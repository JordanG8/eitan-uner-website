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
import { StoryAsk, StoryDefine, StoryFeelings, StoryHost, StoryMemory, StoryRoom, StoryVista } from "@/components/ScrollStory";
import { Testimonials } from "@/components/Testimonials";
import { ProWork } from "@/components/ProWork";
import type { ImageRef, SiteSettings, StoryPanel } from "@/lib/types";

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
  /** True inside the editor, where empty slots show as placeholders. */
  editing?: boolean;
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

/* The homepage scroll story: seven blocks, one per part. Each stores its
   part's fields flat in its own props. */
const story = {
  memory: (p: any) => ({ image: img(p.image), panels: panels(p.panels) }),
  vista: (p: any) => ({ image: img(p.image), cold: panels(p.cold), warm: panels(p.warm) }),
  define: (p: any) => ({ image: img(p.image), term: p.term ?? "", panels: panels(p.panels) }),
  room: (p: any) => ({ image: img(p.image), panels: panels(p.panels) }),
  feelings: (p: any) => ({
    kicker: p.kicker,
    title: p.title ?? "",
    items: (p.items ?? []).filter((i: any) => i?.image?.src).map((i: any) => ({ image: i.image, word: i.word ?? "" })),
  }),
  host: (p: any) => ({ image: img(p.image), name: p.name ?? "", role: p.role ?? "", panels: panels(p.panels) }),
  ask: (p: any) => ({ kicker: p.kicker, title: p.title ?? "", body: texts(p.body), ctas: p.ctas }),
};

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
  StoryMemory: (p) => <StoryMemory memory={story.memory(p)} />,
  StoryVista: (p) => <StoryVista vista={story.vista(p)} />,
  StoryDefine: (p) => <StoryDefine define={story.define(p)} />,
  StoryRoom: (p) => <StoryRoom room={story.room(p)} />,
  StoryFeelings: (p) => <StoryFeelings feelings={story.feelings(p)} />,
  StoryHost: (p) => <StoryHost host={story.host(p)} />,
  StoryAsk: (p) => <StoryAsk ask={story.ask(p)} />,
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
  ProWork: (p, ctx) => (
    <ProWork
      title={p.title}
      intro={p.intro}
      videos={(Array.isArray(p.videos) ? p.videos : []).slice(0, 3).map((v: any) => ({ url: v?.url ?? "", title: v?.title || undefined }))}
      photos={(Array.isArray(p.photos) ? p.photos : []).slice(0, 3).map((r: any) => (r?.image?.src ? r.image : undefined))}
      editing={ctx.editing}
    />
  ),
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
