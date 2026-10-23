import type { MetadataRoute } from "next";
import { getIndex, getPage, pageHref } from "@/lib/cms";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eitanuner.co.il";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const index = await getIndex();
  const entries = await Promise.all(
    index.map(async (p) => ({ p, data: await getPage(p.id) }))
  );
  return entries
    .filter(({ data }) => !data?.meta.noIndex)
    .map(({ p }) => ({
      url: p.slug === "/" ? SITE_URL : `${SITE_URL}${pageHref(p.slug).split("/").map(encodeURIComponent).join("/")}`,
      changeFrequency: p.slug.includes("/") ? ("yearly" as const) : ("monthly" as const),
      priority: p.slug === "/" ? 1 : p.slug.includes("/") ? 0.6 : 0.8,
    }));
}
