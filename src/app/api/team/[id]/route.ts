import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid member id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  const patch: {
    name?: string;
    role?: string;
    email?: string;
    photoUrl?: string;
    bio?: string;
    skills?: string;
    status?: string;
  } = {};

  if (data.name !== undefined) {
    const name = String(data.name).trim();
    if (!name) return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    patch.name = name;
  }
  if (data.role !== undefined) patch.role = String(data.role).trim() || "Member";
  if (data.email !== undefined) {
    const email = String(data.email).trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
    }
    patch.email = email;
  }
  if (data.photoUrl !== undefined) patch.photoUrl = String(data.photoUrl).trim();
  if (data.bio !== undefined) patch.bio = String(data.bio).trim();
  if (data.skills !== undefined) patch.skills = String(data.skills).trim();
  if (data.status !== undefined) patch.status = data.status === "inactive" ? "inactive" : "active";

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const [row] = await db.update(teamMembers).set(patch).where(eq(teamMembers.id, id)).returning();
  if (!row) return NextResponse.json({ ok: false, error: "Member not found." }, { status: 404 });
  return NextResponse.json({ ok: true, member: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid member id." }, { status: 400 });
  }
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
  return NextResponse.json({ ok: true });
}
