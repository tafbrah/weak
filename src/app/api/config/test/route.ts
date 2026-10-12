import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getApiConfig } from "@/lib/config";

/** Live connection test for the configured n8n or Claude API. */
export async function POST(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const target = String((body as Record<string, unknown>).target ?? "");
  const cfg = await getApiConfig();

  if (target === "n8n") {
    if (!cfg.n8n.url || !cfg.n8n.apiKey) {
      return NextResponse.json(
        { ok: false, error: "Configure the n8n URL and API key first." },
        { status: 400 },
      );
    }
    try {
      const res = await fetch(`${cfg.n8n.url.replace(/\/$/, "")}/api/v1/workflows?limit=1`, {
        headers: { "X-N8N-API-KEY": cfg.n8n.apiKey },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: `n8n answered ${res.status} — check the URL and API key.` },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, message: "Connected to the n8n instance." });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: `Could not reach n8n (${err instanceof Error ? err.message : "network error"}).` },
        { status: 502 },
      );
    }
  }

  if (target === "claude") {
    if (!cfg.claude.apiKey) {
      return NextResponse.json({ ok: false, error: "Configure the Claude API key first." }, { status: 400 });
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": cfg.claude.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: cfg.claude.model,
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        return NextResponse.json(
          { ok: false, error: `Claude answered ${res.status}: ${data.error?.message ?? "check the key and model."}` },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, message: `Claude (${cfg.claude.model}) responded.` });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: `Could not reach Claude (${err instanceof Error ? err.message : "network error"}).` },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ ok: false, error: "Unknown target." }, { status: 400 });
}
