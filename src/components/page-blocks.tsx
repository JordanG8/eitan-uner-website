import Image from "next/image";
import Link from "next/link";
import type { Cta, ImageRef } from "@/lib/types";
import { CtaRow, Inline } from "./ui";

/**
 * Sections that used to be hard-coded into routes — the homepage opening, the
 * title banner over content pages, and the story layout. As blocks they can be
 * edited, restyled, reordered or removed like everything else.
 */

/* ------------------------------------------------------------- intro */

export interface IntroProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  ctas?: Cta[];
  linkLabel?: string;
  linkHref?: string;
  headingLevel?: 1 | 2;
}

export function Intro(p: IntroProps) {
  const Heading = p.headingLevel === 2 ? "h2" : "h1";
  return (
    <section className="bg-surface px-5 py-9 sm:py-12">
      <div className="mx-auto max-w-4xl text-center">
        {p.kicker && <p className="mb-3 text-sm font-semibold text-brand-700">{p.kicker}</p>}
        <Heading className="text-[clamp(2rem,5vw,3.75rem)] text-ink">{p.title}</Heading>
        {p.subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">{p.subtitle}</p>}
        <CtaRow align="center" ctas={p.ctas} />
        {p.linkLabel && p.linkHref && (
          <a href={p.linkHref} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 underline underline-offset-4">
            {p.linkLabel}
          </a>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- page banner */

export interface PageBannerProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  headingLevel?: 1 | 2;
}

export function PageBanner(p: PageBannerProps) {
  const Heading = p.headingLevel === 2 ? "h2" : "h1";
  return (
    <div className="page-banner py-10 sm:py-16">
      <div className="relative z-10 mx-auto max-w-(--container-content) px-5 lg:px-8">
        <div className="text-center">
          {p.kicker && <p className="mb-4 text-[13px] font-bold tracking-[0.12em] text-accent-soft">{p.kicker}</p>}
          <Heading className="text-4xl font-bold text-white sm:text-6xl">{p.title}</Heading>
          {p.subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{p.subtitle}</p>}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-16 bg-white/35" aria-hidden="true" />
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ article */

export interface ArticleProps {
  kicker?: string;
  title: string;
  date?: string;
  image?: ImageRef;
  body: string[];
  links?: { label: string; href: string }[];
  tags?: string[];
  ctaTitle?: string;
  ctaBody?: string;
  ctas?: Cta[];
  backLabel?: string;
  backHref?: string;
  nextLabel?: string;
  nextHref?: string;
}

/** A single long-form story: header, photograph, text, then where to go next. */
export function Article(p: ArticleProps) {
  return (
    <article className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <header className="text-center">
          {p.kicker && <p className="mb-4 text-[13px] font-bold tracking-[0.12em] text-brand-600">{p.kicker}</p>}
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">{p.title}</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-16 bg-accent" aria-hidden="true" />
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          </div>
          {p.date && <p className="mt-6 text-[14px] text-ink-soft">{p.date}</p>}
        </header>

        {p.image?.src && (
          <div className="photo-frame mt-10 overflow-hidden rounded-[calc(2rem*var(--radius-scale))] bg-surface-alt">
            <Image
              src={p.image.src}
              alt={p.image.alt}
              width={p.image.width ?? 1200}
              height={p.image.height ?? 900}
              preload
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto max-h-[75svh] w-full object-contain"
            />
          </div>
        )}

        <div className="prose-he mt-12 text-ink">
          {p.body.map((para, i) => (
            <p key={i}>
              <Inline text={para} />
            </p>
          ))}
        </div>

        {p.links?.length ? (
          <ul className="mt-8 space-y-2">
            {p.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="break-all text-brand-600 underline underline-offset-4 hover:text-brand-800">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {p.tags?.length ? (
          <ul className="mt-10 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <li key={t} className="rounded-full bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-700">
                {t}
              </li>
            ))}
          </ul>
        ) : null}

        {p.ctaTitle && (
          <section className="mt-12 rounded-2xl border border-hairline bg-surface-alt p-6">
            <h2 className="text-2xl text-brand-800">{p.ctaTitle}</h2>
            {p.ctaBody && <p className="mt-3 text-ink-soft">{p.ctaBody}</p>}
            <CtaRow ctas={p.ctas} />
          </section>
        )}

        {(p.backHref || p.nextHref) && (
          <nav aria-label="סיפורים נוספים" className="mt-10 flex flex-wrap justify-between gap-6 border-t border-hairline pt-8">
            {p.backHref ? (
              <Link href={p.backHref} className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-600 hover:text-brand-800">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M13 4l-6 6 6 6z" />
                </svg>
                {p.backLabel || "חזרה"}
              </Link>
            ) : <span />}
            {p.nextHref && (
              <Link href={p.nextHref} className="text-base font-semibold text-brand-700 underline underline-offset-4">
                {/* "label: title" as separate text nodes, as the original
                    markup had it — Chrome shapes each node on its own. */}
                {(p.nextLabel || "הבא").split(/(?<=: )/)}
                {" ←"}
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
