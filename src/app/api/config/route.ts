import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getApiConfig, maskSecret, setConfigValues } from "@/lib/config";

/** Current API configuration — secrets are masked. */
export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const cfg = await getApiConfig();
  return NextResponse.json({
    ok: true,
    n8n: {
      url: cfg.n8n.url,
      apiKeyMasked: maskSecret(cfg.n8n.apiKey),
      configured: Boolean(cfg.n8n.url && cfg.n8n.apiKey),
      source: cfg.n8n.source,
    },
    claude: {
      apiKeyMasked: maskSecret(cfg.claude.apiKey),
      model: cfg.claude.model,
      configured: Boolean(cfg.claude.apiKey),
      source: cfg.claude.source,
    },
  });
}

/**
 * Save API configuration. Console values take priority over environment
 * variables. Empty strings clear a stored value (falling back to env).
 */
export async function PUT(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const entries: Record<string, string> = {};

  if (typeof data.n8n_url === "string") {
    const url = data.n8n_url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { ok: false, error: "n8n URL must start with http:// or https://" },
        { status: 400 },
      );
    }
    entries.n8n_url = url.replace(/\/$/, "");
  }
  if (typeof data.n8n_api_key === "string") entries.n8n_api_key = data.n8n_api_key.trim();
  if (typeof data.claude_api_key === "string") entries.claude_api_key = data.claude_api_key.trim();
  if (typeof data.claude_model === "string") entries.claude_model = data.claude_model.trim();

  await setConfigValues(entries);

  // Return the refreshed masked state.
  const cfg = await getApiConfig();
  return NextResponse.json({
    ok: true,
    n8n: {
      url: cfg.n8n.url,
      apiKeyMasked: maskSecret(cfg.n8n.apiKey),
      configured: Boolean(cfg.n8n.url && cfg.n8n.apiKey),
      source: cfg.n8n.source,
    },
    claude: {
      apiKeyMasked: maskSecret(cfg.claude.apiKey),
      model: cfg.claude.model,
      configured: Boolean(cfg.claude.apiKey),
      source: cfg.claude.source,
    },
  });
}
