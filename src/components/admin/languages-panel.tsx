"use client";

import { Globe, Loader2, Plus, Save, Star, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { inputCls } from "./ui";

function useLangApi() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

/* ------------------------------ language list ------------------------------ */

export type LanguageItem = {
  code: string;
  name: string;
  isDefault: number;
  enabled: number;
  count: number;
};

function LanguageManagerInner({ languages }: { languages: LanguageItem[] }) {
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useLangApi();

  async function act(fn: () => Promise<Response>, id: string) {
    setPending(id);
    setError(null);
    try {
      const res = await fn();
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) setError(data.error ?? "Action failed.");
      router.refresh();
    } catch {
      setError("Action failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {languages.map((lang) => (
          <div key={lang.code} className="rounded-lg border border-edge bg-panel p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-display text-base font-bold text-bone">
                <Globe className="h-4 w-4 text-ember" />
                {lang.name}
              </p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-fog">{lang.code}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-fog">
              {lang.count} keys ·{" "}
              {lang.isDefault === 1 ? "default" : lang.enabled === 1 ? "enabled" : "disabled"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {lang.isDefault !== 1 && (
                <>
                  <button
                    type="button"
                    disabled={pending === `def-${lang.code}`}
                    onClick={() =>
                      act(
                        () =>
                          fetch(apiUrl(`/api/languages/${lang.code}`), {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isDefault: true }),
                          }),
                        `def-${lang.code}`,
                      )
                    }
                    className="flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 font-mono text-[10px] text-fog transition-colors hover:border-honey hover:text-[#e3b04b] disabled:opacity-50"
                  >
                    {pending === `def-${lang.code}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
                    set default
                  </button>
                  <button
                    type="button"
                    disabled={pending === `en-${lang.code}`}
                    onClick={() =>
                      act(
                        () =>
                          fetch(apiUrl(`/api/languages/${lang.code}`), {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ enabled: lang.enabled === 1 ? 0 : 1 }),
                          }),
                        `en-${lang.code}`,
                      )
                    }
                    className="rounded-md border border-edge px-2.5 py-1.5 font-mono text-[10px] text-fog transition-colors hover:border-fog hover:text-bone disabled:opacity-50"
                  >
                    {pending === `en-${lang.code}` ? <Loader2 className="h-3 w-3 animate-spin" /> : lang.enabled === 1 ? "disable" : "enable"}
                  </button>
                  <button
                    type="button"
                    disabled={pending === `del-${lang.code}`}
                    onClick={() =>
                      act(() => fetch(apiUrl(`/api/languages/${lang.code}`), { method: "DELETE" }), `del-${lang.code}`)
                    }
                    className="flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 font-mono text-[10px] text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
                  >
                    {pending === `del-${lang.code}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    delete
                  </button>
                </>
              )}
              {lang.isDefault === 1 && (
                <span className="rounded-md border border-honey/40 bg-honey/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#e3b04b]">
                  default language
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-xs text-[#f2b8b3]">{error}</p>}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> Add language
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            act(
              () =>
                fetch(apiUrl("/api/languages"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code: fd.get("code"), name: fd.get("name") }),
                }),
              "add",
            ).then(() => setAdding(false));
          }}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-edge bg-panel p-5"
        >
          <div>
            <label htmlFor="lang-code" className={label}>
              Code
            </label>
            <input id="lang-code" name="code" required placeholder="es" className={`${inputCls} w-24`} />
          </div>
          <div>
            <label htmlFor="lang-name" className={label}>
              Name
            </label>
            <input id="lang-name" name="name" required placeholder="Español" className={`${inputCls} w-48`} />
          </div>
          <button
            type="submit"
            disabled={pending === "add"}
            className="flex items-center gap-1.5 rounded-md bg-ember px-3.5 py-2 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {pending === "add" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Create (copies default keys)
          </button>
          <button type="button" onClick={() => setAdding(false)} className="rounded-md border border-edge px-3 py-2 text-xs text-fog hover:text-bone">
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}

export function LanguageManager({ languages }: { languages: LanguageItem[] }) {
  return (
    <Suspense fallback={null}>
      <LanguageManagerInner languages={languages} />
    </Suspense>
  );
}

/* ---------------------------- translation editor ---------------------------- */

export type TranslationEntry = { key: string; default: string; value: string };

function TranslationEditorInner({
  locale,
  languages,
  entries,
  isDefault,
}: {
  locale: string;
  languages: { code: string; name: string }[];
  entries: TranslationEntry[];
  isDefault: boolean;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(entries.map((e) => [e.key, e.value])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ key: string; ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const apiUrl = useLangApi();
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  const tabSuffix = lwSession ? `&lw_session=${encodeURIComponent(lwSession)}` : "";

  async function save(key: string) {
    setSaving(key);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/translations"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, key, value: drafts[key] ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMessage({ key, ok: false, text: data.error ?? "Save failed." });
        return;
      }
      setMessage({ key, ok: true, text: "Saved." });
      router.refresh();
    } catch {
      setMessage({ key, ok: false, text: "Save failed." });
    } finally {
      setSaving(null);
    }
  }

  async function removeKey(key: string) {
    setSaving(`del-${key}`);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/translations"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMessage({ key, ok: false, text: data.error ?? "Delete failed." });
        return;
      }
      router.refresh();
    } catch {
      setMessage({ key, ok: false, text: "Delete failed." });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {languages.map((lang) => {
          const active = lang.code === locale;
          const href = `/admin/languages?locale=${lang.code}${tabSuffix}`;
          return (
            <Link
              key={lang.code}
              href={href}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] transition-colors ${
                active ? "bg-ember text-shell" : "border border-edge text-fog hover:border-fog hover:text-bone"
              }`}
            >
              {lang.name} · {lang.code}
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-edge bg-panel">
        <table className="w-full min-w-[680px]">
          <thead className="border-b border-edge">
            <tr>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Key</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">
                {isDefault ? "Value (default language)" : `Translation (${locale})`}
              </th>
              <th className="w-28 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-edge/60">
            {entries.map((entry) => {
              const changed = (drafts[entry.key] ?? "") !== entry.value;
              return (
                <tr key={entry.key} className="hover:bg-panel-2/50">
                  <td className="px-4 py-3 align-middle">
                    <p className="font-mono text-[11px] text-bone">{entry.key}</p>
                    {!isDefault && entry.value === "" && (
                      <p className="mt-0.5 font-mono text-[10px] text-honey">missing — falls back to English</p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <textarea
                      rows={entry.value.length > 80 ? 2 : 1}
                      className="w-full resize-y rounded-md border border-edge bg-panel-2 px-3 py-2 text-xs leading-relaxed text-bone focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
                      value={drafts[entry.key] ?? ""}
                      placeholder={isDefault ? "" : entry.default}
                      onChange={(e) => setDrafts((d) => ({ ...d, [entry.key]: e.target.value }))}
                    />
                    {!isDefault && entry.default && (
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-fog/70">EN: {entry.default}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => save(entry.key)}
                        disabled={saving === entry.key || !changed}
                        className="flex items-center gap-1 rounded-md bg-ember px-2.5 py-1.5 font-mono text-[10px] font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-40"
                      >
                        {saving === entry.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        save
                      </button>
                      <button
                        type="button"
                        onClick={() => removeKey(entry.key)}
                        disabled={saving === `del-${entry.key}`}
                        title="Delete this key in all languages"
                        className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
                      >
                        {saving === `del-${entry.key}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                    {message?.key === entry.key && (
                      <p className={`mt-1 text-right font-mono text-[10px] ${message.ok ? "text-[#7fd4a5]" : "text-[#f08c82]"}`}>
                        {message.text}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TranslationEditor(props: {
  locale: string;
  languages: { code: string; name: string }[];
  entries: TranslationEntry[];
  isDefault: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <TranslationEditorInner {...props} />
    </Suspense>
  );
}
