import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Reveal from "./reveal";
import WorkflowCanvas from "./workflow-canvas";

export type TFn = (key: string, fallback: string) => string;

export default function Hero({ t, cms = {} }: { t: TFn; cms?: Record<string, string> }) {
  // CMS content takes priority over i18n translations
  const badge = cms["hero.badge"] || t("hero.kicker", "AI automation studio · n8n partner");
  const title1 = cms["hero.title1"] || t("hero.title1", "Automate the busywork.");
  const title2 = cms["hero.title2"] || t("hero.title2", "Scale the business.");
  const subtitle = cms["hero.subtitle"] || t("hero.sub", "We design, build, and run AI-powered automations on n8n — agents, pipelines, and integrations that give your team their time back.");
  const cta = cms["hero.cta"] || t("hero.cta", "Book a free audit");
  const secondary = cms["hero.secondary"] || t("hero.secondary", "See what we build");

  return (
    <section className="papergrid relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24 lg:pt-28">
        {/* Centered content */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Reveal>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-cream px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft sm:text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-ember" />
              {badge}
            </p>
          </Reveal>

          {/* Headline */}
          <Reveal delay={100}>
            <h1 className="mt-7 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:mt-8 sm:text-5xl lg:text-7xl lg:leading-[1.03]">
              {title1}
              <br />
              <span className="text-ember">{title2}</span>
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {subtitle}
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={300}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/book-audit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-ember px-7 py-3.5 text-sm font-bold text-cream shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ember-deep hover:shadow-lg sm:w-auto"
              >
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#services"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-ink/20 px-7 py-3.5 text-sm font-semibold text-ink transition-all hover:border-ember hover:text-ember sm:w-auto"
              >
                {secondary}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <Reveal delay={400}>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-3 divide-x divide-line border-y border-line">
            {[
              ["42", t("hero.stats.workflows", "workflows in production")],
              ["128k", t("hero.stats.executions", "executions / month")],
              ["99.4%", t("hero.stats.success", "run success rate")],
            ].map(([v, l]) => (
              <div key={l} className="px-3 py-4 first:pl-0 sm:px-6 sm:py-5">
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{v}</dd>
                <dd className="mt-1 font-mono text-[8.5px] uppercase tracking-wider text-mist sm:text-[10px]">{l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Workflow Canvas */}
        <Reveal delay={500}>
          <div className="mt-14">
            <WorkflowCanvas />
            <p className="mt-3 text-center font-mono text-[10px] text-mist sm:text-[11px]">
              {t(
                "hero.canvas.caption",
                "Live build: an AI agent scoring and routing inbound leads — one of 42 we run for clients today.",
              )}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
