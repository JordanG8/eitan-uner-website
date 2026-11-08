import { block, type LexicalState, type PageMeta, type SBlock, type SNode } from "@/lexical/doc";
import { PRO_WORK_DEFAULTS } from "@/blocks/defaults";

/**
 * One-off corrections to content saved through the editor.
 *
 * The homepage's top buttons "צילום מקצועי" and "הרצאות" were saved pointing
 * at the contact page. They are corrected here on read, and only while they
 * still point there, so any link Eitan sets in the editor afterwards wins.
 * The fix becomes permanent the next time the homepage is saved.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const CONTACT = "/צרו-קשר";
const HOME_BUTTONS: Record<string, string> = {
  "צילום מקצועי": "/תיק-עבודות",
  "הרצאות": "/הרצאות",
};

function fixCtas(ctas: unknown): { ctas: unknown; changed: boolean } {
  if (!Array.isArray(ctas)) return { ctas, changed: false };
  let changed = false;
  const next = ctas.map((c: any) => {
    const to = HOME_BUTTONS[String(c?.label ?? "").trim()];
    if (to && String(c?.href ?? "").trim() === CONTACT) {
      changed = true;
      return { ...c, href: to };
    }
    return c;
  });
  return { ctas: next, changed };
}

function walk(nodes: SNode[]): { nodes: SNode[]; changed: boolean } {
  let changed = false;
  const out = nodes.map((node) => {
    if (node.type === "eu-block") {
      const b = node as SBlock;
      const r = fixCtas(b.props?.ctas);
      if (r.changed) {
        changed = true;
        return { ...b, props: { ...b.props, ctas: r.ctas } };
      }
    }
    if (Array.isArray((node as any).children)) {
      const inner = walk((node as any).children);
      if (inner.changed) {
        changed = true;
        return { ...node, children: inner.nodes };
      }
    }
    return node;
  });
  return { nodes: out, changed };
}

/**
 * The portfolio page gets the professional-photography section (three videos,
 * three photos) under its title banner. Added once: the page is marked in
 * meta.fixes, which the editor saves back, so if Eitan deletes the section
 * it stays deleted.
 */
function addProWork(meta: PageMeta, content: LexicalState): { meta: PageMeta; content: LexicalState } {
  if (meta.slug !== "תיק-עבודות" || meta.fixes?.includes("proWork")) return { meta, content };
  const marked = { ...meta, fixes: [...(meta.fixes ?? []), "proWork"] };
  const children = content.root.children;
  if (children.some((n) => n.type === "eu-block" && (n as SBlock).blockType === "ProWork")) return { meta: marked, content };
  const banner = children.findIndex((n) => n.type === "eu-block" && (n as SBlock).blockType === "PageBanner");
  const at = banner >= 0 ? banner + 1 : 0;
  const next = [...children.slice(0, at), block("ProWork", { ...structuredClone(PRO_WORK_DEFAULTS), design: {} }), ...children.slice(at)];
  return { meta: marked, content: { root: { ...content.root, children: next } } };
}

export function fixContent(meta: PageMeta, content: LexicalState): { meta: PageMeta; content: LexicalState } {
  let out = content;
  if (meta.slug === "/") {
    const { nodes, changed } = walk(content.root.children);
    if (changed) out = { root: { ...content.root, children: nodes } };
  }
  return addProWork(meta, out);
}
