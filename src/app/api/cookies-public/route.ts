import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { cookieCategories } from "@/db/schema";

/**
 * Public endpoint for cookie categories (no auth required).
 * Used by the cookie consent banner on the landing page.
 */
export async function GET() {
  const categories = await db.select().from(cookieCategories).orderBy(asc(cookieCategories.name));
  return NextResponse.json({ ok: true, categories });
}
