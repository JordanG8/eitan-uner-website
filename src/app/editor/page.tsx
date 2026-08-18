import type { Data } from "@measured/puck";
import { readStoredPage } from "@/lib/pages-store";
import { storageDriver } from "@/lib/storage";
import { pageToPuckData } from "@/puck/seed";
import { EditorClient } from "./EditorClient";

/**
 * Opens on the last published version of the homepage, or on the content in
 * content.ts if it has never been published.
 */

export const dynamic = "force-dynamic";

const SLUG = "/";

export default async function EditorPage() {
  const stored = await readStoredPage(SLUG);
  const data = (stored?.puck as Data) ?? pageToPuckData(SLUG);
  return <EditorClient data={data} slug={SLUG} driver={storageDriver()} />;
}
