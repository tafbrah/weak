import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/landing/footer";
import Nav from "@/components/landing/nav";
import Reveal from "@/components/landing/reveal";
import { getSiteI18n } from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "About — Loopwerk",
  description: "Loopwerk is an AI automation studio building monitored n8n systems with AI at the decision points.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const { locale, languagesList, t, labels } = await getSiteI18n(lang);

  const values = [
    {
      title: t("about.v1.title", "Ownership"),
      copy: t(
        "about.v1.copy",
        "Every workflow we ship is yours: exportable JSON, documentation and a handover session. No lock-in, ever.",
      ),
    },
    {
      title: t("about.v2.title", "Human in the loop"),
      copy: t(
        "about.v2.copy",
        "Machines prepare, people decide. High-stakes steps always carry an approval gate — in Slack or by email.",
      ),
    },
    {
      title: t("about.v3.title", "Measured hours"),
      copy: t(
        "about.v3.copy",
        "Every engagement is scored in hours returned, before and after. If we can't measure it, we don't sell it.",
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav labels={labels} languagesList={languagesList} locale={locale} />
      <main>
        <section className="papergrid border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                {t("about.kicker", "About")}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {t("about.title", "The studio behind the automations.")}
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-8 max-w-2xl space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                <p>{t("about.p1", "Loopwerk is an AI automation studio. We design, build and run n8n systems with AI at the decision points — agents, pipelines and integrations that take the repetitive work off your team's desk for good.")}</p>
                <p>{t("about.p2", "We work as an extension of your operations: a fixed process, two-week sprints, and a live dashboard you can always look at. No black boxes, no six-month discovery phases.")}</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            {t("about.values.title", "What we believe")}
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 120}>
                <article className="h-full rounded-lg border border-line bg-cream p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/50">
                  <p className="font-display text-3xl font-bold text-line">0{i + 1}</p>
                  <h2 className="mt-4 font-display text-lg font-bold">{v.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg bg-ink p-8 sm:flex-row sm:items-center">
            <p className="max-w-md font-display text-xl font-bold text-bone">
              {t("about.cta.title", "See what a first automation could return you.")}
            </p>
            <Link
              href={`/book-audit?lang=${locale}`}
              className="rounded-md bg-ember px-5 py-3 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
            >
              {t("nav.cta", "Book an audit")}
            </Link>
          </div>
        </section>
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}
