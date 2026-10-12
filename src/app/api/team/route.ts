import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.name));
  return NextResponse.json({ ok: true, team: rows });
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
  const name = String(data.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }

  const email = String(data.email ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
  }

  const [row] = await db
    .insert(teamMembers)
    .values({
      name,
      role: String(data.role ?? "Member").trim() || "Member",
      email,
      photoUrl: String(data.photoUrl ?? "").trim(),
      bio: String(data.bio ?? "").trim(),
      skills: String(data.skills ?? "").trim(),
      status: data.status === "inactive" ? "inactive" : "active",
    })
    .returning();

  return NextResponse.json({ ok: true, member: row }, { status: 201 });
}
