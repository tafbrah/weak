import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cacheEntries } from "@/db/schema";

/** Purge all cache entries. */
export async function POST(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const deleted = await db.delete(cacheEntries).returning({ id: cacheEntries.id });
  return NextResponse.json({ ok: true, purged: deleted.length });
}
