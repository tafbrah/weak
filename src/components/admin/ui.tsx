import type { ReactNode } from "react";

export type Tone = "moss" | "honey" | "rust" | "fog" | "ember";

const badgeTones: Record<Tone, string> = {
  moss: "border-moss/30 bg-moss/15 text-[#7fd4a5]",
  honey: "border-honey/30 bg-honey/15 text-[#e3b04b]",
  rust: "border-rust/40 bg-rust/15 text-[#f08c82]",
  fog: "border-fog/20 bg-fog/10 text-fog",
  ember: "border-ember/40 bg-ember/15 text-[#ff8f66]",
};

const dotTones: Record<Tone, string> = {
  moss: "bg-[#3fbf7f]",
  honey: "bg-[#d9a520]",
  rust: "bg-[#e05e53]",
  fog: "bg-fog",
  ember: "bg-ember",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone, pulse = false }: { tone: Tone; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotTones[tone]}`} />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${dotTones[tone]}`} />
    </span>
  );
}

export function Panel({
  title,
  sub,
  actions,
  children,
  className = "",
}: {
  title?: string;
  sub?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-edge bg-panel ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-5 py-4">
          <div>
            {title && <h2 className="font-display text-base font-bold tracking-tight text-bone">{title}</h2>}
            {sub && <p className="mt-0.5 font-mono text-[11px] text-fog">{sub}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-fog">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "fog",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border border-edge bg-panel p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-fog">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-bone">{value}</p>
      {sub && (
        <div
          className={`mt-2 text-xs ${
            tone === "moss" ? "text-[#7fd4a5]" : tone === "rust" ? "text-[#f08c82]" : "text-fog"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-sm ${className}`}>{children}</td>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-fog">{children}</p>;
}

export const inputCls =
  "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";

export const selectCls =
  "rounded-md border border-edge bg-panel-2 px-2.5 py-1.5 text-xs text-bone focus:border-ember focus:outline-none";

export type UserRoleValue = "admin" | "manager" | "member" | "viewer";
export type UserStatusValue = "active" | "invited" | "suspended";
export type LeadStatusValue = "new" | "contacted" | "qualified" | "won" | "lost";

export const userRoleTone: Record<UserRoleValue, Tone> = {
  admin: "ember",
  manager: "honey",
  member: "fog",
  viewer: "fog",
};

export const userStatusTone: Record<UserStatusValue, Tone> = {
  active: "moss",
  invited: "honey",
  suspended: "rust",
};

export const leadTone: Record<LeadStatusValue, Tone> = {
  new: "ember",
  contacted: "honey",
  qualified: "fog",
  won: "moss",
  lost: "rust",
};

export const pipelineColor: Record<LeadStatusValue, string> = {
  new: "#e4572e",
  contacted: "#d9a520",
  qualified: "#7a8aa0",
  won: "#2e7d53",
  lost: "#e05e53",
};

/** Workflow-pipeline meaning of each intake stage. */
export const leadStageLabel: Record<LeadStatusValue, string> = {
  new: "Intake",
  contacted: "Audit scheduled",
  qualified: "Blueprint",
  won: "Workflow live",
  lost: "Closed",
};

export const LEAD_STAGES: LeadStatusValue[] = ["new", "contacted", "qualified", "won", "lost"];
