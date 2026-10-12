import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cacheEntries } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

/** Purge (delete) a single cache entry. */
export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid cache entry id." }, { status: 400 });
  }
  await db.delete(cacheEntries).where(eq(cacheEntries.id, id));
  return NextResponse.json({ ok: true });
}
