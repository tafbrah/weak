import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { languages } from "@/db/schema";

type Params = { params: Promise<{ code: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { code } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const [current] = await db.select().from(languages).where(eq(languages.code, code)).limit(1);
  if (!current) {
    return NextResponse.json({ ok: false, error: "Language not found." }, { status: 404 });
  }

  if (data.isDefault === true) {
    await db.update(languages).set({ isDefault: 0 }).where(sql`1 = 1`);
    await db.update(languages).set({ isDefault: 1 }).where(eq(languages.code, code));
  }
  if (typeof data.enabled === "number") {
    if (current.isDefault === 1 && data.enabled === 0) {
      return NextResponse.json({ ok: false, error: "The default language cannot be disabled." }, { status: 400 });
    }
    await db.update(languages).set({ enabled: data.enabled }).where(eq(languages.code, code));
  }
  if (typeof data.name === "string" && data.name.trim()) {
    await db.update(languages).set({ name: data.name.trim() }).where(eq(languages.code, code));
  }

  const [row] = await db.select().from(languages).where(eq(languages.code, code)).limit(1);
  return NextResponse.json({ ok: true, language: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { code } = await params;
  const [current] = await db.select().from(languages).where(eq(languages.code, code)).limit(1);
  if (!current) {
    return NextResponse.json({ ok: false, error: "Language not found." }, { status: 404 });
  }
  if (current.isDefault === 1) {
    return NextResponse.json({ ok: false, error: "The default language cannot be deleted." }, { status: 400 });
  }
  await db.delete(languages).where(eq(languages.code, code));
  return NextResponse.json({ ok: true });
}
