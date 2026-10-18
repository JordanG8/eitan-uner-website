import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaRow, Inline } from "@/components/ui";
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
  const { slug, story } = await params;
  if (decodeURIComponent(slug) !== STORIES_SLUG) return {};
  const doc = await getStoryBySlug(decodeURIComponent(story));
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.body?.[0]?.slice(0, 160),
    alternates: { canonical: `/${STORIES_SLUG}/${doc.slug}` },
    openGraph: {
      title: doc.title,
      description: doc.body?.[0]?.slice(0, 160),
      images: doc.image ? [{ url: doc.image.src }] : undefined,
      url: `/${STORIES_SLUG}/${doc.slug}`,
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
  const slugs = await getAllStorySlugs();
  const nextSlug = slugs[(slugs.indexOf(doc.slug) + 1) % slugs.length];
  const nextStory = nextSlug !== doc.slug ? await getStoryBySlug(nextSlug) : undefined;
  const isWorkshop = doc.tags?.some((tag) => ["פוטודוקותרפיה", "פוטותרפיה", "סדנאות"].includes(tag));

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
          {/* Legacy day/month dates have no verified year. Keep them in the
              source for editorial review without implying a recent event. */}
          {doc.date && /\d{4}/.test(doc.date) && <p className="mt-6 text-[14px] text-ink-soft">{doc.date}</p>}
        </header>

        {doc.image && (
          <div className="photo-frame mt-10 overflow-hidden rounded-[2rem] bg-surface-alt">
            <Image
              src={doc.image.src}
              alt={doc.image.alt}
              width={doc.image.width ?? 1200}
              height={doc.image.height ?? 900}
              preload
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto max-h-[75svh] w-full object-contain"
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

        <section className="mt-12 rounded-2xl border border-hairline bg-surface-alt p-6">
          <h2 className="text-2xl text-brand-800">{isWorkshop ? "מהסיפור למפגש שלכם" : "יש סיפור שתרצו לתעד?"}</h2>
          <p className="mt-3 text-ink-soft">{isWorkshop ? "לפרטים על עבודה עם צילום, קלפי תמונות ושיתוף בקבוצה, ולתיאום מפגש שמתאים לכם." : "אפשר לדבר עם איתן על צילום ותיעוד, ולברר יחד את אופי המפגש."}</p>
          <CtaRow ctas={[
            { label: "לשיחה עם איתן", href: "/צרו-קשר" },
            { label: isWorkshop ? "על סדנאות פוטודוקותרפיה" : "לצפייה בתיק העבודות", href: isWorkshop ? "/פוטודוקותרפיה" : "/תיק-עבודות", tone: "outline" },
          ]} />
        </section>
        <nav aria-label="סיפורים נוספים" className="mt-10 flex flex-wrap justify-between gap-6 border-t border-hairline pt-8">
          <Link
            href={`/${STORIES_SLUG}`}
            className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-600 hover:text-brand-800"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M13 4l-6 6 6 6z" />
            </svg>
            חזרה לכל הסיפורים
          </Link>
          {nextStory && <Link href={`/${STORIES_SLUG}/${nextStory.slug}`} className="text-base font-semibold text-brand-700 underline underline-offset-4">הסיפור הבא: {nextStory.title} ←</Link>}
        </nav>
      </div>
    </article>
  );
}
