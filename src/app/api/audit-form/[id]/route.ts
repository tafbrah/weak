import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { auditFormFields } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid field id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const patch: {
    step?: number;
    fieldKey?: string;
    label?: string;
    fieldType?: string;
    options?: string;
    placeholder?: string;
    required?: number;
    enabled?: number;
    sortOrder?: number;
  } = {};

  if (data.step !== undefined) patch.step = Number(data.step);
  if (data.fieldKey !== undefined) patch.fieldKey = String(data.fieldKey);
  if (data.label !== undefined) patch.label = String(data.label);
  if (data.fieldType !== undefined) patch.fieldType = String(data.fieldType);
  if (data.options !== undefined) {
    patch.options = Array.isArray(data.options) ? JSON.stringify(data.options) : String(data.options);
  }
  if (data.placeholder !== undefined) patch.placeholder = String(data.placeholder);
  if (data.required !== undefined) patch.required = data.required ? 1 : 0;
  if (data.enabled !== undefined) patch.enabled = data.enabled ? 1 : 0;
  if (data.sortOrder !== undefined) patch.sortOrder = Number(data.sortOrder);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const [field] = await db.update(auditFormFields).set(patch).where(eq(auditFormFields.id, id)).returning();
  if (!field) return NextResponse.json({ ok: false, error: "Field not found." }, { status: 404 });
  return NextResponse.json({ ok: true, field });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid field id." }, { status: 400 });
  }
  await db.delete(auditFormFields).where(eq(auditFormFields.id, id));
  return NextResponse.json({ ok: true });
}
