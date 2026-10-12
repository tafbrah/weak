import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import {
  GatewayPanel,
  PaymentActions,
  RecordPaymentForm,
  type GatewayState,
} from "@/components/admin/payments-controls";
import { Badge, Empty, PageHeader, Panel, StatCard, Td, Th, type Tone } from "@/components/admin/ui";
import { getAllConfig, maskSecret } from "@/lib/config";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { clients, payments } from "@/db/schema";

export const metadata: Metadata = { title: "Payments — Loopwerk console" };

const STATUS_TONE: Record<string, Tone> = {
  pending: "honey",
  succeeded: "moss",
  failed: "rust",
  refunded: "fog",
};

const STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;

function money(cents: number, currency: string) {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return `${symbol}${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { t } = await getConsoleI18n();

  const [rows, cfg, clientsRows, countRows, collectedRows, refundedRows] = await Promise.all([
    db.select().from(payments).orderBy(desc(payments.createdAt)),
    getAllConfig(),
    db.select({ company: clients.company, email: clients.email }).from(clients),
    db.select({ status: payments.status, c: sql<number>`count(*)::int` }).from(payments).groupBy(payments.status),
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amountCents}), 0)::int` })
      .from(payments)
      .where(sql`${payments.status} = 'succeeded' AND ${payments.createdAt} >= now() - interval '30 days'`),
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amountCents}), 0)::int` })
      .from(payments)
      .where(sql`${payments.status} = 'refunded'`),
  ]);

  const filter = (STATUSES as readonly string[]).includes(params.status ?? "")
    ? (params.status as (typeof STATUSES)[number])
    : undefined;
  const visible = filter ? rows.filter((r) => r.status === filter) : rows;

  const succeeded = rows.filter((r) => r.status === "succeeded").length;
  const failed = rows.filter((r) => r.status === "failed").length;
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const successRate = succeeded + failed > 0 ? Math.round((succeeded / (succeeded + failed)) * 100) : 100;
  const counts = new Map(countRows.map((r) => [r.status, r.c]));
  const currency = cfg.gateway_currency || "EUR";

  const gateway: GatewayState = {
    provider: cfg.gateway_provider || "stripe",
    mode: cfg.gateway_mode || "test",
    currency,
    apiKeyMasked: maskSecret(cfg.gateway_api_key ?? ""),
    webhookMasked: maskSecret(cfg.gateway_webhook_secret ?? ""),
    configured: (cfg.gateway_api_key ?? "").trim().length > 0,
  };

  const labels: Record<string, string> = {
    "gateway.title": t("gateway.title", "Payment gateway API"),
    "gateway.sub": t("gateway.sub", "Connect the provider that collects your payments."),
    "gateway.provider": t("gateway.provider", "Provider"),
    "gateway.mode": t("gateway.mode", "Mode"),
    "gateway.currency": t("gateway.currency", "Currency"),
    "gateway.apiKey": t("gateway.apiKey", "API key"),
    "gateway.webhook": t("gateway.webhook", "Webhook secret"),
    "gateway.save": t("gateway.save", "Save configuration"),
    "gateway.test": t("gateway.test", "Test connection"),
    "gateway.saved": t("gateway.saved", "Configuration saved."),
    "gateway.notConfigured": t("gateway.notConfigured", "not configured"),
    "record.open": t("record.open", "Record a payment"),
    "record.title": t("record.title", "Record a payment"),
    "record.customer": t("record.customer", "Customer"),
    "record.amount": t("record.amount", "Amount (€)"),
    "record.method": t("record.method", "Method"),
    "record.status": t("record.status", "Status"),
    "record.description": t("record.description", "Description"),
    "record.submit": t("record.submit", "Add payment"),
    "actions.markPaid": t("actions.markPaid", "Mark paid"),
    "actions.refund": t("actions.refund", "Refund"),
    "actions.delete": t("actions.delete", "Delete"),
  };

  return (
    <>
      <PageHeader
        title={t("console.payments.title", "Payments")}
        sub={`${rows.length} payments · gateway: ${gateway.provider} (${gateway.mode})`}
      />

      <GatewayPanel initial={gateway} labels={labels} />

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label={t("kpi.collected", "Collected (30 days)")}
          value={money(collectedRows[0]?.total ?? 0, currency)}
          tone="moss"
          sub={`${succeeded} successful payments`}
        />
        <StatCard label={t("kpi.success", "Success rate")} value={`${successRate}%`} tone="moss" sub={`${failed} failed`} />
        <StatCard label={t("kpi.pending", "Pending")} value={String(pendingCount)} tone={pendingCount > 0 ? "honey" : "fog"} sub="awaiting settlement" />
        <StatCard label={t("kpi.refunded", "Refunded")} value={money(refundedRows[0]?.total ?? 0, currency)} sub="all time" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={"/admin/payments" as Route}
            className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] transition-colors ${
              !filter ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
            }`}
          >
            {t("filter.all", "All")} · {rows.length}
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/payments?status=${s}` as Route}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${
                filter === s ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
              }`}
            >
              {s} · {counts.get(s) ?? 0}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 mb-6">
        <RecordPaymentForm clients={clientsRows} labels={labels} />
      </div>

      <Panel>
        {visible.length === 0 ? (
          <Empty>No payments in this view.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="border-b border-edge">
                <tr>
                  <Th>Customer</Th>
                  <Th>Description</Th>
                  <Th>Method</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60">
                {visible.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-panel-2/50">
                    <Td>
                      <p className="font-medium text-bone">{p.customer}</p>
                      {p.email && <p className="font-mono text-[11px] text-fog">{p.email}</p>}
                    </Td>
                    <Td className="max-w-[260px]">
                      <p className="truncate text-fog" title={p.description}>
                        {p.description || "—"}
                      </p>
                      {p.gatewayRef && <p className="truncate font-mono text-[10px] text-fog/60">{p.gatewayRef}</p>}
                    </Td>
                    <Td className="font-mono text-xs uppercase text-fog">{p.method}</Td>
                    <Td className="text-right font-mono text-sm text-bone">{money(p.amountCents, p.currency)}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[p.status] ?? "fog"}>{p.status}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap font-mono text-xs text-fog">
                      {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </Td>
                    <Td className="text-right">
                      <PaymentActions paymentId={p.id} status={p.status} labels={labels} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-4 font-mono text-[11px] text-fog">
        pending → mark paid · succeeded → refund · configure the gateway above to connect your provider
      </p>
    </>
  );
}
