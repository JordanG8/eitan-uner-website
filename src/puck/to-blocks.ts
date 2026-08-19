import type { Block } from "@/lib/types";

/**
 * Puck document -> the Block[] the site renders.
 *
 * The inverse of seed.ts. Keeping this conversion explicit means the public
 * pages never import Puck: the editor is a build-time concern, and a visitor
 * downloads none of it.
 */

const TYPE_FOR: Record<string, string> = {
  "סיפור נגלל": "scrollStory",
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

/** The inverse of seed.ts' wrapBeats: [{kicker, lines:[{text}]}] -> beats. */
const unwrapBeats = (rows: any) =>
  (Array.isArray(rows) ? rows : [])
    .map((r: any) => ({
      kicker: r?.kicker || undefined,
      lines: unwrapText(r?.lines),
    }))
    .filter((b: any) => b.lines.length > 0);

/**
 * The narrative homepage back out of Puck.
 *
 * Spread-then-override rather than rebuilt field by field: an editor that
 * writes a key this function has not heard of should carry it through to the
 * block untouched, not have it silently dropped on the next save.
 */
const scrollStoryFromPuck = (p: any): Block =>
  ({
    _type: "scrollStory",
    ...p,
    memory: { ...p?.memory, panels: unwrapBeats(p?.memory?.panels) },
    vista: {
      ...p?.vista,
      cold: unwrapBeats(p?.vista?.cold),
      warm: unwrapBeats(p?.vista?.warm),
    },
    define: { ...p?.define, panels: unwrapBeats(p?.define?.panels) },
    room: { ...p?.room, panels: unwrapBeats(p?.room?.panels) },
    feelings: {
      ...p?.feelings,
      items: (p?.feelings?.items ?? []).filter((i: any) => i?.image?.src),
    },
    host: { ...p?.host, panels: unwrapBeats(p?.host?.panels) },
    ask: { ...p?.ask, body: unwrapText(p?.ask?.body) },
  }) as Block;

export function puckToBlocks(data: any): Block[] {
  const content = Array.isArray(data?.content) ? data.content : [];

  return content
    .map((item: any): Block | null => {
      const _type = TYPE_FOR[item?.type];
      if (!_type) return null;

      // Puck stores a per-instance id we do not need on the rendered block.
      const props = { ...(item.props ?? {}) };
      delete props.id;

      if (_type === "scrollStory") return scrollStoryFromPuck(props);

      const out: any = { _type, ...props };

      if (Array.isArray(props.body)) out.body = unwrapText(props.body);
      if (Array.isArray(props.images)) out.images = unwrapImages(props.images);
      if (Array.isArray(props.logos)) out.logos = unwrapImages(props.logos);

      return out as Block;
    })
    .filter((b: Block | null): b is Block => b !== null);
}
