import type { LexicalState, SBlock, SNode } from "@/lexical/doc";

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

export function fixContent(slug: string, content: LexicalState): LexicalState {
  if (slug !== "/") return content;
  const { nodes, changed } = walk(content.root.children);
  return changed ? { root: { ...content.root, children: nodes } } : content;
}
