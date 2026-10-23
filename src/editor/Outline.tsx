"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createNodeSelection,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $parseSerializedNode,
  $setSelection,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";
import { useEffect, useState, type CSSProperties } from "react";
import { BLOCK_DEFS } from "@/blocks/fields";
import type { BlockType } from "@/blocks/render";
import { $isBlockNode, $isColumnNode, $isColumnsNode, $isPanelNode } from "@/lexical/nodes";

/**
 * The page's structure as a tree — Elementor's Navigator. Click an item to
 * select it and scroll to it; drag to reorder it among its siblings; copy or
 * delete it from its row. Reordering uses dnd-kit's sortable lists.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Item {
  key: NodeKey;
  icon: string;
  label: string;
  children?: Item[];
  /** Columns themselves are not reorderable or deletable on their own. */
  fixed?: boolean;
}

const trimText = (s: string, n = 34) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

function $describe(node: LexicalNode, index: number): Item {
  const key = node.getKey();
  if ($isBlockNode(node)) {
    const def = BLOCK_DEFS[node.getBlockType() as BlockType];
    const p = node.getProps() as any;
    const hint = typeof p.title === "string" ? p.title : typeof p.quote === "string" ? p.quote : "";
    return { key, icon: "▦", label: `${def?.label ?? node.getBlockType()}${hint ? ` · ${trimText(hint, 22)}` : ""}` };
  }
  if ($isPanelNode(node)) return { key, icon: "▭", label: "קטע צבעוני", children: node.getChildren().map($describe) };
  if ($isColumnsNode(node)) return { key, icon: "▥", label: "עמודות", children: node.getChildren().map($describe) };
  if ($isColumnNode(node)) return { key, icon: "▯", label: `עמודה ${index + 1}`, children: node.getChildren().map($describe), fixed: true };
  const type = node.getType();
  const text = node.getTextContent();
  if (type === "heading") return { key, icon: "H", label: trimText(text) || "כותרת ריקה" };
  if (type === "list") return { key, icon: "•", label: trimText(text) || "רשימה" };
  if (type === "quote") return { key, icon: "❝", label: trimText(text) || "ציטוט" };
  if (type === "horizontalrule") return { key, icon: "—", label: "קו מפריד" };
  return { key, icon: "¶", label: trimText(text) || "פסקה ריקה" };
}

/** An element with all its children, ready to be inserted as a copy. */
function $exportDeep(node: LexicalNode): SerializedLexicalNode {
  const json: any = node.exportJSON();
  if ($isElementNode(node)) json.children = node.getChildren().map($exportDeep);
  return json;
}

const row = (active: boolean, depth: number): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 8px",
  paddingInlineStart: 8 + depth * 14,
  borderRadius: 6,
  background: active ? "#e6f2f1" : "transparent",
  outline: active ? "1px solid #0e6a69" : "none",
  cursor: "pointer",
  fontSize: 13,
  userSelect: "none",
});
const iconBtn: CSSProperties = { border: 0, background: "none", cursor: "pointer", fontSize: 12, padding: "2px 4px", color: "#57606a" };

function Row({ item, depth, active, onSelect, onCopy, onDelete, collapsed, onToggle }: {
  item: Item;
  depth: number;
  active: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onDelete: () => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key, disabled: item.fixed });
  return (
    <div
      ref={setNodeRef}
      style={{ ...row(active, depth), transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      onClick={onSelect}
      className="eu-outline-row"
    >
      {!item.fixed && (
        <span {...attributes} {...listeners} aria-label="גרירה לשינוי הסדר" title="גרירה לשינוי הסדר" style={{ cursor: "grab", color: "#8a949e", touchAction: "none" }} onClick={(e) => e.stopPropagation()}>
          ⋮⋮
        </span>
      )}
      {item.children ? (
        <button type="button" aria-label={collapsed ? "פתיחה" : "סגירה"} onClick={(e) => (e.stopPropagation(), onToggle())} style={{ ...iconBtn, padding: 0, width: 14 }}>
          {collapsed ? "◂" : "▾"}
        </button>
      ) : (
        <span style={{ width: 14 }} />
      )}
      <span aria-hidden="true" style={{ width: 16, textAlign: "center", color: "#0e6a69", fontWeight: 700 }}>{item.icon}</span>
      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
      {!item.fixed && (
        <span className="eu-outline-actions" style={{ display: "flex" }}>
          <button type="button" aria-label="שכפול" title="שכפול" style={iconBtn} onClick={(e) => (e.stopPropagation(), onCopy())}>⧉</button>
          <button type="button" aria-label="מחיקה" title="מחיקה" style={{ ...iconBtn, color: "#b42318" }} onClick={(e) => (e.stopPropagation(), onDelete())}>✕</button>
        </span>
      )}
    </div>
  );
}

export function Outline({ onClose }: { onClose: () => void }) {
  const [editor] = useLexicalComposerContext();
  const [items, setItems] = useState<Item[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<NodeKey>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<NodeKey>>(new Set());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          // Trailing empty paragraphs are editing scaffolding; leave them out.
          const kids = $getRoot().getChildren();
          while (kids.length && kids[kids.length - 1].getType() === "paragraph" && kids[kids.length - 1].getTextContentSize() === 0) kids.pop();
          setItems(kids.map($describe));
          const s = $getSelection();
          const keys = new Set<NodeKey>();
          if ($isNodeSelection(s)) s.getNodes().forEach((n) => keys.add(n.getKey()));
          if ($isRangeSelection(s)) for (let n: LexicalNode | null = s.anchor.getNode(); n; n = n.getParent()) keys.add(n.getKey());
          setActiveKeys(keys);
        });
      }),
    [editor]
  );

  const select = (key: NodeKey) => {
    editor.update(() => {
      const node = $getNodeByKey(key);
      if (!node) return;
      if ($isBlockNode(node)) {
        const ns = $createNodeSelection();
        ns.add(key);
        $setSelection(ns);
      } else if ($isElementNode(node)) node.selectStart();
    });
    editor.getElementByKey(key)?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const copy = (key: NodeKey) =>
    editor.update(() => {
      const node = $getNodeByKey(key);
      if (node) node.insertAfter($parseSerializedNode($exportDeep(node)));
    });

  const remove = (key: NodeKey) => {
    if (!confirm("למחוק את הפריט?")) return;
    editor.update(() => $getNodeByKey(key)?.remove());
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    editor.update(() => {
      const a = $getNodeByKey(String(active.id));
      const b = $getNodeByKey(String(over.id));
      if (!a || !b || !a.getParent()?.is(b.getParent())) return;
      if (a.getIndexWithinParent() < b.getIndexWithinParent()) b.insertAfter(a);
      else b.insertBefore(a);
    });
  };

  const list = (nodes: Item[], depth: number) => (
    <SortableContext items={nodes.map((n) => n.key)} strategy={verticalListSortingStrategy}>
      {nodes.map((item) => (
        <div key={item.key}>
          <Row
            item={item}
            depth={depth}
            active={activeKeys.has(item.key)}
            onSelect={() => select(item.key)}
            onCopy={() => copy(item.key)}
            onDelete={() => remove(item.key)}
            collapsed={collapsed.has(item.key)}
            onToggle={() =>
              setCollapsed((c) => {
                const next = new Set(c);
                if (next.has(item.key)) next.delete(item.key);
                else next.add(item.key);
                return next;
              })
            }
          />
          {item.children && !collapsed.has(item.key) && list(item.children, depth + 1)}
        </div>
      ))}
    </SortableContext>
  );

  return (
    <aside dir="rtl" aria-label="מבנה העמוד" style={{ width: 280, flex: "0 0 280px", borderInlineEnd: "1px solid #d0d7de", background: "#fff", overflowY: "auto", padding: 10, fontFamily: "system-ui, sans-serif", color: "#1f2328" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ flex: 1, fontSize: 14 }}>🧭 מבנה העמוד</strong>
        <button type="button" onClick={onClose} aria-label="סגירת מבנה העמוד" style={iconBtn}>✕</button>
      </div>
      <p style={{ fontSize: 11, color: "#6b7785", margin: "0 0 8px" }}>לחיצה בוחרת ומגיעה לפריט. גררו את ⋮⋮ כדי לשנות סדר.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {list(items, 0)}
      </DndContext>
    </aside>
  );
}
