import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Data } from "@measured/puck";
import { pageToPuckData } from "@/puck/seed";
import { EditorClient } from "./EditorClient";

/**
 * Spike: the Puck editor, loaded with the real homepage.
 *
 * Storage is the open question — see the POST handler in api/puck. Locally it
 * writes a JSON file, which is enough to feel the full edit → publish loop.
 */

export const dynamic = "force-dynamic";

const STORE = path.join(process.cwd(), "puck-data.json");

async function loadData(): Promise<Data> {
  try {
    const raw = await readFile(STORE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed?.content) return parsed as Data;
  } catch {
    /* nothing saved yet — fall back to the live homepage */
  }
  return pageToPuckData("/");
}

export default async function EditorPage() {
  const data = await loadData();
  return <EditorClient data={data} />;
}
