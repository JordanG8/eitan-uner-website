import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Inline, QuietLink } from "@/components/site";
import { Separator } from "@/components/ui/separator";
import { getAllStorySlugs, getStoryBySlug } from "@/lib/fetch";

/** The only parent segment that has children. */
const STORIES_SLUG = "סיפורים-מאחורי-המצלמה";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllStorySlugs();
  return slugs.map((story) => ({ slug: STORIES_SLUG, story }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; story: string }>;
}): Promise<Metadata> {
  const { story } = await params;
  const doc = await getStoryBySlug(decodeURIComponent(story));
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.body?.[0]?.slice(0, 160),
    openGraph: {
      title: doc.title,
      description: doc.body?.[0]?.slice(0, 160),
      images: doc.image ? [{ url: doc.image.src }] : undefined,
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string; story: string }>;
}) {
  const { slug, story } = await params;
  if (decodeURIComponent(slug) !== STORIES_SLUG) notFound();

  const doc = await getStoryBySlug(decodeURIComponent(story));
  if (!doc) notFound();

  return (
    <article className="band bg-paper">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        {/* Same treatment as SectionHeading and as the page title banner.
            This header was centred over a rule-and-dot on a white ground —
            the one layout on the site that had survived every round
            untouched, and the one a reader lands on from the story grid. */}
        <header>
          <h1 className="text-section font-light text-ink">{doc.title}</h1>
          <Separator className="mt-6" />
          {doc.date && <p className="mt-6 text-micro text-ink-faint">{doc.date}</p>}
        </header>

        {doc.image && (
          <div className="relative mt-8 aspect-16/9 w-full overflow-hidden bg-surface-alt">
            <Image
              src={doc.image.src}
              alt={doc.image.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="prose-he mt-10 text-ink">
          {doc.body.map((p, i) => (
            <p key={i}>
              <Inline text={p} />
            </p>
          ))}
        </div>

        {doc.links?.length ? (
          <ul className="mt-8 space-y-2">
            {doc.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-body text-brand-700 underline underline-offset-4 transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {doc.tags?.length ? (
          <ul className="mt-10 flex flex-wrap gap-2">
            {doc.tags.map((t) => (
              <li
                key={t}
                className="border border-hairline bg-paper-deep px-3 py-1.5 text-micro text-ink-soft"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        <Separator className="mt-12" />
        {/* In RTL "back" points to the right, so the chevron is mirrored from
            the original. It pointed left on a right-to-left page. */}
        <div className="mt-8">
          <QuietLink href={`/${STORIES_SLUG}`}>חזרה לכל הסיפורים</QuietLink>
        </div>
      </div>
    </article>
  );
}
