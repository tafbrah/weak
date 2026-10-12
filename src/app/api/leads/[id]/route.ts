import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

type Params = { params: Promise<{ id: string }> };

/** Move a project intake along the workflow pipeline. */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const status = String((body as Record<string, unknown>).status ?? "");
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid stage." }, { status: 400 });
  }

  const [row] = await db
    .update(leads)
    .set({ status: status as (typeof STATUSES)[number] })
    .where(eq(leads.id, id))
    .returning();
  if (!row) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, lead: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id." }, { status: 400 });
  }
  await db.delete(leads).where(eq(leads.id, id));
  return NextResponse.json({ ok: true });
}
