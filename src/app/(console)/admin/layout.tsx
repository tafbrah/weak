import { desc, sql } from "drizzle-orm";
import type { ReactNode } from "react";
import MobileBar from "@/components/admin/mobile-bar";
import Sidebar from "@/components/admin/sidebar";
import Topbar, { type NotificationItem } from "@/components/admin/topbar";
import { requireAdmin } from "@/lib/auth";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { leads, payments, workflows } from "@/db/schema";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const { t, locale, languages } = await getConsoleI18n();
  const languagesList = languages.map((l) => ({ code: l.code, name: l.name }));

  const labels: Record<string, string> = {
    "console.nav.overview": t("console.nav.overview", "Overview"),
    "console.nav.workflows": t("console.nav.workflows", "Workflows"),
    "console.nav.subscriptions": t("console.nav.subscriptions", "Subscriptions"),
    "console.nav.customers": t("console.nav.customers", "Customers"),
    "console.nav.team": t("console.nav.team", "Team"),
    "console.nav.cookies": t("console.nav.cookies", "Cookies"),
    "console.nav.auditForm": t("console.nav.auditForm", "Audit Form"),
    "console.nav.cms": t("console.nav.cms", "CMS"),
    "console.nav.conferences": t("console.nav.conferences", "Conferences"),
    "console.nav.messages": t("console.nav.messages", "Email / SMS"),
    "console.nav.cache": t("console.nav.cache", "Cache"),
    "console.nav.payments": t("console.nav.payments", "Payments"),
    "console.nav.users": t("console.nav.users", "User management"),
    "console.nav.languages": t("console.nav.languages", "Languages"),
    "console.nav.settings": t("console.nav.settings", "Settings"),
    "console.logout": t("console.logout", "Logout"),
    "console.opsConsole": t("console.opsConsole", "ops console"),
    "console.viewSite": t("console.viewSite", "View site"),
    "console.language": t("console.language", "Language"),
  };

  // Live notifications: new leads, pending & failed payments, paused workflows.
  const [newLeads, pendingPays, failedPays, pausedWfs] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(sql`${leads.status} = 'new' AND ${leads.createdAt} >= now() - interval '7 days'`)
      .orderBy(desc(leads.createdAt))
      .limit(4),
    db.select().from(payments).where(sql`${payments.status} = 'pending'`).orderBy(desc(payments.createdAt)).limit(3),
    db
      .select()
      .from(payments)
      .where(sql`${payments.status} = 'failed' AND ${payments.createdAt} >= now() - interval '30 days'`)
      .orderBy(desc(payments.createdAt))
      .limit(2),
    db.select().from(workflows).where(sql`${workflows.status} = 'paused'`).limit(2),
  ]);

  const notifications: NotificationItem[] = [
    ...newLeads.map((l) => ({
      kind: "lead" as const,
      text: `New lead — ${l.name}${l.company ? ` (${l.company})` : ""}`,
      at: l.createdAt.toISOString(),
    })),
    ...pendingPays.map((p) => ({
      kind: "pending" as const,
      text: `Payment pending — ${p.customer} · €${(p.amountCents / 100).toLocaleString("en-US")}`,
      at: p.createdAt.toISOString(),
    })),
    ...failedPays.map((p) => ({
      kind: "failed" as const,
      text: `Payment failed — ${p.customer} · €${(p.amountCents / 100).toLocaleString("en-US")}`,
      at: p.createdAt.toISOString(),
    })),
    ...pausedWfs.map((w) => ({
      kind: "paused" as const,
      text: `Workflow paused — ${w.name}`,
      at: w.createdAt.toISOString(),
    })),
  ].slice(0, 8);

  return (
    <div className="min-h-screen bg-coal text-bone">
      <Sidebar labels={labels} languagesList={languagesList} locale={locale} />
      <MobileBar labels={labels} languagesList={languagesList} locale={locale} />
      <div className="lg:pl-64">
        <Topbar notifications={notifications} />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
