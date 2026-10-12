/**
 * Shared constants safe for both server and client bundles.
 * Keep this file free of Node built-ins so client components can import it.
 */
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin@loopwerk.studio";

export const DEMO_PASSWORD_HINT = "n8n-admin";
