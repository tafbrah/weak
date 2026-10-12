import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Hash a password with scrypt + random salt. Stored as `salt:hash` (hex). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Generate a 6-digit one-time code. */
export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
