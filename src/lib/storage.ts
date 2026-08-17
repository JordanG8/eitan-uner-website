import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Media storage.
 *
 * One interface, two drivers. The local driver writes into public/uploads and is
 * what runs in development and on any normal server (a VPS, Hostinger, a
 * container). It does NOT work on Vercel, whose filesystem is read-only at
 * runtime — which is exactly the storage decision still outstanding.
 *
 * `putObject` is the only seam an S3/R2 driver needs to implement, so swapping
 * hosts later touches this file and nothing else.
 */

export interface StoredObject {
  key: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // photographers bring big files

export function storageDriver(): "local" | "unavailable" {
  // Vercel's runtime filesystem is read-only, so local writes would fail at the
  // worst possible moment — better to report it up front.
  return process.env.VERCEL ? "unavailable" : "local";
}

/** Filesystem-safe, collision-resistant, and still recognisable. */
export function safeKey(filename: string): string {
  const ext = path.extname(filename).toLowerCase().slice(0, 6) || ".bin";
  const base = path
    .basename(filename, path.extname(filename))
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base || "image"}-${stamp}${rand}${ext}`;
}

export async function putObject(
  key: string,
  bytes: Uint8Array
): Promise<StoredObject> {
  if (storageDriver() === "unavailable") {
    throw new Error(
      "אין אחסון מוגדר בסביבת הייצור. יש לחבר אחסון אובייקטים (למשל Cloudflare R2) או להריץ על שרת עם דיסק."
    );
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const dest = path.join(UPLOAD_DIR, key);
  await writeFile(dest, bytes);
  const dims = imageSize(bytes);
  return {
    key,
    url: `${PUBLIC_PREFIX}/${key}`,
    size: bytes.byteLength,
    ...dims,
  };
}

export async function listObjects(): Promise<StoredObject[]> {
  try {
    const names = await readdir(UPLOAD_DIR);
    const out: StoredObject[] = [];
    for (const name of names) {
      if (name.startsWith(".")) continue;
      const full = path.join(UPLOAD_DIR, name);
      const s = await stat(full);
      if (!s.isFile()) continue;
      let dims: { width?: number; height?: number } = {};
      try {
        dims = imageSize(await readFile(full));
      } catch {
        /* unreadable — list it without dimensions */
      }
      out.push({ key: name, url: `${PUBLIC_PREFIX}/${name}`, size: s.size, ...dims });
    }
    return out.sort((a, b) => b.key.localeCompare(a.key));
  } catch {
    return [];
  }
}

/* --------------------------------------------------------------- dimensions */

/**
 * Minimal dimension sniffer for PNG / JPEG / WebP.
 *
 * Worth the ~50 lines: the gallery lays out with CSS columns using each image's
 * intrinsic ratio, so uploads with unknown dimensions would render at a wrong
 * aspect and visibly break the masonry.
 */
export function imageSize(buf: Uint8Array): { width?: number; height?: number } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // PNG: 8-byte signature, then IHDR
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  // WebP: "RIFF"...."WEBP"
  if (
    buf.length > 30 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    const fmt = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    if (fmt === "VP8 ") {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }
    if (fmt === "VP8L") {
      const bits = view.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (fmt === "VP8X") {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width: w, height: h };
    }
  }

  // JPEG: walk the segment markers to the first SOF
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
      }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      i += 2 + view.getUint16(i + 2);
    }
  }

  return {};
}
