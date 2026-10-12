import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";

const STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;

type Params = { params: Promise<{ id: string }> };

/** Transition a payment: mark paid, mark failed, refund… */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid payment id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const status = String((body as Record<string, unknown>).status ?? "");
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const [row] = await db
    .update(payments)
    .set({
      status: status as (typeof STATUSES)[number],
      paidAt: status === "succeeded" ? new Date() : undefined,
    })
    .where(eq(payments.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ ok: false, error: "Payment not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, payment: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid payment id." }, { status: 400 });
  }
  await db.delete(payments).where(eq(payments.id, id));
  return NextResponse.json({ ok: true });
}
