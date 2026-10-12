import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import {
  LanguageManager,
  TranslationEditor,
  type LanguageItem,
  type TranslationEntry,
} from "@/components/admin/languages-panel";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/db";
import { languages, translations } from "@/db/schema";
import { getConsoleI18n, getDefaultLanguage } from "@/lib/i18n";

export const metadata: Metadata = { title: "Languages — Loopwerk console" };

export default async function LanguagesPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const { t } = await getConsoleI18n();

  const [langs, def] = await Promise.all([
    db
      .select({
        code: languages.code,
        name: languages.name,
        isDefault: languages.isDefault,
        enabled: languages.enabled,
        count: sql<number>`count(${translations.id})::int`,
      })
      .from(languages)
      .leftJoin(translations, sql`${translations.languageCode} = ${languages.code}`)
      .groupBy(languages.code)
      .orderBy(languages.code),
    getDefaultLanguage(),
  ]);

  const requested = params.locale ?? "";
  const locale = langs.some((l) => l.code === requested) ? requested : def?.code ?? "en";
  const isDefault = locale === def?.code;

  // Every key of the default dictionary, merged with this locale's values.
  const defCode = def?.code ?? "en";
  const [baseRows, localeRows] = await Promise.all([
    db.select().from(translations).where(sql`${translations.languageCode} = ${defCode}`).orderBy(translations.key),
    isDefault
      ? Promise.resolve([] as (typeof translations.$inferSelect)[])
      : db.select().from(translations).where(sql`${translations.languageCode} = ${locale}`).orderBy(translations.key),
  ]);
  const localeMap = new Map(localeRows.map((r) => [r.key, r.value]));
  const entries: TranslationEntry[] = baseRows.map((row) => ({
    key: row.key,
    default: row.value,
    value: isDefault ? row.value : localeMap.get(row.key) ?? "",
  }));

  const languagesList: LanguageItem[] = langs;

  return (
    <>
      <PageHeader
        title={t("console.languages.title", "Languages")}
        sub={`${langs.length} languages · frontend strings are stored here and served live to the site`}
      />

      <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-bone">Languages</h2>
      <LanguageManager languages={languagesList} />

      <h2 className="mt-8 mb-3 font-display text-lg font-bold tracking-tight text-bone">
        Translations — {langs.find((l) => l.code === locale)?.name ?? locale}
      </h2>
      <TranslationEditor
        locale={locale}
        languages={langs.map((l) => ({ code: l.code, name: l.name }))}
        entries={entries}
        isDefault={isDefault}
      />

      <p className="mt-4 font-mono text-[11px] text-fog">
        missing translations fall back to the English text · changes go live immediately · switch the
        site language with the EN/FR toggle in the landing navbar
      </p>
    </>
  );
}
