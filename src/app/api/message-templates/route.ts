import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { messageTemplates } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(messageTemplates).orderBy(desc(messageTemplates.createdAt));
  return NextResponse.json({ ok: true, templates: rows });
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
  const kind = data.kind === "sms" ? "sms" : "email";
  const name = String(data.name ?? "").trim();
  const subject = String(data.subject ?? "").trim();
  const bodyText = String(data.body ?? "").trim();

  if (!name) {
    return NextResponse.json({ ok: false, error: "Template name is required." }, { status: 400 });
  }
  if (!bodyText) {
    return NextResponse.json({ ok: false, error: "Template body is required." }, { status: 400 });
  }

  const [row] = await db
    .insert(messageTemplates)
    .values({ kind, name, subject, body: bodyText })
    .returning();

  return NextResponse.json({ ok: true, template: row }, { status: 201 });
}
