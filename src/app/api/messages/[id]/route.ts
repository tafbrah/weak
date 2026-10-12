import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { messages } from "@/db/schema";

const STATUSES = ["draft", "scheduled", "sent", "delivered", "failed"] as const;

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid message id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const data = (body ?? {}) as Record<string, unknown>;

  // Resend: mark as sent with a fresh timestamp.
  if (data.resend === true) {
    const [row] = await db
      .update(messages)
      .set({ status: "sent", sentAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    if (!row) return NextResponse.json({ ok: false, error: "Message not found." }, { status: 404 });
    return NextResponse.json({ ok: true, message: row });
  }

  const status = String(data.status ?? "");
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }
  const [row] = await db
    .update(messages)
    .set({ status: status as (typeof STATUSES)[number], sentAt: status === "sent" ? new Date() : undefined })
    .where(eq(messages.id, id))
    .returning();
  if (!row) return NextResponse.json({ ok: false, error: "Message not found." }, { status: 404 });
  return NextResponse.json({ ok: true, message: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid message id." }, { status: 400 });
  }
  await db.delete(messages).where(eq(messages.id, id));
  return NextResponse.json({ ok: true });
}
