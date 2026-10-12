import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { setConfigValues } from "@/lib/config";
import { messagingConfig } from "@/lib/messaging";

const EMAIL_PROVIDERS = ["smtp", "sendgrid", "resend", "manual"] as const;
const SMS_PROVIDERS = ["twilio", "ovh", "manual"] as const;

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, messaging: await messagingConfig() });
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

  if (typeof data.emailProvider === "string") {
    if (!(EMAIL_PROVIDERS as readonly string[]).includes(data.emailProvider)) {
      return NextResponse.json({ ok: false, error: "Unknown email provider." }, { status: 400 });
    }
    entries.email_provider = data.emailProvider;
  }
  if (typeof data.smsProvider === "string") {
    if (!(SMS_PROVIDERS as readonly string[]).includes(data.smsProvider)) {
      return NextResponse.json({ ok: false, error: "Unknown SMS provider." }, { status: 400 });
    }
    entries.sms_provider = data.smsProvider;
  }
  if (typeof data.emailFrom === "string") entries.email_from = data.emailFrom.trim();
  if (typeof data.smsSender === "string") entries.sms_sender = data.smsSender.trim();
  if (typeof data.emailApiKey === "string") {
    entries.email_api_key = data.emailApiKey === "__clear__" ? "" : data.emailApiKey.trim();
  }
  if (typeof data.smsApiKey === "string") {
    entries.sms_api_key = data.smsApiKey === "__clear__" ? "" : data.smsApiKey.trim();
  }

  await setConfigValues(entries);
  return NextResponse.json({ ok: true, messaging: await messagingConfig() });
}
