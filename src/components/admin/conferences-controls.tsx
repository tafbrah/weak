"use client";

import { Check, Loader2, Play, Plus, Trash2, Video, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

/* ------------------------------ meeting actions ------------------------------ */

function MeetingActionsInner({
  conferenceId,
  status,
  meetLink,
  labels,
}: {
  conferenceId: number;
  status: string;
  meetLink: string;
  labels: Record<string, string>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function transition(nextStatus: string) {
    setBusy(nextStatus);
    try {
      await fetch(apiUrl(`/api/conferences/${conferenceId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    try {
      await fetch(apiUrl(`/api/conferences/${conferenceId}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {meetLink && status !== "cancelled" && (
        <a
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          title={L("actions.join", "Join meeting")}
          className="flex items-center gap-1 rounded-md border border-ember/40 bg-ember/10 px-2 py-1.5 font-mono text-[10px] font-bold text-[#ff8f66] transition-colors hover:bg-ember/20"
        >
          <Video className="h-3 w-3" />
          {L("actions.join", "Join")}
        </a>
      )}
      {status === "scheduled" && (
        <button
          type="button"
          onClick={() => transition("live")}
          disabled={busy !== null}
          title={L("actions.start", "Start meeting")}
          className="flex items-center gap-1 rounded-md border border-moss/40 bg-moss/10 px-2 py-1.5 font-mono text-[10px] text-[#7fd4a5] transition-colors hover:bg-moss/20 disabled:opacity-50"
        >
          {busy === "live" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          {L("actions.start", "Start")}
        </button>
      )}
      {status === "live" && (
        <button
          type="button"
          onClick={() => transition("done")}
          disabled={busy !== null}
          title={L("actions.complete", "Mark completed")}
          className="flex items-center gap-1 rounded-md border border-moss/40 bg-moss/10 px-2 py-1.5 font-mono text-[10px] text-[#7fd4a5] transition-colors hover:bg-moss/20 disabled:opacity-50"
        >
          {busy === "done" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {L("actions.complete", "Complete")}
        </button>
      )}
      {(status === "scheduled" || status === "live") && (
        <button
          type="button"
          onClick={() => transition("cancelled")}
          disabled={busy !== null}
          title={L("actions.cancel", "Cancel meeting")}
          className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-honey hover:text-[#e3b04b] disabled:opacity-50"
        >
          {busy === "cancelled" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        disabled={busy !== null}
        title={L("actions.delete", "Delete")}
        className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
      >
        {busy === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function MeetingActions(props: {
  conferenceId: number;
  status: string;
  meetLink: string;
  labels: Record<string, string>;
}) {
  return (
    <Suspense fallback={null}>
      <MeetingActionsInner {...props} />
    </Suspense>
  );
}

/* ------------------------------ schedule form ------------------------------ */

function ScheduleConferenceFormInner({
  clients,
  labels,
}: {
  clients: { company: string }[];
  labels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  const field =
    "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
  const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

  // default: tomorrow at 10:00
  const tomorrow = new Date(Date.now() + 86_400_000);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultWhen = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> {L("form.open", "Schedule a meeting")}
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/conferences"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: fd.get("title"),
                clientName: fd.get("clientName"),
                scheduledAt: fd.get("scheduledAt"),
                durationMin: Number(fd.get("durationMin")),
                meetLink: fd.get("meetLink"),
                participants: fd.get("participants"),
                notes: fd.get("notes"),
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not schedule the meeting.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not schedule the meeting."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">{L("form.title", "Schedule a meeting")}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>{L("form.meetingTitle", "Meeting title")} *</label>
              <input name="title" required placeholder="Audit de découverte — automatisation facturation" className={field} />
            </div>
            <div>
              <label className={label}>{L("form.client", "Client")}</label>
              <input name="clientName" list="conference-clients" placeholder="Company name" className={field} />
              <datalist id="conference-clients">
                {clients.map((c) => (
                  <option key={c.company} value={c.company} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={label}>{L("form.when", "Date & time")} *</label>
              <input name="scheduledAt" type="datetime-local" required defaultValue={defaultWhen} className={field} />
            </div>
            <div>
              <label className={label}>{L("form.duration", "Duration (minutes)")}</label>
              <select name="durationMin" defaultValue="30" className={field}>
                {[15, 30, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>{L("form.link", "Meeting link (auto-generated if empty)")}</label>
              <input name="meetLink" placeholder="https://meet.jit.si/…" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>{L("form.participants", "Participants")}</label>
              <input name="participants" placeholder="Lotte Bakker, Jonas Weber…" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>{L("form.notes", "Notes / agenda")}</label>
              <textarea name="notes" rows={2} placeholder="Agenda, context, links…" className={`${field} resize-none`} />
            </div>
            {error && (
              <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>
            )}
            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {L("form.submit", "Schedule meeting")}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function ScheduleConferenceForm(props: { clients: { company: string }[]; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <ScheduleConferenceFormInner {...props} />
    </Suspense>
  );
}
