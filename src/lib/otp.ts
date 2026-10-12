import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { generateOtpCode } from "@/lib/password";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Issue a fresh OTP for an email, invalidating previous unused codes. Returns the code. */
export async function issueOtp(email: string, purpose: "login" | "signup"): Promise<string> {
  const normalized = email.trim().toLowerCase();
  await db
    .update(otpCodes)
    .set({ used: 1 })
    .where(and(eq(otpCodes.email, normalized), eq(otpCodes.used, 0)));

  const code = generateOtpCode();
  await db.insert(otpCodes).values({
    email: normalized,
    code,
    purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    used: 0,
  });
  return code;
}

/** Verify an OTP. Marks it used on success. */
export async function verifyOtp(email: string, code: string, purpose: "login" | "signup"): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, normalized), eq(otpCodes.purpose, purpose), eq(otpCodes.used, 0)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!row) return false;
  if (row.expiresAt.getTime() < Date.now()) return false;
  if (row.code !== code.trim()) return false;

  await db.update(otpCodes).set({ used: 1 }).where(eq(otpCodes.id, row.id));
  return true;
}

/** Count active (unused, unexpired) codes — used for stats / cleanup. */
export async function countActiveOtps(): Promise<number> {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(otpCodes)
    .where(and(eq(otpCodes.used, 0), sql`${otpCodes.expiresAt} > now()`));
  return row?.c ?? 0;
}
