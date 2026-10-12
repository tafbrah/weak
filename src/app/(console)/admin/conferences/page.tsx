import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CalendarClock, Users } from "lucide-react";
import { desc, sql } from "drizzle-orm";
import { MeetingActions, ScheduleConferenceForm } from "@/components/admin/conferences-controls";
import { Badge, Empty, PageHeader, Panel, StatCard, type Tone } from "@/components/admin/ui";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { clients, conferences } from "@/db/schema";

export const metadata: Metadata = { title: "Conferences — Loopwerk console" };

const STATUS_TONE: Record<string, Tone> = {
  scheduled: "honey",
  live: "ember",
  done: "moss",
  cancelled: "fog",
};

const STATUSES = ["scheduled", "live", "done", "cancelled"] as const;

export default async function ConferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { t } = await getConsoleI18n();

  const [rows, clientsRows, countRows, hoursRows] = await Promise.all([
    db.select().from(conferences).orderBy(desc(conferences.scheduledAt)),
    db.select({ company: clients.company }).from(clients),
    db
      .select({ status: conferences.status, c: sql<number>`count(*)::int` })
      .from(conferences)
      .groupBy(conferences.status),
    db
      .select({ total: sql<number>`coalesce(sum(${conferences.durationMin}), 0)::int` })
      .from(conferences)
      .where(sql`${conferences.status} = 'done'`),
  ]);

  const filter = (STATUSES as readonly string[]).includes(params.status ?? "")
    ? (params.status as (typeof STATUSES)[number])
    : undefined;
  const visible = filter ? rows.filter((r) => r.status === filter) : rows;
  const counts = new Map(countRows.map((r) => [r.status, r.c]));

  const now = Date.now();
  const upcoming = rows.filter((r) => r.status === "scheduled" && r.scheduledAt.getTime() >= now).length;
  const liveCount = rows.filter((r) => r.status === "live").length;
  const doneCount = rows.filter((r) => r.status === "done").length;
  const hoursDone = Math.round((hoursRows[0]?.total ?? 0) / 60);

  const labels: Record<string, string> = {
    "form.open": t("conf.form.open", "Schedule a meeting"),
    "form.title": t("conf.form.title", "Schedule a meeting"),
    "form.submit": t("conf.form.submit", "Schedule meeting"),
    "form.meetingTitle": t("conf.form.meetingTitle", "Meeting title"),
    "form.client": t("conf.form.client", "Client"),
    "form.when": t("conf.form.when", "Date & time"),
    "form.duration": t("conf.form.duration", "Duration (minutes)"),
    "form.link": t("conf.form.link", "Meeting link (auto-generated if empty)"),
    "form.participants": t("conf.form.participants", "Participants"),
    "form.notes": t("conf.form.notes", "Notes / agenda"),
    "actions.join": t("conf.actions.join", "Join"),
    "actions.start": t("conf.actions.start", "Start"),
    "actions.complete": t("conf.actions.complete", "Complete"),
    "actions.cancel": t("conf.actions.cancel", "Cancel meeting"),
    "actions.delete": t("conf.actions.delete", "Delete"),
  };

  const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit" });
  const fmtMonth = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" });
  const fmtTime = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <PageHeader
        title={t("console.conferences.title", "Conferences")}
        sub={`${rows.length} meetings · ${upcoming} upcoming · ${liveCount} live now`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("conf.kpi.upcoming", "Upcoming")} value={String(upcoming)} tone={upcoming > 0 ? "honey" : "fog"} sub="scheduled meetings" />
        <StatCard label={t("conf.kpi.live", "Live now")} value={String(liveCount)} tone={liveCount > 0 ? "ember" : "fog"} sub="meetings in progress" />
        <StatCard label={t("conf.kpi.done", "Completed")} value={String(doneCount)} tone="moss" sub="all time" />
        <StatCard label={t("conf.kpi.hours", "Hours in meetings")} value={`${hoursDone}h`} sub="completed meetings" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={"/admin/conferences" as Route}
          className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${
            !filter ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
          }`}
        >
          {t("filter.all", "All")} · {rows.length}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/conferences?status=${s}` as Route}
            className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${
              filter === s ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
            }`}
          >
            {s} · {counts.get(s) ?? 0}
          </Link>
        ))}
      </div>

      <div className="mt-4 mb-6">
        <ScheduleConferenceForm clients={clientsRows} labels={labels} />
      </div>

      {visible.length === 0 ? (
        <Panel>
          <Empty>No meetings in this view.</Empty>
        </Panel>
      ) : (
        <div className="space-y-3">
          {visible.map((c) => {
            const when = new Date(c.scheduledAt);
            const end = new Date(when.getTime() + c.durationMin * 60000);
            return (
              <Panel key={c.id} className="transition-colors hover:border-ember/30">
                <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-edge bg-panel-2">
                    <span className="font-display text-lg font-bold leading-none text-bone">{fmtDay(when)}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-fog">{fmtMonth(when)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-bold text-bone">{c.title}</p>
                      <Badge tone={STATUS_TONE[c.status] ?? "fog"}>{c.status}</Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-fog">
                      {c.clientName && <span>{c.clientName}</span>}
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {fmtTime(when)} – {fmtTime(end)} · {c.durationMin} min
                      </span>
                      {c.participants && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {c.participants}
                        </span>
                      )}
                    </p>
                    {c.notes && <p className="mt-1.5 truncate text-xs text-fog/80">{c.notes}</p>}
                  </div>

                  <MeetingActions
                    conferenceId={c.id}
                    status={c.status}
                    meetLink={c.meetLink}
                    labels={labels}
                  />
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-mono text-[11px] text-fog">
        meetings without a link get a fresh Jitsi room automatically · join opens the room in a new tab
      </p>
    </>
  );
}
