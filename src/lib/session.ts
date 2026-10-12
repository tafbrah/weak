import { createHash } from "crypto";
import { ADMIN_EMAIL } from "@/lib/constants";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "n8n-admin";

/** Cookie that keeps the console session alive across normal navigation. */
export const AUTH_COOKIE = "loopwerk_auth";

function secret(): string {
  return process.env.SESSION_SECRET ?? "loopwerk-dev-secret";
}

export function sessionToken(): string {
  return createHash("sha256").update(`${secret()}::loopwerk-admin-session`).digest("hex");
}

export function verifyCredentials(email: string, password: string): boolean {
  const emailOk = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  return emailOk && password.trim() === ADMIN_PASSWORD;
}
