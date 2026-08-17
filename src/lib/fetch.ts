import { pages, stories } from "./content";
import type { Page, Story } from "./types";

/**
 * Read layer.
 *
 * Content lives in content.ts, in this repo. There is no external CMS: nothing
 * here can be taken down, rate-limited, or start charging per seat.
 *
 * These stay async so the routes that await them don't need to change when the
 * Puck store is wired in behind this seam.
 */

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  return pages.find((p) => p.slug === slug);
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
