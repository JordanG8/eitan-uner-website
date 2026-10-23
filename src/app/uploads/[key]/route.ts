import { readLocalMedia } from "@/lib/store";

/**
 * Serves uploads under the `fs` storage driver (development, or a server with
 * a disk). Under the `blob` driver uploads have their own public URLs and this
 * route is never linked to.
 */

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  avif: "image/avif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const key = decodeURIComponent((await params).key);
  const bytes = await readLocalMedia(key);
  if (!bytes) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return new Response(new Blob([bytes as BlobPart]), {
    headers: {
      "content-type": TYPES[ext] ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      // An uploaded SVG must not be able to run script on this origin.
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
