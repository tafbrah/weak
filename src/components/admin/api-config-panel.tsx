"use client";

import { Braces, Bot, Eye, EyeOff, Loader2, PlugZap, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Badge, inputCls, type Tone } from "./ui";

export type ApiConfigState = {
  n8n: { url: string; apiKeyMasked: string; configured: boolean; source: string | null };
  claude: { apiKeyMasked: string; model: string; configured: boolean; source: string | null };
};

const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

function StatusBadge({ configured, source }: { configured: boolean; source: string | null }) {
  const tone: Tone = configured ? "moss" : "rust";
  const text = configured ? `connected · ${source}` : "not configured";
  return <Badge tone={tone}>{text}</Badge>;
}

function ApiConfigPanelInner({ initial }: { initial: ApiConfigState }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  const apiUrl = (path: string) =>
    lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path;

  const [state, setState] = useState<ApiConfigState>(initial);
  const [n8nUrl, setN8nUrl] = useState(initial.n8n.url);
  const [n8nKey, setN8nKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [claudeModel, setClaudeModel] = useState(initial.claude.model);
  const [showN8nKey, setShowN8nKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [saving, setSaving] = useState<"n8n" | "claude" | null>(null);
  const [testing, setTesting] = useState<"n8n" | "claude" | null>(null);
  const [message, setMessage] = useState<{ target: string; ok: boolean; text: string } | null>(null);

  async function save(which: "n8n" | "claude") {
    setSaving(which);
    setMessage(null);
    try {
      const body =
        which === "n8n"
          ? { n8n_url: n8nUrl, ...(n8nKey ? { n8n_api_key: n8nKey } : {}) }
          : { claude_model: claudeModel, ...(claudeKey ? { claude_api_key: claudeKey } : {}) };
      const res = await fetch(apiUrl("/api/config"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string } & Partial<ApiConfigState>;
      if (!res.ok || !data.ok) {
        setMessage({ target: which, ok: false, text: data.error ?? "Save failed." });
        return;
      }
      if (data.n8n && data.claude) {
        setState({ n8n: data.n8n, claude: data.claude });
      }
      if (which === "n8n") setN8nKey("");
      else setClaudeKey("");
      setMessage({ target: which, ok: true, text: "Configuration saved." });
      router.refresh();
    } catch {
      setMessage({ target: which, ok: false, text: "Save failed." });
    } finally {
      setSaving(null);
    }
  }

  async function test(which: "n8n" | "claude") {
    setTesting(which);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/config/test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: which }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; message?: string };
      setMessage({ target: which, ok: Boolean(data.ok), text: data.ok ? data.message ?? "OK" : data.error ?? "Test failed." });
    } catch {
      setMessage({ target: which, ok: false, text: "Test failed." });
    } finally {
      setTesting(null);
    }
  }

  const keyInput = "pr-10";

  return (
    <div className="space-y-6">
      {/* n8n card */}
      <div className="rounded-lg border border-edge bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-base font-bold text-bone">
            <Braces className="h-4 w-4 text-ember" />
            n8n API
          </p>
          <StatusBadge configured={state.n8n.configured} source={state.n8n.source} />
        </div>
        <p className="mt-1 text-xs text-fog">
          Generated workflow templates are delivered here (POST /api/v1/workflows).
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="cfg-n8n-url" className={label}>
              Instance URL
            </label>
            <input
              id="cfg-n8n-url"
              className={inputCls}
              placeholder="https://your-instance.app.n8n.cloud"
              value={n8nUrl}
              onChange={(e) => setN8nUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cfg-n8n-key" className={label}>
              API key {state.n8n.apiKeyMasked && !n8nKey ? `(current: ${state.n8n.apiKeyMasked})` : "(sent as X-N8N-API-KEY)"}
            </label>
            <div className="relative">
              <input
                id="cfg-n8n-key"
                type={showN8nKey ? "text" : "password"}
                className={`${inputCls} ${keyInput}`}
                placeholder={state.n8n.apiKeyMasked ? "leave empty to keep the current key" : "paste the API key"}
                value={n8nKey}
                onChange={(e) => setN8nKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowN8nKey(!showN8nKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone"
                aria-label={showN8nKey ? "Hide key" : "Show key"}
              >
                {showN8nKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => save("n8n")}
            disabled={saving === "n8n"}
            className="flex items-center gap-1.5 rounded-md bg-ember px-3.5 py-2 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {saving === "n8n" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save n8n config
          </button>
          <button
            type="button"
            onClick={() => test("n8n")}
            disabled={testing === "n8n"}
            className="flex items-center gap-1.5 rounded-md border border-edge px-3.5 py-2 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-60"
          >
            {testing === "n8n" ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlugZap className="h-3 w-3" />}
            Test connection
          </button>
        </div>

        {message?.target === "n8n" && (
          <p
            className={`mt-3 rounded-md border px-3 py-2 text-xs ${
              message.ok ? "border-moss/40 bg-moss/10 text-[#7fd4a5]" : "border-rust/40 bg-rust/10 text-[#f2b8b3]"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Claude card */}
      <div className="rounded-lg border border-edge bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-base font-bold text-bone">
            <Bot className="h-4 w-4 text-ember" />
            Claude AI API
          </p>
          <StatusBadge configured={state.claude.configured} source={state.claude.source} />
        </div>
        <p className="mt-1 text-xs text-fog">
          Reads each questionnaire brief and designs the n8n workflow template. Without a key, the
          built-in rules template is used.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="cfg-claude-key" className={label}>
              API key {state.claude.apiKeyMasked && !claudeKey ? `(current: ${state.claude.apiKeyMasked})` : "(Anthropic console)"}
            </label>
            <div className="relative">
              <input
                id="cfg-claude-key"
                type={showClaudeKey ? "text" : "password"}
                className={`${inputCls} ${keyInput}`}
                placeholder={state.claude.apiKeyMasked ? "leave empty to keep the current key" : "sk-ant-…"}
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowClaudeKey(!showClaudeKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone"
                aria-label={showClaudeKey ? "Hide key" : "Show key"}
              >
                {showClaudeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="cfg-claude-model" className={label}>
              Model
            </label>
            <input
              id="cfg-claude-model"
              list="claude-models"
              className={inputCls}
              value={claudeModel}
              onChange={(e) => setClaudeModel(e.target.value)}
            />
            <datalist id="claude-models">
              <option value="claude-sonnet-4-5" />
              <option value="claude-opus-4-5" />
              <option value="claude-haiku-4-5" />
            </datalist>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => save("claude")}
            disabled={saving === "claude"}
            className="flex items-center gap-1.5 rounded-md bg-ember px-3.5 py-2 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {saving === "claude" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Claude config
          </button>
          <button
            type="button"
            onClick={() => test("claude")}
            disabled={testing === "claude"}
            className="flex items-center gap-1.5 rounded-md border border-edge px-3.5 py-2 font-mono text-[11px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-60"
          >
            {testing === "claude" ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlugZap className="h-3 w-3" />}
            Test connection
          </button>
        </div>

        {message?.target === "claude" && (
          <p
            className={`mt-3 rounded-md border px-3 py-2 text-xs ${
              message.ok ? "border-moss/40 bg-moss/10 text-[#7fd4a5]" : "border-rust/40 bg-rust/10 text-[#f2b8b3]"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-fog/70">
        keys are stored in postgres and never returned unmasked · values saved here override
        environment variables · clear a field and save to fall back to env
      </p>
    </div>
  );
}

export default function ApiConfigPanel({ initial }: { initial: ApiConfigState }) {
  return (
    <Suspense fallback={null}>
      <ApiConfigPanelInner initial={initial} />
    </Suspense>
  );
}
