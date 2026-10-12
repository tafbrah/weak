import { NextResponse, type NextRequest } from "next/server";

/**
 * Console session.
 *
 * Two ways to be authenticated:
 *  1. `loopwerk_auth` session cookie (set on login) — keeps normal in-page
 *     navigation (search, filters, links) authenticated automatically.
 *  2. `lw_session=<token>` URL token — fallback for cookie-restricted contexts.
 *
 * The proxy validates either and tags the request with `x-lw-auth: 1`, which
 * the server-side guard (src/lib/auth.ts) trusts.
 */
const AUTH_COOKIE = "loopwerk_auth";

async function sessionToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? "loopwerk-dev-secret";
  const data = new TextEncoder().encode(`${secret}::loopwerk-admin-session`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  const token = await sessionToken();
  const urlToken = request.nextUrl.searchParams.get("lw_session");
  const paramOk = urlToken !== null && urlToken === token;
  const cookieOk = request.cookies.get(AUTH_COOKIE)?.value === token;
  const authed = paramOk || cookieOk;

  const requestHeaders = new Headers(request.headers);

  // Forward the requested locale (?lang= wins over the locale cookie) so
  // console pages — whose layouts can't read searchParams — can translate.
  const langParam = request.nextUrl.searchParams.get("lang");
  const localeCookie = request.cookies.get("loopwerk_locale")?.value;
  const locale = langParam || localeCookie || "";
  if (locale) requestHeaders.set("x-locale", locale);

  if (authed) requestHeaders.set("x-lw-auth", "1");

  // Persist the chosen language as a first-party cookie whenever ?lang= is
  // present, so the preference survives navigation even where client-side
  // document.cookie is restricted (e.g. embedded previews).
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (langParam && langParam !== localeCookie) {
    response.cookies.set("loopwerk_locale", langParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/book-audit",
    "/about",
    "/founder",
    "/partnership",
    "/admin/:path*",
    "/api/users/:path*",
    "/api/auth/:path*",
    "/api/subscriptions/:path*",
    "/api/plans/:path*",
    "/api/languages/:path*",
    "/api/translations/:path*",
    "/api/leads/:path*",
  ],
};
