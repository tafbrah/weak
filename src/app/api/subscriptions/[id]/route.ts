import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getPlanPrices } from "@/lib/plans";

const PLANS = ["starter", "growth", "scale"] as const;
const STATUSES = ["onboarding", "active", "paused", "churned"] as const;
const CYCLES = ["monthly", "yearly"] as const;

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid subscription id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const patch: {
    plan?: (typeof PLANS)[number];
    status?: (typeof STATUSES)[number];
    billingCycle?: (typeof CYCLES)[number];
    mrr?: number;
    nextRenewal?: Date;
  } = {};

  if (data.plan !== undefined) {
    const plan = String(data.plan);
    if (!(PLANS as readonly string[]).includes(plan)) {
      return NextResponse.json({ ok: false, error: "Invalid plan." }, { status: 400 });
    }
    patch.plan = plan as (typeof PLANS)[number];
    // Packages with a catalog price (> 0) update the MRR automatically.
    const prices = await getPlanPrices();
    const catalogPrice = prices[plan] ?? 0;
    if (catalogPrice > 0) patch.mrr = catalogPrice;
  }
  if (data.status !== undefined) {
    const status = String(data.status);
    if (!(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    patch.status = status as (typeof STATUSES)[number];
  }
  if (data.billingCycle !== undefined) {
    const cycle = String(data.billingCycle);
    if (!(CYCLES as readonly string[]).includes(cycle)) {
      return NextResponse.json({ ok: false, error: "Invalid billing cycle." }, { status: 400 });
    }
    patch.billingCycle = cycle as (typeof CYCLES)[number];
    const [current] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    if (current?.nextRenewal) {
      const base = current.nextRenewal;
      const shift = cycle === "yearly" ? 12 : 1;
      const before = current.billingCycle === "yearly" ? 12 : 1;
      const next = new Date(base);
      next.setMonth(next.getMonth() - before + shift);
      patch.nextRenewal = next;
    }
  }
  if (data.mrr !== undefined) {
    const mrr = Number(data.mrr);
    if (!Number.isFinite(mrr) || mrr < 0) {
      return NextResponse.json({ ok: false, error: "Invalid MRR." }, { status: 400 });
    }
    patch.mrr = Math.round(mrr);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
  }

  const [row] = await db.update(clients).set(patch).where(eq(clients.id, id)).returning();
  if (!row) {
    return NextResponse.json({ ok: false, error: "Subscription not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, subscription: row });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid subscription id." }, { status: 400 });
  }
  await db.delete(clients).where(eq(clients.id, id));
  return NextResponse.json({ ok: true });
}
