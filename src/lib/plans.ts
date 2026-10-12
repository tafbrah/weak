import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";

export type PlanRow = typeof plans.$inferSelect;

export const PLAN_ORDER = ["starter", "growth", "scale"] as const;
export type PlanKey = (typeof PLAN_ORDER)[number];

/** Default catalog used until the table is seeded / if a key is missing. */
export const DEFAULT_PLANS: { key: PlanKey; name: string; price: number; blurb: string }[] = [
  { key: "starter", name: "Starter", price: 1900, blurb: "One high-value loop, built and monitored." },
  { key: "growth", name: "Growth", price: 4500, blurb: "A dedicated automation engineer + AI agents." },
  { key: "scale", name: "Scale", price: 0, blurb: "We run your whole ops layer on n8n." },
];

export async function getPlans(): Promise<PlanRow[]> {
  const rows = await db.select().from(plans);
  if (rows.length === 0) {
    return DEFAULT_PLANS.map((p, i) => ({ id: -i - 1, ...p, updatedAt: new Date(0) }));
  }
  const byKey = new Map(rows.map((r) => [r.key, r]));
  // Keep the canonical order; fill any missing keys from the defaults.
  return PLAN_ORDER.map((key, i) => byKey.get(key) ?? { id: -i - 1, ...DEFAULT_PLANS[i], updatedAt: new Date(0) });
}

export async function getPlanPrices(): Promise<Record<string, number>> {
  const rows = await getPlans();
  const prices: Record<string, number> = {};
  for (const row of rows) prices[row.key] = row.price;
  return prices;
}

export async function updatePlanPrice(key: string, price: number): Promise<PlanRow | null> {
  const [row] = await db
    .update(plans)
    .set({ price, updatedAt: new Date() })
    .where(eq(plans.key, key))
    .returning();
  return row ?? null;
}
