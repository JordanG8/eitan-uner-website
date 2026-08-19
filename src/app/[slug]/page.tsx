import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks";
import { Separator } from "@/components/ui/separator";
import { getAllPageSlugs, getPageBySlug } from "@/lib/fetch";

/**
 * One route serves every content page. Slugs are the original Hebrew URLs from
 * site123 (e.g. /קהילת-אור) so existing inbound links and Google's index keep
 * resolving after the DNS cutover instead of 404-ing.
 */

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(decodeURIComponent(slug));
  if (!page) return {};
  return {
    title: page.title,
    description: page.seoDescription,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: page.title, description: page.seoDescription },
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(decodeURIComponent(slug));
  if (!page) notFound();

  return (
    <>
      {/*
        The page title banner, brought onto the system.

        It had been missed by every redesign round: pure white ground on a page
        whose every other band is warm paper, `px-4 lg:px-6` against everything
        else's `px-6 lg:px-10`, a centred `text-4xl sm:text-5xl` heading on a
        site that ranges its headings to the reading edge, and a decorative
        rule-and-dot lockup that was explicitly removed from SectionHeading in
        round 1 and left standing here. Seventeen of the eighteen slugs open
        with this band, so it was the first thing a reader saw on almost every
        page — and it was the strongest single "two different sites" signal on
        the site.

        It is now literally the SectionHeading treatment, one level up: the
        title at the section step, light, ranged start, with a hairline under
        it running the full measure.
      */}
      {page.showTitleBanner && (
        <div className="bg-paper pt-16 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-(--container-content) px-6 lg:px-10">
            <h1 className="text-section font-light text-ink">{page.title}</h1>
            <Separator className="mt-6" />
          </div>
        </div>
      )}
      <Blocks blocks={page.blocks} />
    </>
  );
}
