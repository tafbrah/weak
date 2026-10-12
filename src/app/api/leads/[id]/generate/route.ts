import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { generateTemplateForLead } from "@/lib/template-generator";

type Params = { params: Promise<{ id: string }> };

/** Generate (or regenerate) the n8n template for a project intake. */
export async function POST(request: Request, { params }: Params) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "Invalid lead id." }, { status: 400 });
  }

  const template = await generateTemplateForLead(id);
  if (!template) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, template });
}
