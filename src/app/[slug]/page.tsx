import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/blocks";
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
      {page.showTitleBanner && (
        <div className="border-b border-hairline bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-(--container-content) px-4 lg:px-6">
            <div className="text-center">
              <h1 className="text-4xl font-normal text-ink sm:text-5xl">{page.title}</h1>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-px w-24 bg-brand-300" aria-hidden="true" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      )}
      <Blocks blocks={page.blocks} />
    </>
  );
}
