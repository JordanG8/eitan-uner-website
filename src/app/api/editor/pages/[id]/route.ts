import { publishPage } from "@/lib/pages";
import type { PageData } from "@/lib/cms";
import { body, handle } from "../../respond";

export const runtime = "nodejs";

/** Publish a page: { data: { meta, content } } — content is Lexical JSON. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(async () => {
    const { data } = await body<{ data: PageData }>(request);
    return publishPage(id, data);
  });
}
