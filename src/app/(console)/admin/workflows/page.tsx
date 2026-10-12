import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import { DeleteLeadButton, LeadStageSelect } from "@/components/admin/controls";
import ProjectDetail, { type BriefStep } from "@/components/admin/project-detail";
import TemplatePanel from "@/components/admin/template-panel";
import {
  Badge,
  Empty,
  leadStageLabel,
  leadTone,
  LEAD_STAGES,
  PageHeader,
  Panel,
} from "@/components/admin/ui";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { timeAgo } from "@/lib/format";
import { getConsoleI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Workflows — Loopwerk console" };

function parseBrief(message: string): { steps: BriefStep[]; estimate: number | null; isQuestionnaire: boolean } {
  const isQuestionnaire = message.startsWith("AUDIT REQUEST");
  const lines = message.split("\n").filter(Boolean);
  const steps: BriefStep[] = isQuestionnaire
    ? lines.slice(1).map((line) => {
        const m = line.match(/^(\d+)\.\s+(.*)$/);
        return m ? { n: m[1], text: m[2] } : { n: "·", text: line };
      })
    : [];
  const em = message.match(/est\. ≈ (\d+) h\/month/);
  return { steps, estimate: em ? Number(em[1]) : null, isQuestionnaire };
}

const STAGE_OPTIONS = LEAD_STAGES.map((s) => ({ value: s, label: leadStageLabel[s] }));

export default async function WorkflowsPage() {
  const { t } = await getConsoleI18n();
  const [rows, countRows] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)),
    db.select({ status: leads.status, c: sql<number>`count(*)::int` }).from(leads).groupBy(leads.status),
  ]);

  const counts = new Map(countRows.map((r) => [r.status, r.c]));
  const questionnaireCount = rows.filter((r) => r.message.startsWith("AUDIT REQUEST")).length;

  return (
    <>
      <PageHeader
        title={t("console.workflows.title", "Workflows")}
        sub={`${rows.length} project intake${rows.length === 1 ? "" : "s"} · ${questionnaireCount} from the 10-step questionnaire`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {LEAD_STAGES.map((s) => (
          <span
            key={s}
            className="flex items-center gap-2 rounded-full border border-edge bg-panel px-3.5 py-1.5 font-mono text-[11px] text-fog"
          >
            <Badge tone={leadTone[s]}>{leadStageLabel[s]}</Badge>
            {counts.get(s) ?? 0}
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <Panel>
          <Empty>No project registrations yet — they arrive here from the booking questionnaire.</Empty>
        </Panel>
      ) : (
        <div className="space-y-4">
          {rows.map((lead) => {
            const brief = parseBrief(lead.message);
            return (
              <Panel key={lead.id} className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-bone">
                      {lead.name}
                      <Badge tone={leadTone[lead.status]}>{leadStageLabel[lead.status]}</Badge>
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-fog">
                      {lead.email}
                      {lead.company ? ` · ${lead.company}` : ""} · received {timeAgo(lead.createdAt)}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-[10px] text-fog">
                        budget: {lead.budget}
                      </span>
                      {brief.estimate !== null && (
                        <span className="rounded-full border border-ember/40 bg-ember/10 px-2.5 py-0.5 font-mono text-[10px] text-[#ff8f66]">
                          ≈ {brief.estimate} h/month recoverable
                        </span>
                      )}
                      <span className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-[10px] text-fog">
                        {brief.isQuestionnaire ? "10-step brief" : "free-form"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <LeadStageSelect leadId={lead.id} value={lead.status} options={STAGE_OPTIONS} />
                    <DeleteLeadButton leadId={lead.id} />
                  </div>
                </div>
                <TemplatePanel
                  leadId={lead.id}
                  summary={lead.templateSummary}
                  json={lead.templateJson}
                  source={lead.templateSource}
                  company={lead.company}
                  n8nWorkflowId={lead.n8nWorkflowId}
                  n8nPushedAt={lead.n8nPushedAt}
                  n8nError={lead.n8nError}
                />
                <ProjectDetail steps={brief.steps} raw={lead.message} isQuestionnaire={brief.isQuestionnaire} />
              </Panel>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-mono text-[11px] text-fog">
        each registration submitted on /book-audit lands here · move it through: intake → audit → blueprint → live
      </p>
    </>
  );
}
