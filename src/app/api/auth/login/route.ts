import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { issueOtp } from "@/lib/otp";
import { verifyPassword } from "@/lib/password";
import { ADMIN_EMAIL } from "@/lib/constants";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "n8n-admin";

/**
 * Step 1 of login: verify credentials, then issue a one-time code.
 * The session is only created after the OTP is confirmed (/api/auth/verify-otp).
 * For this demo the OTP is returned in the response (in production it would
 * be sent by email / SMS).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const email = String(data.email ?? "").trim().toLowerCase();
  const password = String(data.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  // Look up a signed-up account first.
  const [account] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);

  let authorized = false;
  if (account) {
    if (account.status !== "active") {
      return NextResponse.json({ ok: false, error: "This account is locked." }, { status: 403 });
    }
    authorized = verifyPassword(password, account.passwordHash);
  } else if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    // Built-in demo operator account.
    authorized = true;
  }

  if (!authorized) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  const code = await issueOtp(email, "login");
  return NextResponse.json({
    ok: true,
    step: "otp",
    email,
    // Demo only: in production the code is delivered by email / SMS.
    otp: code,
  });
}
