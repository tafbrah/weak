import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const section = url.searchParams.get("section");

  const items = section
    ? await db.select().from(cmsContent).where(eq(cmsContent.section, section)).orderBy(asc(cmsContent.sortOrder))
    : await db.select().from(cmsContent).orderBy(asc(cmsContent.section), asc(cmsContent.sortOrder));

  return NextResponse.json({ ok: true, content: items });
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
  const contentKey = String(data.contentKey ?? "").trim();
  const label = String(data.label ?? "").trim();
  if (!contentKey || !label) {
    return NextResponse.json({ ok: false, error: "Content key and label are required." }, { status: 400 });
  }

  const [item] = await db
    .insert(cmsContent)
    .values({
      contentKey,
      section: String(data.section ?? "general"),
      label,
      content: String(data.content ?? ""),
      contentType: String(data.contentType ?? "text"),
      enabled: data.enabled === false ? 0 : 1,
      sortOrder: Number(data.sortOrder ?? 0),
    })
    .returning();

  return NextResponse.json({ ok: true, content: item }, { status: 201 });
}
