import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cacheEntries } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(cacheEntries).orderBy(desc(cacheEntries.lastAccessedAt));
  return NextResponse.json({ ok: true, entries: rows });
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
  const cacheKey = String(data.cacheKey ?? "").trim();
  if (!cacheKey) {
    return NextResponse.json({ ok: false, error: "Cache key is required." }, { status: 400 });
  }

  const store = String(data.store ?? "redis");
  const sizeBytes = Math.max(0, Math.round(Number(data.sizeBytes ?? 0)));
  const ttlSec = Math.max(1, Math.round(Number(data.ttlSec ?? 3600)));

  const [row] = await db
    .insert(cacheEntries)
    .values({ cacheKey, store, sizeBytes, ttlSec, hits: 0, misses: 0, status: "active" })
    .returning();

  return NextResponse.json({ ok: true, entry: row }, { status: 201 });
}
