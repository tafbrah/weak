import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { conferences } from "@/db/schema";

const STATUSES = ["scheduled", "live", "done", "cancelled"] as const;

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid conference id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const patch: { status?: (typeof STATUSES)[number]; notes?: string; participants?: string } = {};
  if (data.status !== undefined) {
    const status = String(data.status);
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    patch.status = status as (typeof STATUSES)[number];
  }
  if (typeof data.notes === "string") patch.notes = data.notes;
  if (typeof data.participants === "string") patch.participants = data.participants;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const [row] = await db.update(conferences).set(patch).where(eq(conferences.id, id)).returning();
  if (!row) {
    return NextResponse.json({ ok: false, error: "Conference not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, conference: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid conference id." }, { status: 400 });
  }
  await db.delete(conferences).where(eq(conferences.id, id));
  return NextResponse.json({ ok: true });
}
