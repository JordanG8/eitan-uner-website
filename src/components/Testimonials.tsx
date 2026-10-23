"use client";

import Image from "next/image";
import { useId, useState } from "react";
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
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const quoteId = useId();
  const items = block.items;
  if (!items.length) return null;
  const item = items[index % items.length];
  const long = item.quote.length > 280;
  const excerpt = item.quote.slice(0, 280).replace(/\s+\S*$/, "");
  const select = (value: number) => { setIndex((value + items.length) % items.length); setExpanded(false); };

  return <Section background="white">
    {block.title && <div className="mb-10"><SectionHeading>{block.title}</SectionHeading></div>}
    <div role="region" aria-label="המלצות משתתפים" aria-roledescription="קרוסלה" className="mx-auto max-w-4xl rounded-[calc(2rem*var(--radius-scale))] border border-hairline bg-white px-5 py-8 shadow-[0_18px_55px_rgb(18_42_43_/_0.08)] sm:px-12 sm:py-12">
      <figure className="text-center">
        {item.avatar ? <Image src={item.avatar.src} alt={item.avatar.alt} width={96} height={96} className="mx-auto h-24 w-24 rounded-full object-cover" /> : <span aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-800 text-5xl text-accent-soft">״</span>}
        <blockquote id={quoteId} className="mt-6 min-h-40 whitespace-pre-line text-[17px] leading-[1.85] text-ink sm:min-h-32 sm:text-lg">
          {long && !expanded ? `${excerpt}…` : item.quote}
        </blockquote>
        {long && <button type="button" aria-expanded={expanded} aria-controls={quoteId} onClick={() => setExpanded(!expanded)} className="mt-3 min-h-11 px-3 font-semibold text-brand-700 underline underline-offset-4">{expanded ? "סגירת ההמלצה המלאה" : "לקריאת ההמלצה המלאה"}</button>}
        <Stars rating={item.rating} />
        <figcaption className="mt-5"><span className="block text-base font-semibold text-brand-700">{item.author}</span>{item.role && <span className="mt-1 block text-sm text-ink-soft">{item.role}</span>}</figcaption>
      </figure>
      <p className="mt-6 text-center text-sm text-ink-soft" role="status" aria-live="polite" aria-atomic="true">המלצה {index + 1} מתוך {items.length}<span className="sr-only"> — {item.author}</span></p>
      {items.length > 1 && <div className="mt-2 flex flex-wrap items-center justify-center gap-2" aria-label="בחירת המלצה">
        <button type="button" onClick={() => select(index - 1)} aria-label="המלצה קודמת" className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-xl text-brand-700">→</button>
        {items.map((_, i) => <button key={i} type="button" onClick={() => select(i)} aria-label={`המלצה ${i + 1}`} aria-current={i === index ? "true" : undefined} className="flex h-11 w-11 items-center justify-center rounded-full"><span aria-hidden="true" className={`h-2 rounded-full ${i === index ? "w-6 bg-brand-600" : "w-2 bg-brand-300"}`} /></button>)}
        <button type="button" onClick={() => select(index + 1)} aria-label="ההמלצה הבאה" className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-xl text-brand-700">←</button>
      </div>}
    </div>
  </Section>;
}
