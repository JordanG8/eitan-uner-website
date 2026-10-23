"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $createParagraphNode,
  $getNodeByKey,
  createState,
  DecoratorNode,
  ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
} from "lexical";
import { createContext, useContext, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { BLOCK_DEFS } from "@/blocks/fields";
import { renderBlock, type BlockType } from "@/blocks/render";
import { candidatesFor, editInPlace, editingText, getIn, nextValue, occurrence, setIn, textElementAt } from "@/editor/inline-edit";
import type { SiteSettings } from "@/lib/types";
import { COLUMN_LAYOUTS, type PanelSettings, type SBlock } from "./doc";
import { columnsVars, panelVars } from "./Render";
import type { Spacing } from "./spacing";

/**
 * The editor's custom Lexical nodes.
 *
 *  - BlockNode    a designed section or inserted element (image, buttons…).
 *                 It renders the same component the public site renders.
 *  - PanelNode    a full-width coloured band holding ordinary text.
 *  - ColumnsNode  side-by-side columns, each holding ordinary text.
 *
 * The JSON each one exports is what src/lexical/Render.tsx reads.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const EditorSiteContext = createContext<SiteSettings | null>(null);

/**
 * Margin/padding on any node — paragraphs and headings included — stored with
 * Lexical's NodeState, which serializes it under the node's "$" key. The
 * public renderer reads it from there (src/lexical/Render.tsx).
 */
export const spacingState = createState("spacing", {
  parse: (v: unknown): Spacing | undefined => (v && typeof v === "object" ? (v as Spacing) : undefined),
});

function applyVars(dom: HTMLElement, vars: Record<string, string>, previous?: Record<string, string>) {
  for (const k of Object.keys(previous ?? {})) if (!(k in vars)) dom.style.removeProperty(k);
  for (const [k, v] of Object.entries(vars)) dom.style.setProperty(k, v);
}

/** Node transform: a container must always hold at least one paragraph. */
export function $createParagraphNodeIfEmpty(node: ElementNode): void {
  if (node.getChildrenSize() === 0) node.append($createParagraphNode());
}

/* ------------------------------------------------------------- block */

export class BlockNode extends DecoratorNode<ReactNode> {
  __blockType: string;
  __props: Record<string, unknown>;

  static getType(): string {
    return "eu-block";
  }

  static clone(node: BlockNode): BlockNode {
    return new BlockNode(node.__blockType, node.__props, node.__key);
  }

  static importJSON(json: any): BlockNode {
    return $createBlockNode(json.blockType, json.props ?? {});
  }

  constructor(blockType: string, props: Record<string, unknown>, key?: NodeKey) {
    super(key);
    this.__blockType = blockType;
    this.__props = props;
  }

  exportJSON(): any {
    return { type: "eu-block", version: 1, blockType: this.__blockType, props: this.__props } satisfies SBlock;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "eu-block-node";
    div.contentEditable = "false";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): false {
    return false;
  }

  getBlockType(): string {
    return this.getLatest().__blockType;
  }

  getProps(): Record<string, unknown> {
    return this.getLatest().__props;
  }

  setProps(props: Record<string, unknown>): this {
    const self = this.getWritable();
    self.__props = props;
    return self;
  }

  decorate(): ReactNode {
    return <BlockView nodeKey={this.__key} blockType={this.__blockType} props={this.__props} />;
  }
}

export function $createBlockNode(blockType: string, props: Record<string, unknown>): BlockNode {
  return new BlockNode(blockType, props);
}

export function $isBlockNode(node: LexicalNode | null | undefined): node is BlockNode {
  return node instanceof BlockNode;
}

const handle: CSSProperties = {
  border: 0,
  background: "#0e6a69",
  color: "#fff",
  borderRadius: 6,
  padding: "4px 9px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  lineHeight: 1.4,
};

/** Moves, copies or removes a block, or adds a paragraph next to it. */
export function blockAction(editor: LexicalEditor, key: NodeKey, action: "up" | "down" | "copy" | "delete" | "textBefore" | "textAfter") {
  editor.update(() => {
    const node = $getNodeByKey(key);
    if (!node) return;
    if (action === "up") node.getPreviousSibling()?.insertBefore(node);
    if (action === "down") node.getNextSibling()?.insertAfter(node);
    if (action === "copy" && $isBlockNode(node)) node.insertAfter($createBlockNode(node.getBlockType(), structuredClone(node.getProps())));
    if (action === "delete") node.remove();
    if (action === "textBefore" || action === "textAfter") {
      const p = $createParagraphNode();
      if (action === "textBefore") node.insertBefore(p);
      else node.insertAfter(p);
      p.select();
    }
  });
  // A click on a toolbar button leaves focus on the button; give it back so
  // typing lands in the new paragraph.
  if (action === "textBefore" || action === "textAfter") editor.focus();
}

function BlockView({ nodeKey, blockType, props }: { nodeKey: NodeKey; blockType: string; props: Record<string, unknown> }) {
  const [editor] = useLexicalComposerContext();
  const [selected, setSelected, clear] = useLexicalNodeSelection(nodeKey);
  const site = useContext(EditorSiteContext);
  const label = BLOCK_DEFS[blockType as BlockType]?.label ?? blockType;
  const bodyRef = useRef<HTMLDivElement>(null);
  // Bumped after an inline edit, so React rebuilds the section's DOM from the
  // new props instead of reconciling against nodes the browser edited.
  const [rev, setRev] = useState(0);

  const match = (el: HTMLElement) => {
    const body = bodyRef.current;
    if (!body) return null;
    const found = candidatesFor(props, el.textContent ?? "");
    if (!found.length) return null;
    return found[Math.min(occurrence(el, body), found.length - 1)];
  };

  // A click selects the section; on text it also starts editing that text in
  // place. Links, buttons and dialogs inside the section must not fire.
  const onClickCapture = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-eu-handle]") || target.closest(".eu-inline-editing")) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.shiftKey) clear();
    setSelected(true);

    const body = bodyRef.current;
    const el = body ? textElementAt(target, body) : null;
    const c = el ? match(el) : null;
    if (!el || !c) return;
    editInPlace(el, editingText(c), { x: e.clientX, y: e.clientY }, (text) => {
      if (text !== null) {
        const value = nextValue(c, text);
        if (value !== getIn(props, c.path)) {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isBlockNode(node)) node.setProps(setIn(node.getProps(), c.path, value));
          });
        }
      }
      setRev((r) => r + 1);
    });
  };

  // Show which text can be edited by clicking it.
  const onMouseOver = (e: MouseEvent) => {
    const body = bodyRef.current;
    if (!body) return;
    body.querySelector(".eu-inline-hover")?.classList.remove("eu-inline-hover");
    const el = textElementAt(e.target, body);
    if (el && !el.classList.contains("eu-inline-editing") && match(el)) el.classList.add("eu-inline-hover");
  };
  const onMouseLeave = () => bodyRef.current?.querySelector(".eu-inline-hover")?.classList.remove("eu-inline-hover");

  return (
    <div className="eu-block-edit" data-selected={selected ? "" : undefined} onClickCapture={onClickCapture} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
      <div className="eu-block-bar" data-eu-handle="">
        <span style={{ ...handle, background: "#1f2328", cursor: "default" }}>{label}</span>
        <button type="button" style={handle} title="טקסט מעל" onClick={() => blockAction(editor, nodeKey, "textBefore")}>+ טקסט מעל</button>
        <button type="button" style={handle} title="טקסט מתחת" onClick={() => blockAction(editor, nodeKey, "textAfter")}>+ טקסט מתחת</button>
        <button type="button" style={handle} aria-label="הזזה למעלה" onClick={() => blockAction(editor, nodeKey, "up")}>↑</button>
        <button type="button" style={handle} aria-label="הזזה למטה" onClick={() => blockAction(editor, nodeKey, "down")}>↓</button>
        <button type="button" style={handle} aria-label="שכפול" onClick={() => blockAction(editor, nodeKey, "copy")}>⧉</button>
        <button type="button" style={{ ...handle, background: "#b42318" }} aria-label="מחיקה" onClick={() => blockAction(editor, nodeKey, "delete")}>✕</button>
      </div>
      <div ref={bodyRef} key={rev}>
        {site ? renderBlock(blockType, props, { site }) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- panel */

export class PanelNode extends ElementNode {
  __settings: PanelSettings;

  static getType(): string {
    return "eu-panel";
  }

  static clone(node: PanelNode): PanelNode {
    return new PanelNode(node.__settings, node.__key);
  }

  static importJSON(json: any): PanelNode {
    return $createPanelNode(json.settings ?? {}).updateFromJSON(json);
  }

  constructor(settings: PanelSettings = {}, key?: NodeKey) {
    super(key);
    this.__settings = settings;
  }

  exportJSON(): any {
    return { ...super.exportJSON(), type: "eu-panel", version: 1, settings: this.__settings };
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("section");
    dom.className = "eu-panel";
    applyVars(dom, panelVars(this.__settings));
    return dom;
  }

  updateDOM(prev: PanelNode, dom: HTMLElement): boolean {
    if (prev.__settings !== this.__settings) applyVars(dom, panelVars(this.__settings), panelVars(prev.__settings));
    return false;
  }

  isShadowRoot(): boolean {
    return true;
  }

  getSettings(): PanelSettings {
    return this.getLatest().__settings;
  }

  setSettings(settings: PanelSettings): this {
    const self = this.getWritable();
    self.__settings = settings;
    return self;
  }
}

export function $createPanelNode(settings: PanelSettings = {}): PanelNode {
  return new PanelNode(settings);
}

export function $isPanelNode(node: LexicalNode | null | undefined): node is PanelNode {
  return node instanceof PanelNode;
}

/* ----------------------------------------------------------- columns */

export class ColumnsNode extends ElementNode {
  __layout: string;
  __gap: number;

  static getType(): string {
    return "eu-columns";
  }

  static clone(node: ColumnsNode): ColumnsNode {
    return new ColumnsNode(node.__layout, node.__gap, node.__key);
  }

  static importJSON(json: any): ColumnsNode {
    return $createColumnsNode(json.layout ?? "1-1", Number(json.gap ?? 32)).updateFromJSON(json);
  }

  constructor(layout = "1-1", gap = 32, key?: NodeKey) {
    super(key);
    this.__layout = layout;
    this.__gap = gap;
  }

  exportJSON(): any {
    return { ...super.exportJSON(), type: "eu-columns", version: 1, layout: this.__layout, gap: this.__gap };
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "eu-columns";
    applyVars(dom, columnsVars(this.__layout, this.__gap));
    return dom;
  }

  updateDOM(prev: ColumnsNode, dom: HTMLElement): boolean {
    if (prev.__layout !== this.__layout || prev.__gap !== this.__gap) applyVars(dom, columnsVars(this.__layout, this.__gap));
    return false;
  }

  isShadowRoot(): boolean {
    return true;
  }

  getLayout(): { layout: string; gap: number } {
    const self = this.getLatest();
    return { layout: self.__layout, gap: self.__gap };
  }

  /** Also adds or merges columns so their number matches the layout. */
  setLayout(layout: string, gap: number): this {
    const self = this.getWritable();
    self.__layout = layout;
    self.__gap = gap;
    const want = (COLUMN_LAYOUTS[layout] ?? COLUMN_LAYOUTS["1-1"]).split(" ").length;
    const cols = self.getChildren().filter($isColumnNode);
    for (let i = cols.length; i < want; i++) self.append($createColumnNode().append($createParagraphNode()));
    if (cols.length > want) {
      const last = cols[want - 1];
      for (const extra of cols.slice(want)) {
        for (const child of extra.getChildren()) last.append(child);
        extra.remove();
      }
    }
    return self;
  }
}

export function $createColumnsNode(layout = "1-1", gap = 32): ColumnsNode {
  return new ColumnsNode(layout, gap);
}

export function $isColumnsNode(node: LexicalNode | null | undefined): node is ColumnsNode {
  return node instanceof ColumnsNode;
}

export class ColumnNode extends ElementNode {
  static getType(): string {
    return "eu-column";
  }

  static clone(node: ColumnNode): ColumnNode {
    return new ColumnNode(node.__key);
  }

  static importJSON(json: any): ColumnNode {
    return $createColumnNode().updateFromJSON(json);
  }

  exportJSON(): any {
    return { ...super.exportJSON(), type: "eu-column", version: 1 };
  }

  createDOM(): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "eu-column";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  isShadowRoot(): boolean {
    return true;
  }
}

export function $createColumnNode(): ColumnNode {
  return new ColumnNode();
}

export function $isColumnNode(node: LexicalNode | null | undefined): node is ColumnNode {
  return node instanceof ColumnNode;
}
