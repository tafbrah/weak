import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/landing/footer";
import Nav from "@/components/landing/nav";
import Reveal from "@/components/landing/reveal";
import { getSiteI18n } from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Partnership — Loopwerk",
  description: "Partner with Loopwerk: white-label n8n builds, delivery squads and automation training for agencies and consultants.",
};

export const dynamic = "force-dynamic";

export default async function PartnershipPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const { locale, languagesList, t, labels } = await getSiteI18n(lang);

  const partners = [
    {
      title: t("partnership.t1.title", "Agencies & studios"),
      copy: t(
        "partnership.t1.copy",
        "Add an automation practice to your offer. We build white-label under your brand, you own the client relationship.",
      ),
    },
    {
      title: t("partnership.t2.title", "Consultants & operators"),
      copy: t(
        "partnership.t2.copy",
        "You audit, we deliver. Bring us the process map and your client gets a monitored n8n system in weeks.",
      ),
    },
    {
      title: t("partnership.t3.title", "SaaS & tech teams"),
      copy: t(
        "partnership.t3.copy",
        "Embed AI workflows around your product. We integrate, you ship — with shared SLAs and clean handovers.",
      ),
    },
  ];

  const offers = [
    t("partnership.o1", "White-label delivery — our engineers, your brand"),
    t("partnership.o2", "Partner pricing & recurring revenue share"),
    t("partnership.o3", "Training: bring your team up to n8n speed"),
    t("partnership.o4", "Shared monitoring & on-call coverage"),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav labels={labels} languagesList={languagesList} locale={locale} />
      <main>
        <section className="papergrid border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                {t("partnership.kicker", "Partnership")}
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {t("partnership.title", "Build automation with us.")}
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
                {t(
                  "partnership.p1",
                  "Loopwerk partners with agencies, consultants and product teams who want to offer AI automation without building a delivery practice from scratch. We bring the engineers, the method and the monitoring — you bring the clients.",
                )}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            {t("partnership.types.title", "Who we partner with")}
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {partners.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <article className="h-full rounded-lg border border-line bg-cream p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/50">
                  <h2 className="font-display text-lg font-bold">{p.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                {t("partnership.offer.title", "What partners get")}
              </p>
              <ul className="mt-6 space-y-3">
                {offers.map((o) => (
                  <li key={o} className="flex items-start gap-3 rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink-soft">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between rounded-lg bg-ink p-8">
              <p className="font-display text-2xl font-bold leading-snug text-bone">
                {t("partnership.cta.title", "One conversation is enough to scope a first joint project.")}
              </p>
              <Link
                href={`/book-audit?lang=${locale}`}
                className="mt-8 w-fit rounded-md bg-ember px-5 py-3 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
              >
                {t("partnership.cta", "Start the conversation")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}
