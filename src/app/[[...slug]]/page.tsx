import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndex, getPageBySlug, getSite, pageHref } from "@/lib/cms";
import { siteSettings } from "@/lib/site";
import { LexicalContent } from "@/lexical/Render";

/**
 * Every page on the site, at any depth.
 *
 * Slugs are the original Hebrew URLs from site123 (e.g. /קהילת-אור, and the
 * stories under /סיפורים-מאחורי-המצלמה/…) so existing inbound links and
 * Google's index keep resolving. New pages Eitan creates in the editor appear
 * here as soon as they are published.
 */

export const revalidate = 86400;

type Params = { params: Promise<{ slug?: string[] }> };

const toSlug = (parts?: string[]) =>
  parts?.length ? parts.map((p) => decodeURIComponent(p)).join("/") : "/";

export async function generateStaticParams() {
  const index = await getIndex();
  return index.map((p) => ({ slug: p.slug === "/" ? [] : p.slug.split("/") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = toSlug((await params).slug);
  const [found, site] = await Promise.all([getPageBySlug(slug), getSite()]);
  if (!found) return {};
  const meta = found.data.meta;
  const title = meta.title || found.entry.title;
  const description = meta.seoDescription || site.contact.seoDescription;
  const canonical = pageHref(found.entry.slug);
  const firstImage = JSON.stringify(found.data.content).match(/"src":"([^"]+\.(?:webp|jpe?g|png|avif))"/)?.[1];
  return {
    title: slug === "/" ? { absolute: `${site.contact.siteName} — ${site.contact.tagline}` } : title,
    description,
    alternates: { canonical },
    robots: meta.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: slug === "/" ? `${site.contact.siteName} — ${site.contact.tagline}` : title,
      description,
      url: canonical,
      images: firstImage ? [{ url: firstImage }] : undefined,
    },
  };
}

export default async function SitePage({ params }: Params) {
  const slug = toSlug((await params).slug);
  const [found, site] = await Promise.all([getPageBySlug(slug), getSite()]);
  if (!found) notFound();
  const body = <LexicalContent state={found.data.content} ctx={{ site: siteSettings(site) }} />;
  return found.data.meta.background ? <div style={{ background: found.data.meta.background }}>{body}</div> : body;
}
