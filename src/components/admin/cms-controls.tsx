"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

export type CmsItem = {
  id: number;
  contentKey: string;
  section: string;
  label: string;
  content: string;
  contentType: string;
  enabled: number;
  sortOrder: number;
};

const SECTIONS = ["hero", "header", "navbar", "services", "domains", "verticals", "process", "pricing", "faq", "footer", "general"];
const CONTENT_TYPES = ["text", "heading", "paragraph"];

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

export function AddContentForm() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-cream transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> Add content
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/cms"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contentKey: fd.get("contentKey"),
                section: fd.get("section"),
                label: fd.get("label"),
                content: fd.get("content"),
                contentType: fd.get("contentType"),
                sortOrder: Number(fd.get("sortOrder") ?? 0),
                enabled: true,
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the content.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the content."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">Add content block</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Content key *</label>
              <input name="contentKey" required placeholder="e.g. hero.newbadge" className={field} />
            </div>
            <div>
              <label className={labelCls}>Label *</label>
              <input name="label" required placeholder="e.g. New Badge" className={field} />
            </div>
            <div>
              <label className={labelCls}>Section</label>
              <select name="section" className={field}>
                {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Content type</label>
              <select name="contentType" className={field}>
                {CONTENT_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Content</label>
              <textarea name="content" rows={3} placeholder="Enter the content..." className={`${field} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Sort order</label>
              <input name="sortOrder" type="number" defaultValue={0} className={field} />
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-cream hover:bg-ember-deep disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add content
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function EditContentRow({ item }: { item: CmsItem }) {
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState(item.content);
  const router = useRouter();
  const apiUrl = useApiUrl();

  async function save() {
    setBusy(true);
    try {
      await fetch(apiUrl(`/api/cms/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-md border border-edge bg-panel-2 px-3 py-1.5 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none"
      />
      <button
        type="button"
        onClick={save}
        disabled={busy || content === item.content}
        className="shrink-0 rounded-md bg-ember px-3 py-1.5 text-xs font-bold text-cream hover:bg-ember-deep disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
      </button>
    </div>
  );
}

export function ToggleContentEnabled({ itemId, enabled }: { itemId: number; enabled: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch(apiUrl(`/api/cms/${itemId}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: enabled === 0 }),
          });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
      className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
        enabled === 1 ? "border border-moss/30 bg-moss/10 text-[#7fd4a5]" : "border border-edge bg-panel-2 text-fog"
      }`}
    >
      {enabled === 1 ? "enabled" : "disabled"}
    </button>
  );
}

export function DeleteContentButton({ itemId }: { itemId: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch(apiUrl(`/api/cms/${itemId}`), { method: "DELETE" });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
      title="Delete content"
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
