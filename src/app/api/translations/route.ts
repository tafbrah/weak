import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { languages, translations } from "@/db/schema";
import { deleteTranslationKey, getDefaultLanguage, upsertTranslation } from "@/lib/i18n";

/** Entries for a locale: every key of the default dictionary + the locale's values. */
export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "";

  const [def, langs] = await Promise.all([getDefaultLanguage(), db.select().from(languages)]);
  if (!def || !langs.some((l) => l.code === locale)) {
    return NextResponse.json({ ok: false, error: "Unknown locale." }, { status: 400 });
  }

  const baseRows = await db.select().from(translations).where(eq(translations.languageCode, def.code));
  const localeRows = await db.select().from(translations).where(eq(translations.languageCode, locale));
  const localeMap = new Map(localeRows.map((r) => [r.key, r.value]));

  const entries = baseRows.map((row) => ({
    key: row.key,
    default: row.value,
    value: locale === def.code ? row.value : localeMap.get(row.key) ?? "",
  }));

  return NextResponse.json({ ok: true, locale, isDefault: locale === def.code, entries });
}

/** Create/update one entry: { locale, key, value }. */
export async function PUT(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;
  const locale = String(data.locale ?? "").trim();
  const key = String(data.key ?? "").trim();
  const value = String(data.value ?? "");

  if (!locale || !key) {
    return NextResponse.json({ ok: false, error: "locale and key are required." }, { status: 400 });
  }
  const langs = await db.select().from(languages);
  if (!langs.some((l) => l.code === locale)) {
    return NextResponse.json({ ok: false, error: "Unknown locale." }, { status: 400 });
  }

  await upsertTranslation(locale, key, value);
  return NextResponse.json({ ok: true });
}

/** Delete a key from every language: { key }. */
export async function DELETE(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const key = String((body as Record<string, unknown>).key ?? "").trim();
  if (!key) {
    return NextResponse.json({ ok: false, error: "key is required." }, { status: 400 });
  }
  await deleteTranslationKey(key);
  return NextResponse.json({ ok: true });
}
