import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import ApiConfigPanel, { type ApiConfigState } from "@/components/admin/api-config-panel";
import { Panel, PageHeader } from "@/components/admin/ui";
import { ADMIN_EMAIL } from "@/lib/constants";
import { getApiConfig, maskSecret } from "@/lib/config";
import { db } from "@/db";
import { clients, leads, runs, users, workflows } from "@/db/schema";
import { num } from "@/lib/format";
import { getConsoleI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Settings — Loopwerk console" };

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-edge/60 px-5 py-3 last:border-b-0">
      <span className="font-mono text-xs text-fog">{k}</span>
      <span className="font-mono text-xs text-bone">{v}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const { t } = await getConsoleI18n();
  const [wfCount, leadCount, clientCount, runCount, userCount, avgDuration] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(workflows),
    db.select({ c: sql<number>`count(*)::int` }).from(leads),
    db.select({ c: sql<number>`count(*)::int` }).from(clients),
    db.select({ c: sql<number>`count(*)::int` }).from(runs),
    db.select({ c: sql<number>`count(*)::int` }).from(users),
    db.select({ c: sql<number>`coalesce(avg(${runs.durationMs}), 0)::int` }).from(runs),
  ]);

  const cfg = await getApiConfig();
  const initial: ApiConfigState = {
    n8n: {
      url: cfg.n8n.url,
      apiKeyMasked: maskSecret(cfg.n8n.apiKey),
      configured: Boolean(cfg.n8n.url && cfg.n8n.apiKey),
      source: cfg.n8n.source,
    },
    claude: {
      apiKeyMasked: maskSecret(cfg.claude.apiKey),
      model: cfg.claude.model,
      configured: Boolean(cfg.claude.apiKey),
      source: cfg.claude.source,
    },
  };

  return (
    <>
      <PageHeader
        title={t("console.settings.title", "Settings")}
        sub={t("console.settings.sub", "Workspace configuration, API connections and instance facts.")}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-bone">API configuration</h2>
          <ApiConfigPanel initial={initial} />
        </div>

        <Panel title="n8n instance" sub="Where the automations run">
          <Row k="version" v="v1.94.1 (self-hosted)" />
          <Row k="region" v="eu-central-1 · client VPC" />
          <Row k="queue mode" v="redis · 4 workers" />
          <Row k="avg execution time" v={`${((avgDuration[0]?.c ?? 0) / 1000).toFixed(1)}s`} />
          <Row k="error alerting" v="slack #ops-alerts" />
          <Row k="nightly backup" v="03:00 UTC · postgres + json exports" />
        </Panel>

        <Panel title="Database" sub="Live row counts from postgres">
          <Row k="users" v={num(userCount[0]?.c ?? 0)} />
          <Row k="workflows" v={num(wfCount[0]?.c ?? 0)} />
          <Row k="runs" v={num(runCount[0]?.c ?? 0)} />
          <Row k="leads" v={num(leadCount[0]?.c ?? 0)} />
          <Row k="clients" v={num(clientCount[0]?.c ?? 0)} />
        </Panel>

        <Panel title="Console access" sub="Demo credentials for this environment">
          <Row k="url" v="/admin/login" />
          <Row k="email" v={ADMIN_EMAIL} />
          <Row k="password" v="n8n-admin" />
          <Row k="session" v="cookie-less · signed URL token" />
        </Panel>

        <Panel title="About this demo" sub="What is real and what is staged">
          <div className="space-y-3 px-5 py-4 text-sm leading-relaxed text-fog">
            <p>
              Everything in this console reads and writes a real PostgreSQL database via Drizzle
              ORM. Questionnaire submissions arrive in Workflows and are turned into n8n templates.
            </p>
            <p>
              Connect your n8n instance and Claude API key above — generation and delivery switch
              to them immediately, no restart needed.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
