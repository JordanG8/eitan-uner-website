import type { MetadataRoute } from "next";
import { getAllPageSlugs, getAllStorySlugs } from "@/lib/fetch";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eitanuner.co.il";
const STORIES_SLUG = "סיפורים-מאחורי-המצלמה";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pageSlugs, storySlugs] = await Promise.all([
    getAllPageSlugs(),
    getAllStorySlugs(),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...pageSlugs.map((slug) => ({
      url: `${SITE_URL}/${encodeURIComponent(slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...storySlugs.map((slug) => ({
      url: `${SITE_URL}/${encodeURIComponent(STORIES_SLUG)}/${encodeURIComponent(slug)}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
