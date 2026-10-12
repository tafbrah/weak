"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { selectCls } from "./ui";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

/* ------------------------------ status select ------------------------------ */

const STATUS_LABELS: Record<string, string> = {
  onboarding: "onboarding",
  active: "active",
  paused: "paused",
  churned: "churned",
};

function CustomerStatusSelectInner({ customerId, value }: { customerId: number; value: string }) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  const apiUrl = useApiUrl();

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
            const res = await fetch(apiUrl(`/api/subscriptions/${customerId}`), {
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

export function CustomerStatusSelect(props: { customerId: number; value: string }) {
  return (
    <Suspense fallback={null}>
      <CustomerStatusSelectInner {...props} />
    </Suspense>
  );
}

/* ------------------------------- plan select -------------------------------- */

const PLAN_LABELS: Record<string, string> = {
  starter: "starter",
  growth: "growth",
  scale: "scale",
};

function CustomerPlanSelectInner({ customerId, value }: { customerId: number; value: string }) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  const apiUrl = useApiUrl();

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
            // PATCHing the plan also re-applies the catalog price to the MRR.
            const res = await fetch(apiUrl(`/api/subscriptions/${customerId}`), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: next }),
            });
            if (!res.ok) setCurrent(value);
            router.refresh();
          });
        }}
      >
        {Object.entries(PLAN_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3 w-3 animate-spin text-fog" />}
    </span>
  );
}

export function CustomerPlanSelect(props: { customerId: number; value: string }) {
  return (
    <Suspense fallback={null}>
      <CustomerPlanSelectInner {...props} />
    </Suspense>
  );
}

/* ------------------------------- delete button ------------------------------ */

function DeleteCustomerInner({ customerId }: { customerId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      title="Delete customer"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch(apiUrl(`/api/subscriptions/${customerId}`), { method: "DELETE" });
          router.refresh();
        });
      }}
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export function DeleteCustomerButton({ customerId }: { customerId: number }) {
  return (
    <Suspense fallback={null}>
      <DeleteCustomerInner customerId={customerId} />
    </Suspense>
  );
}

/* ------------------------------- add customer ------------------------------- */

const PLAN_PRICES: Record<string, number> = { starter: 1900, growth: 4500 };

function AddCustomerFormInner({ labels }: { labels: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  const field =
    "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
  const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> {L("customers.add.open", "Add customer")}
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            const plan = String(fd.get("plan") ?? "starter");
            const mrrFromPlan = PLAN_PRICES[plan];
            const mrrInput = Number(fd.get("mrr"));
            const mrr = mrrFromPlan ?? (Number.isFinite(mrrInput) && mrrInput > 0 ? mrrInput : 0);
            fetch(apiUrl("/api/subscriptions"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                company: fd.get("company"),
                contact: fd.get("contact"),
                email: fd.get("email"),
                plan,
                status: fd.get("status"),
                billingCycle: fd.get("billingCycle"),
                mrr,
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the customer.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the customer."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">{L("customers.add.title", "Add a customer")}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>{L("customers.field.company", "Company")} *</label>
              <input name="company" required placeholder="Acme BV" className={field} />
            </div>
            <div>
              <label className={label}>{L("customers.field.contact", "Contact person")} *</label>
              <input name="contact" required placeholder="Jane Doe" className={field} />
            </div>
            <div>
              <label className={label}>{L("customers.field.email", "Email")} *</label>
              <input name="email" type="email" required placeholder="jane@acme.com" className={field} />
            </div>
            <div>
              <label className={label}>{L("customers.field.plan", "Plan")}</label>
              <select name="plan" defaultValue="starter" className={field}>
                <option value="starter">Starter — €1,900 / month</option>
                <option value="growth">Growth — €4,500 / month</option>
                <option value="scale">Scale — custom MRR</option>
              </select>
            </div>
            <div>
              <label className={label}>{L("customers.field.status", "Status")}</label>
              <select name="status" defaultValue="onboarding" className={field}>
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className={label}>{L("customers.field.billing", "Billing cycle")}</label>
              <select name="billingCycle" defaultValue="monthly" className={field}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>{L("customers.field.mrr", "Custom MRR € (Scale only)")}</label>
              <input name="mrr" type="number" min="0" step="100" placeholder="e.g. 7800" className={field} />
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
                {L("customers.add.submit", "Add customer")}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddCustomerForm({ labels }: { labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <AddCustomerFormInner labels={labels} />
    </Suspense>
  );
}
