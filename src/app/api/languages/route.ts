import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { languages, translations } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
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
    .orderBy(languages.code);
  return NextResponse.json({ ok: true, languages: rows });
}

/** Add a language; its dictionary starts as a copy of the default language. */
export async function POST(request: Request) {
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
  const code = String(data.code ?? "").trim().toLowerCase();
  const name = String(data.name ?? "").trim();

  if (!/^[a-z]{2}(-[a-z]{2})?$/i.test(code)) {
    return NextResponse.json({ ok: false, error: "Code must look like 'en', 'fr' or 'pt-BR'." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }

  const existing = await db.select().from(languages).where(sql`${languages.code} = ${code}`).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ ok: false, error: "This language already exists." }, { status: 409 });
  }

  await db.insert(languages).values({ code, name, isDefault: 0, enabled: 1 });

  // Copy the default dictionary as a starting point.
  const [def] = await db.select().from(languages).where(sql`${languages.isDefault} = 1`).limit(1);
  if (def) {
    const base = await db.select().from(translations).where(sql`${translations.languageCode} = ${def.code}`);
    if (base.length > 0) {
      await db.insert(translations).values(
        base.map((row) => ({ languageCode: code, key: row.key, value: row.value })),
      );
    }
  }

  return NextResponse.json({ ok: true, language: { code, name } }, { status: 201 });
}
