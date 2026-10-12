import type { Metadata } from "next";
import Casework from "@/components/landing/casework";
import CookieBanner from "@/components/landing/cookie-banner";
import Domains from "@/components/landing/domains";
import Faq from "@/components/landing/faq";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Marquee from "@/components/landing/marquee";
import Nav from "@/components/landing/nav";
import Pricing from "@/components/landing/pricing";
import Verticals from "@/components/landing/verticals";
import Process from "@/components/landing/process";
import Services from "@/components/landing/services";
import { getCmsContentMap } from "@/lib/cms";
import { getDictionary, getEnabledLanguages, makeT, resolveLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

// Rendered per request so package prices and translations edited in the
// console appear immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — ${SITE.nameSuffix}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;

  const [locale, languagesList, cms] = await Promise.all([
    resolveLocale(lang),
    getEnabledLanguages(),
    getCmsContentMap(),
  ]);
  const dict = await getDictionary(locale);
  const t = makeT(dict);

  const faqItems = [
    { q: t("faq.q1", "Do we need to run n8n already?"), a: t("faq.a1", "No. We provision and manage the n8n instance — cloud or self-hosted in your VPC — including credentials, upgrades and queue workers. If you already run it, we take over operations.") },
    { q: t("faq.q2", "How is this different from Zapier or Make?"), a: t("faq.a2", "Depth and ownership. n8n gives us real branching, AI nodes, error handling, version control and self-hosting. Your data doesn't leave your infrastructure, and the workflow JSON is yours to keep.") },
    { q: t("faq.q3", "Who owns the automations?"), a: t("faq.a3", "You do, fully. Every workflow ships with exportable JSON, documentation and a handover session. No lock-in — our retention rate comes from results, not contracts.") },
    { q: t("faq.q4", "What about data security?"), a: t("faq.a4", "Self-hosted n8n in an EU region by default, least-privilege credentials per node, secrets in a vault, and complete execution logs. We sign DPAs and support your security review.") },
    { q: t("faq.q5", "How fast is the first automation live?"), a: t("faq.a5", "Fourteen days from kickoff, typically. The audit week picks the highest-leverage loop, the blueprint week designs it, and it goes live in sprint one with staging runs on real data.") },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: `${SITE.name} — ${SITE.nameSuffix}`,
      description: SITE.description,
      url: SITE.url,
      image: `${SITE.url}${SITE.ogImage}`,
      areaServed: "Europe",
      knowsAbout: ["AI automation", "n8n", "AI agents", "workflow automation", "process automation"],
      makesOffer: [
        { "@type": "Offer", name: "Starter", description: "One high-value automation loop, built and monitored." },
        { "@type": "Offer", name: "Growth", description: "A dedicated automation engineer plus AI agents." },
        { "@type": "Offer", name: "Scale", description: "We run your whole operations layer on n8n." },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const labels = {
    services: t("nav.services", "Services"),
    process: t("nav.process", "Process"),
    work: t("nav.work", "Work"),
    pricing: t("nav.pricing", "Pricing"),
    faq: t("nav.faq", "FAQ"),
    login: t("nav.login", "Login"),
    cta: t("nav.cta", "Book an audit"),
  };

  return (
    <div id="top" className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav labels={labels} languagesList={languagesList.map((l) => ({ code: l.code, name: l.name }))} locale={locale} />
      <main id="main-content">
        <Hero t={t} cms={cms} />
        <Marquee t={t} />
        <Services t={t} />
        <Domains t={t} />
        <Verticals t={t} />
        <Process t={t} />
        <Casework t={t} />
        <Pricing t={t} />
        <Faq
          kicker={t("faq.kicker", "FAQ")}
          title={t("faq.title", "Asked before every kickoff.")}
          sideBefore={t("faq.side", "Something else on your mind?")}
          sideLink={t("faq.side.link", "Ask it when you book your audit")}
          sideAfter={t("faq.side.after", "— a human replies within one business day.")}
          items={faqItems}
        />
      </main>
      <Footer t={t} locale={locale} />
      <CookieBanner />
    </div>
  );
}
