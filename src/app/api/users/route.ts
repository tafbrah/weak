import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const ROLES = ["admin", "manager", "member", "viewer"] as const;
const STATUSES = ["active", "invited", "suspended"] as const;

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(users).orderBy(users.name);
  return NextResponse.json({ ok: true, users: rows });
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
  const email = String(data.email ?? "").trim();
  if (!name || name.length < 2) {
    return NextResponse.json({ ok: false, error: "Please provide a name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
  }

  const roleRaw = String(data.role ?? "member");
  const role = (ROLES as readonly string[]).includes(roleRaw)
    ? (roleRaw as (typeof ROLES)[number])
    : "member";
  const statusRaw = String(data.status ?? "invited");
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as (typeof STATUSES)[number])
    : "invited";

  const [row] = await db
    .insert(users)
    .values({ name, email, role, status, lastActiveAt: null })
    .returning();

  return NextResponse.json({ ok: true, user: row }, { status: 201 });
}
