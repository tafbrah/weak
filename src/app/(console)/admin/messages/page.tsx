import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Mail, Smartphone } from "lucide-react";
import { desc, sql } from "drizzle-orm";
import {
  ComposeMessageForm,
  MessageActions,
  MessagingProviderPanel,
  TemplateList,
  type ClientOption,
  type MessagingState,
  type TemplateOption,
} from "@/components/admin/messaging-controls";
import { Badge, Empty, PageHeader, Panel, StatCard, type Tone } from "@/components/admin/ui";
import { getConsoleI18n } from "@/lib/i18n";
import { messagingConfig } from "@/lib/messaging";
import { db } from "@/db";
import { clients, messageTemplates, messages } from "@/db/schema";

export const metadata: Metadata = { title: "Messages — Loopwerk console" };

const STATUS_TONE: Record<string, Tone> = {
  draft: "fog",
  scheduled: "honey",
  sent: "ember",
  delivered: "moss",
  failed: "rust",
};

const KINDS = ["email", "sms"] as const;
const STATUSES = ["draft", "scheduled", "sent", "delivered", "failed"] as const;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { t } = await getConsoleI18n();

  const [rows, clientsRows, templates, messaging, countRows] = await Promise.all([
    db.select().from(messages).orderBy(desc(messages.createdAt)),
    db.select({ company: clients.company, contact: clients.contact, email: clients.email }).from(clients),
    db.select().from(messageTemplates).orderBy(desc(messageTemplates.createdAt)),
    messagingConfig(),
    db.select({ status: messages.status, c: sql<number>`count(*)::int` }).from(messages).groupBy(messages.status),
  ]);

  const kindFilter = (KINDS as readonly string[]).includes(params.kind ?? "") ? (params.kind as (typeof KINDS)[number]) : undefined;
  const statusFilter = (STATUSES as readonly string[]).includes(params.status ?? "") ? (params.status as (typeof STATUSES)[number]) : undefined;

  const visible = rows.filter((m) => {
    if (kindFilter && m.kind !== kindFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  const counts = new Map(countRows.map((r) => [r.status, r.c]));
  const sentOrDelivered = rows.filter((m) => m.status === "sent" || m.status === "delivered").length;
  const failedCount = rows.filter((m) => m.status === "failed").length;
  const emailsSent = rows.filter((m) => m.kind === "email" && (m.status === "sent" || m.status === "delivered")).length;
  const smsSent = rows.filter((m) => m.kind === "sms" && (m.status === "sent" || m.status === "delivered")).length;

  const messagingState: MessagingState = {
    emailProvider: messaging.emailProvider,
    emailKeyMasked: messaging.emailKeyMasked,
    emailFrom: messaging.emailFrom,
    emailConfigured: messaging.emailConfigured,
    smsProvider: messaging.smsProvider,
    smsKeyMasked: messaging.smsKeyMasked,
    smsSender: messaging.smsSender,
    smsConfigured: messaging.smsConfigured,
  };

  const clientOptions: ClientOption[] = clientsRows.map((c) => ({ company: c.company, contact: c.contact, email: c.email }));
  const templateOptions: TemplateOption[] = templates.map((tp) => ({
    id: tp.id,
    kind: tp.kind,
    name: tp.name,
    subject: tp.subject,
    body: tp.body,
  }));

  const labels: Record<string, string> = {
    "provider.title": t("msg.provider.title", "Email & SMS providers"),
    "provider.email": t("msg.provider.email", "email"),
    "provider.sms": t("msg.provider.sms", "sms"),
    "provider.emailChannel": t("msg.provider.emailChannel", "Email channel"),
    "provider.smsChannel": t("msg.provider.smsChannel", "SMS channel"),
    "provider.emailProvider": t("msg.provider.emailProvider", "Provider"),
    "provider.emailFrom": t("msg.provider.emailFrom", "From address"),
    "provider.emailKey": t("msg.provider.emailKey", "API key"),
    "provider.smsProvider": t("msg.provider.smsProvider", "Provider"),
    "provider.smsSender": t("msg.provider.smsSender", "Sender ID / number"),
    "provider.smsKey": t("msg.provider.smsKey", "API key"),
    "provider.testEmail": t("msg.provider.testEmail", "Test email"),
    "provider.testSms": t("msg.provider.testSms", "Test SMS"),
    "provider.save": t("msg.provider.save", "Save configuration"),
    "provider.saved": t("msg.provider.saved", "Configuration saved."),
    "compose.open": t("msg.compose.open", "Compose a message"),
    "compose.title": t("msg.compose.title", "Compose a message"),
    "compose.client": t("msg.compose.client", "Client"),
    "compose.template": t("msg.compose.template", "Use a template"),
    "compose.recipientName": t("msg.compose.recipientName", "Recipient name"),
    "compose.recipientEmail": t("msg.compose.recipientEmail", "Recipient email"),
    "compose.recipientPhone": t("msg.compose.recipientPhone", "Recipient phone"),
    "compose.subject": t("msg.compose.subject", "Subject"),
    "compose.body": t("msg.compose.body", "Message"),
    "compose.saveDraft": t("msg.compose.saveDraft", "Save draft"),
    "compose.send": t("msg.compose.send", "Send now"),
    "actions.resend": t("msg.actions.resend", "Resend"),
    "actions.delete": t("msg.actions.delete", "Delete"),
    "templates.empty": t("msg.templates.empty", "No templates yet."),
  };

  const href = (kind?: string, status?: string) => {
    const q = new URLSearchParams();
    if (kind) q.set("kind", kind);
    if (status) q.set("status", status);
    const s = q.toString();
    return (s ? `/admin/messages?${s}` : "/admin/messages") as Route;
  };

  return (
    <>
      <PageHeader
        title={t("console.messages.title", "Messages")}
        sub={`${rows.length} messages · ${sentOrDelivered} sent · ${failedCount} failed`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("msg.kpi.sent", "Sent / delivered")} value={String(sentOrDelivered)} tone="moss" sub="email + SMS" />
        <StatCard label={t("msg.kpi.emails", "Emails sent")} value={String(emailsSent)} sub="delivered or sent" />
        <StatCard label={t("msg.kpi.sms", "SMS sent")} value={String(smsSent)} sub="delivered or sent" />
        <StatCard label={t("msg.kpi.failed", "Failed")} value={String(failedCount)} tone={failedCount > 0 ? "rust" : "fog"} sub="needs attention" />
      </div>

      <div className="mt-6">
        <MessagingProviderPanel state={messagingState} labels={labels} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={href(undefined, statusFilter)}
          className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${!kindFilter ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"}`}
        >
          {t("filter.all", "All")}
        </Link>
        {KINDS.map((k) => (
          <Link
            key={k}
            href={href(k, statusFilter)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] capitalize transition-colors ${kindFilter === k ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"}`}
          >
            {k === "email" ? <Mail className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
            {k}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-edge" />
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={href(kindFilter, statusFilter === s ? undefined : s)}
            className={`rounded-full px-3 py-1.5 font-mono text-[11px] capitalize transition-colors ${statusFilter === s ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"}`}
          >
            {s} · {counts.get(s) ?? 0}
          </Link>
        ))}
      </div>

      <div className="mt-4 mb-6">
        <ComposeMessageForm clients={clientOptions} templates={templateOptions} labels={labels} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          {visible.length === 0 ? (
            <Empty>No messages in this view.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead className="border-b border-edge">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Type</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Message</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Status</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Date</th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge/60">
                  {visible.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-panel-2/50">
                      <td className="px-4 py-3 align-middle">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${m.kind === "email" ? "bg-ember/10 text-ember" : "bg-panel-2 text-fog"}`}>
                          {m.kind === "email" ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                        </span>
                      </td>
                      <td className="max-w-[300px] px-4 py-3 align-middle">
                        <p className="truncate text-sm font-medium text-bone">{m.subject || m.body.slice(0, 40)}</p>
                        <p className="truncate font-mono text-[11px] text-fog">
                          → {m.recipientName || m.clientName || m.recipientEmail || m.recipientPhone}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge tone={STATUS_TONE[m.status] ?? "fog"}>{m.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle font-mono text-xs text-fog">
                        {new Date(m.sentAt ?? m.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <MessageActions messageId={m.id} labels={labels} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title={t("msg.templates.title", "Templates")} sub={`${templates.length} reusable templates`}>
          <div className="px-4">
            <TemplateList templates={templateOptions} labels={labels} />
          </div>
        </Panel>
      </div>

      <p className="mt-4 font-mono text-[11px] text-fog">
        use {"{{contact}}"}, {"{{time}}"}, {"{{ref}}"} placeholders in templates · resend marks a message as sent again
      </p>
    </>
  );
}
