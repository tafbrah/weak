import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import {
  AddCacheEntryForm,
  GlobalPurgeButton,
  PurgeEntryButton,
} from "@/components/admin/cache-controls";
import { Badge, Empty, PageHeader, Panel, StatCard, type Tone } from "@/components/admin/ui";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { cacheEntries } from "@/db/schema";

export const metadata: Metadata = { title: "Cache — Loopwerk console" };

const STORE_TONE: Record<string, Tone> = {
  redis: "ember",
  cdn: "honey",
  memory: "fog",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTtl(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h`;
  return `${Math.round(sec / 86400)}d`;
}

function timeAgoShort(value: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - value.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function CachePage() {
  const { t } = await getConsoleI18n();

  const [cacheRows, cacheAgg] = await Promise.all([
    db.select().from(cacheEntries).orderBy(desc(cacheEntries.lastAccessedAt)),
    db
      .select({
        totalSize: sql<number>`coalesce(sum(${cacheEntries.sizeBytes}), 0)::int`,
        totalHits: sql<number>`coalesce(sum(${cacheEntries.hits}), 0)::int`,
        totalMisses: sql<number>`coalesce(sum(${cacheEntries.misses}), 0)::int`,
      })
      .from(cacheEntries),
  ]);

  const agg = cacheAgg[0] ?? { totalSize: 0, totalHits: 0, totalMisses: 0 };
  const hitRate =
    agg.totalHits + agg.totalMisses > 0
      ? Math.round((agg.totalHits / (agg.totalHits + agg.totalMisses)) * 100)
      : 100;
  const activeEntries = cacheRows.filter((c) => c.status === "active").length;
  const stores = new Set(cacheRows.map((c) => c.store)).size;

  const labels: Record<string, string> = {
    "cache.purgeAll": t("cache.purgeAll", "Purge all cache"),
    "cache.purge": t("cache.purge", "Purge entry"),
    "cache.add.open": t("cache.add.open", "Add cache entry"),
    "cache.add.title": t("cache.add.title", "Add a cache entry"),
    "cache.add.key": t("cache.add.key", "Cache key"),
    "cache.add.store": t("cache.add.store", "Store"),
    "cache.add.ttl": t("cache.add.ttl", "TTL (seconds)"),
    "cache.add.size": t("cache.add.size", "Size (bytes)"),
    "cache.add.submit": t("cache.add.submit", "Add entry"),
  };

  return (
    <>
      <PageHeader
        title={t("console.cache.title", "Cache")}
        sub={`${cacheRows.length} cache entries · ${activeEntries} active`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("cache.kpi.entries", "Cache entries")} value={String(cacheRows.length)} sub={`${activeEntries} active`} />
        <StatCard label={t("cache.kpi.size", "Total size")} value={formatBytes(agg.totalSize)} sub={`${stores} stores in use`} />
        <StatCard label={t("cache.kpi.hitRate", "Hit rate")} value={`${hitRate}%`} tone="moss" sub={`${agg.totalHits.toLocaleString("en-US")} hits`} />
        <StatCard label={t("cache.kpi.misses", "Cache misses")} value={agg.totalMisses.toLocaleString("en-US")} tone={agg.totalMisses > 500 ? "honey" : "fog"} sub="all time" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <GlobalPurgeButton labels={labels} />
        <AddCacheEntryForm labels={labels} />
      </div>

      <div className="mt-4">
        <Panel>
          {cacheRows.length === 0 ? (
            <Empty>Cache is empty — add an entry or it will be populated as pages are cached.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="border-b border-edge">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Key</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Store</th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Size</th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">TTL</th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Hits</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Status</th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge/60">
                  {cacheRows.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-panel-2/50">
                      <td className="max-w-[280px] px-4 py-3 align-middle">
                        <p className="truncate font-mono text-sm text-bone">{c.cacheKey}</p>
                        <p className="font-mono text-[10px] text-fog">accessed {timeAgoShort(c.lastAccessedAt)}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge tone={STORE_TONE[c.store] ?? "fog"}>{c.store}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right align-middle font-mono text-xs text-bone">{formatBytes(c.sizeBytes)}</td>
                      <td className="px-4 py-3 text-right align-middle font-mono text-xs text-fog">{formatTtl(c.ttlSec)}</td>
                      <td className="px-4 py-3 text-right align-middle font-mono text-xs text-[#7fd4a5]">{c.hits.toLocaleString("en-US")}</td>
                      <td className="px-4 py-3 align-middle">
                        <Badge tone={c.status === "active" ? "moss" : "fog"}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <PurgeEntryButton entryId={c.id} labels={labels} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <p className="mt-4 font-mono text-[11px] text-fog">
        purging removes entries from the store · hit rate = hits / (hits + misses) across all entries
      </p>
    </>
  );
}
