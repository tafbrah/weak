import { LogoMark } from "./nav";

export default function Footer({
  t,
  locale = "en",
}: {
  t: (key: string, fallback: string) => string;
  locale?: string;
}) {
  const langSuffix = `?lang=${locale}`;
  return (
    <footer className="border-t border-edge bg-coal text-fog">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-bone">
              <LogoMark className="h-6 w-6" />
              <span className="font-display text-lg font-bold tracking-tight">LOOPWERK</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              {t(
                "footer.tagline",
                "AI automation studio. We design, build and run n8n systems with AI at the decision points — so your team works on judgment, not data entry.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
                {t("footer.studio", "Studio")}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#services" className="transition-colors hover:text-ember">{t("nav.services", "Services")}</a></li>
                <li><a href="#process" className="transition-colors hover:text-ember">{t("nav.process", "Process")}</a></li>
                <li><a href="#work" className="transition-colors hover:text-ember">{t("nav.work", "Work")}</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
                {t("footer.engage", "Engage")}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#pricing" className="transition-colors hover:text-ember">{t("nav.pricing", "Pricing")}</a></li>
                <li><a href="#faq" className="transition-colors hover:text-ember">{t("nav.faq", "FAQ")}</a></li>
                <li>
                  <a href="/book-audit" className="transition-colors hover:text-ember">
                    {t("nav.cta", "Book an audit")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-edge pt-6 sm:mt-12">
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <a
              href={`/about${langSuffix}`}
              className="font-mono text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-ember"
            >
              {t("footer.about", "About")}
            </a>
            <a
              href={`/founder${langSuffix}`}
              className="font-mono text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-ember"
            >
              {t("footer.founder", "Founder")}
            </a>
            <a
              href={`/partnership${langSuffix}`}
              className="font-mono text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-ember"
            >
              {t("footer.partnership", "Partnership")}
            </a>
          </nav>
          <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="font-mono text-[11px]">© 2026 Loopwerk BV · KvK 87654321</p>
            <p className="font-mono text-[10px] text-mist sm:text-[11px]">
              {t("footer.built", "Built on n8n · self-hosted · this site runs on its own workflows")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
