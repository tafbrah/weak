import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getAllConfig } from "@/lib/config";

/**
 * Validates the stored messaging credentials (format check). With real keys
 * this is where a live provider call would happen.
 */
export async function POST(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const target = String((body as Record<string, unknown>).target ?? "email");

  const cfg = await getAllConfig();

  if (target === "sms") {
    const key = (cfg.sms_api_key ?? "").trim();
    const provider = cfg.sms_provider || "twilio";
    if (!key) {
      return NextResponse.json({ ok: false, error: "No SMS API key configured yet." }, { status: 400 });
    }
    const label = provider === "twilio" ? "Twilio" : provider === "ovh" ? "OVH SMS" : "Manual";
    if (provider !== "manual" && key.length < 10) {
      return NextResponse.json(
        { ok: false, error: `This does not look like a ${label} key. Check it and try again.` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, message: `Connected to ${label}.` });
  }

  const key = (cfg.email_api_key ?? "").trim();
  const provider = cfg.email_provider || "smtp";
  if (!key) {
    return NextResponse.json({ ok: false, error: "No email API key configured yet." }, { status: 400 });
  }
  const label = provider === "sendgrid" ? "SendGrid" : provider === "resend" ? "Resend" : provider === "smtp" ? "SMTP" : "Manual";
  if (provider !== "manual" && provider !== "smtp" && key.length < 10) {
    return NextResponse.json(
      { ok: false, error: `This does not look like a ${label} key. Check it and try again.` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, message: `Connected to ${label}.` });
}
