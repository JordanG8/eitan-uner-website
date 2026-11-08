/**
 * The shape of a saved page.
 *
 * A page is a Lexical editor state (serialized JSON) plus page settings. The
 * types below describe the serialized nodes the site uses, so the public
 * renderer can walk the JSON without loading Lexical itself — visitors never
 * download the editor.
 *
 * Class names are shared by the editor's Lexical theme and the public
 * renderer, so a paragraph looks the same in both.
 */

export const THEME = {
  paragraph: "eu-p",
  heading: { h1: "eu-h1", h2: "eu-h2", h3: "eu-h3", h4: "eu-h4", h5: "eu-h5", h6: "eu-h6" },
  quote: "eu-quote",
  list: {
    ul: "eu-ul",
    ol: "eu-ol",
    listitem: "eu-li",
    nested: { listitem: "eu-li-nested" },
  },
  link: "eu-link",
  hr: "eu-hr",
  text: {
    bold: "eu-b",
    italic: "eu-i",
    underline: "eu-u",
    strikethrough: "eu-s",
    underlineStrikethrough: "eu-us",
    code: "eu-code",
    highlight: "eu-mark",
    subscript: "eu-sub",
    superscript: "eu-sup",
  },
} as const;

/** Lexical's text format bit flags. */
export const FORMAT = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
  subscript: 32,
  superscript: 64,
  highlight: 128,
} as const;

/* ------------------------------------------------------------ nodes */

export interface SNode {
  type: string;
  version: number;
  [key: string]: unknown;
}

export interface SElement extends SNode {
  children: SNode[];
  direction?: "ltr" | "rtl" | null;
  format?: string | number;
  indent?: number;
}

export interface SText extends SNode {
  type: "text";
  text: string;
  format: number;
  style: string;
}

export interface SBlock extends SNode {
  type: "eu-block";
  blockType: string;
  props: Record<string, unknown>;
}

export interface PanelSettings {
  background?: string;
  backgroundImage?: { src?: string; alt?: string };
  overlay?: number;
  textColor?: string;
  width?: "narrow" | "normal" | "wide";
  paddingY?: number;
  align?: "" | "start" | "center" | "end";
}

export interface SColumns extends SElement {
  type: "eu-columns";
  layout: string;
  gap: number;
}

export interface SPanel extends SElement {
  type: "eu-panel";
  settings: PanelSettings;
}

export interface LexicalState {
  root: SElement;
}

export interface PageMeta {
  title: string;
  slug: string;
  seoDescription?: string;
  noIndex?: boolean;
  background?: string;
}

export interface PageData {
  meta: PageMeta;
  content: LexicalState;
}

export const COLUMN_LAYOUTS: Record<string, string> = {
  "1-1": "1fr 1fr",
  "1-2": "1fr 2fr",
  "2-1": "2fr 1fr",
  "1-1-1": "1fr 1fr 1fr",
  "1-1-1-1": "1fr 1fr 1fr 1fr",
};

/* --------------------------------------------------------- builders */

export function block(blockType: string, props: Record<string, unknown>): SBlock {
  return { type: "eu-block", version: 1, blockType, props };
}

export function text(value: string, format = 0, style = ""): SText {
  return { type: "text", version: 1, text: value, format, style, mode: "normal", detail: 0 };
}

const element = (type: string, children: SNode[], extra: Record<string, unknown> = {}): SElement => ({
  type,
  version: 1,
  direction: "rtl",
  format: "",
  indent: 0,
  children,
  ...extra,
});

export const paragraph = (children: SNode[] = [], format = "") =>
  element("paragraph", children, { format, textFormat: 0, textStyle: "" });

export const heading = (tag: "h1" | "h2" | "h3" | "h4", children: SNode[], format = "") =>
  element("heading", children, { tag, format });

export function rootState(children: SNode[]): LexicalState {
  return { root: { ...element("root", children), type: "root" } };
}
