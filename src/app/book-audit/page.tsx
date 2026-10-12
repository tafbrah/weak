import type { Metadata } from "next";
import { ArrowLeft, Check, Mail, MapPin, Timer } from "lucide-react";
import Link from "next/link";
import { asc } from "drizzle-orm";
import DynamicAuditQuestionnaire from "@/components/landing/audit-questionnaire-dynamic";
import CookieBanner from "@/components/landing/cookie-banner";
import Footer from "@/components/landing/footer";
import Nav from "@/components/landing/nav";
import Reveal from "@/components/landing/reveal";
import { db } from "@/db";
import { auditFormFields } from "@/db/schema";
import { getDictionary, getEnabledLanguages, makeT, resolveLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Book the audit — Loopwerk",
  description:
    "A 10-step questionnaire about your automation project: processes, volume, budget and goals. We reply within one business day.",
};



export default async function BookAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const [locale, languagesList, formFields] = await Promise.all([
    resolveLocale(lang),
    getEnabledLanguages(),
    db.select().from(auditFormFields).orderBy(asc(auditFormFields.step), asc(auditFormFields.sortOrder)),
  ]);
  const dict = await getDictionary(locale);
  const t = makeT(dict);

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
    <div className="min-h-screen bg-paper text-ink">
      <Nav
        labels={labels}
        languagesList={languagesList.map((l) => ({ code: l.code, name: l.name }))}
        locale={locale}
      />
      <main id="main-content">
        <section className="border-t border-edge bg-ink text-bone">
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
            <Reveal>
              <Link
                href={locale === "en" ? "/" : `/?lang=${locale}`}
                className="inline-flex items-center gap-2 font-mono text-xs text-fog transition-colors hover:text-ember"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t("book.back", "back to loopwerk.studio")}
              </Link>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-8 max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-ember">
                  {t("book.kicker", "Book the audit · project questionnaire")}
                </p>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {t("book.title", "Ten steps between you and your first automation.")}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">
                  {t(
                    "book.intro",
                    "Answer the 10 questions below — it takes about 4 minutes. We use your answers to prepare the free audit: what to automate first, how many hours it returns, and what it costs.",
                  )}
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-8 lg:grid-cols-12">
              <Reveal delay={200} className="lg:col-span-4">
                <ul className="space-y-3">
                  {[
                    t("book.included.1", "A map of your repetitive loops, ranked by hours × pain"),
                    t("book.included.2", "An estimate of recoverable hours and first-year ROI"),
                    t("book.included.3", "The first workflow we'd build, sketched live on the call"),
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-bone">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember/20">
                        <Check className="h-3 w-3 text-ember" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <ul className="mt-8 space-y-3 border-t border-edge pt-6 text-sm text-fog">
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-ember" />
                    hello@loopwerk.studio
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 shrink-0 text-ember" />
                    Rotterdam · Amsterdam · remote, EU-wide
                  </li>
                  <li className="flex items-center gap-3">
                    <Timer className="h-4 w-4 shrink-0 text-ember" />
                    Reply within one business day
                  </li>
                </ul>

                <p className="mt-8 rounded-md border border-edge bg-panel px-4 py-3 font-mono text-[11px] leading-relaxed text-fog">
                  {t("book.tip", "tip: step 6 computes a live estimate of the hours we can recover each month.")}
                </p>
              </Reveal>

              <Reveal delay={280} from="right" className="lg:col-span-8">
                <DynamicAuditQuestionnaire fields={formFields} />
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} locale={locale} />
      <CookieBanner />
    </div>
  );
}
