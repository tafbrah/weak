import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { AddCategoryForm, AddCookieForm, DeleteButton, type CookieCategory, type CookieItem } from "@/components/admin/cookies-controls";
import { Badge, Empty, PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { cookieCategories, cookies } from "@/db/schema";

export const metadata: Metadata = { title: "Cookies — Loopwerk console" };

export default async function CookiesPage() {
  const { t } = await getConsoleI18n();
  const [categories, cookieList] = await Promise.all([
    db.select().from(cookieCategories).orderBy(asc(cookieCategories.name)),
    db.select().from(cookies).orderBy(asc(cookies.name)),
  ]);

  const totalCookies = cookieList.length;
  const thirdParty = cookieList.filter((c) => c.thirdParty === 1).length;
  const requiredCats = categories.filter((c) => c.required === 1).length;

  const labels: Record<string, string> = {
    "cookies.delete": t("cookies.delete", "Delete"),
    "cookies.kpi.total": t("cookies.kpi.total", "Total cookies"),
    "cookies.kpi.thirdParty": t("cookies.kpi.thirdParty", "Third-party"),
    "cookies.kpi.required": t("cookies.kpi.required", "Required categories"),
  };

  return (
    <>
      <PageHeader
        title={t("console.cookies.title", "Cookies")}
        sub={`${totalCookies} cookies tracked · ${requiredCats} required categories`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={labels["cookies.kpi.total"]} value={String(totalCookies)} sub="across all categories" />
        <StatCard label={labels["cookies.kpi.thirdParty"]} value={String(thirdParty)} tone={thirdParty > 0 ? "honey" : "fog"} sub="external providers" />
        <StatCard label={labels["cookies.kpi.required"]} value={String(requiredCats)} sub="cannot be disabled" />
        <StatCard label={t("cookies.kpi.categories", "Categories")} value={String(categories.length)} sub="essential, analytics…" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <Panel title={t("cookies.categories.title", "Categories")} sub={`${categories.length} categories defined`}>
          <div className="mb-4">
            <AddCategoryForm />
          </div>
          {categories.length === 0 ? (
            <Empty>No categories yet. Add the first one above.</Empty>
          ) : (
            <ul className="divide-y divide-edge/60">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-bone">
                      {c.name}
                      {c.required === 1 && <Badge tone="moss">required</Badge>}
                      {c.enabled === 0 && <Badge tone="fog">disabled</Badge>}
                    </p>
                    {c.description && <p className="truncate text-xs text-fog">{c.description}</p>}
                  </div>
                  <DeleteButton id={c.id} type="category" labels={labels} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Cookies */}
        <Panel title={t("cookies.inventory.title", "Cookie inventory")} sub={`${cookieList.length} cookies listed`}>
          <div className="mb-4">
            <AddCookieForm categories={categories} />
          </div>
          {cookieList.length === 0 ? (
            <Empty>No cookies yet. Add the first one above.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-edge">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Name</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Provider</th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">3rd party</th>
                    <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge/60">
                  {cookieList.map((ck) => (
                    <tr key={ck.id} className="transition-colors hover:bg-panel-2/50">
                      <td className="max-w-[200px] px-4 py-3 align-middle">
                        <p className="truncate font-mono text-sm text-bone">{ck.name}</p>
                        {ck.purpose && <p className="truncate text-[11px] text-fog">{ck.purpose}</p>}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="text-sm text-fog">{ck.provider || "—"}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {ck.thirdParty === 1 ? <Badge tone="honey">yes</Badge> : <span className="text-xs text-fog">no</span>}
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <DeleteButton id={ck.id} type="cookie" labels={labels} />
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
        manage cookie categories and inventory · required categories cannot be disabled · third-party cookies need explicit consent
      </p>
    </>
  );
}
