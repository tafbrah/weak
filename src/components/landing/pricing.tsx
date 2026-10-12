import { Check } from "lucide-react";
import Link from "next/link";
import { getPlans } from "@/lib/plans";
import Reveal from "./reveal";

export default async function Pricing({ t }: { t: (key: string, fallback: string) => string }) {
  // Live package catalog — prices edited in the console appear here instantly.
  const catalog = await getPlans();
  const byKey = new Map(catalog.map((p) => [p.key, p]));

  const formatPrice = (key: string, fallback: number) => {
    const price = byKey.get(key)?.price ?? fallback;
    return price > 0 ? `€${price.toLocaleString("en-US")}` : "Custom";
  };

  return (
    <section id="pricing" className="border-y border-line bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        {/* Header */}
        <div className="max-w-3xl text-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-ember">
              {t("pricing.kicker", "Pricing")}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("pricing.title", "Transparent pricing, real value.")}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              {t(
                "pricing.sub",
                "Choose the plan that fits your needs. All plans include hosting, monitoring, and continuous improvements.",
              )}
            </p>
          </Reveal>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-3">
          {/* Starter Plan */}
          <Reveal delay={100}>
            <article className="flex h-full flex-col rounded-lg border border-line bg-paper p-7 transition-all duration-200 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_18px_40px_-24px_rgb(22_24_29/0.35)]">
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold">Starter</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {t("pricing.starter.blurb", "Perfect for getting started with automation.")}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {formatPrice("starter", 1900)}
                  </span>
                  <span className="text-sm text-mist">/ month</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.starter.f1", "2 production workflows")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.starter.f2", "n8n hosting included")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.starter.f3", "Monthly improvement slot")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.starter.f4", "Email support, 1-day SLA")}
                  </span>
                </li>
              </ul>

              <Link
                href="/book-audit"
                className="block rounded-md border border-ink/20 px-4 py-3 text-center text-sm font-bold text-ink transition-colors hover:border-ember hover:text-ember"
              >
                {t("pricing.starter.cta", "Start with Starter")}
              </Link>
            </article>
          </Reveal>

          {/* Growth Plan - Featured */}
          <Reveal delay={200}>
            <article className="relative flex h-full flex-col rounded-lg border border-ink bg-ink p-7 text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_34px_70px_-30px_rgb(22_24_29/0.75)]">
              <span className="absolute -top-3 left-7 rounded-full bg-ember px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest text-shell">
                {t("pricing.growth.badge", "Most Popular")}
              </span>

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-white">Growth</h3>
                <p className="mt-1 text-sm text-white/80">
                  {t("pricing.growth.blurb", "For teams ready to scale their automation.")}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight text-white">
                    {formatPrice("growth", 4500)}
                  </span>
                  <span className="text-sm text-white/80">/ month</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="text-white">
                    {t("pricing.growth.f1", "6 production workflows")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="text-white">
                    {t("pricing.growth.f2", "AI agents with approval gates")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="text-white">
                    {t("pricing.growth.f3", "Weekly iteration sprints")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="text-white">
                    {t("pricing.growth.f4", "Slack channel, 4-hour SLA")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="text-white">
                    {t("pricing.growth.f5", "Quarterly ROI report")}
                  </span>
                </li>
              </ul>

              <Link
                href="/book-audit"
                className="block rounded-md bg-ember px-4 py-3 text-center text-sm font-bold text-cream transition-colors hover:bg-ember-deep"
              >
                {t("pricing.growth.cta", "Start with Growth")}
              </Link>
            </article>
          </Reveal>

          {/* Scale Plan */}
          <Reveal delay={300}>
            <article className="flex h-full flex-col rounded-lg border border-line bg-paper p-7 transition-all duration-200 hover:-translate-y-1 hover:border-ember/40 hover:shadow-[0_18px_40px_-24px_rgb(22_24_29/0.35)]">
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold">Scale</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {t("pricing.scale.blurb", "Enterprise-grade automation at scale.")}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {formatPrice("scale", 0)}
                  </span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.scale.f1", "Unlimited workflows")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.scale.f2", "Self-hosted in your VPC")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.scale.f3", "Embedded automation squad")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.scale.f4", "24/7 monitoring & on-call")}
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                  <span className="text-ink-soft">
                    {t("pricing.scale.f5", "Custom SLA & reporting")}
                  </span>
                </li>
              </ul>

              <Link
                href="/book-audit"
                className="block rounded-md border border-ink/20 px-4 py-3 text-center text-sm font-bold text-ink transition-colors hover:border-ember hover:text-ember"
              >
                {t("pricing.scale.cta", "Contact Sales")}
              </Link>
            </article>
          </Reveal>
        </div>

        {/* Footer Note */}
        <Reveal delay={400}>
          <div className="mt-12 rounded-lg border border-line bg-paper p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-mist">
              {t(
                "pricing.footnote",
                "All plans include n8n hosting, execution monitoring, and a live dashboard.",
              )}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
