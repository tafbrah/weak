import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { generateTemplateForLead } from "@/lib/template-generator";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const company = String(data.company ?? "").trim();
  const budget = String(data.budget ?? "Not sure yet").trim() || "Not sure yet";
  const message = String(data.message ?? "").trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ ok: false, error: "Please provide your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid work email." },
      { status: 400 },
    );
  }
  if (message.length > 2000) {
    return NextResponse.json({ ok: false, error: "Message is too long." }, { status: 400 });
  }

  const [row] = await db
    .insert(leads)
    .values({ name, email, company, budget, message, status: "new" })
    .returning({ id: leads.id });

  // The intake workflow: as soon as a questionnaire arrives, hand the brief to
  // Claude (or the rules fallback) to produce the n8n template. Fire-and-forget
  // so the customer's submission never waits on generation.
  void generateTemplateForLead(row.id).catch((err) => {
    console.error("[intake] template generation failed:", err);
  });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
