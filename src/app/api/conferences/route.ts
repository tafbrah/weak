import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { conferences } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(conferences).orderBy(desc(conferences.scheduledAt));
  return NextResponse.json({ ok: true, conferences: rows });
}

function generateMeetLink(title: string): string {
  const slug =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "meeting";
  const rand = Math.random().toString(36).slice(2, 8);
  return `https://meet.jit.si/loopwerk-${slug}-${rand}`;
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
  const title = String(data.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 });
  }

  const when = new Date(String(data.scheduledAt ?? ""));
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ ok: false, error: "A valid date & time is required." }, { status: 400 });
  }

  const durationMin = Math.max(5, Math.min(480, Math.round(Number(data.durationMin ?? 30))));
  const clientName = String(data.clientName ?? "").trim();
  const participants = String(data.participants ?? "").trim();
  const notes = String(data.notes ?? "").trim();
  let meetLink = String(data.meetLink ?? "").trim();
  if (!meetLink) meetLink = generateMeetLink(title);
  if (!/^https?:\/\//.test(meetLink)) meetLink = `https://${meetLink}`;

  const [row] = await db
    .insert(conferences)
    .values({
      title,
      clientName,
      scheduledAt: when,
      durationMin,
      meetLink,
      notes,
      participants,
      status: "scheduled",
    })
    .returning();

  return NextResponse.json({ ok: true, conference: row }, { status: 201 });
}
