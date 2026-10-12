import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { getAllConfig } from "@/lib/config";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
  return NextResponse.json({ ok: true, messages: rows });
}

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

  const data = (body ?? {}) as Record<string, unknown>;
  const kind = data.kind === "sms" ? "sms" : "email";
  const subject = String(data.subject ?? "").trim();
  const bodyText = String(data.body ?? "").trim();
  const recipientName = String(data.recipientName ?? "").trim();
  const recipientEmail = String(data.recipientEmail ?? "").trim();
  const recipientPhone = String(data.recipientPhone ?? "").trim();
  const clientName = String(data.clientName ?? "").trim();
  const sendNow = data.sendNow !== false;
  const scheduledAtRaw = String(data.scheduledAt ?? "");

  if (!bodyText) {
    return NextResponse.json({ ok: false, error: "Message body is required." }, { status: 400 });
  }
  if (kind === "email" && !subject) {
    return NextResponse.json({ ok: false, error: "Email subject is required." }, { status: 400 });
  }
  if (kind === "email" && !recipientEmail) {
    return NextResponse.json({ ok: false, error: "Recipient email is required." }, { status: 400 });
  }
  if (kind === "sms" && !recipientPhone) {
    return NextResponse.json({ ok: false, error: "Recipient phone is required." }, { status: 400 });
  }

  // Resolve the provider from configuration (for the log).
  const cfg = await getAllConfig();
  const provider = kind === "email" ? cfg.email_provider || "smtp" : cfg.sms_provider || "twilio";

  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;
  const isScheduled = !sendNow && scheduledAt && !Number.isNaN(scheduledAt.getTime());
  const status = sendNow ? "sent" : isScheduled ? "scheduled" : "draft";

  const [row] = await db
    .insert(messages)
    .values({
      kind,
      subject,
      body: bodyText,
      recipientName,
      recipientEmail,
      recipientPhone,
      clientName,
      status,
      provider,
      scheduledAt: isScheduled ? scheduledAt : null,
      sentAt: sendNow ? new Date() : null,
    })
    .returning();

  return NextResponse.json({ ok: true, message: row }, { status: 201 });
}
