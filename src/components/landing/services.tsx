import type { ReactNode } from "react";
import type { TFn } from "./hero";
import Reveal from "./reveal";

function Card({
  className = "",
  title,
  copy,
  children,
}: {
  className?: string;
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <article
      className={`group h-full rounded-lg border border-line bg-cream p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/50 hover:shadow-[0_18px_40px_-24px_rgb(22_24_29/0.35)] ${className}`}
    >
      <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{copy}</p>
      {children}
    </article>
  );
}

export default function Services({ t }: { t: TFn }) {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <Reveal>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ember">
              {t("services.kicker", "What we build")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("services.title", "Automation, as a product.")}
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-2 lg:pt-8">
          <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {t(
              "services.intro",
              "Not one-off Zaps. We ship monitored, versioned, self-hostable n8n systems with AI at the decision points — and we keep them running under SLA.",
            )}
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-6">
        <Reveal delay={80} className="md:col-span-2 lg:col-span-4">
          <Card
            className="lg:flex lg:flex-col"
            title={t("services.agents.title", "AI agents that own a queue")}
            copy={t(
              "services.agents.copy",
              "Agents that read, research, decide and act — triaging leads, tickets and documents, escalating to a human only when confidence drops. Every decision is logged and auditable.",
            )}
          >
            <div className="mt-6 flex-1 rounded-md border border-edge bg-coal p-4 font-mono text-[11px] leading-relaxed text-fog">
              <p className="text-bone">{t("services.terminal.head", "$ agent run #4213 — inbound-lead-triage")}</p>
              <p className="mt-2">{t("services.terminal.l1", "→ parse webhook payload · ok")}</p>
              <p>{t("services.terminal.l2", "→ enrich via Clearbit · Nordwind Logistics, 240 FTE")}</p>
              <p>{t("services.terminal.l3", "→ GPT score 91/100 · intent: pricing")}</p>
              <p>{t("services.terminal.l4", "→ route to #sales-eu · draft intro ✓ sent for approval")}</p>
              <p className="mt-2 text-moss">{t("services.terminal.l5", "✓ done in 1.2s · human review requested")}</p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={160} className="lg:col-span-2">
          <Card
            title={t("services.pipeline.title", "Lead-to-revenue pipelines")}
            copy={t(
              "services.pipeline.copy",
              "Webhook to CRM to invoice: every handoff wired, deduped and reconciled — so revenue ops runs itself.",
            )}
          />
        </Reveal>

        <Reveal delay={240} className="lg:col-span-2">
          <Card
            title={t("services.docs.title", "Document intelligence")}
            copy={t(
              "services.docs.copy",
              "OCR + LLM extraction for invoices, contracts and intake forms, with validation rules before anything hits your ERP.",
            )}
          />
        </Reveal>

        <Reveal delay={320} className="lg:col-span-2">
          <Card
            title={t("services.support.title", "Support triage & deflection")}
            copy={t(
              "services.support.copy",
              "Classify, draft and resolve tier-1 tickets in seconds. Agents escalate edge cases with full context attached.",
            )}
          />
        </Reveal>

        <Reveal delay={400} className="lg:col-span-2">
          <Card
            title={t("services.hitl.title", "Human-in-the-loop approvals")}
            copy={t(
              "services.hitl.copy",
              "Slack or email approval gates on every high-stakes step. Machines prepare, people decide, loops close.",
            )}
          />
        </Reveal>

        <Reveal delay={480} className="lg:col-span-2">
          <Card
            className="lg:flex lg:flex-col lg:justify-between lg:bg-ink lg:text-bone"
            title={t("services.selfhost.title", "Self-hosted & compliant")}
            copy={t(
              "services.selfhost.copy",
              "Your data stays in your VPC. EU hosting, least-privilege credentials, full execution logs for audit.",
            )}
          >
            <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-fog lg:text-fog">
              {t("services.selfhost.badge", "SOC2-ready · GDPR · EU region")}
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
