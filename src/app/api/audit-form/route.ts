import { asc, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { auditFormFields } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const fields = await db.select().from(auditFormFields).orderBy(asc(auditFormFields.step), asc(auditFormFields.sortOrder));
  return NextResponse.json({ ok: true, fields });
}

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
  const label = String(data.label ?? "").trim();
  if (!label) {
    return NextResponse.json({ ok: false, error: "Label is required." }, { status: 400 });
  }

  const step = Number(data.step ?? 1);
  const fieldKey = String(data.fieldKey ?? "").trim() || `field_${Date.now()}`;
  const fieldType = String(data.fieldType ?? "text");
  const options = Array.isArray(data.options) ? JSON.stringify(data.options) : String(data.options ?? "");
  const placeholder = String(data.placeholder ?? "");
  const required = data.required ? 1 : 0;
  const enabled = data.enabled === false ? 0 : 1;
  const sortOrder = Number(data.sortOrder ?? 0);

  const [field] = await db
    .insert(auditFormFields)
    .values({ step, fieldKey, label, fieldType, options, placeholder, required, enabled, sortOrder })
    .returning();

  return NextResponse.json({ ok: true, field }, { status: 201 });
}
