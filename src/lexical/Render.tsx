import type { CSSProperties, ReactNode } from "react";
import { renderBlock, type RenderContext } from "@/blocks/render";
import { FontLinks } from "@/components/design";
import { safeHref } from "@/components/primitives";
import { FONTS } from "@/lib/fonts";
import {
  COLUMN_LAYOUTS,
  FORMAT,
  THEME,
  type LexicalState,
  type PanelSettings,
  type SBlock,
  type SColumns,
  type SElement,
  type SNode,
  type SPanel,
  type SText,
} from "./doc";
import { spacingStyle, type Spacing } from "./spacing";

/**
 * Saved Lexical JSON → the page's React tree.
 *
 * Walks the serialized state directly instead of booting a headless Lexical
 * editor, so it runs as a server component with no DOM and ships nothing to
 * visitors. The markup mirrors what Lexical itself produces in the editor
 * (same tags, same theme classes), so a page reads identically in both.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ----------------------------------------------------- shared styling */

/** CSS variables for a coloured panel — used here and by the editor node. */
export function panelVars(s: PanelSettings = {}): Record<string, string> {
  const vars: Record<string, string> = {};
  const bg = [
    s.backgroundImage?.src ? `url("${s.backgroundImage.src.replace(/"/g, "%22")}") center / cover no-repeat` : "",
    s.background || "",
  ].filter(Boolean).join(", ");
  if (bg) vars["--panel-bg"] = bg;
  if (s.backgroundImage?.src && Number(s.overlay) > 0) vars["--panel-overlay"] = `rgb(0 0 0 / ${Math.min(90, Number(s.overlay))}%)`;
  if (s.textColor) {
    vars["--color-ink"] = s.textColor;
    vars["--color-ink-soft"] = `color-mix(in srgb, ${s.textColor} 78%, transparent)`;
  }
  if (s.width === "narrow") vars["--rt-width"] = "42rem";
  if (s.width === "wide") vars["--rt-width"] = "var(--container-content)";
  if (s.paddingY !== undefined && s.paddingY !== null && !Number.isNaN(Number(s.paddingY))) vars["--panel-py"] = `${Number(s.paddingY)}px`;
  if (s.align) vars["--panel-align"] = s.align;
  return vars;
}

export function columnsVars(layout: string, gap: number): Record<string, string> {
  return { "--cols": COLUMN_LAYOUTS[layout] ?? COLUMN_LAYOUTS["1-1"], "--cols-gap": `${Number.isFinite(gap) ? gap : 32}px` };
}

/** The only inline text styles the editor's toolbar sets. */
const STYLE_PROPS: Record<string, keyof CSSProperties> = {
  "font-family": "fontFamily",
  "font-size": "fontSize",
  color: "color",
  "background-color": "backgroundColor",
  "font-weight": "fontWeight",
  "letter-spacing": "letterSpacing",
};

function parseStyle(style: string | undefined, fonts: Set<string>): CSSProperties | undefined {
  if (!style) return undefined;
  const out: Record<string, string> = {};
  for (const decl of style.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim().toLowerCase();
    const value = decl.slice(i + 1).trim();
    const key = STYLE_PROPS[prop];
    if (!key || !value || /url\(|expression|[<>]/i.test(value)) continue;
    out[key] = value;
    if (prop === "font-family") {
      const name = value.split(",")[0].replace(/["']/g, "").trim();
      if (FONTS.some((f) => f.name === name)) fonts.add(name);
    }
  }
  return Object.keys(out).length ? (out as CSSProperties) : undefined;
}

/** Margin/padding saved through the editor's NodeState ("$": { spacing }). */
function nodeSpacing(node: SNode): CSSProperties | undefined {
  const state = node.$ as { spacing?: Spacing } | undefined;
  return spacingStyle(state?.spacing);
}

function blockStyle(node: SElement): CSSProperties | undefined {
  const style: CSSProperties = { ...nodeSpacing(node) };
  if (typeof node.format === "string" && node.format) style.textAlign = node.format as CSSProperties["textAlign"];
  if (node.indent) style.paddingInlineStart = `calc(${node.indent} * 40px)`;
  return Object.keys(style).length ? style : undefined;
}

/* --------------------------------------------------------------- text */

function renderText(node: SText, key: number, fonts: Set<string>): ReactNode {
  const f = node.format ?? 0;
  const style = parseStyle(node.style, fonts);
  if (!f && !style) return node.text;

  const classes: string[] = [];
  if (f & FORMAT.bold) classes.push(THEME.text.bold);
  if (f & FORMAT.italic) classes.push(THEME.text.italic);
  if (f & FORMAT.underline && f & FORMAT.strikethrough) classes.push(THEME.text.underlineStrikethrough);
  else if (f & FORMAT.underline) classes.push(THEME.text.underline);
  else if (f & FORMAT.strikethrough) classes.push(THEME.text.strikethrough);
  if (f & FORMAT.code) classes.push(THEME.text.code);
  if (f & FORMAT.highlight) classes.push(THEME.text.highlight);
  if (f & FORMAT.subscript) classes.push(THEME.text.subscript);
  if (f & FORMAT.superscript) classes.push(THEME.text.superscript);

  // Same nesting as Lexical's TextNode: an outer semantic tag, then strong/em.
  const Inner = f & FORMAT.bold ? "strong" : f & FORMAT.italic ? "em" : "span";
  const inner = (
    <Inner key={key} className={classes.join(" ") || undefined} style={style}>
      {node.text}
    </Inner>
  );
  const Outer = f & FORMAT.code ? "code" : f & FORMAT.highlight ? "mark" : f & FORMAT.subscript ? "sub" : f & FORMAT.superscript ? "sup" : null;
  return Outer ? <Outer key={key}>{inner}</Outer> : inner;
}

/* ----------------------------------------------------------- elements */

function children(node: SElement, ctx: RenderContext, fonts: Set<string>): ReactNode[] {
  return (node.children ?? []).map((child, i) => renderNode(child, i, ctx, fonts));
}

function renderNode(node: SNode, key: number, ctx: RenderContext, fonts: Set<string>): ReactNode {
  const el = node as SElement;
  const dir = el.direction ?? undefined;

  switch (node.type) {
    case "text":
      return renderText(node as SText, key, fonts);
    case "linebreak":
      return <br key={key} />;
    case "tab":
      return <span key={key}>{"\t"}</span>;
    case "paragraph": {
      const kids = children(el, ctx, fonts);
      return (
        <p key={key} className={THEME.paragraph} dir={dir} style={blockStyle(el)}>
          {kids.length ? kids : <br />}
        </p>
      );
    }
    case "heading": {
      const tag = String(node.tag ?? "h2");
      const Tag = (/^h[1-6]$/.test(tag) ? tag : "h2") as "h1";
      return (
        <Tag key={key} className={THEME.heading[Tag]} dir={dir} style={blockStyle(el)}>
          {children(el, ctx, fonts)}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote key={key} className={THEME.quote} dir={dir} style={blockStyle(el)}>
          {children(el, ctx, fonts)}
        </blockquote>
      );
    case "list": {
      const ordered = node.listType === "number";
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag key={key} className={ordered ? THEME.list.ol : THEME.list.ul} dir={dir} style={nodeSpacing(node)} start={ordered && Number(node.start) > 1 ? Number(node.start) : undefined}>
          {children(el, ctx, fonts)}
        </Tag>
      );
    }
    case "listitem": {
      const nested = el.children?.length > 0 && el.children.every((c) => c.type === "list");
      return (
        <li key={key} className={nested ? `${THEME.list.listitem} ${THEME.list.nested.listitem}` : THEME.list.listitem} value={Number(node.value) || undefined} style={blockStyle(el)}>
          {children(el, ctx, fonts)}
        </li>
      );
    }
    case "link":
    case "autolink": {
      const href = safeHref(String(node.url ?? ""));
      const external = Boolean(href && /^https?:/i.test(href)) || node.target === "_blank";
      return (
        <a key={key} className={THEME.link} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children(el, ctx, fonts)}
        </a>
      );
    }
    case "horizontalrule":
      return <hr key={key} className={THEME.hr} />;
    case "eu-block": {
      const b = node as SBlock;
      return (
        <div key={key} className="eu-block-node">
          {renderBlock(b.blockType, b.props, ctx)}
        </div>
      );
    }
    case "eu-columns": {
      const c = node as SColumns;
      return (
        <div key={key} className="eu-columns" style={{ ...columnsVars(c.layout, c.gap), ...nodeSpacing(c) } as Vars}>
          {children(el, ctx, fonts)}
        </div>
      );
    }
    case "eu-column":
      return (
        <div key={key} className="eu-column">
          {children(el, ctx, fonts)}
        </div>
      );
    case "eu-panel": {
      const p = node as SPanel;
      return (
        <section key={key} className="eu-panel" style={{ ...panelVars(p.settings), ...nodeSpacing(p) } as Vars}>
          {children(el, ctx, fonts)}
        </section>
      );
    }
    default:
      return Array.isArray(el.children) ? <span key={key}>{children(el, ctx, fonts)}</span> : null;
  }
}

/** A whole page body. */
export function LexicalContent({ state, ctx }: { state: LexicalState | null | undefined; ctx: RenderContext }) {
  const fonts = new Set<string>();
  const body = state?.root ? children(state.root, ctx, fonts) : [];
  return (
    <div className="eu-doc">
      {fonts.size > 0 && <FontLinks fonts={[...fonts]} />}
      {body}
    </div>
  );
}
