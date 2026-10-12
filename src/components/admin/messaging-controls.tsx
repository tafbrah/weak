"use client";

import { Eye, EyeOff, Loader2, Mail, PlugZap, Plus, RefreshCw, Save, Send, Smartphone, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

/* --------------------------- provider config panel --------------------------- */

export type MessagingState = {
  emailProvider: string;
  emailKeyMasked: string;
  emailFrom: string;
  emailConfigured: boolean;
  smsProvider: string;
  smsKeyMasked: string;
  smsSender: string;
  smsConfigured: boolean;
};

function MessagingProviderPanelInner({ state: initial, labels }: { state: MessagingState; labels: Record<string, string> }) {
  const [state, setState] = useState(initial);
  const [emailKey, setEmailKey] = useState("");
  const [smsKey, setSmsKey] = useState("");
  const [showEmailKey, setShowEmailKey] = useState(false);
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [busy, setBusy] = useState<"save" | "test-email" | "test-sms" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function save() {
    setBusy("save");
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/messaging"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailProvider: state.emailProvider,
          smsProvider: state.smsProvider,
          emailFrom: state.emailFrom,
          smsSender: state.smsSender,
          ...(emailKey ? { emailApiKey: emailKey } : {}),
          ...(smsKey ? { smsApiKey: smsKey } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; messaging?: MessagingState };
      if (!res.ok || !data.ok) {
        setMessage({ ok: false, text: data.error ?? "Save failed." });
        return;
      }
      if (data.messaging) setState(data.messaging);
      setEmailKey("");
      setSmsKey("");
      setMessage({ ok: true, text: L("provider.saved", "Configuration saved.") });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Save failed." });
    } finally {
      setBusy(null);
    }
  }

  async function test(target: "email" | "sms") {
    setBusy(target === "email" ? "test-email" : "test-sms");
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/messaging/test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; message?: string };
      setMessage({ ok: Boolean(data.ok), text: data.ok ? data.message ?? "OK" : data.error ?? "Test failed." });
    } catch {
      setMessage({ ok: false, text: "Test failed." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-edge bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-base font-bold text-bone">
          <PlugZap className="h-4 w-4 text-ember" />
          {L("provider.title", "Email & SMS providers")}
        </p>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${state.emailConfigured ? "border-moss/30 bg-moss/10 text-[#7fd4a5]" : "border-edge text-fog"}`}>
            {L("provider.email", "email")} {state.emailConfigured ? "✓" : "—"}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${state.smsConfigured ? "border-moss/30 bg-moss/10 text-[#7fd4a5]" : "border-edge text-fog"}`}>
            {L("provider.sms", "sms")} {state.smsConfigured ? "✓" : "—"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {/* email */}
        <div className="rounded-md border border-edge/60 p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-fog">
            <Mail className="h-3.5 w-3.5 text-ember" /> {L("provider.emailChannel", "Email channel")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>{L("provider.emailProvider", "Provider")}</label>
              <select className={field} value={state.emailProvider} onChange={(e) => setState((s) => ({ ...s, emailProvider: e.target.value }))}>
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
                <option value="resend">Resend</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className={label}>{L("provider.emailFrom", "From address")}</label>
              <input className={field} placeholder="hello@loopwerk.studio" value={state.emailFrom} onChange={(e) => setState((s) => ({ ...s, emailFrom: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>
                {L("provider.emailKey", "API key")} {state.emailKeyMasked && !emailKey ? `(${state.emailKeyMasked})` : ""}
              </label>
              <div className="relative">
                <input type={showEmailKey ? "text" : "password"} className={`${field} pr-10`} placeholder={state.emailKeyMasked ? "leave empty to keep current key" : "SG.…"} value={emailKey} onChange={(e) => setEmailKey(e.target.value)} />
                <button type="button" onClick={() => setShowEmailKey(!showEmailKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone" aria-label="Toggle key visibility">
                  {showEmailKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => test("email")} disabled={busy !== null} className="mt-3 flex items-center gap-1.5 rounded-md border border-edge px-3 py-1.5 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-60">
            {busy === "test-email" ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlugZap className="h-3 w-3" />}
            {L("provider.testEmail", "Test email")}
          </button>
        </div>

        {/* sms */}
        <div className="rounded-md border border-edge/60 p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-fog">
            <Smartphone className="h-3.5 w-3.5 text-ember" /> {L("provider.smsChannel", "SMS channel")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>{L("provider.smsProvider", "Provider")}</label>
              <select className={field} value={state.smsProvider} onChange={(e) => setState((s) => ({ ...s, smsProvider: e.target.value }))}>
                <option value="twilio">Twilio</option>
                <option value="ovh">OVH SMS</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className={label}>{L("provider.smsSender", "Sender ID / number")}</label>
              <input className={field} placeholder="LOOPWERK" value={state.smsSender} onChange={(e) => setState((s) => ({ ...s, smsSender: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>
                {L("provider.smsKey", "API key")} {state.smsKeyMasked && !smsKey ? `(${state.smsKeyMasked})` : ""}
              </label>
              <div className="relative">
                <input type={showSmsKey ? "text" : "password"} className={`${field} pr-10`} placeholder={state.smsKeyMasked ? "leave empty to keep current key" : "AC…"} value={smsKey} onChange={(e) => setSmsKey(e.target.value)} />
                <button type="button" onClick={() => setShowSmsKey(!showSmsKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone" aria-label="Toggle key visibility">
                  {showSmsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => test("sms")} disabled={busy !== null} className="mt-3 flex items-center gap-1.5 rounded-md border border-edge px-3 py-1.5 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-60">
            {busy === "test-sms" ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlugZap className="h-3 w-3" />}
            {L("provider.testSms", "Test SMS")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={busy === "save"} className="flex items-center gap-1.5 rounded-md bg-ember px-3.5 py-2 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60">
          {busy === "save" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {L("provider.save", "Save configuration")}
        </button>
        {message && (
          <span className={`rounded-md border px-3 py-1.5 text-xs ${message.ok ? "border-moss/40 bg-moss/10 text-[#7fd4a5]" : "border-rust/40 bg-rust/10 text-[#f08c82]"}`}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function MessagingProviderPanel(props: { state: MessagingState; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <MessagingProviderPanelInner {...props} />
    </Suspense>
  );
}

/* ------------------------------- compose form ------------------------------- */

export type ClientOption = { company: string; contact: string; email: string };
export type TemplateOption = { id: number; kind: string; name: string; subject: string; body: string };

function ComposeMessageFormInner({
  clients,
  templates,
  labels,
}: {
  clients: ClientOption[];
  templates: TemplateOption[];
  labels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"email" | "sms">("email");
  const [busy, setBusy] = useState<"send" | "draft" | "template" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  const kindTemplates = useMemo(() => templates.filter((t) => t.kind === kind), [templates, kind]);

  function applyTemplate(id: number) {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setSubject(tpl.subject);
    setBody(tpl.body);
  }

  async function submit(sendNow: boolean) {
    setBusy(sendNow ? "send" : "draft");
    setError(null);
    const form = document.getElementById("compose-form") as HTMLFormElement | null;
    const fd = form ? new FormData(form) : new FormData();
    try {
      const res = await fetch(apiUrl("/api/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          subject,
          body,
          recipientName: fd.get("recipientName") ?? "",
          recipientEmail: fd.get("recipientEmail") ?? "",
          recipientPhone: fd.get("recipientPhone") ?? "",
          clientName: fd.get("clientName") ?? "",
          sendNow,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not send the message.");
        return;
      }
      form?.reset();
      setSubject("");
      setBody("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not send the message.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="w-full">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep">
          <Plus className="h-4 w-4" /> {L("compose.open", "Compose a message")}
        </button>
      ) : (
        <form id="compose-form" onSubmit={(e) => { e.preventDefault(); submit(true); }} className="rounded-lg border border-edge bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">{L("compose.title", "Compose a message")}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            {(["email", "sms"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  kind === k ? "border-ember bg-ember/10 text-[#ff8f66]" : "border-edge text-fog hover:border-fog hover:text-bone"
                }`}
              >
                {k === "email" ? <Mail className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                {k}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>{L("compose.client", "Client")}</label>
              <select
                name="clientName"
                className={field}
                onChange={(e) => {
                  const c = clients.find((cl) => cl.company === e.target.value);
                  const form = e.target.form;
                  if (c && form) {
                    (form.elements.namedItem("recipientName") as HTMLInputElement).value = c.contact;
                    (form.elements.namedItem("recipientEmail") as HTMLInputElement).value = c.email;
                  }
                }}
              >
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.company} value={c.company}>{c.company}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>{L("compose.template", "Use a template")}</label>
              <select className={field} defaultValue="" onChange={(e) => applyTemplate(Number(e.target.value))}>
                <option value="">—</option>
                {kindTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>{L("compose.recipientName", "Recipient name")}</label>
              <input name="recipientName" placeholder="Jane Doe" className={field} />
            </div>
            {kind === "email" ? (
              <div>
                <label className={label}>{L("compose.recipientEmail", "Recipient email")} *</label>
                <input name="recipientEmail" type="email" placeholder="jane@acme.com" className={field} />
              </div>
            ) : (
              <div>
                <label className={label}>{L("compose.recipientPhone", "Recipient phone")} *</label>
                <input name="recipientPhone" placeholder="+31 6 12 34 56 78" className={field} />
              </div>
            )}
            {kind === "email" && (
              <div className="sm:col-span-2">
                <label className={label}>{L("compose.subject", "Subject")} *</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your invoice is ready" className={field} />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className={label}>{L("compose.body", "Message")} *</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder={kind === "sms" ? "Bonjour {{contact}}, …" : "Bonjour {{contact}},\n\n…"} className={`${field} resize-none`} />
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => submit(false)} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-md border border-edge px-4 py-2 text-sm font-semibold text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-60">
                {busy === "draft" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {L("compose.saveDraft", "Save draft")}
              </button>
              <button type="submit" disabled={busy !== null} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60">
                {busy === "send" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {L("compose.send", "Send now")}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function ComposeMessageForm(props: { clients: ClientOption[]; templates: TemplateOption[]; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <ComposeMessageFormInner {...props} />
    </Suspense>
  );
}

/* ------------------------------ message actions ------------------------------ */

function MessageActionsInner({ messageId, labels }: { messageId: number; labels: Record<string, string> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function resend() {
    setBusy("resend");
    try {
      await fetch(apiUrl(`/api/messages/${messageId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resend: true }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    try {
      await fetch(apiUrl(`/api/messages/${messageId}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" onClick={resend} disabled={busy !== null} title={L("actions.resend", "Resend")} className="flex items-center gap-1 rounded-md border border-edge px-2 py-1.5 font-mono text-[10px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-50">
        {busy === "resend" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        {L("actions.resend", "Resend")}
      </button>
      <button type="button" onClick={remove} disabled={busy !== null} title={L("actions.delete", "Delete")} className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50">
        {busy === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function MessageActions(props: { messageId: number; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <MessageActionsInner {...props} />
    </Suspense>
  );
}

/* ------------------------------ templates list ------------------------------ */

function TemplateListInner({ templates, labels }: { templates: TemplateOption[]; labels: Record<string, string> }) {
  const [busy, setBusy] = useState<number | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function remove(id: number) {
    setBusy(id);
    try {
      await fetch(apiUrl(`/api/message-templates/${id}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (templates.length === 0) {
    return <p className="px-1 py-4 text-center text-xs text-fog">{L("templates.empty", "No templates yet.")}</p>;
  }

  return (
    <ul className="divide-y divide-edge/60">
      {templates.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-1 py-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${t.kind === "email" ? "bg-ember/10 text-ember" : "bg-panel-2 text-fog"}`}>
            {t.kind === "email" ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-bone">{t.name}</p>
            <p className="truncate font-mono text-[11px] text-fog">{t.subject || t.body.slice(0, 60)}</p>
          </div>
          <button type="button" onClick={() => remove(t.id)} disabled={busy === t.id} title={L("actions.delete", "Delete")} className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50">
            {busy === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function TemplateList(props: { templates: TemplateOption[]; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <TemplateListInner {...props} />
    </Suspense>
  );
}
