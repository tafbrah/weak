"use client";

import { Flame, Loader2, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

/* ------------------------------ purge buttons ------------------------------ */

function GlobalPurgeButtonInner({ labels }: { labels: Record<string, string> }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function purgeAll() {
    setBusy(true);
    try {
      await fetch(apiUrl("/api/cache/purge"), { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={purgeAll}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-md border border-rust/40 bg-rust/10 px-4 py-2 text-sm font-bold text-[#f08c82] transition-colors hover:bg-rust/20 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
      {L("cache.purgeAll", "Purge all cache")}
    </button>
  );
}

export function GlobalPurgeButton({ labels }: { labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <GlobalPurgeButtonInner labels={labels} />
    </Suspense>
  );
}

function PurgeEntryButtonInner({ entryId, labels }: { entryId: number; labels: Record<string, string> }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  async function purge() {
    setBusy(true);
    try {
      await fetch(apiUrl(`/api/cache/${entryId}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={purge}
      disabled={busy}
      title={L("cache.purge", "Purge entry")}
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flame className="h-3.5 w-3.5" />}
    </button>
  );
}

export function PurgeEntryButton(props: { entryId: number; labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <PurgeEntryButtonInner {...props} />
    </Suspense>
  );
}

/* ---------------------------- add cache entry form ---------------------------- */

function AddCacheEntryFormInner({ labels }: { labels: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();
  const L = (k: string, fb: string) => labels[k] ?? fb;

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-edge px-4 py-2 text-sm font-semibold text-fog transition-colors hover:border-fog hover:text-bone"
        >
          <Plus className="h-4 w-4" /> {L("cache.add.open", "Add cache entry")}
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/cache"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cacheKey: fd.get("cacheKey"),
                store: fd.get("store"),
                sizeBytes: Number(fd.get("sizeBytes")),
                ttlSec: Number(fd.get("ttlSec")),
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the entry.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the entry."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">{L("cache.add.title", "Add a cache entry")}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>{L("cache.add.key", "Cache key")} *</label>
              <input name="cacheKey" required placeholder="api:products:list" className={field} />
            </div>
            <div>
              <label className={label}>{L("cache.add.store", "Store")}</label>
              <select name="store" defaultValue="redis" className={field}>
                <option value="redis">Redis</option>
                <option value="cdn">CDN</option>
                <option value="memory">Memory</option>
              </select>
            </div>
            <div>
              <label className={label}>{L("cache.add.ttl", "TTL (seconds)")}</label>
              <input name="ttlSec" type="number" min="1" defaultValue="3600" className={field} />
            </div>
            <div>
              <label className={label}>{L("cache.add.size", "Size (bytes)")}</label>
              <input name="sizeBytes" type="number" min="0" defaultValue="1024" className={field} />
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {L("cache.add.submit", "Add entry")}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddCacheEntryForm({ labels }: { labels: Record<string, string> }) {
  return (
    <Suspense fallback={null}>
      <AddCacheEntryFormInner labels={labels} />
    </Suspense>
  );
}
