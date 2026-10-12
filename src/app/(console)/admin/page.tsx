import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { PipelineDonut, RunsChart, type ChartRow } from "@/components/admin/charts";
import {
  Badge,
  leadTone,
  Panel,
  PageHeader,
  pipelineColor,
  StatCard,
  StatusDot,
  userRoleTone,
  userStatusTone,
} from "@/components/admin/ui";
import { db } from "@/db";
import { clients, leads, runs, users, workflows } from "@/db/schema";
import { money, num, timeAgo } from "@/lib/format";
import { getConsoleI18n } from "@/lib/i18n";

const DAY_MS = 86_400_000;

export default async function OverviewPage() {
  const { t } = await getConsoleI18n();
  const [
    allWorkflows,
    allUsers,
    runsLast7Rows,
    runsPrev7Rows,
    okRows,
    newLeads7Rows,
    mrrRows,
    chartRows,
    pipelineRows,
    recentLeads,
    wfRuns7Rows,
  ] = await Promise.all([
    db.select().from(workflows).orderBy(desc(workflows.createdAt)),
    db.select().from(users).orderBy(users.name),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(runs)
      .where(sql`${runs.ranAt} >= now() - interval '7 days'`),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(runs)
      .where(sql`${runs.ranAt} >= now() - interval '14 days' AND ${runs.ranAt} < now() - interval '7 days'`),
    db
      .select({
        total: sql<number>`count(*)::int`,
        failed: sql<number>`count(*) filter (where ${runs.status} = 'failed')::int`,
      })
      .from(runs)
      .where(sql`${runs.ranAt} >= now() - interval '14 days'`),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(leads)
      .where(sql`${leads.createdAt} >= now() - interval '7 days'`),
    db
      .select({ total: sql<number>`coalesce(sum(${clients.mrr}), 0)::int` })
      .from(clients)
      .where(eq(clients.status, "active")),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${runs.ranAt}), 'YYYY-MM-DD')`,
        total: sql<number>`count(*)::int`,
        failed: sql<number>`count(*) filter (where ${runs.status} = 'failed')::int`,
      })
      .from(runs)
      .where(sql`${runs.ranAt} >= now() - interval '13 days'`)
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select({ status: leads.status, c: sql<number>`count(*)::int` }).from(leads).groupBy(leads.status),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(6),
    db
      .select({ workflowId: runs.workflowId, c: sql<number>`count(*)::int` })
      .from(runs)
      .where(sql`${runs.ranAt} >= now() - interval '7 days'`)
      .groupBy(runs.workflowId),
  ]);

  const runs7 = runsLast7Rows[0]?.c ?? 0;
  const runsPrev7 = runsPrev7Rows[0]?.c ?? 0;
  const delta = runsPrev7 > 0 ? Math.round(((runs7 - runsPrev7) / runsPrev7) * 100) : null;
  const ok = okRows[0] ?? { total: 0, failed: 0 };
  const successRate = ok.total > 0 ? (((ok.total - ok.failed) / ok.total) * 100).toFixed(1) : "100.0";
  const activeWorkflows = allWorkflows.filter((w) => w.status === "active").length;
  const activeUsers = allUsers.filter((u) => u.status === "active").length;
  const mrr = mrrRows[0]?.total ?? 0;
  const newLeads7 = newLeads7Rows[0]?.c ?? 0;

  const byDay = new Map(chartRows.map((r) => [r.day, r]));
  const chart: ChartRow[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    chart.push({
      key,
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }),
      total: row?.total ?? 0,
      failed: row?.failed ?? 0,
    });
  }

  const wfRuns7 = new Map(wfRuns7Rows.map((r) => [r.workflowId, r.c]));
  const pipelineOrder = ["new", "contacted", "qualified", "won", "lost"] as const;
  const pipelineCount = new Map(pipelineRows.map((r) => [r.status, r.c]));
  const pipeline = pipelineOrder.map((s) => ({
    label: s,
    value: pipelineCount.get(s) ?? 0,
    color: pipelineColor[s],
  }));
  const pipelineTotal = pipeline.reduce((a, s) => a + s.value, 0);

  return (
    <>
      <PageHeader
        title={t("console.overview.title", "Overview")}
        sub="The state of the studio — people, pipeline and production."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/subscriptions"
            className="rounded-md border border-edge px-4 py-2 font-mono text-xs text-fog transition-colors hover:border-ember hover:text-ember"
          >
            Subscriptions →
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md border border-edge px-4 py-2 font-mono text-xs text-fog transition-colors hover:border-ember hover:text-ember"
          >
            Manage users →
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={num(allUsers.length)}
          tone="moss"
          sub={`${activeUsers} active · ${allUsers.length - activeUsers} invited or suspended`}
        />
        <StatCard
          label="Runs · last 7 days"
          value={num(runs7)}
          tone={delta !== null && delta < 0 ? "rust" : "moss"}
          sub={
            delta !== null ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% vs previous week` : "no baseline yet"
          }
        />
        <StatCard
          label="Success rate · 14d"
          value={`${successRate}%`}
          tone="moss"
          sub={`${num(ok.failed)} failed of ${num(ok.total)} runs`}
        />
        <StatCard
          label="Active MRR"
          value={money(mrr)}
          sub={`${newLeads7} new lead${newLeads7 === 1 ? "" : "s"} this week`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          title="Workflow runs"
          sub={`${activeWorkflows}/${allWorkflows.length} workflows active · per day`}
          className="lg:col-span-2"
        >
          <RunsChart rows={chart} />
        </Panel>
        <Panel title="Lead pipeline" sub={`${pipelineTotal} total in CRM`}>
          <PipelineDonut segments={pipeline} total={pipelineTotal} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          title="Team"
          sub="Roles and access across the console"
          actions={
            <Link href="/admin/users" className="font-mono text-xs text-fog hover:text-ember">
              manage →
            </Link>
          }
        >
          <ul className="divide-y divide-edge/60">
            {allUsers.slice(0, 5).map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-medium text-bone">
                    <StatusDot tone={userStatusTone[user.status]} pulse={user.status === "active"} />
                    {user.name}
                  </p>
                  <p className="truncate font-mono text-[11px] text-fog">
                    {user.email} · seen {timeAgo(user.lastActiveAt)}
                  </p>
                </div>
                <Badge tone={userRoleTone[user.role]}>{user.role}</Badge>
              </li>
            ))}
            {allUsers.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-fog">No users yet — invite the first one.</li>
            )}
          </ul>
        </Panel>

        <Panel
          title="Latest leads"
          sub="From the booking questionnaire"
          actions={
            <Link href="/admin/workflows" className="font-mono text-xs text-fog hover:text-ember">
              pipeline →
            </Link>
          }
        >
          <ul className="divide-y divide-edge/60">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-bone">{lead.name}</p>
                  <p className="truncate font-mono text-[11px] text-fog">
                    {lead.company || lead.email} · {timeAgo(lead.createdAt)}
                  </p>
                </div>
                <Badge tone={leadTone[lead.status]}>{lead.status}</Badge>
              </li>
            ))}
            {recentLeads.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-fog">No leads yet — the form is live.</li>
            )}
          </ul>
        </Panel>

        <Panel title="Workflow health" sub="Most recent deployments">
          <ul className="divide-y divide-edge/60">
            {allWorkflows.slice(0, 5).map((wf) => (
              <li key={wf.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-bone">{wf.name}</p>
                  <p className="truncate font-mono text-[11px] text-fog">
                    {wf.category} · {num(wfRuns7.get(wf.id) ?? 0)} runs/7d
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <StatusDot tone={wf.status === "active" ? "moss" : wf.status === "paused" ? "honey" : "fog"} pulse={wf.status === "active"} />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-fog">{wf.status}</span>
                </span>
              </li>
            ))}
            {allWorkflows.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-fog">No workflows registered.</li>
            )}
          </ul>
        </Panel>
      </div>
    </>
  );
}
