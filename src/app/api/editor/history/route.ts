import { saveSite } from "@/lib/cms";
import { EditorError, restorePage } from "@/lib/pages";
import type { SiteDoc } from "@/lib/site";
import { listVersions, readVersion } from "@/lib/store";
import { body, handle } from "../respond";

export const runtime = "nodejs";

/** Only the documents the editor exposes history for. */
function docName(doc: string | null): string {
  if (doc === "site" || /^page-[a-z0-9]+$/.test(doc ?? "")) return doc!;
  throw new EditorError("מסמך לא מוכר");
}

/** Saved versions of a document: ?doc=site | page-<id> */
export async function GET(request: Request) {
  return handle(
    async () => ({ versions: await listVersions(docName(new URL(request.url).searchParams.get("doc"))) }),
    { write: false }
  );
}

/** Restore: { doc, version } — saved again as the newest version. */
export async function POST(request: Request) {
  return handle(async () => {
    const { doc, version } = await body<{ doc: string; version: string }>(request);
    const name = docName(doc);
    if (name === "site") {
      const old = await readVersion<SiteDoc>("site", version);
      if (!old) throw new EditorError("הגרסה לא נמצאה", 404);
      return { version: await saveSite(old) };
    }
    return restorePage(name.slice("page-".length), version);
  });
}
