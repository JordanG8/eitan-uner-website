import type { LexicalState, PageMeta, SBlock, SNode } from "@/lexical/doc";

/**
 * One-off corrections to content saved through the editor.
 *
 * The homepage's top buttons "צילום מקצועי" and "הרצאות" were saved pointing
 * at the contact page. They are corrected here on read, and only while they
 * still point at one of the old targets, so any other link Eitan sets in the
 * editor afterwards wins. "צילום מקצועי" leads to its own page.
 * The fix becomes permanent the next time the homepage is saved.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const HOME_BUTTONS: Record<string, { from: string[]; to: string }> = {
  "צילום מקצועי": { from: ["/צרו-קשר", "/תיק-עבודות", "/תיק-עבודות#צילום-מקצועי"], to: "/צילום-מקצועי" },
  "הרצאות": { from: ["/צרו-קשר"], to: "/הרצאות" },
};

function fixCtas(ctas: unknown): { ctas: unknown; changed: boolean } {
  if (!Array.isArray(ctas)) return { ctas, changed: false };
  let changed = false;
  const next = ctas.map((c: any) => {
    const fix = HOME_BUTTONS[String(c?.label ?? "").trim()];
    if (fix && fix.from.includes(String(c?.href ?? "").trim())) {
      changed = true;
      return { ...c, href: fix.to };
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

export function fixContent(meta: PageMeta, content: LexicalState): { meta: PageMeta; content: LexicalState } {
  let out = content;
  if (meta.slug === "/") {
    const { nodes, changed } = walk(content.root.children);
    if (changed) out = { root: { ...content.root, children: nodes } };
  }
  return { meta, content: out };
}
