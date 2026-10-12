import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import {
  DeleteSubscriptionButton,
  NewSubscriptionForm,
  PlanEditor,
  PlanSelect,
  StatusSelect,
} from "@/components/admin/subscription-controls";
import {
  Badge,
  Empty,
  Panel,
  PageHeader,
  StatCard,
  Td,
  Th,
  type Tone,
} from "@/components/admin/ui";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { fmtDate, money, num } from "@/lib/format";
import { getConsoleI18n } from "@/lib/i18n";
import { getPlans, getPlanPrices } from "@/lib/plans";

export const metadata: Metadata = { title: "Subscriptions — Loopwerk console" };

const STATUS_LABEL: Record<string, string> = {
  onboarding: "trialing",
  active: "active",
  paused: "paused",
  churned: "canceled",
};

const STATUS_TONE: Record<string, Tone> = {
  onboarding: "honey",
  active: "moss",
  paused: "fog",
  churned: "rust",
};

const PLAN_TONE: Record<string, Tone> = {
  starter: "fog",
  growth: "honey",
  scale: "ember",
};

export default async function SubscriptionsPage() {
  const { t } = await getConsoleI18n();
  const [rows, catalog, prices] = await Promise.all([
    db.select().from(clients).orderBy(clients.company),
    getPlans(),
    getPlanPrices(),
  ]);

  const activeRows = rows.filter((r) => r.status === "active");
  const mrr = activeRows.reduce((acc, r) => acc + r.mrr, 0);
  const arr = mrr * 12;
  const in30 = new Date(Date.now() + 30 * 86_400_000);
  const renewalsSoon = rows.filter(
    (r) => r.status === "active" && r.nextRenewal && r.nextRenewal <= in30,
  ).length;

  const planCounts = new Map<string, number>();
  for (const r of rows) planCounts.set(r.plan, (planCounts.get(r.plan) ?? 0) + 1);

  return (
    <>
      <PageHeader
        title={t("console.subscriptions.title", "Subscriptions")}
        sub={`${rows.length} subscriptions · ${activeRows.length} active · plans: Starter €1,900 / Growth €4,500 / Scale custom`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Monthly recurring revenue" value={money(mrr)} tone="moss" sub={`${activeRows.length} active subscriptions`} />
        <StatCard label="Annual run rate" value={money(arr)} sub="MRR × 12" />
        <StatCard label="Renewals · next 30 days" value={num(renewalsSoon)} tone={renewalsSoon > 0 ? "honey" : "fog"} sub="active subscriptions" />
        <StatCard
          label="Average revenue / account"
          value={activeRows.length ? money(Math.round(mrr / activeRows.length)) : money(0)}
          sub="across active accounts"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["starter", "growth", "scale"] as const).map((plan) => (
          <span
            key={plan}
            className="flex items-center gap-2 rounded-full border border-edge bg-panel px-3.5 py-1.5 font-mono text-[11px] text-fog"
          >
            <Badge tone={PLAN_TONE[plan]}>{plan}</Badge>
            {planCounts.get(plan) ?? 0} ·{" "}
            {prices[plan] ? `€${prices[plan].toLocaleString("en-US")} / month` : "custom"}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-bone">
          Packages & pricing
        </h2>
        <PlanEditor
          plans={catalog.map((p) => ({ key: p.key, name: p.name, blurb: p.blurb }))}
          prices={prices}
        />
      </div>

      <div className="mt-6 mb-6">
        <NewSubscriptionForm prices={prices} />
      </div>

      <Panel>
        {rows.length === 0 ? (
          <Empty>No subscriptions yet — create the first one above.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="border-b border-edge">
                <tr>
                  <Th>Customer</Th>
                  <Th>Plan</Th>
                  <Th className="text-right">MRR</Th>
                  <Th>Cycle</Th>
                  <Th>Status</Th>
                  <Th>Next renewal</Th>
                  <Th>Since</Th>
                  <Th className="text-right">Del</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60">
                {rows.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-panel-2/50">
                    <Td>
                      <p className="font-medium text-bone">{sub.company}</p>
                      <p className="font-mono text-[11px] text-fog">
                        {sub.contact} · {sub.email}
                      </p>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Badge tone={PLAN_TONE[sub.plan]}>{sub.plan}</Badge>
                        <PlanSelect subId={sub.id} value={sub.plan} />
                      </div>
                    </Td>
                    <Td className="text-right font-mono text-xs">{money(sub.mrr)}</Td>
                    <Td className="font-mono text-xs text-fog">{sub.billingCycle}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[sub.status]}>{STATUS_LABEL[sub.status] ?? sub.status}</Badge>
                        <StatusSelect subId={sub.id} value={sub.status} />
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap font-mono text-xs text-fog">{fmtDate(sub.nextRenewal)}</Td>
                    <Td className="whitespace-nowrap font-mono text-xs text-fog">{fmtDate(sub.startDate)}</Td>
                    <Td className="text-right">
                      <DeleteSubscriptionButton subId={sub.id} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-4 font-mono text-[11px] text-fog">
        switching to Starter / Growth applies the fixed price automatically · Scale keeps a custom MRR
      </p>
    </>
  );
}
