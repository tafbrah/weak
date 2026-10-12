import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid content id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const patch: {
    contentKey?: string;
    section?: string;
    label?: string;
    content?: string;
    contentType?: string;
    enabled?: number;
    sortOrder?: number;
  } = {};

  if (data.contentKey !== undefined) patch.contentKey = String(data.contentKey);
  if (data.section !== undefined) patch.section = String(data.section);
  if (data.label !== undefined) patch.label = String(data.label);
  if (data.content !== undefined) patch.content = String(data.content);
  if (data.contentType !== undefined) patch.contentType = String(data.contentType);
  if (data.enabled !== undefined) patch.enabled = data.enabled ? 1 : 0;
  if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const [item] = await db.update(cmsContent).set(patch).where(eq(cmsContent.id, id)).returning();
  if (!item) return NextResponse.json({ ok: false, error: "Content not found." }, { status: 404 });
  return NextResponse.json({ ok: true, content: item });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid content id." }, { status: 400 });
  }
  await db.delete(cmsContent).where(eq(cmsContent.id, id));
  return NextResponse.json({ ok: true });
}
