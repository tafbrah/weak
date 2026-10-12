"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type BriefStep = { n: string; text: string };

export default function ProjectDetail({
  steps,
  raw,
  isQuestionnaire,
}: {
  steps: BriefStep[];
  raw: string;
  isQuestionnaire: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-edge/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-fog transition-colors hover:text-bone"
      >
        {isQuestionnaire ? "View the 10-step brief" : "View message"}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-4">
          {isQuestionnaire ? (
            <ol className="space-y-2">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-md border border-edge/60 bg-coal px-3.5 py-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember/15 font-mono text-[10px] font-bold text-ember">
                    {s.n}
                  </span>
                  <span className="text-xs leading-relaxed text-fog">{s.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="whitespace-pre-wrap rounded-md border border-edge/60 bg-coal px-3.5 py-2.5 text-xs leading-relaxed text-fog">
              {raw}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
