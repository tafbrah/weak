import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { issueOtp } from "@/lib/otp";
import { hashPassword } from "@/lib/password";

/**
 * Sign up: create an account, then issue a one-time code to verify the email.
 * The session is only created after the OTP is confirmed (/api/auth/verify-otp).
 * For this demo the OTP is returned in the response.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const password = String(data.password ?? "");

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const [existing] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });
  }

  await db.insert(accounts).values({
    email,
    name,
    passwordHash: hashPassword(password),
    status: "active",
  });

  const code = await issueOtp(email, "signup");
  return NextResponse.json({
    ok: true,
    step: "otp",
    email,
    // Demo only: in production the code is delivered by email / SMS.
    otp: code,
  });
}
