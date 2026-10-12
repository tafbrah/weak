"use client";

import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { inputCls, selectCls } from "./ui";

function useSubApi() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

/* ------------------------------ plan select ------------------------------ */

function PlanSelectInner({ subId, value }: { subId: number; value: string }) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  const apiUrl = useSubApi();

  return (
    <span className={`inline-flex items-center gap-1.5 ${pending ? "opacity-50" : ""}`}>
      <select
        key={current}
        defaultValue={current}
        disabled={pending}
        className={`${selectCls} cursor-pointer font-mono uppercase tracking-wider`}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setCurrent(next);
          startTransition(async () => {
            const res = await fetch(apiUrl(`/api/subscriptions/${subId}`), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: next }),
            });
            if (!res.ok) setCurrent(value);
            router.refresh();
          });
        }}
      >
        <option value="starter">starter</option>
        <option value="growth">growth</option>
        <option value="scale">scale</option>
      </select>
      {pending && <Loader2 className="h-3 w-3 animate-spin text-fog" />}
    </span>
  );
}

export function PlanSelect(props: { subId: number; value: string }) {
  return (
    <Suspense fallback={null}>
      <PlanSelectInner {...props} />
    </Suspense>
  );
}

/* ----------------------------- status select ----------------------------- */

const STATUS_LABELS: Record<string, string> = {
  onboarding: "trialing",
  active: "active",
  paused: "paused",
  churned: "canceled",
};

function StatusSelectInner({ subId, value }: { subId: number; value: string }) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  const apiUrl = useSubApi();

  return (
    <span className={`inline-flex items-center gap-1.5 ${pending ? "opacity-50" : ""}`}>
      <select
        key={current}
        defaultValue={current}
        disabled={pending}
        className={`${selectCls} cursor-pointer font-mono uppercase tracking-wider`}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setCurrent(next);
          startTransition(async () => {
            const res = await fetch(apiUrl(`/api/subscriptions/${subId}`), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: next }),
            });
            if (!res.ok) setCurrent(value);
            router.refresh();
          });
        }}
      >
        {Object.entries(STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3 w-3 animate-spin text-fog" />}
    </span>
  );
}

export function StatusSelect(props: { subId: number; value: string }) {
  return (
    <Suspense fallback={null}>
      <StatusSelectInner {...props} />
    </Suspense>
  );
}

/* ------------------------------ delete button ----------------------------- */

function DeleteSubscriptionInner({ subId }: { subId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = useSubApi();

  return (
    <button
      type="button"
      title="Cancel & delete subscription"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch(apiUrl(`/api/subscriptions/${subId}`), { method: "DELETE" });
          router.refresh();
        });
      }}
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export function DeleteSubscriptionButton({ subId }: { subId: number }) {
  return (
    <Suspense fallback={null}>
      <DeleteSubscriptionInner subId={subId} />
    </Suspense>
  );
}

/* ------------------------------- create form ------------------------------ */

function NewSubscriptionFormInner({ prices }: { prices: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useSubApi();

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> New subscription
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            setPending(true);
            fetch(apiUrl("/api/subscriptions"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                company: fd.get("company"),
                contact: fd.get("contact"),
                email: fd.get("email"),
                plan: fd.get("plan"),
                status: fd.get("status"),
                billingCycle: fd.get("billingCycle"),
                mrr: fd.get("mrr"),
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not create the subscription.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not create the subscription."))
              .finally(() => setPending(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">New subscription</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="company" required placeholder="Company" className={inputCls} />
            <input name="contact" required placeholder="Contact person" className={inputCls} />
            <input name="email" type="email" required placeholder="email@company.com" className={inputCls} />
            <select name="plan" defaultValue="starter" className={inputCls}>
              <option value="starter">
                Starter — €{(prices.starter ?? 1900).toLocaleString("en-US")} / month
              </option>
              <option value="growth">
                Growth — €{(prices.growth ?? 4500).toLocaleString("en-US")} / month
              </option>
              <option value="scale">Scale — custom MRR</option>
            </select>
            <select name="status" defaultValue="onboarding" className={inputCls}>
              <option value="onboarding">Trialing / onboarding</option>
              <option value="active">Active</option>
            </select>
            <select name="billingCycle" defaultValue="monthly" className={inputCls}>
              <option value="monthly">Monthly billing</option>
              <option value="yearly">Yearly billing</option>
            </select>
            <input name="mrr" type="number" min="0" step="100" placeholder="Custom MRR € (Scale only)" className={inputCls} />
            {error && (
              <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">
                {error}
              </p>
            )}
            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create subscription
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function NewSubscriptionForm({ prices }: { prices: Record<string, number> }) {
  return (
    <Suspense fallback={null}>
      <NewSubscriptionFormInner prices={prices} />
    </Suspense>
  );
}

/* ------------------------------- plan editor ------------------------------- */

function PlanEditorInner({
  plans,
  prices,
}: {
  plans: { key: string; name: string; blurb: string }[];
  prices: Record<string, number>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(plans.map((p) => [p.key, String(prices[p.key] ?? 0)])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ key: string; ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const apiUrl = useSubApi();

  async function save(key: string) {
    const price = Number(drafts[key]);
    if (!Number.isFinite(price) || price < 0) {
      setMessage({ key, ok: false, text: "Enter a valid price." });
      return;
    }
    setSaving(key);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/plans"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, price: Math.round(price) }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMessage({ key, ok: false, text: data.error ?? "Save failed." });
        return;
      }
      setMessage({ key, ok: true, text: "Price updated." });
      router.refresh();
    } catch {
      setMessage({ key, ok: false, text: "Save failed." });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const custom = plan.key === "scale";
        const changed = Number(drafts[plan.key]) !== (prices[plan.key] ?? 0);
        return (
          <div key={plan.key} className="rounded-lg border border-edge bg-panel p-5">
            <p className="font-display text-base font-bold text-bone">{plan.name}</p>
            <p className="mt-0.5 text-xs text-fog">{plan.blurb}</p>
            <label htmlFor={`plan-price-${plan.key}`} className="mt-4 mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog">
              {custom ? "Starting price € / month (0 = quoted)" : "Price € / month"}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`plan-price-${plan.key}`}
                type="number"
                min="0"
                step="100"
                className="w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
                value={drafts[plan.key]}
                onChange={(e) => setDrafts((d) => ({ ...d, [plan.key]: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => save(plan.key)}
                disabled={saving === plan.key || !changed}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-ember px-3 py-2 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-40"
              >
                {saving === plan.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </button>
            </div>
            {message?.key === plan.key && (
              <p className={`mt-2 text-[11px] ${message.ok ? "text-[#7fd4a5]" : "text-[#f08c82]"}`}>{message.text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PlanEditor(props: { plans: { key: string; name: string; blurb: string }[]; prices: Record<string, number> }) {
  return (
    <Suspense fallback={null}>
      <PlanEditorInner {...props} />
    </Suspense>
  );
}
