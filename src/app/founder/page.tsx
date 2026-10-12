import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/landing/footer";
import Nav from "@/components/landing/nav";
import Reveal from "@/components/landing/reveal";
import { getSiteI18n } from "@/lib/site-i18n";

export const metadata: Metadata = {
  title: "Founder — Loopwerk",
  description: "Lotte Bakker — founder of Loopwerk, AI automation studio. Background, track record and the team.",
};

export const dynamic = "force-dynamic";

const FOUNDER_EMAIL = "lotte@loopwerk.studio";
const FOUNDER_PHONE = "+31 6 24 18 92 07";

const TEAM = [
  { name: "Jonas Weber", img: "/images/team-jonas.jpg", roleKey: "team.m1.role", bioKey: "team.m1.bio", email: "jonas@loopwerk.studio" },
  { name: "Sofia Lindqvist", img: "/images/team-sofia.jpg", roleKey: "team.m2.role", bioKey: "team.m2.bio", email: "sofia@loopwerk.studio" },
  { name: "Elias Verhoeven", img: "/images/team-elias.jpg", roleKey: "team.m3.role", bioKey: "team.m3.bio", email: "elias@loopwerk.studio" },
];

export default async function FounderPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const { locale, languagesList, t, labels } = await getSiteI18n(lang);

  const stats = [
    { value: "10+", label: t("founder.stat1", "Years in operations") },
    { value: "42", label: t("founder.stat2", "Workflows in production") },
    { value: "3,400+", label: t("founder.stat3", "Hours recovered / month") },
    { value: "18", label: t("founder.stat4", "Clients served") },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav labels={labels} languagesList={languagesList} locale={locale} />
      <main>
        {/* header */}
        <section className="papergrid border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-5 lg:items-center">
            <Reveal className="lg:col-span-3">
              <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">{t("founder.kicker", "Founder")}</p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{t("founder.name", "Lotte Bakker")}</h1>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-mist">{t("founder.role", "Founder & automation architect")}</p>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{t("founder.intro", "Founder of Loopwerk, AI automation studio. Ten years in operations, one mission: give skilled teams their hours back.")}</p>

              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
                <a href={`tel:${FOUNDER_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-lg border border-line bg-cream px-4 py-3 transition-colors hover:border-ember">
                  <Phone className="h-4 w-4 shrink-0 text-ember" />
                  <span className="min-w-0">
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-mist">{t("founder.contact.phone", "Phone")}</span>
                    <span className="block truncate text-sm font-semibold">{FOUNDER_PHONE}</span>
                  </span>
                </a>
                <a href={`mailto:${FOUNDER_EMAIL}`} className="flex items-center gap-3 rounded-lg border border-line bg-cream px-4 py-3 transition-colors hover:border-ember">
                  <Mail className="h-4 w-4 shrink-0 text-ember" />
                  <span className="min-w-0">
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-mist">{t("founder.contact.email", "Email")}</span>
                    <span className="block truncate text-sm font-semibold">{FOUNDER_EMAIL}</span>
                  </span>
                </a>
                <div className="flex items-center gap-3 rounded-lg border border-line bg-cream px-4 py-3 sm:col-span-2">
                  <MapPin className="h-4 w-4 shrink-0 text-ember" />
                  <span>
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-mist">{t("founder.contact.location", "Location")}</span>
                    <span className="block text-sm font-semibold">{t("founder.location", "Rotterdam, Netherlands")}</span>
                  </span>
                </div>
              </div>
              </div>
            </Reveal>

            <Reveal from="right" delay={220} className="lg:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/founder.jpg"
                alt={t("founder.name", "Lotte Bakker")}
                className="mx-auto aspect-[4/5] w-full max-w-sm rounded-lg border border-line object-cover shadow-[0_24px_60px_-30px_rgb(22_24_29/0.45)]"
              />
            </Reveal>
          </div>
        </section>

        {/* bio + stats */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">{t("founder.bio.title", "Background")}</p>
          <div className="mt-6 max-w-3xl space-y-5 text-base leading-relaxed text-ink-soft">
            <p>{t("founder.bio.p1", "")}</p>
            <p>{t("founder.bio.p2", "")}</p>
            <p>{t("founder.bio.p3", "")}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="h-full rounded-lg border border-line bg-cream px-5 py-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/50">
                  <p className="font-display text-3xl font-bold tracking-tight text-ember">{s.value}</p>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-mist">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* quote */}
        <section className="border-y border-edge bg-ink">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
            <p className="text-center font-display text-2xl font-bold leading-snug text-bone sm:text-3xl">
              “{t("founder.quote", "Automation is not about replacing people. It's about giving them back the hours that make the job worth doing.")}”
            </p>
            <p className="mt-6 text-center font-mono text-xs uppercase tracking-widest text-fog">
              {t("founder.name", "Lotte Bakker")} · {t("founder.role", "Founder & automation architect")}
            </p>
          </div>
        </section>

        {/* team */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">{t("team.kicker", "The team")}</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("team.title", "Three specialists. One method.")}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{t("team.sub", "Loopwerk stays deliberately small: every project is delivered by senior engineers who own it end to end.")}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 130}>
              <article className="group h-full overflow-hidden rounded-lg border border-line bg-cream transition-all duration-200 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_18px_40px_-24px_rgb(22_24_29/0.4)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold">{m.name}</h3>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ember">{t(m.roleKey, "")}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t(m.bioKey, "")}</p>
                  <a href={`mailto:${m.email}`} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-mist transition-colors hover:text-ember">
                    <Mail className="h-3 w-3" />
                    {m.email}
                  </a>
                </div>
              </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg bg-ink p-8 sm:flex-row sm:items-center">
            <p className="max-w-md font-display text-xl font-bold text-bone">{t("about.cta.title", "See what a first automation could return you.")}</p>
            <Link href={`/book-audit?lang=${locale}`} className="rounded-md bg-ember px-5 py-3 text-sm font-bold text-shell transition-colors hover:bg-ember-deep">
              {t("nav.cta", "Book an audit")}
            </Link>
          </div>
        </section>
      </main>
      <Footer t={t} locale={locale} />
    </div>
  );
}
