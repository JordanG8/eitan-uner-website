import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type { PageData } from "@/lexical/doc";
import { seedIndex, seedPage } from "./seed";
import { normalizeSite, type SiteDoc } from "./site";
import { readDoc, writeDoc, deleteDoc, type Version } from "./store";

/**
 * Read/write layer over the store.
 *
 * Three kinds of document:
 *
 *   site          the design document (src/lib/site.ts)
 *   pages         the ordered list of pages: id, slug, title
 *   page-<id>     one page: its settings and its Lexical document
 *
 * Anything never saved falls back to the seed transcribed in content.ts, so a
 * fresh deployment renders the full original site before the first publish.
 *
 * Public reads are cached and tagged; every write expires the tag, so a
 * publish is visible on the very next request. The editor always reads
 * uncached.
 */

export const CMS_TAG = "cms";

export interface PageEntry {
  id: string;
  slug: string;
  title: string;
}

export type { PageData };

/* ---------------------------------------------------------------- slugs */

/** "/" for home; otherwise no surrounding slashes, NFC, no spaces. */
export function normalizeSlug(input: string): string {
  const s = decodeURIComponentSafe(input)
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
  return s || "/";
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Letters (any script), digits, dashes, and "/" between segments. */
export function isValidSlug(slug: string): boolean {
  if (slug === "/") return true;
  return /^[\p{L}\p{N}_-]+(\/[\p{L}\p{N}_-]+)*$/u.test(slug) && !slug.startsWith("editor") && !slug.startsWith("api") && !slug.startsWith("login") && !slug.startsWith("uploads");
}

export function pageHref(slug: string): string {
  return slug === "/" ? "/" : `/${slug}`;
}

/* ---------------------------------------------------------------- reads */

export async function loadSite(): Promise<SiteDoc> {
  return normalizeSite(await readDoc("site"));
}

export async function loadIndex(): Promise<PageEntry[]> {
  const stored = await readDoc<{ pages?: PageEntry[] }>("pages");
  return Array.isArray(stored?.pages) ? stored.pages : seedIndex();
}

export async function loadPage(id: string): Promise<PageData | null> {
  if (!/^[a-z0-9]+$/.test(id)) return null;
  const stored = await readDoc<Partial<PageData>>(`page-${id}`);
  return stored?.meta && stored?.content?.root ? { meta: stored.meta, content: stored.content } : seedPage(id);
}

const cacheOptions = { tags: [CMS_TAG], revalidate: 60 * 60 * 24 };

export const getSite = unstable_cache(loadSite, ["cms-site"], cacheOptions);
export const getIndex = unstable_cache(loadIndex, ["cms-index"], cacheOptions);
export const getPage = unstable_cache(loadPage, ["cms-page"], cacheOptions);

export async function getPageBySlug(
  slug: string
): Promise<{ entry: PageEntry; data: PageData } | null> {
  const wanted = normalizeSlug(slug);
  const entry = (await getIndex()).find((p) => p.slug === wanted);
  if (!entry) return null;
  const data = await getPage(entry.id);
  return data ? { entry, data } : null;
}

/* --------------------------------------------------------------- writes */

/** Makes every cached read stale and re-renders every route on next visit. */
export function invalidate(): void {
  revalidateTag(CMS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

export async function saveSite(doc: SiteDoc): Promise<Version> {
  const v = await writeDoc("site", normalizeSite(doc));
  invalidate();
  return v;
}

export async function saveIndex(pages: PageEntry[]): Promise<Version> {
  const v = await writeDoc("pages", { pages });
  invalidate();
  return v;
}

export async function savePage(id: string, page: PageData): Promise<Version> {
  const v = await writeDoc(`page-${id}`, { id, meta: page.meta, content: page.content, savedAt: new Date().toISOString() });
  invalidate();
  return v;
}

export async function removePage(id: string): Promise<void> {
  await deleteDoc(`page-${id}`);
  invalidate();
}

export function newPageId(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
