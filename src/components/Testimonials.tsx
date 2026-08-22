"use client";

import Image from "next/image";
import { useState } from "react";
import type { TestimonialsBlock } from "@/lib/types";
import { Section, SectionHeading } from "./ui";

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <div
      className="mt-6 flex justify-center gap-1.5"
      role="img"
      aria-label={`דירוג ${rating} מתוך 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-5 w-5 ${i < rating ? "text-amber-400" : "text-hairline"}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials({ block }: { block: TestimonialsBlock }) {
  const [i, setI] = useState(0);
  const items = block.items;
  if (!items.length) return null;

  const item = items[i];
  const go = (delta: number) => setI((prev) => (prev + delta + items.length) % items.length);

  return (
    <Section background="white">
      {block.title && (
        <div className="mb-12">
          <SectionHeading>{block.title}</SectionHeading>
        </div>
      )}

      <div className="relative mx-auto max-w-4xl rounded-[2rem] border border-hairline bg-white px-2 py-12 shadow-[0_18px_55px_rgb(18_42_43_/_0.08)] sm:px-8">
        {items.length > 1 && (
          <>
            {/* In RTL, "previous" sits on the right */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="המלצה קודמת"
              className="absolute end-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-700 sm:end-6"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                <path d="M9 6l6 6-6 6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="ההמלצה הבאה"
              className="absolute start-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-700 sm:start-6"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                <path d="M15 6l-6 6 6 6z" />
              </svg>
            </button>
          </>
        )}

        <figure className="px-12 text-center sm:px-16">
          {item.avatar ? (
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full">
              <Image src={item.avatar.src} alt={item.avatar.alt} fill className="object-cover" />
            </div>
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-800 text-accent-soft shadow-[0_10px_25px_rgb(18_42_43_/_0.18)]">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
                <path d="M7.5 5C5 5 3 7.2 3 10c0 2.6 1.9 4.7 4.3 4.9-.3 1.7-1.4 3-3 3.6V21c3.6-.8 6.2-4 6.2-8.4V10C10.5 7.2 9.5 5 7.5 5zm11 0C16 5 14 7.2 14 10c0 2.6 1.9 4.7 4.3 4.9-.3 1.7-1.4 3-3 3.6V21c3.6-.8 6.2-4 6.2-8.4V10c0-2.8-1-5-3-5z" />
              </svg>
            </div>
          )}

          <blockquote className="mt-8 whitespace-pre-line text-[17px] leading-[1.9] text-ink sm:text-lg">
            {item.quote}
          </blockquote>

          <Stars rating={item.rating} />

          <figcaption className="mt-5">
            <span className="block text-[16px] font-medium text-brand-600">
              {item.author}
            </span>
            {item.role && (
              <span className="mt-1 block text-[13px] italic text-ink-soft">
                {item.role}
              </span>
            )}
          </figcaption>
        </figure>

        {items.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`המלצה ${idx + 1}`}
                aria-current={idx === i}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-6 bg-brand-500" : "w-2 bg-brand-200 hover:bg-brand-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
