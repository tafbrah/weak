"use client";

import { Braces, Download, Loader2, RefreshCw, Sparkles, Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { Badge, type Tone } from "./ui";

function TemplatePanelInner({
  leadId,
  summary,
  json,
  source,
  company,
  n8nWorkflowId,
  n8nPushedAt,
  n8nError,
}: {
  leadId: number;
  summary: string | null;
  json: string | null;
  source: string | null;
  company: string;
  n8nWorkflowId: string | null;
  n8nPushedAt: string | Date | null;
  n8nError: string | null;
}) {
  const [showJson, setShowJson] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");

  const apiUrl = (path: string) =>
    lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path;

  function regenerate() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(apiUrl(`/api/leads/${leadId}/generate`), { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Generation failed.");
        return;
      }
      setShowJson(true);
      router.refresh();
    });
  }

  function pushToN8n() {
    setError(null);
    setPushing(true);
    fetch(apiUrl(`/api/leads/${leadId}/push-n8n`), { method: "POST" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          ok: boolean;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Push to n8n failed.");
          return;
        }
        router.refresh();
      })
      .catch(() => setError("Push to n8n failed."))
      .finally(() => setPushing(false));
  }

  function download() {
    if (!json) return;
    const slug =
      company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `project-${leadId}`;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loopwerk-${slug}.n8n.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const sourceTone: Tone = source === "claude" ? "ember" : "fog";
  const sourceLabel = source === "claude" ? "Claude AI" : "Rule template";

  return (
    <div className="border-t border-edge/60 bg-coal/40 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-fog">
          <Braces className="h-3.5 w-3.5 text-ember" />
          n8n workflow template
          {source && <Badge tone={sourceTone}>{sourceLabel}</Badge>}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {json ? (
            <>
              <button
                type="button"
                onClick={() => setShowJson(!showJson)}
                className="rounded-md border border-edge px-3 py-1.5 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone"
              >
                {showJson ? "Hide JSON" : "View JSON"}
              </button>
              <button
                type="button"
                onClick={download}
                className="flex items-center gap-1.5 rounded-md border border-edge px-3 py-1.5 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone"
              >
                <Download className="h-3 w-3" />
                .n8n.json
              </button>
              <button
                type="button"
                onClick={pushToN8n}
                disabled={pushing}
                className="flex items-center gap-1.5 rounded-md border border-moss/40 bg-moss/10 px-3 py-1.5 font-mono text-[11px] font-bold text-[#7fd4a5] transition-colors hover:bg-moss/20 disabled:opacity-60"
              >
                {pushing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                {n8nWorkflowId ? "Resend to n8n" : "Send to n8n"}
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={regenerate}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-md bg-ember px-3 py-1.5 font-mono text-[11px] font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : json ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {pending ? "Generating…" : json ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>

      {summary && (
        <p className="mt-3 rounded-md border border-edge/60 bg-panel px-3.5 py-2.5 text-xs leading-relaxed text-fog">
          {summary}
        </p>
      )}

      {n8nWorkflowId && (
        <p className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-moss/30 bg-moss/10 px-3.5 py-2.5 font-mono text-[11px] text-[#7fd4a5]">
          <Upload className="h-3 w-3" />
          delivered to n8n — workflow #{n8nWorkflowId}
          {n8nPushedAt ? ` · ${new Date(n8nPushedAt).toLocaleString("en-GB")}` : ""}
        </p>
      )}

      {!n8nWorkflowId && n8nError && (
        <p className="mt-3 rounded-md border border-rust/40 bg-rust/10 px-3.5 py-2.5 font-mono text-[11px] leading-relaxed text-[#f2b8b3]">
          n8n push failed: {n8nError}
        </p>
      )}

      {!json && !pending && (
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-fog/70">
          auto-generated on intake · click Generate to (re)build it with Claude
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-xs text-[#f2b8b3]">{error}</p>
      )}

      {showJson && json && (
        <pre className="mt-3 max-h-72 overflow-auto rounded-md border border-edge/60 bg-coal p-3.5 font-mono text-[10.5px] leading-relaxed text-fog">
          {json}
        </pre>
      )}
    </div>
  );
}

export default function TemplatePanel(props: {
  leadId: number;
  summary: string | null;
  json: string | null;
  source: string | null;
  company: string;
  n8nWorkflowId: string | null;
  n8nPushedAt: string | Date | null;
  n8nError: string | null;
}) {
  return (
    <Suspense fallback={null}>
      <TemplatePanelInner {...props} />
    </Suspense>
  );
}
