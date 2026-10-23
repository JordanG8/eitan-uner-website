import type { ReactNode } from "react";
import {
  CardGrid,
  Contact,
  Gallery,
  Hero,
  Logos,
  Quote,
  RichText,
  TextImage,
  Video,
} from "@/components/blocks";
import { Designed, type BlockDesign } from "@/components/design";
import { Article, Intro, PageBanner } from "@/components/page-blocks";
import { Buttons, Divider, Embed, ImageBlock, Spacer } from "@/components/primitives";
import { ScrollStory } from "@/components/ScrollStory";
import { Testimonials } from "@/components/Testimonials";
import type { ImageRef, ScrollStoryBlock, SiteSettings, StoryPanel } from "@/lib/types";

/**
 * How each block renders.
 *
 * A page is a Lexical document; its designed sections (and the inserted
 * images, buttons, embeds…) are block nodes that carry a `blockType` and a
 * `props` object. This file is the one place those are turned into the site's
 * components, and it is used by both the public renderer and the editor, so
 * what Eitan sees while editing is literally the page.
 *
 * Props are stored in an editor-friendly shape (lists of strings as
 * [{text}] rows, so each row is editable); the converters below turn them
 * back into what the components take.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RenderContext {
  site: SiteSettings;
}

/** Lists of strings are stored as [{text}] rows. */
export const texts = (rows?: { text?: string }[]): string[] =>
  (Array.isArray(rows) ? rows : []).map((r) => r?.text ?? "").filter(Boolean);

const images = (rows?: { image?: ImageRef }[]): ImageRef[] =>
  (Array.isArray(rows) ? rows : []).map((r) => r?.image).filter((i): i is ImageRef => Boolean(i?.src));

const panels = (rows?: { kicker?: string; text?: string }[]): StoryPanel[] =>
  (Array.isArray(rows) ? rows : []).map((r) => ({
    kicker: r?.kicker || undefined,
    lines: (r?.text ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
  }));

const img = (i?: ImageRef): ImageRef => (i?.src ? i : { src: "/images/cameras-flatlay.webp", alt: "" });

export function toScrollStory(p: any): ScrollStoryBlock {
  return {
    _type: "scrollStory",
    memory: { image: img(p.memory?.image), panels: panels(p.memory?.panels) },
    vista: { image: img(p.vista?.image), cold: panels(p.vista?.cold), warm: panels(p.vista?.warm) },
    define: { image: img(p.define?.image), term: p.define?.term ?? "", panels: panels(p.define?.panels) },
    room: { image: img(p.room?.image), inset: img(p.room?.inset), panels: panels(p.room?.panels) },
    feelings: {
      kicker: p.feelings?.kicker,
      title: p.feelings?.title ?? "",
      items: (p.feelings?.items ?? []).filter((i: any) => i?.image?.src).map((i: any) => ({ image: i.image, word: i.word ?? "" })),
    },
    host: { image: img(p.host?.image), name: p.host?.name ?? "", role: p.host?.role ?? "", panels: panels(p.host?.panels) },
    ask: { kicker: p.ask?.kicker, title: p.ask?.title ?? "", body: texts(p.ask?.body), ctas: p.ask?.ctas },
  };
}

type Render = (p: any, ctx: RenderContext) => ReactNode;

/**
 * Inserted elements (image, buttons, embed…) sit in the content column like
 * text does; designed sections run full width.
 */
const contained = (render: Render): Render =>
  function Contained(p, ctx) {
    return <div className="eu-contain">{render(p, ctx)}</div>;
  };

export const BLOCKS = {
  /* designed sections */
  Intro: (p) => <Intro {...p} />,
  PageBanner: (p) => <PageBanner {...p} />,
  ScrollStory: (p) => <ScrollStory block={toScrollStory(p)} />,
  Hero: (p) => <Hero block={{ _type: "hero", ...p, image: img(p.image), tags: texts(p.tags) }} />,
  TextImage: (p) => <TextImage block={{ _type: "textImage", ...p, image: img(p.image), body: texts(p.body) }} />,
  RichText: (p) => <RichText block={{ _type: "richText", ...p, body: texts(p.body) }} />,
  CardGrid: (p) => <CardGrid block={{ _type: "cardGrid", ...p, cards: (p.cards ?? []).map((c: any) => ({ ...c, image: c?.image?.src ? c.image : undefined })) }} />,
  Gallery: (p, ctx) => <Gallery site={ctx.site} block={{ _type: "gallery", ...p, images: images(p.images) }} />,
  Testimonials: (p) => <Testimonials block={{ _type: "testimonials", ...p, items: p.items ?? [] }} />,
  Logos: (p) => (
    <Logos
      block={{
        _type: "logos",
        ...p,
        logos: (p.logos ?? []).filter((r: any) => r?.image?.src).map((r: any) => ({ ...r.image, href: r.href || undefined, linkLabel: r.linkLabel || undefined })),
      }}
    />
  ),
  Quote: (p) => <Quote block={{ _type: "quote", ...p }} />,
  Video: (p) => <Video block={{ _type: "video", ...p, youtubeUrl: p.youtubeUrl ?? "", body: texts(p.body) }} />,
  Contact: (p, ctx) => <Contact site={ctx.site} block={{ _type: "contact", ...p, headingLevel: Number(p.headingLevel) === 1 ? 1 : 2 }} />,
  Article: (p) => (
    <Article {...p} image={p.image?.src ? p.image : undefined} body={texts(p.body)} tags={texts(p.tags)} links={(p.links ?? []).filter((l: any) => l?.href)} />
  ),

  /* inserted elements */
  Image: contained((p) => <ImageBlock {...p} />),
  Buttons: contained((p) => <Buttons {...p} />),
  Spacer: (p) => <Spacer {...p} />,
  Divider: contained((p) => <Divider {...p} />),
  Embed: contained((p) => <Embed {...p} />),
} satisfies Record<string, Render>;

export type BlockType = keyof typeof BLOCKS;

export function isBlockType(t: unknown): t is BlockType {
  return typeof t === "string" && Object.prototype.hasOwnProperty.call(BLOCKS, t);
}

/** One block, wrapped in its per-section design overrides. */
export function renderBlock(type: string, props: Record<string, unknown> | undefined, ctx: RenderContext): ReactNode {
  if (!isBlockType(type)) return null;
  const { design, ...rest } = (props ?? {}) as { design?: BlockDesign } & Record<string, unknown>;
  return <Designed design={design}>{BLOCKS[type](rest, ctx)}</Designed>;
}
