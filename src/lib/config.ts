import { db } from "@/db";
import { configuration } from "@/db/schema";

/**
 * Console-managed API configuration.
 *
 * Values saved in the console (Postgres) take priority over environment
 * variables; env vars act as the fallback. Keys:
 *   n8n_url, n8n_api_key, claude_api_key, claude_model
 */

export const CONFIG_KEYS = [
  "n8n_url",
  "n8n_api_key",
  "claude_api_key",
  "claude_model",
  "gateway_provider",
  "gateway_mode",
  "gateway_currency",
  "gateway_api_key",
  "gateway_webhook_secret",
  "email_provider",
  "email_api_key",
  "email_from",
  "sms_provider",
  "sms_api_key",
  "sms_sender",
] as const;
export type ConfigKey = (typeof CONFIG_KEYS)[number];

export async function getAllConfig(): Promise<Record<string, string>> {
  const rows = await db.select().from(configuration);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function setConfigValues(entries: Partial<Record<ConfigKey, string>>): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    if (!(CONFIG_KEYS as readonly string[]).includes(key)) continue;
    await db
      .insert(configuration)
      .values({ key, value: value ?? "", updatedAt: new Date() })
      .onConflictDoUpdate({ target: configuration.key, set: { value: value ?? "", updatedAt: new Date() } });
  }
}

export type ApiConfig = {
  n8n: { url: string; apiKey: string; source: "database" | "environment" | null };
  claude: { apiKey: string; model: string; source: "database" | "environment" | null };
};

/** Resolve the effective configuration: console values first, env as fallback. */
export async function getApiConfig(): Promise<ApiConfig> {
  const stored = await getAllConfig();

  const n8nUrl = stored.n8n_url || process.env.N8N_API_URL || "";
  const n8nKey = stored.n8n_api_key || process.env.N8N_API_KEY || "";
  const claudeKey = stored.claude_api_key || process.env.ANTHROPIC_API_KEY || "";
  const claudeModel = stored.claude_model || process.env.CLAUDE_MODEL || "claude-sonnet-4-5";

  return {
    n8n: {
      url: n8nUrl.trim(),
      apiKey: n8nKey.trim(),
      source: stored.n8n_url || stored.n8n_api_key ? "database" : n8nUrl || n8nKey ? "environment" : null,
    },
    claude: {
      apiKey: claudeKey.trim(),
      model: claudeModel.trim() || "claude-sonnet-4-5",
      source: stored.claude_api_key ? "database" : process.env.ANTHROPIC_API_KEY ? "environment" : null,
    },
  };
}

/** Mask a secret for display: keep only the last 4 characters. */
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••••••${value.slice(-4)}`;
}
