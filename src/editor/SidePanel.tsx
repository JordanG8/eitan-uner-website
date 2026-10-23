"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from "@lexical/rich-text";
import {
  $createParagraphNode,
  $getNodeByKey,
  $isElementNode,
  getStyleObjectFromCSS,
  $getSelection,
  $getState,
  $isNodeSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $setState,
  SKIP_DOM_SELECTION_TAG,
  type LexicalNode,
  type NodeKey,
} from "lexical";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BLOCK_DEFS } from "@/blocks/fields";
import type { BlockType } from "@/blocks/render";
import type { BlockDesign } from "@/components/design";
import { COLUMN_LAYOUTS, type PageMeta, type PanelSettings } from "@/lexical/doc";
import { $isBlockNode, $isColumnsNode, $isPanelNode, blockAction, spacingState, type BlockNode, type ColumnsNode, type PanelNode } from "@/lexical/nodes";
import type { Spacing } from "@/lexical/spacing";
import { colorField, DesignPanel, fontField, imageField, rangeField, SpacingControls } from "./fields";
import { FONTS, fontStack } from "@/lib/fonts";
import { FieldsForm } from "./Form";
import type { Fields } from "./schema";

/**
 * The settings panel beside the page, modelled on Elementor's: it follows
 * what is selected, with a breadcrumb up through the containers it sits in
 * (paragraph → coloured panel → page), and Content / Style / Advanced tabs
 * for sections. Margin and padding are under Advanced, as in Elementor.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Target =
  | { kind: "page" }
  | { kind: "block"; key: NodeKey; type: string; props: Record<string, unknown> }
  | { kind: "panel"; key: NodeKey; settings: PanelSettings; spacing?: Spacing }
  | { kind: "columns"; key: NodeKey; layout: string; gap: number; spacing?: Spacing }
  | { kind: "element"; key: NodeKey; label: string; spacing?: Spacing; text: TextProps };

/** A text element's look, as the inspector shows and edits it. */
interface TextProps {
  kind: string;
  align: string;
  font: string;
  size: string;
  color: string;
  highlight: string;
}

const ELEMENT_LABEL: Record<string, string> = { paragraph: "פסקה", heading: "כותרת", quote: "ציטוט", list: "רשימה" };

function label(t: Target): string {
  if (t.kind === "page") return "עמוד";
  if (t.kind === "block") return BLOCK_DEFS[t.type as BlockType]?.label ?? t.type;
  if (t.kind === "panel") return "קטע צבעוני";
  if (t.kind === "columns") return "עמודות";
  return t.label;
}

const panelFields: Fields = {
  background: colorField("צבע רקע"),
  backgroundImage: imageField("תמונת רקע"),
  overlay: rangeField("הכהיית תמונת הרקע", 0, 90, 0, "%"),
  textColor: colorField("צבע טקסט"),
  width: { type: "radio", label: "רוחב הטקסט", options: [{ label: "צר", value: "narrow" }, { label: "רגיל", value: "normal" }, { label: "רחב", value: "wide" }] },
  align: { type: "radio", label: "יישור", options: [{ label: "ימין", value: "start" }, { label: "מרכז", value: "center" }, { label: "שמאל", value: "end" }] },
};

const columnsFields: Fields = {
  layout: { type: "select", label: "חלוקה", options: Object.keys(COLUMN_LAYOUTS).map((k) => ({ value: k, label: `${k.split("-").length} עמודות (${k.replace(/-/g, ":")})` })) },
  gap: rangeField("רווח בין העמודות", 0, 160, 32, "px", 4),
};

const pageFields: Fields = {
  title: { type: "text", label: "שם העמוד (בלשונית הדפדפן ובגוגל)" },
  slug: { type: "text", label: "כתובת העמוד (אחרי הסלאש)" },
  seoDescription: { type: "textarea", label: "תיאור לגוגל ולשיתוף ברשתות" },
  background: colorField("צבע רקע לעמוד"),
  noIndex: { type: "radio", label: "להסתיר מגוגל", options: [{ label: "כן", value: true }, { label: "לא", value: false }] },
};

const head: CSSProperties = { fontSize: 15, fontWeight: 800, marginBottom: 4 };
const hint: CSSProperties = { fontSize: 12, color: "#6b7785", marginBottom: 14, lineHeight: 1.5 };
const small = (danger = false): CSSProperties => ({ padding: "5px 10px", borderRadius: 6, border: `1px solid ${danger ? "#f0b4ae" : "#d0d7de"}`, background: "#fff", color: danger ? "#b42318" : "#1f2328", cursor: "pointer", fontSize: 12, fontWeight: 600 });
const tab = (on: boolean): CSSProperties => ({ flex: 1, padding: "8px 4px", border: 0, borderBottom: `3px solid ${on ? "#0e6a69" : "transparent"}`, background: "none", cursor: "pointer", fontSize: 13, fontWeight: on ? 800 : 600, color: on ? "#0e6a69" : "#57606a" });

function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string][] }) {
  return (
    <div role="tablist" style={{ display: "flex", borderBottom: "1px solid #d0d7de", margin: "4px 0 14px" }}>
      {items.map(([k, l]) => (
        <button key={k} type="button" role="tab" aria-selected={value === k} onClick={() => onChange(k)} style={tab(value === k)}>
          {l}
        </button>
      ))}
    </div>
  );
}

/** Sets (or, with null, removes) inline styles on every piece of text in an element. */
function $styleAllText(node: LexicalNode, patch: Record<string, string | null>) {
  if (!$isElementNode(node)) return;
  for (const t of node.getAllTextNodes()) {
    const style: Record<string, string> = { ...getStyleObjectFromCSS(t.getStyle()) };
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) delete style[k];
      else style[k] = v;
    }
    t.setStyle(Object.entries(style).map(([k, v]) => `${k}: ${v};`).join(" "));
  }
}

function $textProps(node: LexicalNode): TextProps {
  // The first piece of text speaks for the element, as in a word processor.
  const first = $isElementNode(node) ? node.getAllTextNodes()[0] : undefined;
  const css = first ? getStyleObjectFromCSS(first.getStyle()) : {};
  const style = (prop: string) => css[prop] ?? "";
  const font = style("font-family");
  const type = node.getType();
  return {
    kind: type === "heading" ? (node as any).getTag() : type,
    align: $isElementNode(node) ? node.getFormatType() : "",
    font: FONTS.find((f) => fontStack(f.name) === font)?.name ?? "",
    size: style("font-size"),
    color: style("color"),
    highlight: style("background-color"),
  };
}

const SIZES = ["", "12px", "14px", "16px", "17px", "18px", "20px", "24px", "28px", "32px", "40px", "48px", "56px", "64px", "80px"];

const textFields = (isList: boolean): Fields => ({
  ...(isList
    ? {}
    : {
        kind: {
          type: "select",
          label: "סוג",
          options: [
            { value: "paragraph", label: "טקסט רגיל" },
            { value: "h1", label: "כותרת ראשית" },
            { value: "h2", label: "כותרת 2" },
            { value: "h3", label: "כותרת 3" },
            { value: "h4", label: "כותרת 4" },
            { value: "quote", label: "ציטוט" },
          ],
        } as const,
      }),
  align: { type: "radio", label: "יישור", options: [{ label: "ימין", value: "right" }, { label: "מרכז", value: "center" }, { label: "שמאל", value: "left" }, { label: "מיושר", value: "justify" }] },
  font: fontField("גופן"),
  size: { type: "select", label: "גודל", options: SIZES.map((v) => ({ value: v, label: v ? v.replace("px", "") : "כמו באתר" })) },
  color: colorField("צבע טקסט"),
  highlight: colorField("צבע רקע לטקסט"),
});

/** Selected thing first, then each container around it, then the page. */
function $chain(): Target[] {
  const s = $getSelection();
  const out: Target[] = [];
  const add = (n: LexicalNode | null) => {
    for (let node = n; node; node = node.getParent()) {
      if ($isBlockNode(node)) out.push({ kind: "block", key: node.getKey(), type: node.getBlockType(), props: node.getProps() });
      else if ($isPanelNode(node)) out.push({ kind: "panel", key: node.getKey(), settings: node.getSettings(), spacing: $getState(node, spacingState) });
      else if ($isColumnsNode(node)) out.push({ kind: "columns", key: node.getKey(), ...node.getLayout(), spacing: $getState(node, spacingState) });
      else if (ELEMENT_LABEL[node.getType()] && node.getParent() && $isRootOrShadowRoot(node.getParent()!))
        out.push({ kind: "element", key: node.getKey(), label: ELEMENT_LABEL[node.getType()], spacing: $getState(node, spacingState), text: $textProps(node) });
    }
  };
  if ($isNodeSelection(s)) add(s.getNodes()[0] ?? null);
  else if ($isRangeSelection(s)) add(s.anchor.getNode());
  out.push({ kind: "page" });
  return out;
}

export function SidePanel({ meta, onMeta, isHome }: { meta: PageMeta; onMeta: (m: PageMeta) => void; isHome: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [chain, setChain] = useState<Target[]>([{ kind: "page" }]);
  const [level, setLevel] = useState(0);
  const [blockTab, setBlockTab] = useState<"content" | "style" | "advanced">("content");
  const [boxTab, setBoxTab] = useState<"style" | "advanced">("style");
  const lastKeys = useRef("page");

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const next = $chain();
          // A new selection starts at the selected thing; edits to the same
          // one keep whichever breadcrumb level is open.
          const keys = next.map((t) => ("key" in t ? t.key : "page")).join("/");
          if (keys !== lastKeys.current) setLevel(0);
          lastKeys.current = keys;
          setChain(next);
        });
      }),
    [editor]
  );

  const update = (fn: () => void) => editor.update(fn, { tag: SKIP_DOM_SELECTION_TAG });
  const setSpacing = (key: NodeKey, sp: Spacing) =>
    update(() => {
      const node = $getNodeByKey(key);
      if (node) $setState(node, spacingState, sp.margin || sp.padding ? sp : undefined);
    });
  /** Applies whichever text property changed to the whole element. */
  const setText = (key: NodeKey, prev: TextProps, next: TextProps) =>
    update(() => {
      let node = $getNodeByKey(key);
      if (!$isElementNode(node)) return;
      if (next.kind !== prev.kind) {
        const repl =
          next.kind === "paragraph" ? $createParagraphNode() : next.kind === "quote" ? $createQuoteNode() : $createHeadingNode(next.kind as HeadingTagType);
        repl.setFormat(node.getFormatType());
        node = node.replace(repl, true);
      }
      if (next.align !== prev.align && $isElementNode(node)) node.setFormat((next.align || "") as any);
      const patch: Record<string, string | null> = {};
      if (next.font !== prev.font) patch["font-family"] = next.font ? fontStack(next.font) : null;
      if (next.size !== prev.size) patch["font-size"] = next.size || null;
      if (next.color !== prev.color) patch.color = next.color || null;
      if (next.highlight !== prev.highlight) patch["background-color"] = next.highlight || null;
      if (Object.keys(patch).length) $styleAllText(node, patch);
    });
  const show = chain[Math.min(level, chain.length - 1)] ?? { kind: "page" };

  return (
    <aside dir="rtl" aria-label="הגדרות" style={{ width: 360, flex: "0 0 360px", borderInlineStart: "1px solid #d0d7de", background: "#fff", overflowY: "auto", padding: 16, fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 1.4, color: "#1f2328" }}>
      <nav aria-label="מיקום בעמוד" style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", marginBottom: 12, fontSize: 12 }}>
        {[...chain].reverse().map((t, ri) => {
          const i = chain.length - 1 - ri;
          return (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {ri > 0 && <span aria-hidden="true" style={{ color: "#8a949e" }}>←</span>}
              <button type="button" onClick={() => setLevel(i)} aria-current={i === level ? "true" : undefined} style={{ ...small(), padding: "3px 8px", ...(i === level ? { background: "#0e6a69", color: "#fff", borderColor: "#0e6a69" } : {}) }}>
                {label(t)}
              </button>
            </span>
          );
        })}
      </nav>

      {show.kind === "page" && (
        <>
          <div style={head}>הגדרות העמוד</div>
          <p style={hint}>לחצו על טקסט בעמוד כדי לערוך אותו במקום, או על קטע כדי לפתוח את ההגדרות שלו. סמנו טקסט כדי לעצב אותו בסרגל למעלה.</p>
          <FieldsForm
            fields={isHome ? Object.fromEntries(Object.entries(pageFields).filter(([k]) => k !== "slug")) : pageFields}
            value={meta as any}
            onChange={(v) => onMeta(v as PageMeta)}
          />
        </>
      )}

      {show.kind === "block" && (() => {
        const def = BLOCK_DEFS[show.type as BlockType];
        const props = show.props as any;
        const setProps = (v: Record<string, unknown>) => update(() => ($getNodeByKey(show.key) as BlockNode | null)?.setProps(v));
        // The design panel is split across the Style and Advanced tabs.
        const contentFields = Object.fromEntries(Object.entries(def?.fields ?? {}).filter(([k]) => k !== "design"));
        return (
          <>
            <div style={head}>{label(show)}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 4px" }}>
              <button type="button" style={small()} onClick={() => blockAction(editor, show.key, "up")}>↑ למעלה</button>
              <button type="button" style={small()} onClick={() => blockAction(editor, show.key, "down")}>↓ למטה</button>
              <button type="button" style={small()} onClick={() => blockAction(editor, show.key, "copy")}>⧉ שכפול</button>
              <button type="button" style={small(true)} onClick={() => confirm("למחוק את הקטע?") && blockAction(editor, show.key, "delete")}>✕ מחיקה</button>
            </div>
            <Tabs value={blockTab} onChange={setBlockTab} items={[["content", "תוכן"], ["style", "עיצוב"], ["advanced", "מתקדם"]]} />
            {!def ? (
              <p style={hint}>סוג קטע לא מוכר.</p>
            ) : blockTab === "content" ? (
              <>
                <p style={hint}>טיפ: אפשר גם ללחוץ ישירות על טקסט בקטע ולערוך אותו במקום.</p>
                <FieldsForm key={show.key} fields={contentFields} value={props} onChange={setProps} />
              </>
            ) : (
              <DesignPanel key={show.key + blockTab} part={blockTab} value={props.design as BlockDesign} onChange={(design) => setProps({ ...props, design })} />
            )}
          </>
        );
      })()}

      {show.kind === "panel" && (
        <>
          <div style={head}>קטע צבעוני</div>
          <p style={hint}>הטקסט בתוך הקטע נערך ישירות בעמוד.</p>
          <Tabs value={boxTab} onChange={setBoxTab} items={[["style", "עיצוב"], ["advanced", "מתקדם"]]} />
          {boxTab === "style" ? (
            <FieldsForm key={show.key} fields={panelFields} value={show.settings as any} onChange={(v) => update(() => ($getNodeByKey(show.key) as PanelNode | null)?.setSettings(v as PanelSettings))} />
          ) : (
            <SpacingControls key={show.key} value={show.spacing} onChange={(sp) => setSpacing(show.key, sp)} />
          )}
          <button type="button" style={small(true)} onClick={() => confirm("למחוק את הקטע הצבעוני וכל מה שבתוכו?") && editor.update(() => $getNodeByKey(show.key)?.remove())}>✕ מחיקת הקטע</button>
        </>
      )}

      {show.kind === "columns" && (
        <>
          <div style={head}>עמודות</div>
          <p style={hint}>כל עמודה נערכת ישירות בעמוד. בטלפון העמודות מוצגות אחת מתחת לשנייה.</p>
          <Tabs value={boxTab} onChange={setBoxTab} items={[["style", "פריסה"], ["advanced", "מתקדם"]]} />
          {boxTab === "style" ? (
            <FieldsForm
              key={show.key}
              fields={columnsFields}
              value={{ layout: show.layout, gap: show.gap }}
              onChange={(v) => update(() => ($getNodeByKey(show.key) as ColumnsNode | null)?.setLayout(String(v.layout), Number(v.gap === "" || v.gap === undefined ? 32 : v.gap)))}
            />
          ) : (
            <SpacingControls key={show.key} value={show.spacing} onChange={(sp) => setSpacing(show.key, sp)} />
          )}
          <button type="button" style={small(true)} onClick={() => confirm("למחוק את העמודות וכל מה שבתוכן?") && editor.update(() => $getNodeByKey(show.key)?.remove())}>✕ מחיקת העמודות</button>
        </>
      )}

      {show.kind === "element" && (
        <>
          <div style={head}>{show.label}</div>
          <p style={hint}>ההגדרות חלות על כל ה{show.label}. לעיצוב חלק מהטקסט — סמנו אותו והשתמשו בסרגל למעלה.</p>
          <Tabs value={boxTab} onChange={setBoxTab} items={[["style", "עיצוב"], ["advanced", "מתקדם"]]} />
          {boxTab === "style" ? (
            <FieldsForm
              key={show.key}
              fields={textFields(show.kind === "element" && show.text.kind === "list")}
              value={show.text as any}
              onChange={(v) => setText(show.key, show.text, v as TextProps)}
            />
          ) : (
            <SpacingControls key={show.key} value={show.spacing} onChange={(sp) => setSpacing(show.key, sp)} />
          )}
        </>
      )}
    </aside>
  );
}
