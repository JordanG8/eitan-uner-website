import { pages, stories } from "./content";
import { readStoredPage } from "./pages-store";
import type { Page, Story } from "./types";

/**
 * Read layer.
 *
 * Published pages (committed to content/pages/*.json by the editor) win; the
 * hand-written content in content.ts is the fallback for anything never edited.
 * Both live in this repo, so there is no external service in the request path.
 */

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const base = pages.find((p) => p.slug === slug);
  const stored = await readStoredPage(slug);
  if (!stored) return base;

  return {
    slug,
    title: base?.title ?? slug,
    showTitleBanner: base?.showTitleBanner,
    seoDescription: base?.seoDescription,
    blocks: stored.blocks,
  };
}

export async function getAllPageSlugs(): Promise<string[]> {
  return pages.filter((p) => p.slug !== "/").map((p) => p.slug);
}

export async function getStoryBySlug(slug: string): Promise<Story | undefined> {
  return stories.find((s) => s.slug === slug);
}

export async function getAllStorySlugs(): Promise<string[]> {
  return stories.map((s) => s.slug);
}
