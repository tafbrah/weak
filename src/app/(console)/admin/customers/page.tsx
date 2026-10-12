import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import {
  AddCustomerForm,
  CustomerPlanSelect,
  CustomerStatusSelect,
  DeleteCustomerButton,
} from "@/components/admin/customers-controls";
import { Empty, PageHeader, Panel, StatCard, Td, Th } from "@/components/admin/ui";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { clients, payments } from "@/db/schema";

export const metadata: Metadata = { title: "Customers — Loopwerk console" };

function money(cents: number, currency = "EUR") {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return `${symbol}${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; lw_session?: string }>;
}) {
  const params = await searchParams;
  const { t } = await getConsoleI18n();
  // Preserve the session token across in-page navigation (search / filters)
  // for cookie-restricted contexts; harmless when the session cookie is used.
  const lwSession = params.lw_session;
  const tokenQs = lwSession ? `lw_session=${encodeURIComponent(lwSession)}` : "";
  const qs = (extra: string) => {
    const parts = [extra, tokenQs].filter(Boolean);
    return parts.length ? `?${parts.join("&")}` : "";
  };

  const [rows, paymentsRows, plansCount] = await Promise.all([
    db.select().from(clients).orderBy(clients.company),
    db.select().from(payments),
    db.select({ plan: clients.plan, c: sql<number>`count(*)::int` }).from(clients).groupBy(clients.plan),
  ]);

  // Lifetime value per customer (matched by company name on payments).
  const paidByCustomer = new Map<string, { total: number; count: number }>();
  for (const p of paymentsRows) {
    if (p.status !== "succeeded") continue;
    const cur = paidByCustomer.get(p.customer) ?? { total: 0, count: 0 };
    cur.total += p.amountCents;
    cur.count += 1;
    paidByCustomer.set(p.customer, cur);
  }

  const q = (params.q ?? "").trim().toLowerCase();
  const planFilter = params.plan;
  const visible = rows.filter((c) => {
    if (planFilter && c.plan !== planFilter) return false;
    if (q) {
      const hay = `${c.company} ${c.contact} ${c.email}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const activeCount = rows.filter((c) => c.status === "active").length;
  const totalMrrCents = rows.filter((c) => c.status === "active").reduce((a, c) => a + c.mrr * 100, 0);
  const lifetimeTotal = [...paidByCustomer.values()].reduce((a, v) => a + v.total, 0);
  const avgLifetime = paidByCustomer.size > 0 ? lifetimeTotal / paidByCustomer.size : 0;
  const planCounts = new Map(plansCount.map((r) => [r.plan, r.c]));

  const labels: Record<string, string> = {
    "customers.add.open": t("customers.add.open", "Add customer"),
    "customers.add.title": t("customers.add.title", "Add a customer"),
    "customers.add.submit": t("customers.add.submit", "Add customer"),
    "customers.field.company": t("customers.field.company", "Company"),
    "customers.field.contact": t("customers.field.contact", "Contact person"),
    "customers.field.email": t("customers.field.email", "Email"),
    "customers.field.plan": t("customers.field.plan", "Plan"),
    "customers.field.status": t("customers.field.status", "Status"),
    "customers.field.billing": t("customers.field.billing", "Billing cycle"),
    "customers.field.mrr": t("customers.field.mrr", "Custom MRR € (Scale only)"),
  };

  return (
    <>
      <PageHeader
        title={t("console.customers.title", "Customers")}
        sub={`${rows.length} customers · ${activeCount} active · lifetime collected ${money(lifetimeTotal)}`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("customers.kpi.total", "Total customers")} value={String(rows.length)} sub={`${activeCount} active`} />
        <StatCard label={t("customers.kpi.active", "Active MRR")} value={money(totalMrrCents)} tone="moss" sub="across active customers" />
        <StatCard label={t("customers.kpi.lifetime", "Lifetime collected")} value={money(lifetimeTotal)} tone="moss" sub={`${[...paidByCustomer.values()].reduce((a, v) => a + v.count, 0)} successful payments`} />
        <StatCard label={t("customers.kpi.avg", "Avg lifetime / customer")} value={money(Math.round(avgLifetime))} sub={`${paidByCustomer.size} paying customers`} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/customers${qs("")}` as Route}
            className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] transition-colors ${
              !planFilter ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
            }`}
          >
            {t("filter.all", "All")} · {rows.length}
          </Link>
          {(["starter", "growth", "scale"] as const).map((p) => (
            <Link
              key={p}
              href={`/admin/customers${qs(`plan=${p}`)}` as Route}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${
                planFilter === p ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
              }`}
            >
              {p} · {planCounts.get(p) ?? 0}
            </Link>
          ))}
        </div>
        <form method="get" action="/admin/customers" className="flex items-center gap-2">
          {lwSession && <input type="hidden" name="lw_session" value={lwSession} />}
          {planFilter && <input type="hidden" name="plan" value={planFilter} />}
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder={t("customers.search", "Search company, contact, email…")}
            className="w-64 rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
          />
          <button
            type="submit"
            className="rounded-md border border-edge px-3 py-2 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone"
          >
            {t("customers.filter", "Filter")}
          </button>
        </form>
      </div>

      <div className="mt-4 mb-6">
        <AddCustomerForm labels={labels} />
      </div>

      <Panel>
        {visible.length === 0 ? (
          <Empty>No customers match this view.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-edge">
                <tr>
                  <Th>Customer</Th>
                  <Th>Plan</Th>
                  <Th>Status</Th>
                  <Th className="text-right">MRR</Th>
                  <Th className="text-right">{t("customers.totalPaid", "Total paid")}</Th>
                  <Th className="text-right">{t("customers.payments", "Payments")}</Th>
                  <Th>Since</Th>
                  <Th className="text-right">{t("customers.actions", "")}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60">
                {visible.map((c) => {
                  const paid = paidByCustomer.get(c.company);
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-panel-2/50">
                      <Td>
                        <p className="font-medium text-bone">{c.company}</p>
                        <p className="font-mono text-[11px] text-fog">
                          {c.contact} · {c.email}
                        </p>
                      </Td>
                      <Td>
                        <CustomerPlanSelect customerId={c.id} value={c.plan} />
                      </Td>
                      <Td>
                        <CustomerStatusSelect customerId={c.id} value={c.status} />
                      </Td>
                      <Td className="text-right font-mono text-sm text-bone">{money(c.mrr * 100)}</Td>
                      <Td className="text-right font-mono text-sm text-[#7fd4a5]">
                        {paid ? money(paid.total) : "—"}
                      </Td>
                      <Td className="text-right font-mono text-xs text-fog">{paid ? paid.count : 0}</Td>
                      <Td className="whitespace-nowrap font-mono text-xs text-fog">
                        {new Date(c.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                      </Td>
                      <Td className="text-right">
                        <DeleteCustomerButton customerId={c.id} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-4 font-mono text-[11px] text-fog">
        total paid aggregates succeeded payments per customer · billing & renewals live in Subscriptions
      </p>
    </>
  );
}
