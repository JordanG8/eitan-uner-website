"use client";

import { $createLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, $isListNode, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { $getSelectionStyleValueForProperty, $patchStyleText, $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType, $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isTextNode,
  $isNodeSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type ElementFormatType,
  type LexicalNode,
  type TextFormatType,
} from "lexical";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BLOCK_DEFS, BLOCK_GROUPS } from "@/blocks/fields";
import type { BlockType } from "@/blocks/render";
import { COLUMN_LAYOUTS } from "@/lexical/doc";
import { $createBlockNode, $createColumnNode, $createColumnsNode, $createPanelNode, $isBlockNode } from "@/lexical/nodes";
import { FONTS, fontStack } from "@/lib/fonts";

/**
 * The formatting toolbar: everything that changes how text looks, plus the
 * "insert" menu for sections, elements, columns and panels.
 */

const bar: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 4,
  padding: "6px 10px",
  background: "#fff",
  borderBottom: "1px solid #d0d7de",
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
  lineHeight: 1.3,
};

const tbtn = (active = false): CSSProperties => ({
  minWidth: 30,
  height: 30,
  padding: "0 7px",
  border: "1px solid " + (active ? "#0e6a69" : "transparent"),
  borderRadius: 6,
  background: active ? "#e6f2f1" : "transparent",
  color: "#1f2328",
  cursor: "pointer",
  fontSize: 14,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
});

const sel: CSSProperties = { height: 30, border: "1px solid #d0d7de", borderRadius: 6, padding: "0 6px", fontSize: 13, background: "#fff", maxWidth: 170 };
const sep = <span aria-hidden="true" style={{ width: 1, height: 22, background: "#d0d7de", margin: "0 4px" }} />;

const SIZES = ["", "12px", "14px", "16px", "17px", "18px", "20px", "24px", "28px", "32px", "40px", "48px", "56px", "64px", "80px"];

type BlockKind = "paragraph" | "h1" | "h2" | "h3" | "h4" | "quote" | "bullet" | "number" | "other";

function Menu({ label, children }: { label: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ ...tbtn(open), background: "#0e6a69", color: "#fff", fontWeight: 700, padding: "0 12px" }}>
        {label}
      </button>
      {open && (
        <div role="menu" style={{ position: "absolute", insetInlineStart: 0, top: 34, zIndex: 50, width: 300, maxHeight: "70vh", overflow: "auto", background: "#fff", border: "1px solid #d0d7de", borderRadius: 10, boxShadow: "0 18px 40px rgb(0 0 0 / .18)", padding: 8 }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const menuItem: CSSProperties = { display: "block", width: "100%", textAlign: "start", padding: "7px 10px", border: 0, background: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 };
const menuTitle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#6b7785", padding: "8px 10px 4px" };

function ColorButton({ title, icon, onPick }: { title: string; icon: string; onPick: (v: string | null) => void }) {
  const [value, setValue] = useState("#0b3436");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", border: "1px solid #d0d7de", borderRadius: 6, height: 30, overflow: "hidden" }} title={title}>
      <label style={{ ...tbtn(), border: 0, borderRadius: 0, position: "relative" }}>
        <span aria-hidden="true" style={{ borderBottom: `3px solid ${value}`, lineHeight: 1 }}>{icon}</span>
        <input
          type="color"
          aria-label={title}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onPick(e.target.value);
          }}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
        />
      </label>
      <button type="button" aria-label={`${title} — איפוס`} onClick={() => onPick(null)} style={{ ...tbtn(), border: 0, borderRadius: 0, minWidth: 22, fontSize: 11, color: "#6b7785" }}>✕</button>
    </span>
  );
}

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    highlight: false,
    link: false,
    kind: "paragraph" as BlockKind,
    align: "" as string,
    font: "",
    size: "",
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const refresh = useCallback(() => {
    const s = $getSelection();
    if (!$isRangeSelection(s)) return;
    const anchor = s.anchor.getNode();
    let top: LexicalNode | null = anchor.getKey() === "root" ? anchor : $findMatchingParent(anchor, (n) => {
      const parent = n.getParent();
      return parent !== null && $isRootOrShadowRoot(parent);
    });
    if (top === null) top = anchor.getTopLevelElementOrThrow();
    let kind: BlockKind = "other";
    if ($isListNode(top)) {
      const list = $getNearestNodeOfType(anchor, ListNode);
      kind = (list ?? top).getListType() === "number" ? "number" : "bullet";
    } else if ($isHeadingNode(top)) {
      const tag = top.getTag();
      kind = (["h1", "h2", "h3", "h4"].includes(tag) ? tag : "h4") as BlockKind;
    } else if (top?.getType() === "quote") kind = "quote";
    else if (top?.getType() === "paragraph") kind = "paragraph";
    const parent = anchor.getParent();
    const font = $getSelectionStyleValueForProperty(s, "font-family", "");
    setState({
      bold: s.hasFormat("bold"),
      italic: s.hasFormat("italic"),
      underline: s.hasFormat("underline"),
      strikethrough: s.hasFormat("strikethrough"),
      highlight: s.hasFormat("highlight"),
      link: $isLinkNode(parent) || $isLinkNode(anchor),
      kind,
      align: $isElementNode(top) ? top.getFormatType() : "",
      font: FONTS.find((f) => fontStack(f.name) === font)?.name ?? "",
      size: $getSelectionStyleValueForProperty(s, "font-size", ""),
    });
  }, []);

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => editorState.read(refresh)),
        editor.registerCommand(SELECTION_CHANGE_COMMAND, () => (refresh(), false), COMMAND_PRIORITY_LOW),
        editor.registerCommand(CAN_UNDO_COMMAND, (v) => (setCanUndo(v), false), COMMAND_PRIORITY_LOW),
        editor.registerCommand(CAN_REDO_COMMAND, (v) => (setCanRedo(v), false), COMMAND_PRIORITY_LOW)
      ),
    [editor, refresh]
  );

  const format = (f: TextFormatType) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, f);
  const align = (a: ElementFormatType) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, a);
  const style = (patch: Record<string, string | null>) => {
    editor.update(() => {
      const s = $getSelection();
      if (s) $patchStyleText(s, patch);
    });
    // Back to the text, so typing continues with the new style.
    editor.focus();
  };

  function setKind(kind: BlockKind) {
    if (kind === "bullet" || kind === "number") {
      const current = state.kind === kind;
      editor.dispatchCommand(current ? REMOVE_LIST_COMMAND : kind === "bullet" ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND, undefined);
      editor.focus();
      return;
    }
    editor.update(() => {
      const s = $getSelection();
      if (!$isRangeSelection(s)) return;
      if (state.kind === "bullet" || state.kind === "number") editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      if (kind === "paragraph") $setBlocksType(s, () => $createParagraphNode());
      else if (kind === "quote") $setBlocksType(s, () => $createQuoteNode());
      else $setBlocksType(s, () => $createHeadingNode(kind as HeadingTagType));
    });
    editor.focus();
  }

  function link() {
    if (state.link) return editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    const url = prompt("כתובת הקישור (עמוד באתר: ‎/שם-העמוד‎, או https://…)");
    if (!url) return;
    editor.update(() => {
      const s = $getSelection();
      if ($isRangeSelection(s) && s.isCollapsed()) {
        // No text selected: insert the address itself as a link.
        const node = $createLinkNode(url).append($createTextNode(url));
        s.insertNodes([node]);
      } else {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url, target: /^https?:/.test(url) ? "_blank" : null });
      }
    });
  }

  function insertBlock(type: BlockType) {
    editor.update(() => {
      const node = $createBlockNode(type, structuredClone(BLOCK_DEFS[type].defaultProps ?? {}));
      const s = $getSelection();
      if ($isNodeSelection(s) && $isBlockNode(s.getNodes()[0])) s.getNodes()[0].insertAfter(node);
      else $insertNodeToNearestRoot(node);
      const ns = $createNodeSelection();
      ns.add(node.getKey());
      $setSelection(ns);
    });
  }

  function insertColumns(layout: string) {
    editor.update(() => {
      const count = COLUMN_LAYOUTS[layout].split(" ").length;
      const columns = $createColumnsNode(layout, 32);
      for (let i = 0; i < count; i++) columns.append($createColumnNode().append($createParagraphNode().append($createTextNode(`עמודה ${i + 1}`))));
      $insertNodeToNearestRoot(columns);
      const first = columns.getFirstDescendant();
      if ($isTextNode(first)) first.select(0, first.getTextContentSize());
    });
    editor.focus();
  }

  function insertPanel() {
    editor.update(() => {
      const panel = $createPanelNode({ background: "var(--color-surface-alt)" });
      const h = $createHeadingNode("h2").append($createTextNode("כותרת"));
      const p = $createParagraphNode().append($createTextNode("טקסט בתוך קטע צבעוני. בחרו את הקטע כדי לשנות צבע, רקע ורוחב."));
      panel.append(h, p);
      $insertNodeToNearestRoot(panel);
      p.selectEnd();
    });
    editor.focus();
  }

  return (
    <div
      role="toolbar"
      aria-label="עיצוב טקסט"
      dir="rtl"
      style={bar}
      // Buttons must not take focus from the text: the selection they act on
      // lives there. Selects and colour pickers still need it to open.
      onMouseDown={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("button") && !t.closest("[role=menu]")) e.preventDefault();
      }}
    >
      <Menu label="➕ הוספה">
        {(close) => (
          <>
            <div style={menuTitle}>פריסה</div>
            <button type="button" style={menuItem} onClick={() => (insertPanel(), close())}>קטע צבעוני (רקע, צבע טקסט, רוחב)</button>
            {Object.keys(COLUMN_LAYOUTS).map((l) => (
              <button key={l} type="button" style={menuItem} onClick={() => (insertColumns(l), close())}>
                עמודות {l.replace(/-/g, ":")}
              </button>
            ))}
            <button type="button" style={menuItem} onClick={() => (editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined), close())}>קו מפריד פשוט</button>
            {BLOCK_GROUPS.map((g) => (
              <div key={g.title}>
                <div style={menuTitle}>{g.title}</div>
                {g.types.map((t) => (
                  <button key={t} type="button" style={menuItem} onClick={() => (insertBlock(t), close())}>
                    {BLOCK_DEFS[t].label}
                  </button>
                ))}
              </div>
            ))}
          </>
        )}
      </Menu>
      {sep}
      <button type="button" aria-label="ביטול" title="ביטול (Ctrl+Z)" disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} style={{ ...tbtn(), opacity: canUndo ? 1 : 0.4 }}>↶</button>
      <button type="button" aria-label="ביצוע מחדש" title="ביצוע מחדש" disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} style={{ ...tbtn(), opacity: canRedo ? 1 : 0.4 }}>↷</button>
      {sep}
      <select aria-label="סוג פסקה" value={state.kind === "other" ? "paragraph" : state.kind} onChange={(e) => setKind(e.target.value as BlockKind)} style={sel}>
        <option value="paragraph">טקסט רגיל</option>
        <option value="h1">כותרת ראשית</option>
        <option value="h2">כותרת 2</option>
        <option value="h3">כותרת 3</option>
        <option value="h4">כותרת 4</option>
        <option value="quote">ציטוט</option>
        <option value="bullet">רשימה</option>
        <option value="number">רשימה ממוספרת</option>
      </select>
      <select aria-label="גופן" value={state.font} onChange={(e) => style({ "font-family": e.target.value ? fontStack(e.target.value) : null })} style={sel}>
        <option value="">גופן האתר</option>
        {FONTS.map((f) => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>
      <select aria-label="גודל" value={state.size} onChange={(e) => style({ "font-size": e.target.value || null })} style={{ ...sel, width: 80 }}>
        {SIZES.map((s) => (
          <option key={s} value={s}>{s ? s.replace("px", "") : "גודל"}</option>
        ))}
      </select>
      {sep}
      <button type="button" aria-label="מודגש" title="מודגש (Ctrl+B)" aria-pressed={state.bold} onClick={() => format("bold")} style={{ ...tbtn(state.bold), fontWeight: 800 }}>B</button>
      <button type="button" aria-label="נטוי" title="נטוי (Ctrl+I)" aria-pressed={state.italic} onClick={() => format("italic")} style={{ ...tbtn(state.italic), fontStyle: "italic" }}>I</button>
      <button type="button" aria-label="קו תחתון" title="קו תחתון (Ctrl+U)" aria-pressed={state.underline} onClick={() => format("underline")} style={{ ...tbtn(state.underline), textDecoration: "underline" }}>U</button>
      <button type="button" aria-label="קו חוצה" aria-pressed={state.strikethrough} onClick={() => format("strikethrough")} style={{ ...tbtn(state.strikethrough), textDecoration: "line-through" }}>S</button>
      <button type="button" aria-label="סימון" aria-pressed={state.highlight} onClick={() => format("highlight")} style={tbtn(state.highlight)}>🖍</button>
      <button type="button" aria-label="קישור" aria-pressed={state.link} onClick={link} style={tbtn(state.link)}>🔗</button>
      <ColorButton title="צבע טקסט" icon="A" onPick={(v) => style({ color: v })} />
      <ColorButton title="צבע רקע לטקסט" icon="▆" onPick={(v) => style({ "background-color": v })} />
      {sep}
      <button type="button" aria-label="יישור לימין" aria-pressed={state.align === "right"} onClick={() => align("right")} style={tbtn(state.align === "right")}>⇶</button>
      <button type="button" aria-label="יישור למרכז" aria-pressed={state.align === "center"} onClick={() => align("center")} style={tbtn(state.align === "center")}>≡</button>
      <button type="button" aria-label="יישור לשמאל" aria-pressed={state.align === "left"} onClick={() => align("left")} style={tbtn(state.align === "left")}>⇷</button>
      <button type="button" aria-label="יישור לשני הצדדים" aria-pressed={state.align === "justify"} onClick={() => align("justify")} style={tbtn(state.align === "justify")}>☰</button>
      {sep}
      <button
        type="button"
        aria-label="ניקוי עיצוב"
        title="ניקוי עיצוב"
        onClick={() =>
          editor.update(() => {
            const s = $getSelection();
            if (!$isRangeSelection(s)) return;
            $patchStyleText(s, { "font-family": null, "font-size": null, color: null, "background-color": null });
            for (const f of ["bold", "italic", "underline", "strikethrough", "highlight"] as TextFormatType[]) if (s.hasFormat(f)) s.formatText(f);
          })
        }
        style={tbtn()}
      >
        ⌫ עיצוב
      </button>
    </div>
  );
}
