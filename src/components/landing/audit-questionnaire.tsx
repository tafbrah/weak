"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------ option catalogs ------------------------------ */

type Tr = (key: string, fallback: string) => string;

function buildCatalogs(tr: Tr) {
  return {
    ROLES: [
      tr("q.roles.founder", "Founder / CEO"),
      tr("q.roles.ops", "Operations"),
      tr("q.roles.sales", "Sales"),
      tr("q.roles.finance", "Finance"),
      tr("q.roles.support", "Support"),
      tr("q.roles.it", "IT / Engineering"),
      tr("q.roles.marketing", "Marketing"),
      tr("q.roles.other", "Other"),
    ],
    TEAM_SIZES: [
      tr("q.teams.solo", "Just me"),
      tr("q.teams.xs", "2 – 10"),
      tr("q.teams.sm", "11 – 50"),
      tr("q.teams.md", "51 – 250"),
      tr("q.teams.lg", "250+"),
    ],
    INDUSTRIES: [
      tr("q.ind.logistics", "Logistics & transport"),
      tr("q.ind.health", "Healthcare"),
      tr("q.ind.retail", "E-commerce & retail"),
      tr("q.ind.services", "Professional services"),
      tr("q.ind.finance", "Finance & insurance"),
      tr("q.ind.manufacturing", "Manufacturing"),
      tr("q.ind.saas", "SaaS & tech"),
      tr("q.ind.public", "Public sector"),
      tr("q.ind.other", "Other"),
    ],
    TOOLS: [
      tr("q.tools.mail", "Gmail / Outlook"),
      tr("q.tools.sheets", "Excel / Google Sheets"),
      tr("q.tools.slack", "Slack"),
      tr("q.tools.crm", "HubSpot / CRM"),
      tr("q.tools.sf", "Salesforce"),
      tr("q.tools.erp", "ERP (Exact, SAP…)"),
      tr("q.tools.notion", "Notion / Airtable"),
      tr("q.tools.shopify", "Shopify"),
      tr("q.tools.chat", "WhatsApp / Telegram"),
      tr("q.tools.other", "Other"),
    ],
    PROCESSES: [
      tr("q.proc.leads", "Lead handling & follow-up"),
      tr("q.proc.finance", "Invoicing & finance"),
      tr("q.proc.support", "Support tickets"),
      tr("q.proc.docs", "Documents & data entry"),
      tr("q.proc.reporting", "Reporting & dashboards"),
      tr("q.proc.sync", "Sync between tools"),
      tr("q.proc.content", "Content & marketing ops"),
      tr("q.proc.quoting", "Quoting & proposals"),
      tr("q.proc.other", "Other"),
    ],
    MODES: [
      tr("q.mode.manual", "100% manual today"),
      tr("q.mode.semi", "Semi-manual (templates / macros)"),
      tr("q.mode.unhappy", "Automated elsewhere, unhappy with it"),
    ],
    VOLUMES: [
      { label: tr("q.vol.1", "< 10 / week"), mid: 5 },
      { label: tr("q.vol.2", "10 – 50 / week"), mid: 30 },
      { label: tr("q.vol.3", "50 – 200 / week"), mid: 125 },
      { label: tr("q.vol.4", "200 – 1,000 / week"), mid: 600 },
      { label: tr("q.vol.5", "1,000+ / week"), mid: 1500 },
    ],
    TIMES: [
      { label: tr("q.time.1", "< 2 min"), mid: 1 },
      { label: tr("q.time.2", "2 – 10 min"), mid: 6 },
      { label: tr("q.time.3", "10 – 30 min"), mid: 20 },
      { label: tr("q.time.4", "30 – 60 min"), mid: 45 },
      { label: tr("q.time.5", "1 – 4 hours"), mid: 150 },
      { label: tr("q.time.6", "4+ hours"), mid: 360 },
    ],
    BUDGETS: [
      tr("q.bud.1", "< €2k / month"),
      tr("q.bud.2", "€2–5k / month"),
      tr("q.bud.3", "€5–10k / month"),
      tr("q.bud.4", "€10k+ / month"),
      tr("q.bud.5", "Not sure yet"),
    ],
    TIMELINES: [
      tr("q.tl.1", "ASAP — this is hurting now"),
      tr("q.tl.2", "Within 1 – 3 months"),
      tr("q.tl.3", "Within 3 – 6 months"),
      tr("q.tl.4", "Just exploring"),
    ],
    GOALS: [
      tr("q.goal.hours", "Save team hours"),
      tr("q.goal.errors", "Eliminate errors"),
      tr("q.goal.scale", "Scale without hiring"),
      tr("q.goal.costs", "Cut operational costs"),
      tr("q.goal.speed", "Respond faster to customers"),
      tr("q.goal.strategy", "Free up time for strategy"),
    ],
    LEVELS: [
      tr("q.lvl.none", "Nothing automated yet"),
      tr("q.lvl.zaps", "Some Zapier / Make zaps"),
      tr("q.lvl.n8n", "We already run n8n"),
      tr("q.lvl.code", "Custom code / scripts"),
    ],
    COMPLIANCE: [
      tr("q.cmp.self", "Self-hosted / EU hosting required"),
      tr("q.cmp.cloud", "Standard cloud is fine"),
      tr("q.cmp.unsure", "Not sure — advise us"),
    ],
    SLOTS: [
      tr("q.slot.morning", "Weekday morning"),
      tr("q.slot.afternoon", "Weekday afternoon"),
      tr("q.slot.evening", "Weekday evening"),
      tr("q.slot.flex", "Flexible — email me options"),
    ],
  };
}

function buildStepMeta(tr: Tr) {
  return [
    { title: tr("q.s1.title", "Who are you?"), sub: tr("q.s1.sub", "So we know who to reply to.") },
    { title: tr("q.s2.title", "Your company"), sub: tr("q.s2.sub", "Context helps us scope realistically.") },
    { title: tr("q.s3.title", "Industry & tools"), sub: tr("q.s3.sub", "What does your stack look like today?") },
    { title: tr("q.s4.title", "What should we automate?"), sub: tr("q.s4.sub", "Pick every loop that eats your time.") },
    { title: tr("q.s5.title", "Describe the process"), sub: tr("q.s5.sub", "In your own words — rough is fine.") },
    { title: tr("q.s6.title", "Volume & time"), sub: tr("q.s6.sub", "How often it runs, and how long it takes.") },
    { title: tr("q.s7.title", "Budget & timeline"), sub: tr("q.s7.sub", "Honest answers get honest proposals.") },
    { title: tr("q.s8.title", "Your goals"), sub: tr("q.s8.sub", "What does success look like?") },
    { title: tr("q.s9.title", "Technical context"), sub: tr("q.s9.sub", "Automation maturity & constraints.") },
    { title: tr("q.s10.title", "Review & confirm"), sub: tr("q.s10.sub", "One last look before it reaches our team.") },
  ];
}

/* --------------------------------- state --------------------------------- */

type Answers = {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  industry: string;
  tools: string[];
  processes: string[];
  description: string;
  mode: string;
  volume: string;
  timePerRun: string;
  budget: string;
  timeline: string;
  goals: string[];
  level: string;
  compliance: string;
  slot: string;
  notes: string;
  consent: boolean;
};

const INITIAL: Answers = {
  name: "",
  email: "",
  company: "",
  role: "",
  teamSize: "",
  industry: "",
  tools: [],
  processes: [],
  description: "",
  mode: "",
  volume: "",
  timePerRun: "",
  budget: "",
  timeline: "",
  goals: [],
  level: "",
  compliance: "",
  slot: "",
  notes: "",
  consent: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------- UI helpers ------------------------------- */

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3.5 py-2.5 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

function ChipGroup({
  options,
  value,
  onToggle,
}: {
  options: string[];
  value: string[];
  onToggle: (opt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(opt)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              on
                ? "border-ember bg-ember/15 text-shell"
                : "border-edge bg-panel-2 text-fog hover:border-fog hover:text-bone"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function OptionList({
  options,
  value,
  onSelect,
  columns = 1,
}: {
  options: string[];
  value: string;
  onSelect: (opt: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(opt)}
            className={`flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors ${
              on ? "border-ember bg-ember/10 text-bone" : "border-edge bg-panel-2 text-fog hover:border-fog hover:text-bone"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                on ? "border-ember bg-ember" : "border-fog/50"
              }`}
            >
              {on && <span className="h-1.5 w-1.5 rounded-full bg-cream" />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- component -------------------------------- */

type Status = "idle" | "sending" | "success" | "error";

export default function AuditQuestionnaire({ dict }: { dict: Record<string, string> }) {
  const tr: Tr = (key, fallback) => dict[key] ?? fallback;
  const cat = useMemo(() => buildCatalogs(tr), [dict]); // eslint-disable-line react-hooks/exhaustive-deps
  const STEP_META = useMemo(() => buildStepMeta(tr), [dict]); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Answers>(key: K, val: Answers[K]) => setA((prev) => ({ ...prev, [key]: val }));
  const toggle = (key: "tools" | "processes" | "goals", opt: string) =>
    setA((prev) => ({
      ...prev,
      [key]: prev[key].includes(opt) ? prev[key].filter((x) => x !== opt) : [...prev[key], opt],
    }));

  const estimate = useMemo(() => {
    const v = cat.VOLUMES.find((x) => x.label === a.volume);
    const t = cat.TIMES.find((x) => x.label === a.timePerRun);
    if (!v || !t) return null;
    return Math.round((v.mid * t.mid * 4.33) / 60);
  }, [a.volume, a.timePerRun, cat]);

  const stepValid = (i: number): boolean => {
    switch (i) {
      case 0:
        return a.name.trim().length >= 2 && EMAIL_RE.test(a.email.trim());
      case 1:
        return a.company.trim().length >= 2 && a.role !== "" && a.teamSize !== "";
      case 2:
        return a.industry !== "";
      case 3:
        return a.processes.length > 0;
      case 4:
        return a.description.trim().length >= 20 && a.mode !== "";
      case 5:
        return a.volume !== "" && a.timePerRun !== "";
      case 6:
        return a.budget !== "" && a.timeline !== "";
      case 7:
        return a.goals.length > 0;
      case 8:
        return a.level !== "" && a.compliance !== "";
      case 9:
        return a.slot !== "" && a.consent;
      default:
        return false;
    }
  };

  const summary = () =>
    [
      "AUDIT REQUEST — 10-step project questionnaire",
      `1. Contact: ${a.name} <${a.email}>`,
      `2. Company: ${a.company} · role: ${a.role} · team: ${a.teamSize}`,
      `3. Industry: ${a.industry} · tools: ${a.tools.join(", ") || "none listed"}`,
      `4. Processes: ${a.processes.join(", ")}`,
      `5. Description: ${a.description.trim()} (currently: ${a.mode})`,
      `6. Volume: ${a.volume} · ${a.timePerRun} per run${estimate ? ` · est. ≈ ${estimate} h/month` : ""}`,
      `7. Budget: ${a.budget} · timeline: ${a.timeline}`,
      `8. Goals: ${a.goals.join(", ")}`,
      `9. Automation level: ${a.level} · compliance: ${a.compliance}`,
      `10. Preferred slot: ${a.slot}${a.notes.trim() ? ` · notes: ${a.notes.trim()}` : ""}`,
    ].join("\n");

  async function submit() {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: a.name,
          email: a.email,
          company: a.company,
          budget: a.budget,
          message: summary(),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : tr("q.error.generic", "Something went wrong. Try again."));
    }
  }

  /* ------------------------------- success view ------------------------------- */

  if (status === "success") {
    return (
      <div className="rounded-lg border border-edge bg-panel p-6 sm:p-10">
        <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/15">
            <Check className="h-7 w-7 text-moss" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold text-bone">{tr("q.success.title", "Project brief received.")}</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-fog">
            {tr(
              "q.success.body",
              "All 10 answers just landed in our pipeline — an n8n workflow is already routing them to the right engineer. We reply within one business day.",
            )}
            {estimate
              ? " " + tr("q.success.estimate", "…with a first take on the ≈ {h} h/month we can recover.").replace("{h}", String(estimate))
              : ""}
          </p>
          <button
            type="button"
            onClick={() => {
              setA(INITIAL);
              setStep(0);
              setStatus("idle");
            }}
            className="mt-6 font-mono text-xs uppercase tracking-widest text-ember hover:text-bone"
          >
            {tr("q.success.again", "Submit another project →")}
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------- wizard view ------------------------------- */

  return (
    <div className="rounded-lg border border-edge bg-panel">
      {/* progress header */}
      <div className="border-b border-edge px-5 pb-4 pt-5 sm:px-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ember">
            {tr("q.of", "Step")} {step + 1} / {STEP_META.length}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
            {Math.round(((step + 1) / STEP_META.length) * 100)}%
          </p>
        </div>
        <div className="mt-3 flex gap-1">
          {STEP_META.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-ember" : "bg-edge"}`}
            />
          ))}
        </div>
        <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-bone">{STEP_META[step].title}</h3>
        <p className="mt-0.5 text-sm text-fog">{STEP_META[step].sub}</p>
      </div>

      {/* step body */}
      <div className="px-5 py-6 sm:px-8">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="q-name" className={labelCls}>
                {tr("q.name", "Your name *")}
              </label>
              <input
                id="q-name"
                className={field}
                value={a.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={tr("q.name.ph", "Ada Lovelace")}
              />
            </div>
            <div>
              <label htmlFor="q-email" className={labelCls}>
                {tr("q.email", "Work email *")}
              </label>
              <input
                id="q-email"
                type="email"
                className={field}
                value={a.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder={tr("q.email.ph", "ada@company.com")}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="q-company" className={labelCls}>
                {tr("q.company", "Company")}
              </label>
              <input
                id="q-company"
                className={field}
                value={a.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder={tr("q.company.ph", "Analytical Engines BV")}
              />
            </div>
            <div>
              <p className={labelCls}>{tr("q.role", "Your role *")}</p>
              <OptionList options={cat.ROLES} value={a.role} onSelect={(v) => set("role", v)} columns={2} />
            </div>
            <div>
              <p className={labelCls}>{tr("q.team", "Team size *")}</p>
              <OptionList options={cat.TEAM_SIZES} value={a.teamSize} onSelect={(v) => set("teamSize", v)} columns={2} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className={labelCls}>{tr("q.industry", "Industry *")}</p>
              <OptionList options={cat.INDUSTRIES} value={a.industry} onSelect={(v) => set("industry", v)} columns={2} />
            </div>
            <div>
              <p className={labelCls}>{tr("q.toolsOpt", "Tools you use daily (optional)")}</p>
              <ChipGroup options={cat.TOOLS} value={a.tools} onToggle={(v) => toggle("tools", v)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className={labelCls}>{tr("q.processPick", "Pick at least one *")}</p>
            <ChipGroup options={cat.PROCESSES} value={a.processes} onToggle={(v) => toggle("processes", v)} />
            <p className="mt-4 font-mono text-[11px] text-fog">
              {a.processes.length} {tr("q.selected", "selected")}
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="q-desc" className={labelCls}>
                {tr("q.desc", "Walk us through it *")}{" "}
                <span className="normal-case tracking-normal">{tr("q.minChars", "(min. 20 characters)")}</span>
              </label>
              <textarea
                id="q-desc"
                rows={5}
                className={`${field} resize-none`}
                value={a.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={tr(
                  "q.desc.ph",
                  "Every morning someone downloads the orders CSV, copies rows into Exact, then emails the warehouse…",
                )}
              />
            </div>
            <div>
              <p className={labelCls}>{tr("q.howToday", "How does it run today? *")}</p>
              <OptionList options={cat.MODES} value={a.mode} onSelect={(v) => set("mode", v)} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <p className={labelCls}>{tr("q.volume", "How often does it run? *")}</p>
              <OptionList options={cat.VOLUMES.map((v) => v.label)} value={a.volume} onSelect={(v) => set("volume", v)} columns={2} />
            </div>
            <div>
              <p className={labelCls}>{tr("q.time", "Time it takes each time *")}</p>
              <OptionList options={cat.TIMES.map((t2) => t2.label)} value={a.timePerRun} onSelect={(v) => set("timePerRun", v)} columns={2} />
            </div>
            {estimate !== null && (
              <p className="rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-bone">
                {tr("q.estimate", "That's roughly ≈ {h} hours / month of recoverable work.").replace("{h}", String(estimate))}
              </p>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div>
              <p className={labelCls}>{tr("q.budgetQ", "Monthly budget *")}</p>
              <OptionList options={cat.BUDGETS} value={a.budget} onSelect={(v) => set("budget", v)} columns={2} />
            </div>
            <div>
              <p className={labelCls}>{tr("q.timeline", "When do you want to start? *")}</p>
              <OptionList options={cat.TIMELINES} value={a.timeline} onSelect={(v) => set("timeline", v)} />
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <p className={labelCls}>{tr("q.goalsPick", "Pick every goal that applies *")}</p>
            <ChipGroup options={cat.GOALS} value={a.goals} onToggle={(v) => toggle("goals", v)} />
            <p className="mt-4 font-mono text-[11px] text-fog">
              {a.goals.length} {tr("q.selected", "selected")}
            </p>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4">
            <div>
              <p className={labelCls}>{tr("q.level", "Where are you today? *")}</p>
              <OptionList options={cat.LEVELS} value={a.level} onSelect={(v) => set("level", v)} />
            </div>
            <div>
              <p className={labelCls}>{tr("q.compliance", "Hosting & compliance *")}</p>
              <OptionList options={cat.COMPLIANCE} value={a.compliance} onSelect={(v) => set("compliance", v)} />
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-4">
            <div>
              <p className={labelCls}>{tr("q.slot", "Best time for the audit call *")}</p>
              <OptionList options={cat.SLOTS} value={a.slot} onSelect={(v) => set("slot", v)} columns={2} />
            </div>
            <div>
              <label htmlFor="q-notes" className={labelCls}>
                {tr("q.notes", "Anything else? (optional)")}
              </label>
              <textarea
                id="q-notes"
                rows={3}
                className={`${field} resize-none`}
                value={a.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder={tr("q.notes.ph", "Deadlines, constraints, links…")}
              />
            </div>

            <div className="rounded-md border border-edge bg-coal px-4 py-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fog">{tr("q.yourBrief", "Your brief")}</p>
              <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-fog">
                {summary()}
              </pre>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-edge bg-panel-2 px-4 py-3 text-sm text-fog">
              <input
                type="checkbox"
                checked={a.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#e4572e]"
              />
              <span>
                {tr(
                  "q.consent",
                  "Send this brief to the Loopwerk team and let them contact me about my project. *",
                )}
              </span>
            </label>
          </div>
        )}

        {status === "error" && error && (
          <p className="mt-4 rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3]">{error}</p>
        )}
      </div>

      {/* navigation footer */}
      <div className="flex items-center justify-between gap-3 border-t border-edge px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || status === "sending"}
          className="flex items-center gap-1.5 rounded-md border border-edge px-3.5 py-2 text-sm font-medium text-fog transition-colors hover:border-fog hover:text-bone disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr("q.back", "Back")}
        </button>

        {step < STEP_META.length - 1 ? (
          <button
            type="button"
            onClick={() => stepValid(step) && setStep((s) => Math.min(STEP_META.length - 1, s + 1))}
            disabled={!stepValid(step)}
            className="flex items-center gap-1.5 rounded-md bg-ember px-5 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {tr("q.next", "Next")}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!stepValid(9) || status === "sending"}
            className="flex items-center gap-2 rounded-md bg-ember px-5 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {tr("q.sending", "Sending…")}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> {tr("q.submit", "Submit my project")}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
