import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";

const STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(payments).orderBy(desc(payments.createdAt));
  return NextResponse.json({ ok: true, payments: rows });
}

/** Record a payment manually (or as sent by the gateway webhook). */
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
  const customer = String(data.customer ?? "").trim();
  const email = String(data.email ?? "").trim();
  const description = String(data.description ?? "").trim();
  const amount = Number(data.amount);

  if (!customer) {
    return NextResponse.json({ ok: false, error: "Customer is required." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Amount must be a positive number." }, { status: 400 });
  }

  const method = String(data.method ?? "card");
  const statusRaw = String(data.status ?? "pending");
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as (typeof STATUSES)[number])
    : "pending";

  const [row] = await db
    .insert(payments)
    .values({
      customer,
      email,
      description,
      amountCents: Math.round(amount * 100),
      status,
      method,
      paidAt: status === "succeeded" ? new Date() : null,
    })
    .returning();

  return NextResponse.json({ ok: true, payment: row }, { status: 201 });
}
