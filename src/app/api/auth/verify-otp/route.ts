import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { verifyOtp } from "@/lib/otp";
import { AUTH_COOKIE, sessionToken } from "@/lib/session";

/**
 * Step 2 of login / signup: verify the one-time code, then establish the
 * session. A session cookie is set so normal in-page navigation (search,
 * filters, links) stays authenticated; the returned token also works as a
 * `lw_session` URL fallback for cookie-restricted contexts.
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
  const code = String(data.code ?? "").trim();
  const purpose = data.purpose === "signup" ? "signup" : "login";

  if (!email || !code) {
    return NextResponse.json({ ok: false, error: "Email and code are required." }, { status: 400 });
  }

  const ok = await verifyOtp(email, code, purpose);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid or expired code." }, { status: 400 });
  }

  // Update last login for signed-up accounts.
  const [account] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1);
  if (account) {
    await db.update(accounts).set({ lastLoginAt: new Date() }).where(eq(accounts.id, account.id));
  }

  const token = sessionToken();
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ ok: true, token, redirect: "/admin" });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
