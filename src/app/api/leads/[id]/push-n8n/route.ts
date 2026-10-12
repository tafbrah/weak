import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { pushWorkflowToN8n } from "@/lib/n8n-client";
import { generateTemplateForLead } from "@/lib/template-generator";

type Params = { params: Promise<{ id: string }> };

/** Push the project's generated workflow to the n8n instance (retry-safe). */
export async function POST(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id." }, { status: 400 });
  }

  let [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  // No template yet? Generate one first, which also attempts the push.
  if (!lead.templateJson) {
    const template = await generateTemplateForLead(id);
    if (!template) {
      return NextResponse.json({ ok: false, error: "Generation failed." }, { status: 500 });
    }
    return NextResponse.json({
      ok: template.n8n?.pushed ?? false,
      workflowId: template.n8n?.workflowId ?? null,
      error: template.n8n?.error ?? null,
    });
  }

  const workflow = JSON.parse(lead.templateJson) as {
    name: string;
    nodes: unknown[];
    connections: Record<string, unknown>;
    settings?: Record<string, unknown>;
  };

  const push = await pushWorkflowToN8n(workflow);
  if (push.ok) {
    await db
      .update(leads)
      .set({ n8nWorkflowId: push.workflowId, n8nPushedAt: new Date(), n8nError: null })
      .where(eq(leads.id, id));
    return NextResponse.json({ ok: true, workflowId: push.workflowId });
  }

  await db.update(leads).set({ n8nError: push.error }).where(eq(leads.id, id));
  return NextResponse.json({ ok: false, error: push.error }, { status: 502 });
}
