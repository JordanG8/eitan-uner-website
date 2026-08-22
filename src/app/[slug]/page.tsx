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
        <div className="page-banner py-16 sm:py-22">
          <div className="relative z-10 mx-auto max-w-(--container-content) px-5 lg:px-8">
            <div className="text-center">
              <p className="mb-4 text-[13px] font-bold tracking-[0.12em] text-accent-soft">איתן אונר · פוטודוקותרפיה</p>
              <h1 className="text-4xl font-bold text-white sm:text-6xl">{page.title}</h1>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-px w-16 bg-white/35" aria-hidden="true" />
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      )}
      <Blocks blocks={page.blocks} />
    </>
  );
}
