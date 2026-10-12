import { getDictionary, getEnabledLanguages, makeT, resolveLocale } from "@/lib/i18n";

/**
 * One-call i18n bootstrap for public pages: resolves the locale, loads the
 * dictionary and returns ready-to-use nav labels.
 */
export async function getSiteI18n(lang: string | undefined) {
  const [locale, languagesList] = await Promise.all([resolveLocale(lang), getEnabledLanguages()]);
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

  return {
    locale,
    languagesList: languagesList.map((l) => ({ code: l.code, name: l.name })),
    dict,
    t,
    labels,
  };
}
