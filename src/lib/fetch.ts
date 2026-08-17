import { client } from "@/sanity/client";
import { sanityEnabled } from "@/sanity/env";
import { pages, stories } from "./content";
import type { Page, Story } from "./types";

/**
 * Read layer.
 *
 * Every reader tries Sanity first and falls back to the seed content in
 * content.ts. Failures are swallowed deliberately: a CMS problem should degrade
 * to the last-known-good copy rather than serve Eitan's clients an error page.
 */

const PAGE_PROJECTION = `{
  "slug": coalesce(slug.current, "/"),
  title,
  showTitleBanner,
  seoDescription,
  "blocks": blocks[]{
    ...,
    image{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
    images[]{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
    logos[]{ "src": asset->url, alt },
    cards[]{ ..., image{ "src": asset->url, alt } },
    items[]{ ..., avatar{ "src": asset->url, alt } }
  }
}`;

const STORY_PROJECTION = `{
  "slug": slug.current,
  title,
  date,
  body,
  tags,
  links,
  image{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
}`;

async function fromSanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!sanityEnabled || !client) return null;
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 60, tags: ["content"] },
    });
  } catch (err) {
    console.error("[sanity] fetch failed, falling back to seed content:", err);
    return null;
  }
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const doc = await fromSanity<Page | null>(
    `*[_type == "page" && coalesce(slug.current, "/") == $slug][0] ${PAGE_PROJECTION}`,
    { slug }
  );
  if (doc?.blocks?.length) return doc;
  return pages.find((p) => p.slug === slug);
}

export async function getAllPageSlugs(): Promise<string[]> {
  const remote = await fromSanity<string[] | null>(
    `*[_type == "page" && defined(slug.current) && slug.current != "/"].slug.current`
  );
  const local = pages.filter((p) => p.slug !== "/").map((p) => p.slug);
  return Array.from(new Set([...(remote ?? []), ...local]));
}

export async function getStoryBySlug(slug: string): Promise<Story | undefined> {
  const doc = await fromSanity<Story | null>(
    `*[_type == "story" && slug.current == $slug][0] ${STORY_PROJECTION}`,
    { slug }
  );
  if (doc?.title) return doc;
  return stories.find((s) => s.slug === slug);
}

export async function getAllStorySlugs(): Promise<string[]> {
  const remote = await fromSanity<string[] | null>(
    `*[_type == "story" && defined(slug.current)].slug.current`
  );
  return Array.from(new Set([...(remote ?? []), ...stories.map((s) => s.slug)]));
}
