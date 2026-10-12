"use client";

import { Eye, EyeOff, Loader2, PlugZap, Plus, Save, Trash2, Undo2, X, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { inputCls, selectCls } from "./ui";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

/* ------------------------------ gateway panel ------------------------------ */

export type GatewayState = {
  provider: string;
  mode: string;
  currency: string;
  apiKeyMasked: string;
  webhookMasked: string;
  configured: boolean;
};

function GatewayPanelInner({ initial, labels }: { initial: GatewayState; labels: Record<string, string> }) {
  const [state, setState] = useState(initial);
  const [apiKey, setApiKey] = useState("");
  const [webhook, setWebhook] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showHook, setShowHook] = useState(false);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();

  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function save() {
    setBusy("save");
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/gateway"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: state.provider,
          mode: state.mode,
          currency: state.currency,
          ...(apiKey ? { apiKey } : {}),
          ...(webhook ? { webhookSecret: webhook } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; gateway?: GatewayState };
      if (!res.ok || !data.ok) {
        setMessage({ ok: false, text: data.error ?? "Save failed." });
        return;
      }
      if (data.gateway) setState(data.gateway);
      setApiKey("");
      setWebhook("");
      setMessage({ ok: true, text: L("gateway.saved", "Configuration saved.") });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Save failed." });
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    setBusy("test");
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/gateway/test"), { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; message?: string };
      setMessage({ ok: Boolean(data.ok), text: data.ok ? data.message ?? "OK" : data.error ?? "Test failed." });
    } catch {
      setMessage({ ok: false, text: "Test failed." });
    } finally {
      setBusy(null);
    }
  }

  const field =
    "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
  const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

  return (
    <div className="rounded-lg border border-edge bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-display text-base font-bold text-bone">
            <PlugZap className="h-4 w-4 text-ember" />
            {L("gateway.title", "Payment gateway API")}
          </p>
          <p className="mt-0.5 text-xs text-fog">{L("gateway.sub", "Connect the provider that collects your payments.")}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
            state.configured
              ? "border-moss/30 bg-moss/10 text-[#7fd4a5]"
              : "border-rust/40 bg-rust/10 text-[#f08c82]"
          }`}
        >
          {state.configured
            ? `${state.provider} · ${state.mode}`
            : L("gateway.notConfigured", "not configured")}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className={label}>{L("gateway.provider", "Provider")}</label>
          <select
            className={field}
            value={state.provider}
            onChange={(e) => setState((s) => ({ ...s, provider: e.target.value }))}
          >
            <option value="stripe">Stripe</option>
            <option value="mollie">Mollie</option>
            <option value="paypal">PayPal</option>
            <option value="manual">Manual / bank transfer</option>
          </select>
        </div>
        <div>
          <label className={label}>{L("gateway.mode", "Mode")}</label>
          <select
            className={field}
            value={state.mode}
            onChange={(e) => setState((s) => ({ ...s, mode: e.target.value }))}
          >
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>
        </div>
        <div>
          <label className={label}>{L("gateway.currency", "Currency")}</label>
          <select
            className={field}
            value={state.currency}
            onChange={(e) => setState((s) => ({ ...s, currency: e.target.value }))}
          >
            <option value="EUR">EUR €</option>
            <option value="USD">USD $</option>
            <option value="GBP">GBP £</option>
          </select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>
            {L("gateway.apiKey", "API key")}{" "}
            {state.apiKeyMasked && !apiKey ? `(${state.apiKeyMasked})` : ""}
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              className={`${field} pr-10`}
              placeholder={state.apiKeyMasked ? "leave empty to keep current key" : "sk_test_…"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={label}>
            {L("gateway.webhook", "Webhook secret")}{" "}
            {state.webhookMasked && !webhook ? `(${state.webhookMasked})` : ""}
          </label>
          <div className="relative">
            <input
              type={showHook ? "text" : "password"}
              className={`${field} pr-10`}
              placeholder={state.webhookMasked ? "leave empty to keep current secret" : "whsec_…"}
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowHook(!showHook)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone"
              aria-label={showHook ? "Hide secret" : "Show secret"}
            >
              {showHook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy === "save"}
          className="flex items-center gap-1.5 rounded-md bg-ember px-3.5 py-2 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
        >
          {busy === "save" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {L("gateway.save", "Save configuration")}
        </button>
        <button
          type="button"
          onClick={test}
          disabled={busy === "test"}
          className="flex items-center gap-1.5 rounded-md border border-edge px-3.5 py-2 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-60"
        >
          {busy === "test" ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlugZap className="h-3 w-3" />}
          {L("gateway.test", "Test connection")}
        </button>
        {message && (
          <span
            className={`rounded-md border px-3 py-1.5 text-xs ${
              message.ok
                ? "border-moss/40 bg-moss/10 text-[#7fd4a5]"
                : "border-rust/40 bg-rust/10 text-[#f08c82]"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function GatewayPanel(props: { initial: GatewayState; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <GatewayPanelInner {...props} />
    </Suspense>
  );
}

/* ---------------------------- record payment form ---------------------------- */

function RecordPaymentFormInner({ clients, labels }: { clients: { company: string; email: string }[]; labels: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> {L("record.open", "Record a payment")}
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/payments"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customer: fd.get("customer"),
                email: fd.get("email"),
                description: fd.get("description"),
                amount: Number(fd.get("amount")),
                method: fd.get("method"),
                status: fd.get("status"),
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not record the payment.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not record the payment."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">{L("record.title", "Record a payment")}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog">{L("record.customer", "Customer")}</label>
              <input
                name="customer"
                required
                list="payment-clients"
                placeholder="Company name"
                className="w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
              />
              <datalist id="payment-clients">
                {clients.map((c) => (
                  <option key={c.company} value={c.company} />
                ))}
              </datalist>
            </div>
            <input type="hidden" name="email" value="" />
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog">{L("record.amount", "Amount (€)")}</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="4500"
                className="w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog">{L("record.method", "Method")}</label>
              <select name="method" defaultValue="card" className="w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone focus:border-ember focus:outline-none">
                <option value="card">Card</option>
                <option value="ideal">iDEAL</option>
                <option value="bancontact">Bancontact</option>
                <option value="transfer">Bank transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog">{L("record.status", "Status")}</label>
              <select name="status" defaultValue="pending" className="w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone focus:border-ember focus:outline-none">
                <option value="pending">Pending</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog">{L("record.description", "Description")}</label>
              <input
                name="description"
                placeholder="Growth retainer — monthly invoice #2024-045"
                className="w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
              />
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
                {L("record.submit", "Add payment")}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function RecordPaymentForm(props: { clients: { company: string; email: string }[]; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <RecordPaymentFormInner {...props} />
    </Suspense>
  );
}

/* ------------------------------- row actions ------------------------------- */

function PaymentActionsInner({ paymentId, status, labels }: { paymentId: number; status: string; labels: Record<string, string> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function act(action: string, nextStatus?: string) {
    setBusy(action);
    try {
      if (action === "delete") {
        await fetch(apiUrl(`/api/payments/${paymentId}`), { method: "DELETE" });
      } else if (nextStatus) {
        await fetch(apiUrl(`/api/payments/${paymentId}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status === "pending" && (
        <button
          type="button"
          onClick={() => act("pay", "succeeded")}
          disabled={busy !== null}
          title={L("actions.markPaid", "Mark paid")}
          className="flex items-center gap-1 rounded-md border border-moss/40 bg-moss/10 px-2 py-1.5 font-mono text-[10px] text-[#7fd4a5] transition-colors hover:bg-moss/20 disabled:opacity-50"
        >
          {busy === "pay" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {L("actions.markPaid", "Mark paid")}
        </button>
      )}
      {status === "succeeded" && (
        <button
          type="button"
          onClick={() => act("refund", "refunded")}
          disabled={busy !== null}
          title={L("actions.refund", "Refund")}
          className="flex items-center gap-1 rounded-md border border-honey/40 bg-honey/10 px-2 py-1.5 font-mono text-[10px] text-[#e3b04b] transition-colors hover:bg-honey/20 disabled:opacity-50"
        >
          {busy === "refund" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
          {L("actions.refund", "Refund")}
        </button>
      )}
      <button
        type="button"
        onClick={() => act("delete")}
        disabled={busy !== null}
        title={L("actions.delete", "Delete")}
        className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
      >
        {busy === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function PaymentActions(props: { paymentId: number; status: string; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <PaymentActionsInner {...props} />
    </Suspense>
  );
}
