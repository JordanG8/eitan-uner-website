"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import { $getNodeByKey, $getSelection, $isNodeSelection, $isRangeSelection, SKIP_DOM_SELECTION_TAG, type NodeKey } from "lexical";
import { useEffect, useState, type CSSProperties } from "react";
import { BLOCK_DEFS } from "@/blocks/fields";
import type { BlockType } from "@/blocks/render";
import { COLUMN_LAYOUTS, type PageMeta, type PanelSettings } from "@/lexical/doc";
import { $isBlockNode, $isColumnsNode, $isPanelNode, blockAction, type BlockNode, type ColumnsNode, type PanelNode } from "@/lexical/nodes";
import { colorField, imageField, rangeField } from "./fields";
import { FieldsForm } from "./Form";
import type { Fields } from "./schema";

/**
 * The settings panel beside the page. It follows the cursor: a selected
 * section shows that section's fields; a cursor inside a coloured panel or
 * columns shows their settings; otherwise the page's own settings.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Target =
  | { kind: "page" }
  | { kind: "block"; key: NodeKey; type: string; props: Record<string, unknown> }
  | { kind: "panel"; key: NodeKey; settings: PanelSettings }
  | { kind: "columns"; key: NodeKey; layout: string; gap: number };

const panelFields: Fields = {
  background: colorField("צבע רקע"),
  backgroundImage: imageField("תמונת רקע"),
  overlay: rangeField("הכהיית תמונת הרקע", 0, 90, 0, "%"),
  textColor: colorField("צבע טקסט"),
  width: { type: "radio", label: "רוחב הטקסט", options: [{ label: "צר", value: "narrow" }, { label: "רגיל", value: "normal" }, { label: "רחב", value: "wide" }] },
  align: { type: "radio", label: "יישור", options: [{ label: "ימין", value: "start" }, { label: "מרכז", value: "center" }, { label: "שמאל", value: "end" }] },
  paddingY: rangeField("ריווח למעלה ולמטה", 0, 240, 72, "px", 4),
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

export function SidePanel({ meta, onMeta, isHome }: { meta: PageMeta; onMeta: (m: PageMeta) => void; isHome: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [target, setTarget] = useState<Target>({ kind: "page" });
  const [pinPage, setPinPage] = useState(false);

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const s = $getSelection();
          if ($isNodeSelection(s)) {
            const node = s.getNodes()[0];
            if ($isBlockNode(node)) return setTarget({ kind: "block", key: node.getKey(), type: node.getBlockType(), props: node.getProps() });
          }
          if ($isRangeSelection(s)) {
            const anchor = s.anchor.getNode();
            const panel = $findMatchingParent(anchor, $isPanelNode) as PanelNode | null;
            const cols = $findMatchingParent(anchor, $isColumnsNode) as ColumnsNode | null;
            // The innermost container wins.
            if (cols && (!panel || panel.isParentOf(cols))) return setTarget({ kind: "columns", key: cols.getKey(), ...cols.getLayout() });
            if (panel) return setTarget({ kind: "panel", key: panel.getKey(), settings: panel.getSettings() });
          }
          setTarget({ kind: "page" });
        });
      }),
    [editor]
  );

  const update = (fn: () => void) => editor.update(fn, { tag: SKIP_DOM_SELECTION_TAG });
  const show = pinPage ? ({ kind: "page" } as Target) : target;

  return (
    <aside dir="rtl" aria-label="הגדרות" style={{ width: 360, flex: "0 0 360px", borderInlineStart: "1px solid #d0d7de", background: "#fff", overflowY: "auto", padding: 16, fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 1.4, color: "#1f2328" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <button type="button" onClick={() => setPinPage(false)} style={{ ...small(), ...(pinPage ? {} : { background: "#0e6a69", color: "#fff", borderColor: "#0e6a69" }) }}>הפריט שנבחר</button>
        <button type="button" onClick={() => setPinPage(true)} style={{ ...small(), ...(pinPage ? { background: "#0e6a69", color: "#fff", borderColor: "#0e6a69" } : {}) }}>הגדרות העמוד</button>
      </div>

      {show.kind === "page" && (
        <>
          <div style={head}>הגדרות העמוד</div>
          <p style={hint}>לחצו על קטע בעמוד כדי לערוך אותו, או כתבו ישירות בטקסט. סמנו טקסט כדי לעצב אותו בסרגל למעלה.</p>
          <FieldsForm
            fields={isHome ? Object.fromEntries(Object.entries(pageFields).filter(([k]) => k !== "slug")) : pageFields}
            value={meta as any}
            onChange={(v) => onMeta(v as PageMeta)}
          />
        </>
      )}

      {show.kind === "block" && (
        <>
          <div style={head}>{BLOCK_DEFS[show.type as BlockType]?.label ?? show.type}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 14px" }}>
            <button type="button" style={small()} onClick={() => blockAction(editor, show.key, "up")}>↑ למעלה</button>
            <button type="button" style={small()} onClick={() => blockAction(editor, show.key, "down")}>↓ למטה</button>
            <button type="button" style={small()} onClick={() => blockAction(editor, show.key, "copy")}>⧉ שכפול</button>
            <button type="button" style={small(true)} onClick={() => confirm("למחוק את הקטע?") && blockAction(editor, show.key, "delete")}>✕ מחיקה</button>
          </div>
          {BLOCK_DEFS[show.type as BlockType] ? (
            <FieldsForm
              key={show.key}
              fields={BLOCK_DEFS[show.type as BlockType].fields}
              value={show.props as any}
              onChange={(v) => update(() => ($getNodeByKey(show.key) as BlockNode | null)?.setProps(v))}
            />
          ) : (
            <p style={hint}>סוג קטע לא מוכר.</p>
          )}
        </>
      )}

      {show.kind === "panel" && (
        <>
          <div style={head}>קטע צבעוני</div>
          <p style={hint}>הטקסט בתוך הקטע נערך ישירות בעמוד.</p>
          <FieldsForm key={show.key} fields={panelFields} value={show.settings as any} onChange={(v) => update(() => ($getNodeByKey(show.key) as PanelNode | null)?.setSettings(v as PanelSettings))} />
          <button type="button" style={small(true)} onClick={() => confirm("למחוק את הקטע הצבעוני וכל מה שבתוכו?") && editor.update(() => $getNodeByKey(show.key)?.remove())}>✕ מחיקת הקטע</button>
        </>
      )}

      {show.kind === "columns" && (
        <>
          <div style={head}>עמודות</div>
          <p style={hint}>כל עמודה נערכת ישירות בעמוד. בטלפון העמודות מוצגות אחת מתחת לשנייה.</p>
          <FieldsForm
            key={show.key}
            fields={columnsFields}
            value={{ layout: show.layout, gap: show.gap }}
            onChange={(v) => update(() => ($getNodeByKey(show.key) as ColumnsNode | null)?.setLayout(String(v.layout), Number(v.gap === "" || v.gap === undefined ? 32 : v.gap)))}
          />
          <button type="button" style={small(true)} onClick={() => confirm("למחוק את העמודות וכל מה שבתוכן?") && editor.update(() => $getNodeByKey(show.key)?.remove())}>✕ מחיקת העמודות</button>
        </>
      )}
    </aside>
  );
}
