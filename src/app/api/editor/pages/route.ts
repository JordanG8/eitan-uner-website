import { createPage, deletePage, reorderPages } from "@/lib/pages";
import { body, handle } from "../respond";

export const runtime = "nodejs";

/** Create a page: { title, slug?, copyFrom?, addToNav? } */
export async function POST(request: Request) {
  return handle(async () => createPage(await body(request)));
}

/** Reorder the page list: { order: id[] } */
export async function PATCH(request: Request) {
  return handle(async () => {
    const { order } = await body<{ order?: string[] }>(request);
    await reorderPages(Array.isArray(order) ? order : []);
    return {};
  });
}

/** Delete a page: ?id=… */
export async function DELETE(request: Request) {
  return handle(async () => deletePage(new URL(request.url).searchParams.get("id") ?? ""));
}
