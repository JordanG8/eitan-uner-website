import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { commitFiles } from "./github";
import { storageDriver } from "./storage";
import type { Block } from "./types";

/**
 * Where published pages live.
 *
 * Published page content is committed to `content/pages/*.json` in this repo.
 * That makes the repo the single source of truth for both code and content, and
 * gives page edits the same history, diffing and one-click revert as code.
 *
 * Reads always come from the deployed filesystem — a committed file is just a
 * file by the time it is running — so serving a page never depends on the
 * GitHub API being reachable. Only *writing* needs a token.
 */

const DIR = path.join(process.cwd(), "content", "pages");
const REPO_DIR = "content/pages";

/** "/" is not a filename; everything else keeps its Hebrew slug. */
export function pageFile(slug: string): string {
  return slug === "/" ? "home" : slug.replace(/^\/+|\/+$/g, "");
}

export interface StoredPage {
  slug: string;
  updatedAt: string;
  /** Puck's own document, kept verbatim so the editor round-trips losslessly. */
  puck: unknown;
  /** Flattened for rendering, so the site never imports the editor. */
  blocks: Block[];
}

export async function readStoredPage(slug: string): Promise<StoredPage | null> {
  try {
    const raw = await readFile(path.join(DIR, `${pageFile(slug)}.json`), "utf8");
    const parsed = JSON.parse(raw) as StoredPage;
    return parsed?.blocks?.length ? parsed : null;
  } catch {
    return null; // never published — fall back to content.ts
  }
}

export async function writeStoredPage(page: StoredPage): Promise<{ committed: boolean; url?: string }> {
  const json = JSON.stringify(page, null, 2) + "\n";
  const rel = `${REPO_DIR}/${pageFile(page.slug)}.json`;
  const driver = storageDriver();

  if (driver === "github") {
    const { url } = await commitFiles(
      [{ path: rel, content: json }],
      `Update ${page.slug === "/" ? "homepage" : page.slug} content`
    );
    return { committed: true, url };
  }

  if (driver === "local") {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, `${pageFile(page.slug)}.json`), json, "utf8");
    return { committed: false };
  }

  throw new Error(
    "אין אחסון מוגדר. יש להגדיר GITHUB_TOKEN ו־GITHUB_REPO, או להריץ על שרת עם דיסק."
  );
}
