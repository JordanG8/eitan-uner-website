import { NextResponse } from "next/server";
import { puckToBlocks } from "@/puck/to-blocks";
import { writeStoredPage } from "@/lib/pages-store";
import { storageDriver } from "@/lib/storage";

/**
 * Publish.
 *
 * Stores both the Puck document (so the editor round-trips losslessly) and the
 * flattened blocks (so rendering never touches the editor). Under the github
 * driver this is a commit, which triggers a Vercel rebuild — the new page is
 * live in about a minute, and every publish is revertible in git.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { slug?: string; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const data = body?.data ?? body; // tolerate a bare Puck document
  const slug = typeof body?.slug === "string" ? body.slug : "/";

  const blocks = puckToBlocks(data);
  if (!blocks.length) {
    return NextResponse.json(
      { error: "אין תוכן לשמור — העמוד ריק." },
      { status: 400 }
    );
  }

  try {
    const result = await writeStoredPage({
      slug,
      updatedAt: new Date().toISOString(),
      puck: data,
      blocks,
    });

    return NextResponse.json({
      ok: true,
      blocks: blocks.length,
      committed: result.committed,
      url: result.url,
      driver: storageDriver(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
