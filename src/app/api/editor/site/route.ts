import { saveSite } from "@/lib/cms";
import { EditorError } from "@/lib/pages";
import type { SiteDoc } from "@/lib/site";
import { body, handle } from "../respond";

export const runtime = "nodejs";

/** Publish the site design: { doc: SiteDoc } */
export async function POST(request: Request) {
  return handle(async () => {
    const { doc } = await body<{ doc: SiteDoc }>(request);
    if (!doc || typeof doc !== "object") throw new EditorError("בקשה לא תקינה");
    return { version: await saveSite(doc) };
  });
}
