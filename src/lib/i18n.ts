import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { languages, translations } from "@/db/schema";
import { LOCALE_COOKIE } from "@/lib/i18n-client";

export type LanguageRow = typeof languages.$inferSelect;
export { LOCALE_COOKIE };

export async function getLanguages(): Promise<LanguageRow[]> {
  return db.select().from(languages).orderBy(languages.code);
}

export async function getEnabledLanguages(): Promise<LanguageRow[]> {
  return db.select().from(languages).where(eq(languages.enabled, 1)).orderBy(languages.code);
}

export async function getDefaultLanguage(): Promise<LanguageRow | null> {
  const rows = await db.select().from(languages).where(eq(languages.isDefault, 1)).limit(1);
  return rows[0] ?? null;
}

/**
 * Resolve the active locale: `?lang=` query parameter first (survives
 * cookie-blocked environments), then the locale cookie, then the default.
 */
export async function resolveLocale(paramLang: string | undefined): Promise<string> {
  const enabled = await getEnabledLanguages();
  const valid = new Set(enabled.map((l) => l.code));

  if (paramLang && valid.has(paramLang)) return paramLang;

  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (fromCookie && valid.has(fromCookie)) return fromCookie;

  const def = enabled.find((l) => l.isDefault === 1);
  return def?.code ?? enabled[0]?.code ?? "en";
}

/** All key/value pairs for a locale. */
export async function getDictionary(locale: string): Promise<Record<string, string>> {
  const rows = await db.select().from(translations).where(eq(translations.languageCode, locale));
  const dict: Record<string, string> = {};
  for (const row of rows) {
    if (row.value.trim() !== "") dict[row.key] = row.value;
  }
  return dict;
}

/**
 * Translation helper: returns the dictionary value for `key`, falling back to
 * the provided English string so the page never renders an empty spot.
 */
export function makeT(dict: Record<string, string>) {
  return (key: string, fallback: string): string => dict[key] ?? fallback;
}

/**
 * Locale for console requests: the proxy forwards `?lang=` (or the locale
 * cookie) as the `x-locale` request header, because console layouts cannot
 * read searchParams.
 */
export async function getRequestLocale(): Promise<string> {
  const { headers } = await import("next/headers");
  const requested = (await headers()).get("x-locale") ?? "";
  const enabled = await getEnabledLanguages();
  if (requested && enabled.some((l) => l.code === requested)) return requested;
  const def = enabled.find((l) => l.isDefault === 1);
  return def?.code ?? enabled[0]?.code ?? "en";
}

/** One-call helper for console pages: locale + dictionary + t(). */
export async function getConsoleI18n() {
  const [locale, languagesList] = await Promise.all([getRequestLocale(), getEnabledLanguages()]);
  const dict = await getDictionary(locale);
  return { locale, languages: languagesList, t: makeT(dict) };
}

export async function upsertTranslation(locale: string, key: string, value: string): Promise<void> {
  await db
    .insert(translations)
    .values({ languageCode: locale, key, value })
    .onConflictDoUpdate({
      target: [translations.languageCode, translations.key],
      set: { value },
    });
}

export async function deleteTranslationKey(key: string): Promise<void> {
  await db.delete(translations).where(and(eq(translations.key, key)));
}
