import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const ROLES = ["admin", "manager", "member", "viewer"] as const;
const STATUSES = ["active", "invited", "suspended"] as const;

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid user id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const patch: { role?: (typeof ROLES)[number]; status?: (typeof STATUSES)[number] } = {};

  if (data.role !== undefined) {
    const role = String(data.role);
    if (!(ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role." }, { status: 400 });
    }
    patch.role = role as (typeof ROLES)[number];
  }
  if (data.status !== undefined) {
    const status = String(data.status);
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    patch.status = status as (typeof STATUSES)[number];
  }
  if (patch.role === undefined && patch.status === undefined) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const [row] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
  if (!row) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, user: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid user id." }, { status: 400 });
  }
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
