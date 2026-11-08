import { block, type LexicalState, type SBlock, type SNode } from "./doc";

/**
 * The homepage scroll story used to be one "ScrollStory" block holding all
 * seven parts. It is now seven blocks, one per part, so each can be selected
 * and edited on its own. This turns the old shape into the new one.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const PARTS = [
  ["memory", "StoryMemory"],
  ["vista", "StoryVista"],
  ["define", "StoryDefine"],
  ["room", "StoryRoom"],
  ["feelings", "StoryFeelings"],
  ["host", "StoryHost"],
  ["ask", "StoryAsk"],
] as const;

/** Old ScrollStory props → seven blocks. The old block's design (if any) stays with the first part. */
export function splitStory(props: Record<string, any>): SBlock[] {
  return PARTS.map(([key, type], i) => {
    const { inset: _inset, ...part } = (props?.[key] ?? {}) as Record<string, unknown>;
    void _inset;
    return block(type, { ...part, design: i === 0 ? (props?.design ?? {}) : {} });
  });
}

function walk(nodes: SNode[]): { nodes: SNode[]; changed: boolean } {
  let changed = false;
  const out: SNode[] = [];
  for (const node of nodes) {
    if (node.type === "eu-block" && (node as SBlock).blockType === "ScrollStory") {
      out.push(...splitStory((node as SBlock).props));
      changed = true;
      continue;
    }
    if (Array.isArray((node as any).children)) {
      const inner = walk((node as any).children);
      if (inner.changed) {
        out.push({ ...node, children: inner.nodes });
        changed = true;
        continue;
      }
    }
    out.push(node);
  }
  return { nodes: out, changed };
}

/** Replaces any old single ScrollStory block in a saved page with its seven parts. */
export function migrateStory(content: LexicalState): LexicalState {
  const { nodes, changed } = walk(content.root.children);
  return changed ? { root: { ...content.root, children: nodes } } : content;
}
