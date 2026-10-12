import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sessionToken } from "@/lib/session";

/**
 * Cookie-less authentication.
 *
 * Console pages are authenticated by the proxy, which validates the
 * `lw_session` URL token and tags the request with `x-lw-auth: 1`.
 * No cookies are used anywhere in the console.
 */
export async function isAuthenticated(): Promise<boolean> {
  const reqHeaders = await headers();
  return reqHeaders.get("x-lw-auth") === "1";
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

/** Auth check for API routes: proxy header or `lw_session` query param. */
export async function requestIsAuthed(request: Request): Promise<boolean> {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("lw_session") === sessionToken()) {
      return true;
    }
  } catch {
    // fall through to header check
  }
  const reqHeaders = await headers();
  return reqHeaders.get("x-lw-auth") === "1";
}
