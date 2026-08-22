import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inline } from "@/components/ui";
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
    <article className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <header className="text-center">
          <p className="mb-4 text-[13px] font-bold tracking-[0.12em] text-brand-600">סיפור מאחורי המצלמה</p>
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">{doc.title}</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-16 bg-accent" aria-hidden="true" />
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          </div>
          {doc.date && <p className="mt-6 text-[14px] text-ink-soft">{doc.date}</p>}
        </header>

        {doc.image && (
          <div className="photo-frame relative mt-10 aspect-16/9 w-full overflow-hidden rounded-[2rem] bg-surface-alt">
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

        <div className="prose-he mt-12 text-ink">
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
                  className="break-all text-brand-600 underline underline-offset-4 hover:text-brand-800"
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
                className="rounded-full bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-700"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-12 border-t border-hairline pt-8">
          <Link
            href={`/${STORIES_SLUG}`}
            className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-600 hover:text-brand-800"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M13 4l-6 6 6 6z" />
            </svg>
            חזרה לכל הסיפורים
          </Link>
        </div>
      </div>
    </article>
  );
}
