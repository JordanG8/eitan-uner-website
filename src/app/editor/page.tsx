import { loadIndex } from "@/lib/cms";
import { storageDriver } from "@/lib/store";
import { Dashboard } from "./Dashboard";

/**
 * The editor's home: every page on the site, and the way into the site design.
 */

export const dynamic = "force-dynamic";

export default async function EditorHome() {
  return <Dashboard pages={await loadIndex()} driver={storageDriver()} />;
}
