import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getPlans, PLAN_ORDER, updatePlanPrice } from "@/lib/plans";

/** Current package catalog (prices included). */
export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await getPlans();
  return NextResponse.json({ ok: true, plans: rows });
}

/** Update a package price: { key: "starter" | "growth" | "scale", price: number }. */
export async function PATCH(request: Request) {
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
  const key = String(data.key ?? "");
  if (!(PLAN_ORDER as readonly string[]).includes(key)) {
    return NextResponse.json({ ok: false, error: "Unknown package." }, { status: 400 });
  }

  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    return NextResponse.json({ ok: false, error: "Price must be between 0 and 1,000,000." }, { status: 400 });
  }

  const row = await updatePlanPrice(key, Math.round(price));
  if (!row) {
    return NextResponse.json({ ok: false, error: "Package not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, plan: row });
}
