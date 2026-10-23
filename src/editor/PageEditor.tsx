"use client";

import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { $createParagraphNode, $getNodeByKey, $getRoot, $getState, $isParagraphNode, HISTORY_MERGE_TAG, ParagraphNode, type LexicalEditor } from "lexical";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { btn, EditorFrame, HistoryDialog, StatusToast, StorageBanner, type Status } from "@/app/editor/shared";
import { FontLinks } from "@/components/design";
import { safeHref } from "@/components/primitives";
import type { PageEntry } from "@/lib/cms";
import { FONTS } from "@/lib/fonts";
import { siteSettings, type SiteDoc } from "@/lib/site";
import { THEME, type LexicalState, type PageData, type PageMeta, type SElement } from "@/lexical/doc";
import { $createColumnNode, $createParagraphNodeIfEmpty, BlockNode, ColumnNode, ColumnsNode, EditorSiteContext, PanelNode, $isColumnNode, spacingState } from "@/lexical/nodes";
import { applySpacing } from "@/lexical/spacing";
import { EditorContext } from "./fields";
import { Outline } from "./Outline";
import { SidePanel } from "./SidePanel";
import { Toolbar } from "./Toolbar";

/**
 * The page editor.
 *
 * The page is edited in place: the Lexical document sits inside the site's
 * real header and footer, styled by the live design, and its sections render
 * through the same components as the public site. Text is typed and styled
 * directly; sections, columns and panels are configured in the side panel.
 *
 * Publishing writes to storage and is live on the next page load.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, HorizontalRuleNode, BlockNode, PanelNode, ColumnsNode, ColumnNode];

/** Empty paragraphs at the very start or end of a page are editing scaffolding, not content. */
function trim(state: LexicalState): LexicalState {
  const kids = [...(state.root.children ?? [])];
  const empty = (n: any) => n?.type === "paragraph" && !(n.children?.length);
  while (kids.length && empty(kids[0])) kids.shift();
  while (kids.length && empty(kids[kids.length - 1])) kids.pop();
  return { root: { ...state.root, children: kids } as SElement };
}

/** Keeps containers editable and leaves room to type after the last section. */
function StructurePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // A place for the cursor below the last section (dropped again on publish).
    editor.update(
      () => {
        const last = $getRoot().getLastChild();
        if (!last || !$isParagraphNode(last)) $getRoot().append($createParagraphNode());
      },
      { tag: HISTORY_MERGE_TAG }
    );
    return mergeRegister(
      editor.registerNodeTransform(ColumnNode, $createParagraphNodeIfEmpty),
      editor.registerNodeTransform(PanelNode, $createParagraphNodeIfEmpty),
      editor.registerNodeTransform(ColumnsNode, (node) => {
        // Anything that is not a column (pasted, dragged) goes into one.
        for (const child of node.getChildren()) {
          if (!$isColumnNode(child)) child.replace($createColumnNode()).append(child);
        }
        if (node.getChildrenSize() === 0) node.remove();
      })
    );
  }, [editor]);
  return null;
}

/** Shows each node's saved margin/padding on the live page, as the public renderer will. */
function SpacingPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const klasses = [ParagraphNode, HeadingNode, QuoteNode, ListNode, PanelNode, ColumnsNode];
    return mergeRegister(
      ...klasses.map((klass) =>
        editor.registerMutationListener(klass, (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, kind] of mutations) {
              if (kind === "destroyed") continue;
              const node = $getNodeByKey(key);
              const dom = editor.getElementByKey(key);
              if (node && dom) applySpacing(dom, $getState(node, spacingState));
            }
          });
        })
      )
    );
  }, [editor]);
  return null;
}

/**
 * Drag handles beside each top-level block, from Lexical's own
 * DraggableBlockPlugin: grab ⋮⋮ and drop where the line shows.
 */
function DragHandles({ anchor }: { anchor: HTMLElement | null }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  if (!anchor) return null;
  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchor}
      menuRef={menuRef}
      targetLineRef={lineRef}
      menuComponent={
        <div ref={menuRef} className="eu-drag-handle" title="גרירה לשינוי מיקום" aria-hidden="true">
          ⋮⋮
        </div>
      }
      targetLineComponent={<div ref={lineRef} className="eu-drag-line" />}
      isOnMenu={(el) => Boolean(el.closest(".eu-drag-handle"))}
    />
  );
}

/** Loads any Google font used in the text, as the public page will. */
function FontsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [fonts, setFonts] = useState<string[]>([]);
  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        const json = JSON.stringify(editorState.toJSON());
        const used = FONTS.filter((f) => json.includes(`\\"${f.name}\\"`) || json.includes(`"${f.name}"`)).map((f) => f.name);
        setFonts((prev) => (prev.join() === used.join() ? prev : used));
      }),
    [editor]
  );
  return <FontLinks fonts={fonts} />;
}

/** Ctrl/Cmd-click opens a link in the text, in a new tab. */
function LinkClickPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a.eu-link") as HTMLAnchorElement | null;
      if (a && (e.metaKey || e.ctrlKey)) {
        const href = safeHref(a.getAttribute("href") ?? "");
        if (href) window.open(href, "_blank", "noopener");
      }
    };
    return editor.registerRootListener((root, prev) => {
      prev?.removeEventListener("click", onClick);
      root?.addEventListener("click", onClick);
    });
  }, [editor]);
  return null;
}

function EditorRef({ onReady }: { onReady: (e: LexicalEditor) => () => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => onReady(editor), [editor, onReady]);
  return null;
}

export function PageEditor({
  id,
  entry,
  data,
  site,
  pages,
  driver,
}: {
  id: string;
  entry: PageEntry;
  data: PageData;
  site: SiteDoc;
  pages: { slug: string; title: string }[];
  driver: string;
}) {
  const [meta, setMeta] = useState<PageMeta>(data.meta);
  const [status, setStatus] = useState<Status>(null);
  const [history, setHistory] = useState(false);
  const [outline, setOutline] = useState(true);
  const [canvas, setCanvas] = useState<HTMLDivElement | null>(null);
  const [dirty, setDirty] = useState(false);
  const [slug, setSlug] = useState(entry.slug);
  const editorRef = useRef<LexicalEditor | null>(null);
  const isHome = entry.slug === "/";
  const href = slug === "/" ? "/" : `/${slug}`;

  const initialConfig: InitialConfigType = {
    namespace: `page-${id}`,
    nodes: NODES,
    theme: THEME as any,
    editorState: JSON.stringify(data.content),
    onError: (error) => {
      console.error(error);
      setStatus({ text: `שגיאה בעורך: ${error.message}`, tone: "bad" });
    },
  };

  // Warn before leaving with unpublished changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const onReady = useCallback((editor: LexicalEditor) => {
    editorRef.current = editor;
    let first = true;
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves, tags }) => {
      if (first || tags.has(HISTORY_MERGE_TAG)) return void (first = false);
      if (dirtyElements.size || dirtyLeaves.size) setDirty(true);
    });
  }, []);

  async function publish() {
    const editor = editorRef.current;
    if (!editor) return;
    setStatus({ text: "מפרסם…", tone: "busy" });
    try {
      const content = trim(editor.getEditorState().toJSON() as unknown as LexicalState);
      const res = await fetch(`/api/editor/pages/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { meta, content } }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return setStatus({ text: body.error ?? `שגיאה ${res.status}`, tone: "bad" });
      setSlug(body.slug);
      setMeta((m) => ({ ...m, slug: body.slug, title: body.title }));
      setDirty(false);
      setStatus({
        text: body.moved ? `פורסם ✓ — הכתובת החדשה: /${body.slug}. קישורים בתפריט עודכנו.` : "פורסם ✓ — השינויים כבר באתר",
        tone: "ok",
      });
    } catch (err) {
      setStatus({ text: `שגיאה: ${(err as Error).message}`, tone: "bad" });
    }
  }

  const onMeta = (m: PageMeta) => {
    setMeta(m);
    setDirty(true);
  };

  return (
    <EditorContext.Provider value={{ pages }}>
      <EditorSiteContext.Provider value={siteSettings(site)}>
        <LexicalComposer initialConfig={initialConfig}>
          <div dir="rtl" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#eef1f4" }}>
            <StorageBanner driver={driver} />
            <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", borderBottom: "1px solid #d0d7de", fontFamily: "system-ui, sans-serif", flexWrap: "wrap" }}>
              <Link href="/editor" style={btn()}>→ כל העמודים</Link>
              <strong style={{ fontSize: 15, flex: 1, minWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {meta.title} <span dir="ltr" style={{ fontWeight: 400, color: "#6b7785", fontSize: 12 }}>{decodeURIComponent(href)}</span>
              </strong>
              <button type="button" onClick={() => setOutline(!outline)} aria-pressed={outline} style={{ ...btn(), ...(outline ? { background: "#e6f2f1", borderColor: "#0e6a69" } : {}) }}>🧭 מבנה העמוד</button>
              <Link href="/editor/site" style={btn()}>🎨 עיצוב האתר</Link>
              <button type="button" onClick={() => setHistory(true)} style={btn()}>היסטוריה</button>
              <a href={href} target="_blank" rel="noopener noreferrer" style={btn()}>צפייה באתר ↗</a>
              <button type="button" onClick={publish} disabled={driver === "unavailable"} style={{ ...btn(true), padding: "8px 18px", fontSize: 14 }}>
                {dirty ? "● פרסום" : "פרסום"}
              </button>
            </header>
            <Toolbar />
            <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
              {outline && <Outline onClose={() => setOutline(false)} />}
              <div ref={setCanvas} style={{ flex: 1, minWidth: 0, overflowY: "auto", position: "relative" }} className="eu-editor-canvas">
                <EditorFrame site={site} background={meta.background}>
                  <RichTextPlugin
                    contentEditable={<ContentEditable className="eu-doc eu-editing" aria-label="תוכן העמוד" />}
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                </EditorFrame>
              </div>
              <SidePanel meta={meta} onMeta={onMeta} isHome={isHome} />
            </div>
          </div>
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin validateUrl={(u) => Boolean(safeHref(u))} />
          <HorizontalRulePlugin />
          <StructurePlugin />
          <SpacingPlugin />
          <DragHandles anchor={canvas} />
          <FontsPlugin />
          <LinkClickPlugin />
          <EditorRef onReady={onReady} />
        </LexicalComposer>
        {history && <HistoryDialog doc={`page-${id}`} onClose={() => setHistory(false)} onRestored={() => window.location.reload()} />}
        <StatusToast status={status} onClose={() => setStatus(null)} />
      </EditorSiteContext.Provider>
    </EditorContext.Provider>
  );
}
