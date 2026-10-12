import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getPlanPrices } from "@/lib/plans";

const PLANS = ["starter", "growth", "scale"] as const;
const STATUSES = ["onboarding", "active", "paused", "churned"] as const;
const CYCLES = ["monthly", "yearly"] as const;

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(clients).orderBy(clients.company);
  return NextResponse.json({ ok: true, subscriptions: rows });
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
  const company = String(data.company ?? "").trim();
  const contact = String(data.contact ?? "").trim();
  const email = String(data.email ?? "").trim();
  if (!company || !contact) {
    return NextResponse.json({ ok: false, error: "Company and contact are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
  }

  const planRaw = String(data.plan ?? "starter");
  const plan = (PLANS as readonly string[]).includes(planRaw) ? (planRaw as (typeof PLANS)[number]) : "starter";
  const statusRaw = String(data.status ?? "onboarding");
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as (typeof STATUSES)[number])
    : "onboarding";
  const cycleRaw = String(data.billingCycle ?? "monthly");
  const billingCycle = (CYCLES as readonly string[]).includes(cycleRaw)
    ? (cycleRaw as (typeof CYCLES)[number])
    : "monthly";

  // Packages with a catalog price (> 0) apply it; Scale (custom) keeps the MRR provided.
  const prices = await getPlanPrices();
  const catalogPrice = prices[plan] ?? 0;
  const mrrInput = Number(data.mrr ?? 0);
  const mrr =
    catalogPrice > 0
      ? catalogPrice
      : Number.isFinite(mrrInput) && mrrInput > 0
        ? Math.round(mrrInput)
        : 0;

  const renewal = new Date();
  renewal.setMonth(renewal.getMonth() + (billingCycle === "yearly" ? 12 : 1));

  const [row] = await db
    .insert(clients)
    .values({ company, contact, email, plan, status, mrr, billingCycle, nextRenewal: renewal })
    .returning();

  return NextResponse.json({ ok: true, subscription: row }, { status: 201 });
}
