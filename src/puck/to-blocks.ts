import type { Block } from "@/lib/types";

/**
 * Puck document -> the Block[] the site renders.
 *
 * The inverse of seed.ts. Keeping this conversion explicit means the public
 * pages never import Puck: the editor is a build-time concern, and a visitor
 * downloads none of it.
 */

const TYPE_FOR: Record<string, string> = {
  "כותרת ראשית": "hero",
  "טקסט ותמונה": "textImage",
  "קטע טקסט": "richText",
  "שורת כרטיסים": "cardGrid",
  "גלריה": "gallery",
  "המלצות": "testimonials",
  "לוגואים": "logos",
  "ציטוט": "quote",
  "סרטון": "video",
  "צרו קשר": "contact",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

const unwrapText = (rows: any): string[] =>
  Array.isArray(rows) ? rows.map((r) => r?.text ?? "").filter(Boolean) : [];

const unwrapImages = (rows: any) =>
  Array.isArray(rows)
    ? rows.map((r) => r?.image).filter((i: any) => i?.src)
    : [];

export function puckToBlocks(data: any): Block[] {
  const content = Array.isArray(data?.content) ? data.content : [];

  return content
    .map((item: any): Block | null => {
      const _type = TYPE_FOR[item?.type];
      if (!_type) return null;

      // Puck stores a per-instance id we do not need on the rendered block.
      const props = { ...(item.props ?? {}) };
      delete props.id;
      const out: any = { _type, ...props };

      if (Array.isArray(props.body)) out.body = unwrapText(props.body);
      if (Array.isArray(props.images)) out.images = unwrapImages(props.images);
      if (Array.isArray(props.logos)) out.logos = unwrapImages(props.logos);

      return out as Block;
    })
    .filter((b: Block | null): b is Block => b !== null);
}
