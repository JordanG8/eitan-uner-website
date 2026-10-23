import {
  isValidSlug,
  loadIndex,
  loadPage,
  loadSite,
  newPageId,
  normalizeSlug,
  pageHref,
  removePage,
  saveIndex,
  savePage,
  saveSite,
  type PageData,
  type PageEntry,
} from "./cms";
import { heading, paragraph, rootState, text, block } from "@/lexical/doc";
import { readVersion } from "./store";

/**
 * Page operations behind the editor's API routes. Each returns either a
 * result or a Hebrew error message meant to be shown to Eitan as-is.
 */

export class EditorError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function checkSlug(slug: string, index: PageEntry[], selfId?: string) {
  if (!isValidSlug(slug)) {
    throw new EditorError("כתובת לא תקינה. מותר: אותיות, ספרות, מקפים, ו־/ בין חלקים. לדוגמה: סדנאות-קיץ");
  }
  if (index.some((p) => p.slug === slug && p.id !== selfId)) {
    throw new EditorError(`כבר יש עמוד בכתובת ‎/${slug}‎. בחרו כתובת אחרת.`);
  }
}

/** Saves a page, keeping the page list's slug and title in step with it. */
export async function publishPage(id: string, data: PageData) {
  if (!data?.content?.root || !Array.isArray(data.content.root.children)) throw new EditorError("בקשה לא תקינה");
  const index = await loadIndex();
  const entry = index.find((p) => p.id === id);
  if (!entry) throw new EditorError("העמוד לא נמצא", 404);

  const meta = { ...(data.meta ?? {}) };
  // The homepage is always "/": everything links to it.
  const slug = entry.slug === "/" ? "/" : normalizeSlug(String(meta.slug ?? entry.slug));
  checkSlug(slug, index, id);
  const title = String(meta.title ?? "").trim() || entry.title;

  const version = await savePage(id, { meta: { ...meta, slug, title }, content: data.content });

  let moved: { from: string; to: string } | undefined;
  if (slug !== entry.slug || title !== entry.title) {
    await saveIndex(index.map((p) => (p.id === id ? { ...p, slug, title } : p)));
    if (slug !== entry.slug) {
      moved = { from: entry.slug, to: slug };
      await relinkNav(entry.slug, slug);
    }
  }
  return { version, slug, title, moved };
}

/** Points menu links at a page's new address after its slug changes. */
async function relinkNav(from: string, to: string) {
  const site = await loadSite();
  const fromHref = pageHref(from);
  const toHref = pageHref(to);
  let changed = false;
  const fix = (href: string) => {
    if (href === fromHref) {
      changed = true;
      return toHref;
    }
    return href;
  };
  const nav = site.nav.map((n) => ({
    ...n,
    href: fix(n.href),
    children: n.children?.map((c) => ({ ...c, href: fix(c.href) })),
  }));
  if (changed) await saveSite({ ...site, nav });
}

function blankPage(title: string, slug: string): PageData {
  return {
    meta: { title, slug, seoDescription: "" },
    content: rootState([
      block("PageBanner", { kicker: "איתן אונר · פוטודוקותרפיה", title, headingLevel: 1, design: {} }),
      heading("h2", [text("כותרת")]),
      paragraph([text("כתבו כאן את התוכן של העמוד. אפשר לעצב טקסט, להוסיף תמונות, כפתורים, עמודות וקטעים מעוצבים מסרגל הכלים.")]),
    ]),
  };
}

export async function createPage(input: { title?: string; slug?: string; copyFrom?: string; addToNav?: boolean }) {
  const title = (input.title ?? "").trim();
  if (!title) throw new EditorError("צריך לתת לעמוד שם");
  const index = await loadIndex();
  const slug = normalizeSlug(input.slug?.trim() || title);
  if (slug === "/") throw new EditorError("כתובת לא תקינה");
  checkSlug(slug, index);

  let data = blankPage(title, slug);
  if (input.copyFrom) {
    const source = await loadPage(input.copyFrom);
    if (!source) throw new EditorError("העמוד להעתקה לא נמצא", 404);
    data = { meta: { ...source.meta, title, slug }, content: structuredClone(source.content) };
  }

  const id = newPageId();
  await savePage(id, data);
  await saveIndex([...index, { id, slug, title }]);

  if (input.addToNav) {
    const site = await loadSite();
    await saveSite({ ...site, nav: [...site.nav, { label: title, href: pageHref(slug), children: [] }] });
  }
  return { id, slug, title };
}

export async function deletePage(id: string) {
  const index = await loadIndex();
  const entry = index.find((p) => p.id === id);
  if (!entry) throw new EditorError("העמוד לא נמצא", 404);
  if (entry.slug === "/") throw new EditorError("אי אפשר למחוק את דף הבית");

  await saveIndex(index.filter((p) => p.id !== id));
  await removePage(id);

  // Drop menu links to the page, so the menu never points at a 404.
  const site = await loadSite();
  const href = pageHref(entry.slug);
  const nav = site.nav
    .filter((n) => n.href !== href || (n.children?.length ?? 0) > 0)
    .map((n) => ({ ...n, children: n.children?.filter((c) => c.href !== href) }));
  if (JSON.stringify(nav) !== JSON.stringify(site.nav)) await saveSite({ ...site, nav });
  return { id };
}

export async function reorderPages(order: string[]) {
  const index = await loadIndex();
  const byId = new Map(index.map((p) => [p.id, p]));
  const next = order.map((id) => byId.get(id)).filter((p): p is PageEntry => Boolean(p));
  // Anything the client did not mention keeps its place at the end.
  for (const p of index) if (!order.includes(p.id)) next.push(p);
  await saveIndex(next);
}

/** Restores a page to an earlier saved version (saved again as the newest). */
export async function restorePage(id: string, versionId: string) {
  const old = await readVersion<Partial<PageData>>(`page-${id}`, versionId);
  if (!old?.meta || !old.content) throw new EditorError("הגרסה לא נמצאה", 404);
  return publishPage(id, { meta: old.meta, content: old.content });
}
