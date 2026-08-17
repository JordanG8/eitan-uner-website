/**
 * Content model.
 *
 * These block types are the whole vocabulary of the site. Every page is a list
 * of blocks, and each block has a fixed, designed layout. Eitan chooses blocks
 * and fills in fields — he never positions anything. That is deliberate: it is
 * what makes it impossible for him to produce a broken page.
 *
 * The Sanity schemas in src/sanity/schemas mirror these one-for-one.
 */

export type CtaTone = "solid" | "outline" | "solidWhite" | "outlineWhite";

export interface Cta {
  label: string;
  href: string;
  tone?: CtaTone;
}

export interface ImageRef {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Full-bleed opening band: photo on one side, turquoise on the other. */
export interface HeroBlock {
  _type: "hero";
  title: string;
  subtitle?: string;
  image: ImageRef;
  ctas?: Cta[];
  /** Which side the photo sits on. In RTL, "start" is the right. */
  imageSide?: "start" | "end";
  background?: "brand" | "white";
}

/** Photo beside a block of text with the signature short rule under the heading. */
export interface TextImageBlock {
  _type: "textImage";
  title?: string;
  eyebrow?: string;
  body: string[];
  image: ImageRef;
  imageSide?: "start" | "end";
  ctas?: Cta[];
  background?: "white" | "alt" | "brand";
}

/** Centred heading + paragraphs. Supports **bold** runs. */
export interface RichTextBlock {
  _type: "richText";
  title?: string;
  body: string[];
  align?: "start" | "center";
  background?: "white" | "alt" | "brand";
  maxWidth?: "narrow" | "wide";
}

export interface Card {
  title: string;
  body?: string;
  image?: ImageRef;
  href?: string;
  linkLabel?: string;
}

/** The 3-up / 4-up card rows used for stories, lectures and Edut 710. */
export interface CardGridBlock {
  _type: "cardGrid";
  title?: string;
  cards: Card[];
  columns?: 2 | 3 | 4;
  /** "overlay" = text on turquoise beneath image (Lectures);
   *  "plain"   = white card, teal title (Stories). */
  variant?: "plain" | "overlay";
  background?: "white" | "alt" | "brand";
}

export interface GalleryBlock {
  _type: "gallery";
  title?: string;
  images: ImageRef[];
  background?: "white" | "alt";
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
  avatar?: ImageRef;
}

export interface TestimonialsBlock {
  _type: "testimonials";
  title?: string;
  items: Testimonial[];
}

export interface LogosBlock {
  _type: "logos";
  title?: string;
  logos: ImageRef[];
}

/** Turquoise band with a large centred pull-quote. */
export interface QuoteBlock {
  _type: "quote";
  quote: string;
  attribution?: string;
  ctas?: Cta[];
}

export interface VideoBlock {
  _type: "video";
  title?: string;
  body?: string[];
  youtubeUrl: string;
  poster?: ImageRef;
  background?: "white" | "brand";
}

export interface ContactBlock {
  _type: "contact";
  title?: string;
}

export type Block =
  | HeroBlock
  | TextImageBlock
  | RichTextBlock
  | CardGridBlock
  | GalleryBlock
  | TestimonialsBlock
  | LogosBlock
  | QuoteBlock
  | VideoBlock
  | ContactBlock;

export interface Page {
  slug: string;
  title: string;
  /** Shown as the page's own H1 banner. Omit on the homepage. */
  showTitleBanner?: boolean;
  seoDescription?: string;
  blocks: Block[];
}

export interface Story {
  slug: string;
  title: string;
  date?: string;
  image?: ImageRef;
  body: string[];
  tags?: string[];
  links?: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  location: string;
  hours: string[];
  roles: string[];
  facebookUrl?: string;
  whatsappUrl: string;
  nav: NavItem[];
}
