/**
 * Minimal n8n public-API client (server-side only).
 *
 * Credentials are resolved from the console configuration (Settings →
 * API configuration, stored in Postgres); environment variables
 * N8N_API_URL / N8N_API_KEY act as a fallback.
 */

import { getApiConfig } from "@/lib/config";

export type N8nWorkflowPayload = {
  name: string;
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export type N8nPushResult =
  | { ok: true; workflowId: string }
  | { ok: false; error: string };

export type N8nCredentials = { url: string; apiKey: string };

export async function getN8nCredentials(): Promise<N8nCredentials> {
  const cfg = await getApiConfig();
  return { url: cfg.n8n.url.replace(/\/$/, ""), apiKey: cfg.n8n.apiKey };
}

export async function n8nConfigured(): Promise<boolean> {
  const { url, apiKey } = await getN8nCredentials();
  return Boolean(url && apiKey);
}

/** Create the workflow on the n8n instance (draft — not activated). */
export async function pushWorkflowToN8n(workflow: N8nWorkflowPayload): Promise<N8nPushResult> {
  const { url: base, apiKey: key } = await getN8nCredentials();
  if (!base || !key) {
    return {
      ok: false,
      error: "n8n API not configured — add the URL and API key in Settings → API configuration.",
    };
  }

  try {
    const res = await fetch(`${base}/api/v1/workflows`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-N8N-API-KEY": key,
      },
      body: JSON.stringify({
        name: workflow.name.slice(0, 128),
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings ?? { executionOrder: "v1" },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: unknown; message?: unknown };
    if (!res.ok) {
      const detail = typeof data.message === "string" ? data.message : res.statusText;
      return { ok: false, error: `n8n API ${res.status}: ${detail}`.slice(0, 300) };
    }

    return { ok: true, workflowId: String(data.id ?? "") };
  } catch (err) {
    return {
      ok: false,
      error: `Could not reach the n8n instance (${err instanceof Error ? err.message : "network error"}).`.slice(
        0,
        300,
      ),
    };
  }
}
