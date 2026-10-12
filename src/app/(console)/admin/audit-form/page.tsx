import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import {
  AddFieldForm,
  DeleteFieldButton,
  ToggleFieldEnabled,
  ToggleFieldRequired,
} from "@/components/admin/audit-form-controls";
import { Badge, Empty, PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { db } from "@/db";
import { auditFormFields } from "@/db/schema";

export const metadata: Metadata = { title: "Audit Form — Loopwerk console" };

const STEP_NAMES: Record<number, string> = {
  1: "Contact",
  2: "Company",
  3: "Industry & Tools",
  4: "What to automate",
  5: "Describe process",
  6: "Volume & time",
  7: "Budget & timeline",
  8: "Goals",
  9: "Technical context",
  10: "Scheduling",
};

export default async function AuditFormPage() {
  const fields = await db.select().from(auditFormFields).orderBy(asc(auditFormFields.step), asc(auditFormFields.sortOrder));

  const totalFields = fields.length;
  const enabledFields = fields.filter((f) => f.enabled === 1).length;
  const requiredFields = fields.filter((f) => f.required === 1).length;
  const steps = new Set(fields.map((f) => f.step)).size;

  // Group fields by step
  const fieldsByStep = new Map<number, typeof fields>();
  for (const field of fields) {
    if (!fieldsByStep.has(field.step)) fieldsByStep.set(field.step, []);
    fieldsByStep.get(field.step)!.push(field);
  }

  const nextStep = Math.min(10, steps + 1);

  return (
    <>
      <PageHeader
        title="Audit Form Builder"
        sub={`${totalFields} fields · ${steps} steps · manage the "Book the audit" questionnaire`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total fields" value={String(totalFields)} sub="across all steps" />
        <StatCard label="Enabled" value={String(enabledFields)} tone="moss" sub="active in form" />
        <StatCard label="Required" value={String(requiredFields)} tone="honey" sub="mandatory fields" />
        <StatCard label="Steps" value={String(steps)} sub="form steps" />
      </div>

      <div className="mt-6 mb-6">
        <AddFieldForm nextStep={nextStep} />
      </div>

      {fields.length === 0 ? (
        <Panel>
          <Empty>No form fields yet. Add the first one above.</Empty>
        </Panel>
      ) : (
        <div className="space-y-6">
          {Array.from(fieldsByStep.entries())
            .sort(([a], [b]) => a - b)
            .map(([step, stepFields]) => (
              <Panel
                key={step}
                title={`Step ${step}: ${STEP_NAMES[step] ?? "Custom"}`}
                sub={`${stepFields.length} field${stepFields.length === 1 ? "" : "s"}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="border-b border-edge">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Label</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Type</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Options</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Status</th>
                        <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-edge/60">
                      {stepFields.map((f) => {
                        const options = f.options ? JSON.parse(f.options) : [];
                        return (
                          <tr key={f.id} className="transition-colors hover:bg-panel-2/50">
                            <td className="max-w-[200px] px-4 py-3 align-middle">
                              <p className="truncate text-sm font-medium text-bone">{f.label}</p>
                              <p className="truncate font-mono text-[10px] text-fog">{f.fieldKey}</p>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <Badge tone="fog">{f.fieldType}</Badge>
                            </td>
                            <td className="max-w-[200px] px-4 py-3 align-middle">
                              <p className="truncate text-xs text-fog">
                                {options.length > 0 ? `${options.length} options` : "—"}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="flex items-center gap-2">
                                <ToggleFieldEnabled fieldId={f.id} enabled={f.enabled} />
                                <ToggleFieldRequired fieldId={f.id} required={f.required} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right align-middle">
                              <DeleteFieldButton fieldId={f.id} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ))}
        </div>
      )}

      <p className="mt-4 font-mono text-[11px] text-fog">
        Fields are grouped by step · toggle enabled/required · add new fields to any step · delete to remove
      </p>
    </>
  );
}
