import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cookieCategories, cookies } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  if (type === "category") {
    const patch: { name?: string; description?: string; required?: number; enabled?: number } = {};
    if (data.name !== undefined) patch.name = String(data.name).trim();
    if (data.description !== undefined) patch.description = String(data.description).trim();
    if (data.required !== undefined) patch.required = data.required === true ? 1 : 0;
    if (data.enabled !== undefined) patch.enabled = data.enabled === true ? 1 : 0;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
    }

    const [row] = await db.update(cookieCategories).set(patch).where(eq(cookieCategories.id, id)).returning();
    if (!row) return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
    return NextResponse.json({ ok: true, category: row });
  }

  if (type === "cookie") {
    const patch: { name?: string; categoryId?: number | null; provider?: string; purpose?: string; duration?: string; dataTypes?: string; thirdParty?: number } = {};
    if (data.name !== undefined) patch.name = String(data.name).trim();
    if (data.categoryId !== undefined) patch.categoryId = data.categoryId ? Number(data.categoryId) : null;
    if (data.provider !== undefined) patch.provider = String(data.provider).trim();
    if (data.purpose !== undefined) patch.purpose = String(data.purpose).trim();
    if (data.duration !== undefined) patch.duration = String(data.duration).trim();
    if (data.dataTypes !== undefined) patch.dataTypes = String(data.dataTypes).trim();
    if (data.thirdParty !== undefined) patch.thirdParty = data.thirdParty === true ? 1 : 0;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
    }

    const [row] = await db.update(cookies).set(patch).where(eq(cookies.id, id)).returning();
    if (!row) return NextResponse.json({ ok: false, error: "Cookie not found." }, { status: 404 });
    return NextResponse.json({ ok: true, cookie: row });
  }

  return NextResponse.json({ ok: false, error: "Invalid type." }, { status: 400 });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "category") {
    await db.delete(cookieCategories).where(eq(cookieCategories.id, id));
    return NextResponse.json({ ok: true });
  }

  if (type === "cookie") {
    await db.delete(cookies).where(eq(cookies.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Invalid type." }, { status: 400 });
}
