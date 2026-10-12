import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { getApiConfig } from "@/lib/config";
import { n8nConfigured, pushWorkflowToN8n } from "@/lib/n8n-client";

export type GeneratedTemplate = {
  summary: string;
  workflow: {
    name: string;
    nodes: unknown[];
    connections: Record<string, unknown>;
    settings?: Record<string, unknown>;
  };
  source: "claude" | "rules";
  /** Result of the push to the n8n instance (only when it is configured). */
  n8n?: { pushed: boolean; workflowId?: string; error?: string };
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

type LeadRow = typeof leads.$inferSelect;

/* ------------------------------ Claude path ------------------------------ */

function buildClaudePrompt(lead: LeadRow): string {
  return `You are a senior n8n automation architect at an automation agency.
A prospective customer submitted a project questionnaire. Design a production-ready n8n workflow template that implements the FIRST automation we should build for them.

CUSTOMER BRIEF
--------------
${lead.message}

TASK
----
Return STRICT JSON ONLY (no markdown fences, no commentary) with this exact shape:
{
  "summary": "2-3 sentence plain-English description of the workflow, the hours it saves, and how it maps to the customer's process",
  "workflow": {
    "name": "Short workflow name",
    "nodes": [ { "id": "uuid", "name": "Node Name", "type": "n8n node type id", "typeVersion": 1, "position": [x, y], "parameters": { } } ],
    "connections": { "Node Name": { "main": [ [ { "node": "Next Node", "type": "main", "index": 0 } ] ] } },
    "settings": { "executionOrder": "v1" }
  }
}

RULES
-----
- Use real n8n node types, e.g. n8n-nodes-base.webhook, n8n-nodes-base.set, n8n-nodes-base.if, n8n-nodes-base.slack, n8n-nodes-base.gmail, n8n-nodes-base.postgres, n8n-nodes-base.scheduleTrigger, @n8n/n8n-nodes-langchain.agent.
- Start with a trigger that matches the intake (webhook or schedule).
- Include an AI step (agent or LLM node) where the brief implies decisions/drafting/classification.
- Include a human-approval or notification step (Slack/Gmail) and a persistence step (Postgres) when sensible.
- 6 to 12 nodes, positions laid out left-to-right (x increases by ~220).
- Parameters should be realistic placeholders referencing the customer's tools from the brief.
- Keep it valid importable n8n JSON.`;
}

function extractJson(text: string): unknown {
  // strip code fences if the model added them anyway
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in Claude response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function validateTemplate(obj: unknown): GeneratedTemplate["workflow"] {
  const t = obj as { name?: unknown; nodes?: unknown; connections?: unknown; settings?: unknown };
  if (!t || !Array.isArray(t.nodes) || t.nodes.length === 0) throw new Error("Template has no nodes");
  if (!t.connections || typeof t.connections !== "object") throw new Error("Template has no connections");
  return {
    name: typeof t.name === "string" && t.name.trim() ? t.name : "Generated workflow",
    nodes: t.nodes,
    connections: t.connections as Record<string, unknown>,
    settings: (t.settings as Record<string, unknown>) ?? { executionOrder: "v1" },
  };
}

async function generateWithClaude(lead: LeadRow, apiKey: string, model: string): Promise<GeneratedTemplate> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: "user", content: buildClaudePrompt(lead) }],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: { type?: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  const parsed = extractJson(text) as { summary?: unknown; workflow?: unknown };
  const workflow = validateTemplate(parsed.workflow);
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : `n8n workflow "${workflow.name}" generated from the 10-step brief.`;

  return { summary, workflow, source: "claude" };
}

/* ------------------------------ rules fallback ------------------------------ */

function buildRulesTemplate(lead: LeadRow): GeneratedTemplate {
  const company = lead.company.trim() || lead.name.trim() || "Customer";
  const brief = lead.message;
  const wantsDocs = /documents|invoice|data entry|ocr/i.test(brief);
  const wantsSupport = /support|ticket/i.test(brief);
  const wantsLeads = /lead|follow-up|quoting/i.test(brief);

  const focus = wantsDocs
    ? "document processing"
    : wantsSupport
      ? "support triage"
      : wantsLeads
        ? "lead handling"
        : "process automation";

  const nodes = [
    {
      id: randomUUID(),
      name: "Intake webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [0, 0],
      parameters: { httpMethod: "POST", path: `${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-intake` },
    },
    {
      id: randomUUID(),
      name: "Normalize answers",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [220, 0],
      parameters: {
        assignments: {
          assignments: [
            { id: randomUUID(), name: "company", value: `={{ $json.body.company ?? "${company}" }}`, type: "string" },
            { id: randomUUID(), name: "focus", value: focus, type: "string" },
            { id: randomUUID(), name: "budget", value: `={{ $json.body.budget ?? "" }}`, type: "string" },
          ],
        },
      },
    },
    {
      id: randomUUID(),
      name: "AI triage agent",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.7,
      position: [440, 0],
      parameters: {
        promptType: "define",
        text: `Classify this ${focus} request from ${company}, score its priority, and draft the first action. Brief: {{ $json.body.message ?? "" }}`,
        options: { systemMessage: "You are the operations AI of an automation agency." },
      },
    },
    {
      id: randomUUID(),
      name: "High value?",
      type: "n8n-nodes-base.if",
      typeVersion: 2.2,
      position: [660, 0],
      parameters: {
        conditions: {
          options: { caseSensitive: false, typeValidation: "loose" },
          combinator: "and",
          conditions: [
            {
              id: randomUUID(),
              leftValue: "={{ $json.budget }}",
              rightValue: "€5",
              operator: { type: "string", operation: "contains" },
            },
          ],
        },
      },
    },
    {
      id: randomUUID(),
      name: "Alert team in Slack",
      type: "n8n-nodes-base.slack",
      typeVersion: 2.2,
      position: [880, -120],
      parameters: { resource: "message", operation: "post", channel: "#sales-eu", text: "={{ $json.output ?? 'New high-value project intake' }}" },
    },
    {
      id: randomUUID(),
      name: "Store in Postgres",
      type: "n8n-nodes-base.postgres",
      typeVersion: 2.5,
      position: [880, 120],
      parameters: { operation: "insert", table: "project_intakes", columns: { mappingMode: "autoMapInputData" } },
    },
  ];

  return {
    summary:
      `Starter n8n template for ${company}: a webhook receives each ${focus} request, an AI agent classifies and drafts the first action, ` +
      `high-value intakes alert the team in Slack and everything is stored in Postgres. Typical starting point — we tailor nodes, credentials and the human-approval gate during the audit.`,
    workflow: {
      name: `${company} — ${focus} intake (starter)`,
      nodes,
      connections: {
        "Intake webhook": { main: [[{ node: "Normalize answers", type: "main", index: 0 }]] },
        "Normalize answers": { main: [[{ node: "AI triage agent", type: "main", index: 0 }]] },
        "AI triage agent": { main: [[{ node: "High value?", type: "main", index: 0 }]] },
        "High value?": {
          main: [
            [{ node: "Alert team in Slack", type: "main", index: 0 }],
            [{ node: "Store in Postgres", type: "main", index: 0 }],
          ],
        },
      },
      settings: { executionOrder: "v1" },
    },
    source: "rules",
  };
}

/* --------------------------------- public --------------------------------- */

/**
 * Generate the n8n template for a lead: Claude when ANTHROPIC_API_KEY is
 * configured, deterministic rules template otherwise. Persists the result on
 * the lead row and returns it.
 */
export async function generateTemplateForLead(leadId: number): Promise<GeneratedTemplate | null> {
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) return null;

  let template: GeneratedTemplate;
  const { claude } = await getApiConfig();
  if (claude.apiKey) {
    try {
      template = await generateWithClaude(lead, claude.apiKey, claude.model);
    } catch (err) {
      console.error(`[template-generator] Claude failed, using rules fallback:`, err);
      template = buildRulesTemplate(lead);
    }
  } else {
    template = buildRulesTemplate(lead);
  }

  await db
    .update(leads)
    .set({
      templateSummary: template.summary,
      templateJson: JSON.stringify(template.workflow, null, 2),
      templateSource: template.source,
      generatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  // Immediately deliver the generated workflow to the n8n instance when the
  // API credentials are configured. A failed push never breaks generation —
  // the state is stored so it can be retried from the console.
  if (await n8nConfigured()) {
    const push = await pushWorkflowToN8n(template.workflow);
    if (push.ok) {
      template.n8n = { pushed: true, workflowId: push.workflowId };
      await db
        .update(leads)
        .set({ n8nWorkflowId: push.workflowId, n8nPushedAt: new Date(), n8nError: null })
        .where(eq(leads.id, leadId));
    } else {
      template.n8n = { pushed: false, error: push.error };
      await db.update(leads).set({ n8nError: push.error }).where(eq(leads.id, leadId));
    }
  }

  return template;
}
