import { NextResponse } from "next/server";

/**
 * Logout: clear the session cookie so the console is no longer authenticated.
 * (Any `lw_session` URL token is dropped by navigating to the landing page.)
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("loopwerk_auth", "", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
