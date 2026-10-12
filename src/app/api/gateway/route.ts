import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getAllConfig, maskSecret, setConfigValues } from "@/lib/config";

const PROVIDERS = ["stripe", "mollie", "paypal", "manual"] as const;
const MODES = ["test", "live"] as const;
const CURRENCIES = ["EUR", "USD", "GBP"] as const;

export async function gatewayConfig() {
  const cfg = await getAllConfig();
  const provider = cfg.gateway_provider ?? "stripe";
  const mode = cfg.gateway_mode ?? "test";
  const apiKey = cfg.gateway_api_key ?? "";
  const webhookSecret = cfg.gateway_webhook_secret ?? "";
  const currency = cfg.gateway_currency ?? "EUR";
  return {
    provider,
    mode,
    currency,
    apiKeyMasked: maskSecret(apiKey),
    webhookMasked: maskSecret(webhookSecret),
    configured: apiKey.trim().length > 0,
  };
}

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, gateway: await gatewayConfig() });
}

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

  if (typeof data.provider === "string") {
    if (!(PROVIDERS as readonly string[]).includes(data.provider)) {
      return NextResponse.json({ ok: false, error: "Unknown provider." }, { status: 400 });
    }
    entries.gateway_provider = data.provider;
  }
  if (typeof data.mode === "string") {
    if (!(MODES as readonly string[]).includes(data.mode)) {
      return NextResponse.json({ ok: false, error: "Mode must be test or live." }, { status: 400 });
    }
    entries.gateway_mode = data.mode;
  }
  if (typeof data.currency === "string") {
    if (!(CURRENCIES as readonly string[]).includes(data.currency.toUpperCase())) {
      return NextResponse.json({ ok: false, error: "Unsupported currency." }, { status: 400 });
    }
    entries.gateway_currency = data.currency.toUpperCase();
  }
  // Empty strings keep the previously stored secret (use "clear" to erase).
  if (typeof data.apiKey === "string") {
    entries.gateway_api_key = data.apiKey === "__clear__" ? "" : data.apiKey.trim();
  }
  if (typeof data.webhookSecret === "string") {
    entries.gateway_webhook_secret = data.webhookSecret === "__clear__" ? "" : data.webhookSecret.trim();
  }

  await setConfigValues(entries);
  return NextResponse.json({ ok: true, gateway: await gatewayConfig() });
}
