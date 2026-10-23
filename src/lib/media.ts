import path from "node:path";
import sharp from "sharp";
import { mediaKey } from "./store";

/**
 * Upload validation and re-encoding.
 *
 * Every raster upload is downscaled and re-encoded to WebP before it is
 * stored: a photographer's 8MB camera JPEG becomes a few hundred KB, which is
 * what keeps pages fast and storage well inside the free tier.
 */

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "image/tiff",
]);

/**
 * Ceiling on an incoming request body.
 *
 * Vercel caps a function's request body at 4.5MB — infrastructure, not config,
 * so it cannot be raised. The browser downscales before uploading (see
 * MediaField), which keeps real photos around 500KB; this limit exists to
 * reject anything that slipped past that with a clear message instead of an
 * opaque 413 from the platform.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Long edge, in pixels. Comfortably above any layout slot on the site. */
const MAX_EDGE = 2400;
const WEBP_QUALITY = 82;

/** Filesystem-safe, still recognisable. */
function baseName(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Downscale and re-encode to WebP.
 *
 * SVG and GIF pass through untouched — SVG is already small and rasterising a
 * logo would be a downgrade; re-encoding a GIF would drop its animation.
 */
export async function optimize(
  bytes: Uint8Array,
  mime: string,
  filename: string
): Promise<{ bytes: Uint8Array; key: string; contentType: string; width?: number; height?: number }> {
  const base = baseName(filename);

  if (mime === "image/svg+xml") {
    return { bytes, key: mediaKey(base, ".svg"), contentType: mime };
  }
  if (mime === "image/gif") {
    const m = await sharp(bytes, { failOn: "none" }).metadata().catch(() => null);
    return { bytes, key: mediaKey(base, ".gif", m?.width, m?.pageHeight ?? m?.height), contentType: mime, width: m?.width, height: m?.pageHeight ?? m?.height };
  }

  const { data, info } = await sharp(bytes, { failOn: "none" })
    .rotate() // honour EXIF orientation, then drop it
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    bytes: new Uint8Array(data),
    key: mediaKey(base, ".webp", info.width, info.height),
    contentType: "image/webp",
    width: info.width,
    height: info.height,
  };
}
