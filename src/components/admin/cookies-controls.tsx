"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

const field = "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

export type CookieCategory = { id: number; name: string; slug: string; description: string; required: number; enabled: number };
export type CookieItem = { id: number; name: string; categoryId: number | null; provider: string; purpose: string; duration: string; dataTypes: string; thirdParty: number };

/* -------------------------- add category form -------------------------- */

function AddCategoryFormInner() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <div className="w-full">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-edge px-4 py-2 text-sm font-semibold text-fog transition-colors hover:border-fog hover:text-bone">
          <Plus className="h-4 w-4" /> Add category
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/cookies"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "category",
                name: fd.get("name"),
                description: fd.get("description"),
                required: fd.get("required") === "on",
                enabled: fd.get("enabled") !== "off",
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the category.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the category."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">Add a cookie category</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Name *</label>
              <input name="name" required placeholder="e.g. Analytics" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Description</label>
              <textarea name="description" rows={2} placeholder="What this category is used for…" className={`${field} resize-none`} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="required" id="cat-required" className="h-4 w-4 accent-[#e4572e]" />
              <label htmlFor="cat-required" className="text-sm text-fog">Required (cannot be disabled)</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="enabled" id="cat-enabled" defaultChecked className="h-4 w-4 accent-[#e4572e]" />
              <label htmlFor="cat-enabled" className="text-sm text-fog">Enabled</label>
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell hover:bg-ember-deep disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add category
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddCategoryForm() {
  return (
    <Suspense fallback={null}>
      <AddCategoryFormInner />
    </Suspense>
  );
}

/* -------------------------- add cookie form -------------------------- */

function AddCookieFormInner({ categories }: { categories: CookieCategory[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <div className="w-full">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-edge px-4 py-2 text-sm font-semibold text-fog transition-colors hover:border-fog hover:text-bone">
          <Plus className="h-4 w-4" /> Add cookie
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/cookies"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "cookie",
                name: fd.get("name"),
                categoryId: fd.get("categoryId") ? Number(fd.get("categoryId")) : null,
                provider: fd.get("provider"),
                purpose: fd.get("purpose"),
                duration: fd.get("duration"),
                dataTypes: fd.get("dataTypes"),
                thirdParty: fd.get("thirdParty") === "on",
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the cookie.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the cookie."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">Add a cookie</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Name *</label>
              <input name="name" required placeholder="e.g. _ga" className={field} />
            </div>
            <div>
              <label className={label}>Provider</label>
              <input name="provider" placeholder="e.g. Google Analytics" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Purpose</label>
              <input name="purpose" placeholder="What this cookie does…" className={field} />
            </div>
            <div>
              <label className={label}>Duration</label>
              <input name="duration" placeholder="e.g. 2 years" className={field} />
            </div>
            <div>
              <label className={label}>Data types</label>
              <input name="dataTypes" placeholder="e.g. client_id, session" className={field} />
            </div>
            <div>
              <label className={label}>Category</label>
              <select name="categoryId" className={field}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="thirdParty" id="cookie-third" className="h-4 w-4 accent-[#e4572e]" />
              <label htmlFor="cookie-third" className="text-sm text-fog">Third-party cookie</label>
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell hover:bg-ember-deep disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add cookie
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddCookieForm({ categories }: { categories: CookieCategory[] }) {
  return (
    <Suspense fallback={null}>
      <AddCookieFormInner categories={categories} />
    </Suspense>
  );
}

/* -------------------------- delete button -------------------------- */

function DeleteButtonInner({ id, type, labels }: { id: number; type: "category" | "cookie"; labels: Record<string, string> }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();

  async function remove() {
    setBusy(true);
    try {
      await fetch(apiUrl(`/api/cookies/${id}?type=${type}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      title={labels["cookies.delete"] ?? "Delete"}
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export function DeleteButton(props: { id: number; type: "category" | "cookie"; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <DeleteButtonInner {...props} />
    </Suspense>
  );
}
