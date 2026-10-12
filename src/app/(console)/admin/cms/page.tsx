import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import {
  AddContentForm,
  DeleteContentButton,
  EditContentRow,
  ToggleContentEnabled,
} from "@/components/admin/cms-controls";
import { Badge, Empty, PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";

export const metadata: Metadata = { title: "CMS — Loopwerk console" };

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  header: "Header",
  navbar: "Navbar",
  services: "Services",
  domains: "Domains",
  verticals: "Verticals",
  process: "Process",
  pricing: "Pricing",
  faq: "FAQ",
  footer: "Footer",
  general: "General",
};

export default async function CmsPage() {
  const items = await db.select().from(cmsContent).orderBy(asc(cmsContent.section), asc(cmsContent.sortOrder));

  const totalItems = items.length;
  const enabledItems = items.filter((i) => i.enabled === 1).length;
  const sections = new Set(items.map((i) => i.section)).size;

  // Group items by section
  const itemsBySection = new Map<string, typeof items>();
  for (const item of items) {
    if (!itemsBySection.has(item.section)) itemsBySection.set(item.section, []);
    itemsBySection.get(item.section)!.push(item);
  }

  return (
    <>
      <PageHeader
        title="CMS — Content Management"
        sub={`${totalItems} content blocks · edit the landing page content`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard label="Content blocks" value={String(totalItems)} sub="total blocks" />
        <StatCard label="Enabled" value={String(enabledItems)} tone="moss" sub="active on site" />
        <StatCard label="Sections" value={String(sections)} sub="page sections" />
      </div>

      <div className="mt-6 mb-6">
        <AddContentForm />
      </div>

      {items.length === 0 ? (
        <Panel>
          <Empty>No content blocks yet. Add the first one above.</Empty>
        </Panel>
      ) : (
        <div className="space-y-6">
          {Array.from(itemsBySection.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([section, sectionItems]) => (
              <Panel
                key={section}
                title={SECTION_LABELS[section] ?? section}
                sub={`${sectionItems.length} block${sectionItems.length === 1 ? "" : "s"}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="border-b border-edge">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Key</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Label</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Content</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Type</th>
                        <th className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Status</th>
                        <th className="px-4 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-fog">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-edge/60">
                      {sectionItems.map((item) => (
                        <tr key={item.id} className="transition-colors hover:bg-panel-2/50">
                          <td className="max-w-[150px] px-4 py-3 align-middle">
                            <p className="truncate font-mono text-xs text-fog">{item.contentKey}</p>
                          </td>
                          <td className="max-w-[150px] px-4 py-3 align-middle">
                            <p className="truncate text-sm font-medium text-bone">{item.label}</p>
                          </td>
                          <td className="min-w-[250px] px-4 py-3 align-middle">
                            <EditContentRow item={item} />
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <Badge tone="fog">{item.contentType}</Badge>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <ToggleContentEnabled itemId={item.id} enabled={item.enabled} />
                          </td>
                          <td className="px-4 py-3 text-right align-middle">
                            <DeleteContentButton itemId={item.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ))}
        </div>
      )}

      <p className="mt-4 font-mono text-[11px] text-fog">
        Content is grouped by section · edit content inline · toggle enabled/disabled · delete to remove
      </p>
    </>
  );
}
