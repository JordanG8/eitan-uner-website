/**
 * Content model.
 *
 * These block types are the whole vocabulary of the site. Every page is a list
 * of blocks, and each block has a fixed, designed layout. Eitan chooses blocks
 * and fills in fields — he never positions anything. That is deliberate: it is
 * what makes it impossible for him to produce a broken page.
 *
 * The Puck config in src/puck/config.tsx mirrors these one-for-one.
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
  /**
   * Optional full-bleed photograph behind the masthead.
   *
   * `image` is Eitan's portrait, and the archive has nothing of him above
   * ~1080px, so it cannot carry a 1440px fold without visibly upscaling. A
   * backdrop lets the fold lead with one of his photographs at full bleed and
   * keep the portrait inset at a size its resolution supports.
   */
  backdrop?: ImageRef;
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

/* --------------------------------------------------- the scroll narrative */

/**
 * One photograph in the river of feelings — a print with a single word under
 * it. The word is the whole caption on purpose: naming a feeling in one word
 * is the exercise the workshop actually runs.
 */
export interface FeelingCard {
  image: ImageRef;
  word: string;
}

/** One beat of copy held over a stage. Each line is its own display line. */
export interface StoryPanel {
  kicker?: string;
  lines: string[];
}

/**
 * The homepage argument, told by scrolling.
 *
 * This block is deliberately not a generic "scenes" array. The choreography —
 * a single photographic print that grows, loses its border, turns from grey to
 * colour, multiplies across a table and finally becomes a row of feelings — is
 * fixed, and it is the argument. Eitan swaps the photographs and edits the
 * words; he does not re-cut the film. That is the same "blocks, not a canvas"
 * rule the rest of the site is built on, applied to a longer form.
 */
export interface ScrollStoryBlock {
  _type: "scrollStory";
  /** Act I — the print you already own, before anyone taught you a word for it. */
  memory: { image: ImageRef; panels: StoryPanel[] };
  /** Acts II & III — the same vista twice: once as a postcard, once as yours. */
  vista: { image: ImageRef; cold: StoryPanel[]; warm: StoryPanel[] };
  /** Act IV — the word, finally. */
  define: { image: ImageRef; term: string; panels: StoryPanel[] };
  /** Act V — the table. The one print becomes many. */
  room: { image: ImageRef; inset: ImageRef; panels: StoryPanel[] };
  /** Act VI — what comes out of it, one word per photograph. */
  feelings: { kicker?: string; title: string; items: FeelingCard[] };
  /** Act VII — who is in the room with them. */
  host: { image: ImageRef; name: string; role: string; panels: StoryPanel[] };
  /** Act VIII — the ask. The only act on paper. */
  ask: { kicker?: string; title: string; body: string[]; ctas?: Cta[] };
}

export type Block =
  | ScrollStoryBlock
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
