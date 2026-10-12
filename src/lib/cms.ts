import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";

/**
 * Fetch all enabled CMS content as a key-value map.
 * Used by the landing page to render dynamic content.
 */
export async function getCmsContentMap(): Promise<Record<string, string>> {
  const items = await db
    .select()
    .from(cmsContent)
    .where(eq(cmsContent.enabled, 1))
    .orderBy(asc(cmsContent.sortOrder));
  const map: Record<string, string> = {};
  for (const item of items) {
    map[item.contentKey] = item.content;
  }
  return map;
}

/**
 * Get a single CMS content value by key, with a fallback.
 */
export async function getCmsValue(key: string, fallback: string): Promise<string> {
  const [item] = await db
    .select()
    .from(cmsContent)
    .where(eq(cmsContent.contentKey, key))
    .limit(1);
  return item && item.enabled === 1 && item.content ? item.content : fallback;
}
