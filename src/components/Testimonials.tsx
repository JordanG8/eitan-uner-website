"use client";

import Image from "next/image";
import { useState } from "react";
import type { TestimonialsBlock } from "@/lib/types";
import { Section, SectionHeading } from "./site";

/**
 * Testimonials.
 *
 * The old treatment was a centred card with a round avatar, gold stars and
 * dot pagination — three separate template conventions stacked on one another.
 *
 * Here the quote itself is the design: set at section scale, light, ranged to
 * the reading edge. The rating is kept (it is Eitan's data, not decoration)
 * but rendered as a quiet count rather than gold star clip-art, which is the
 * single loudest "widget" signal on the old page.
 */
export function Testimonials({ block }: { block: TestimonialsBlock }) {
  const [i, setI] = useState(0);
  const items = block.items;
  if (!items.length) return null;

  const item = items[i];
  const go = (delta: number) =>
    setI((prev) => (prev + delta + items.length) % items.length);

  return (
    <Section background="white">
      {block.title && (
        <div className="mb-16">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/*
          aria-live="polite" on the figure, and it was the only live region on
          the site — the audit counted zero [aria-live] elements in the whole
          document. Pressing "ההמלצה הבאה" replaced the quote, the
          author, the role and the rating with nothing announced at all, so a
          screen-reader reader pressed a button and was told the button was
          still there. The figure is the region rather than the blockquote
          because the caption changes with the quote and belongs to the same
          announcement.
        */}
        <figure className="lg:col-span-9" aria-live="polite">
          {/*
            `key={i}` is what makes the animation replay. Without it React
            reuses the element, only the text node changes, and a mounted
            element does not restart an animation — the class would be present
            and inert, which is the most expensive kind of fix.
          */}
          <blockquote
            key={i}
            className="quote-swap text-title whitespace-pre-line font-light text-ink"
          >
            {item.quote}
          </blockquote>

          <figcaption className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            {item.avatar && (
              <span className="relative h-12 w-12 shrink-0 overflow-hidden">
                <Image
                  src={item.avatar.src}
                  alt={item.avatar.alt}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
            )}
            <span>
              <span className="block text-body text-ink">{item.author}</span>
              {item.role && (
                <span className="mt-0.5 block text-micro text-ink-faint">
                  {item.role}
                </span>
              )}
            </span>
            {item.rating != null && (
              <span
                className="text-micro text-brand-600 tabular-nums"
                aria-label={`דירוג ${item.rating} מתוך 5`}
              >
                {item.rating}/5
              </span>
            )}
          </figcaption>
        </figure>

        {items.length > 1 && (
          <div className="lg:col-span-3">
            <div className="flex items-center gap-6 lg:flex-col lg:items-start lg:gap-4">
              {/*
                The position indicator. It was reported missing and it is not
                — it has been here since the block was rewritten, reading
                "01 / 02". What it lacked was a name: to a screen reader it
                announced as two bare numerals with a slash between them, in a
                column with two unlabelled arrows.

                aria-label would need new Hebrew and the strings are frozen,
                so the label is built from the numerals themselves.
              */}
              <p
                className="text-micro text-brand-600 tabular-nums"
                aria-label={`${i + 1} / ${items.length}`}
              >
                <span aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                  <span className="text-ink-faint">
                    {" "}
                    / {String(items.length).padStart(2, "0")}
                  </span>
                </span>
              </p>
              <div className="flex gap-2">
                {/* In RTL, "previous" sits on the right — so it comes first. */}
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="המלצה קודמת"
                  className="flex size-11 items-center justify-center border border-ink/25 text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M9 6l6 6-6 6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="ההמלצה הבאה"
                  className="flex size-11 items-center justify-center border border-ink/25 text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
