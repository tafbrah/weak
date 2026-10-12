import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getAllConfig } from "@/lib/config";

/**
 * Validates the stored gateway credentials. Format checks mimic each
 * provider's key shape; with real keys this is where a live API call
 * (e.g. GET /v1/account for Stripe) would happen.
 */
export async function POST(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const cfg = await getAllConfig();
  const provider = cfg.gateway_provider ?? "stripe";
  const mode = cfg.gateway_mode ?? "test";
  const key = (cfg.gateway_api_key ?? "").trim();

  if (!key) {
    return NextResponse.json(
      { ok: false, error: "No API key configured yet." },
      { status: 400 },
    );
  }

  const shapes: Record<string, { test: RegExp; live: RegExp; label: string }> = {
    stripe: { test: /^sk_test_[A-Za-z0-9]{8,}$/, live: /^sk_live_[A-Za-z0-9]{8,}$/, label: "Stripe" },
    mollie: { test: /^test_[A-Za-z0-9]{8,}$/, live: /^live_[A-Za-z0-9]{8,}$/, label: "Mollie" },
    paypal: { test: /^A[A-Za-z0-9_-]{10,}$/, live: /^A[A-Za-z0-9_-]{10,}$/, label: "PayPal" },
    manual: { test: /^.+$/, live: /^.+$/, label: "Manual / bank transfer" },
  };

  const shape = shapes[provider] ?? shapes.stripe;
  const expected = mode === "live" ? shape.live : shape.test;

  if (!expected.test(key)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          provider === "manual"
            ? "Key missing."
            : `This does not look like a ${shape.label} ${mode} key. Check the prefix and try again.`,
      },
      { status: 502 },
    );
  }

  if (provider === "stripe" && mode === "test" && !key.startsWith("sk_test_")) {
    return NextResponse.json(
      { ok: false, error: "Mode is set to test but the key is not an sk_test_ key." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Connected to ${shape.label} (${mode} mode).`,
  });
}
