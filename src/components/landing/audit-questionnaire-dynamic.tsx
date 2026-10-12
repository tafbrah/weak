"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

export type DynamicField = {
  id: number;
  step: number;
  fieldKey: string;
  label: string;
  fieldType: string;
  options: string;
  placeholder: string;
  required: number;
  enabled: number;
  sortOrder: number;
};

const STEP_META: Record<number, { title: string; sub: string }> = {
  1: { title: "Who are you?", sub: "So we know who to reply to." },
  2: { title: "Your company", sub: "Context helps us scope realistically." },
  3: { title: "Industry & tools", sub: "What does your stack look like today?" },
  4: { title: "What should we automate?", sub: "Pick every loop that eats your time." },
  5: { title: "Describe the process", sub: "In your own words — rough is fine." },
  6: { title: "Volume & time", sub: "How often it runs, and how long it takes." },
  7: { title: "Budget & timeline", sub: "Honest answers get honest proposals." },
  8: { title: "Your goals", sub: "What does success look like?" },
  9: { title: "Technical context", sub: "Automation maturity & constraints." },
  10: { title: "Review & confirm", sub: "One last look before it reaches our team." },
};

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3.5 py-2.5 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

// Estimate midpoints for volume and time
const VOLUME_MID: Record<string, number> = {
  "< 10 / week": 5,
  "10 – 50 / week": 30,
  "50 – 200 / week": 125,
  "200 – 1,000 / week": 600,
  "1,000+ / week": 1500,
};
const TIME_MID: Record<string, number> = {
  "< 2 min": 1,
  "2 – 10 min": 6,
  "10 – 30 min": 20,
  "30 – 60 min": 45,
  "1 – 4 hours": 150,
  "4+ hours": 360,
};

export default function DynamicAuditQuestionnaire({
  fields,
}: {
  fields: DynamicField[];
}) {
  // Group fields by step, only enabled fields, sorted by sortOrder
  const stepsMap = useMemo(() => {
    const map = new Map<number, DynamicField[]>();
    fields
      .filter((f) => f.enabled === 1)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((f) => {
        if (!map.has(f.step)) map.set(f.step, []);
        map.get(f.step)!.push(f);
      });
    return map;
  }, [fields]);

  const stepNumbers = Array.from(stepsMap.keys()).sort((a, b) => a - b);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = stepNumbers[currentStepIdx] ?? 1;
  const currentFields = stepsMap.get(currentStep) ?? [];
  const isLastStep = currentStepIdx === stepNumbers.length - 1;

  function parseOptions(optionsStr: string): string[] {
    if (!optionsStr) return [];
    try {
      const parsed = JSON.parse(optionsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key: string, option: string) {
    setAnswers((prev) => {
      const current = (prev[key] as string[]) ?? [];
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
      return { ...prev, [key]: next };
    });
  }

  function isStepValid(): boolean {
    for (const f of currentFields) {
      if (f.required !== 1) continue;
      const val = answers[f.fieldKey];
      if (f.fieldType === "multiselect") {
        if (!Array.isArray(val) || val.length === 0) return false;
      } else {
        if (!val || String(val).trim() === "") return false;
      }
    }
    if (isLastStep && !consent) return false;
    return true;
  }

  // Live estimate for step 6
  const estimate = useMemo(() => {
    const volume = answers["volume"] as string;
    const time = answers["timePerRun"] as string;
    if (!volume || !time) return null;
    const v = VOLUME_MID[volume];
    const tm = TIME_MID[time];
    if (v === undefined || tm === undefined) return null;
    return Math.round((v * tm * 4.33) / 60);
  }, [answers]);

  function buildSummary(): string {
    const lines = ["AUDIT REQUEST — 10-step project questionnaire"];
    let stepNum = 0;
    for (const step of stepNumbers) {
      stepNum++;
      const stepFields = stepsMap.get(step) ?? [];
      const parts = stepFields
        .map((f) => {
          const val = answers[f.fieldKey];
          if (val === undefined || val === "") return null;
          const display = Array.isArray(val) ? val.join(", ") : String(val);
          return `${f.label}: ${display}`;
        })
        .filter(Boolean)
        .join(" · ");
      if (parts) lines.push(`${stepNum}. ${parts}`);
    }
    if (estimate) lines.push(`Estimated: ≈ ${estimate} h/month recoverable`);
    return lines.join("\n");
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const name = (answers["name"] as string) ?? "";
      const email = (answers["email"] as string) ?? "";
      const company = (answers["company"] as string) ?? "";
      const budget = (answers["budget"] as string) ?? "Not sure yet";
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          budget,
          message: buildSummary(),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (!isStepValid()) return;
    if (isLastStep) {
      submit();
    } else {
      setCurrentStepIdx((i) => i + 1);
    }
  }

  function prev() {
    if (currentStepIdx > 0) setCurrentStepIdx((i) => i - 1);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-edge bg-panel p-6 sm:p-10">
        <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/15">
            <Check className="h-7 w-7 text-moss" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold text-bone">Project brief received.</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-fog">
            Your answers are in our pipeline — an n8n workflow is already routing them to the right engineer.
            We reply within one business day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-edge bg-panel">
      {/* Progress header */}
      <div className="border-b border-edge px-5 pb-4 pt-5 sm:px-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ember">
            Step {currentStepIdx + 1} / {stepNumbers.length}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
            {Math.round(((currentStepIdx + 1) / stepNumbers.length) * 100)}%
          </p>
        </div>
        <div className="mt-3 flex gap-1">
          {stepNumbers.map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= currentStepIdx ? "bg-ember" : "bg-edge"}`}
            />
          ))}
        </div>
        <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-bone">
          {STEP_META[currentStep]?.title ?? `Step ${currentStep}`}
        </h3>
        <p className="mt-0.5 text-sm text-fog">{STEP_META[currentStep]?.sub ?? ""}</p>
      </div>

      {/* Fields */}
      <div className="px-5 py-6 sm:px-8">
        <div className="space-y-4">
          {currentFields.map((f) => {
            const options = parseOptions(f.options);
            const val = answers[f.fieldKey];

            if (f.fieldType === "text" || f.fieldType === "email") {
              return (
                <div key={f.id}>
                  <label className={labelCls}>
                    {f.label} {f.required === 1 && "*"}
                  </label>
                  <input
                    type={f.fieldType}
                    value={(val as string) ?? ""}
                    onChange={(e) => setAnswer(f.fieldKey, e.target.value)}
                    placeholder={f.placeholder}
                    className={field}
                  />
                </div>
              );
            }

            if (f.fieldType === "textarea") {
              return (
                <div key={f.id}>
                  <label className={labelCls}>
                    {f.label} {f.required === 1 && "*"}
                  </label>
                  <textarea
                    rows={5}
                    value={(val as string) ?? ""}
                    onChange={(e) => setAnswer(f.fieldKey, e.target.value)}
                    placeholder={f.placeholder}
                    className={`${field} resize-none`}
                  />
                </div>
              );
            }

            if (f.fieldType === "select") {
              return (
                <div key={f.id}>
                  <label className={labelCls}>
                    {f.label} {f.required === 1 && "*"}
                  </label>
                  <select
                    value={(val as string) ?? ""}
                    onChange={(e) => setAnswer(f.fieldKey, e.target.value)}
                    className={field}
                  >
                    <option value="">— Select —</option>
                    {options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (f.fieldType === "multiselect") {
              const selected = (val as string[]) ?? [];
              return (
                <div key={f.id}>
                  <label className={labelCls}>
                    {f.label} {f.required === 1 && "*"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {options.map((o) => {
                      const on = selected.includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => toggleMulti(f.fieldKey, o)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            on
                              ? "border-ember bg-ember/15 text-cream"
                              : "border-edge bg-panel-2 text-fog hover:border-fog hover:text-bone"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (f.fieldType === "checkbox") {
              return (
                <div key={f.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`field-${f.id}`}
                    checked={val === "true"}
                    onChange={(e) => setAnswer(f.fieldKey, e.target.checked ? "true" : "false")}
                    className="h-4 w-4 accent-[#e4572e]"
                  />
                  <label htmlFor={`field-${f.id}`} className="text-sm text-fog">
                    {f.label} {f.required === 1 && "*"}
                  </label>
                </div>
              );
            }

            return null;
          })}

          {/* Live estimate for step 6 */}
          {currentStep === 6 && estimate !== null && (
            <p className="rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-bone">
              That&apos;s roughly ≈ {estimate} hours / month of recoverable work.
            </p>
          )}

          {/* Consent for last step */}
          {isLastStep && (
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-edge bg-panel-2 px-4 py-3 text-sm text-fog">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#e4572e]"
              />
              <span>
                Send this brief to the Loopwerk team and let them contact me about my project. *
              </span>
            </label>
          )}

          {error && (
            <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3]">{error}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-edge px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={prev}
          disabled={currentStepIdx === 0 || busy}
          className="flex items-center gap-1.5 rounded-md border border-edge px-3.5 py-2 text-sm font-medium text-fog transition-colors hover:border-fog hover:text-bone disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!isStepValid() || busy}
          className="flex items-center gap-2 rounded-md bg-ember px-5 py-2 text-sm font-bold text-cream transition-colors hover:bg-ember-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLastStep ? (
            <Check className="h-4 w-4" />
          ) : null}
          {isLastStep ? "Submit my project" : "Next"}
          {!isLastStep && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
