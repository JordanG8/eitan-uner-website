import type { Data } from "@measured/puck";
import { pages } from "@/lib/content";
import type { Block } from "@/lib/types";

/**
 * Converts a page from content.ts into Puck's data shape, so the editor opens on
 * Eitan's real homepage rather than a blank canvas.
 */

const COMPONENT_FOR: Record<string, string> = {
  hero: "כותרת ראשית",
  textImage: "טקסט ותמונה",
  richText: "קטע טקסט",
  cardGrid: "שורת כרטיסים",
  gallery: "גלריה",
  testimonials: "המלצות",
  logos: "לוגואים",
  quote: "ציטוט",
  video: "סרטון",
  contact: "צרו קשר",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Puck array items are objects, so string[] bodies become [{text}]. */
const wrap = (body?: string[]) => (body ?? []).map((text) => ({ text }));

function toPuckProps(block: Block): Record<string, unknown> {
  const b = block as any;
  const props: Record<string, unknown> = { ...b };
  delete props._type;

  if (Array.isArray(b.body)) props.body = wrap(b.body);

  // Images collapse to the {src, alt} pair the editor's select field expects.
  if (b.image) props.image = { src: b.image.src, alt: b.image.alt };
  if (Array.isArray(b.images))
    props.images = b.images.map((i: any) => ({ src: i.src, alt: i.alt }));
  if (Array.isArray(b.logos))
    props.logos = b.logos.map((i: any) => ({ src: i.src, alt: i.alt }));
  if (Array.isArray(b.cards))
    props.cards = b.cards.map((c: any) => ({
      ...c,
      ...(c.image ? { image: { src: c.image.src, alt: c.image.alt } } : {}),
    }));

  return props;
}

export function pageToPuckData(slug: string): Data {
  const page = pages.find((p) => p.slug === slug) ?? pages[0];
  return {
    root: { props: { title: page.title } },
    content: page.blocks
      .filter((b) => COMPONENT_FOR[b._type])
      .map((b) => ({
        type: COMPONENT_FOR[b._type],
        props: { id: `${b._type}-${Math.random().toString(36).slice(2, 9)}`, ...toPuckProps(b) },
      })),
    zones: {},
  } as Data;
}
