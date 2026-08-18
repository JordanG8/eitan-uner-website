import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { commitFiles, githubConfig } from "./github";

/**
 * Media storage.
 *
 * Two drivers behind one interface:
 *
 *  - `github`  — production. Commits into the repo Eitan owns, which triggers a
 *                Vercel rebuild. No database, no media service, no extra account.
 *  - `local`   — development, or any server with a real disk.
 *
 * Vercel's runtime filesystem is read-only, so `local` cannot work there; if
 * neither driver is configured we say so rather than failing at write time.
 *
 * Every raster upload is re-encoded before it is stored. That is the single
 * thing that makes repo-as-storage viable: a photographer's 8MB camera JPEG
 * becomes a ~150KB WebP, and git keeps every version of every binary forever.
 */

export const UPLOAD_PREFIX = "public/uploads";
const PUBLIC_PREFIX = "/uploads";
const LOCAL_DIR = path.join(process.cwd(), UPLOAD_PREFIX);

export interface StoredObject {
  key: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  /** Bytes saved by re-encoding, for reporting back to the editor. */
  originalSize?: number;
}

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
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

export type Driver = "github" | "local" | "unavailable";

export function storageDriver(): Driver {
  if (githubConfig()) return "github";
  if (process.env.VERCEL) return "unavailable";
  return "local";
}

/** Filesystem-safe, collision-resistant, still recognisable. */
export function safeKey(filename: string, ext = ".webp"): string {
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

/**
 * Downscale and re-encode to WebP.
 *
 * SVG passes through untouched — it is already small, and rasterising a logo
 * would be a downgrade.
 */
export async function optimize(
  bytes: Uint8Array,
  mime: string,
  filename: string
): Promise<{ bytes: Uint8Array; key: string; width?: number; height?: number }> {
  if (mime === "image/svg+xml") {
    return { bytes, key: safeKey(filename, ".svg") };
  }

  const pipeline = sharp(bytes, { failOn: "none" })
    .rotate() // honour EXIF orientation, then drop it
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return {
    bytes: new Uint8Array(data),
    key: safeKey(filename, ".webp"),
    width: info.width,
    height: info.height,
  };
}

export async function putObject(
  key: string,
  bytes: Uint8Array,
  meta: { width?: number; height?: number; originalSize?: number } = {}
): Promise<StoredObject> {
  const driver = storageDriver();
  const result: StoredObject = {
    key,
    url: `${PUBLIC_PREFIX}/${key}`,
    size: bytes.byteLength,
    ...meta,
  };

  if (driver === "github") {
    await commitFiles(
      [{ path: `${UPLOAD_PREFIX}/${key}`, content: bytes }],
      `Add image ${key}`
    );
    return result;
  }

  if (driver === "local") {
    await mkdir(LOCAL_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_DIR, key), bytes);
    return result;
  }

  throw new Error(
    "אין אחסון מוגדר. יש להגדיר GITHUB_TOKEN ו־GITHUB_REPO, או להריץ על שרת עם דיסק."
  );
}

/** Commits several images in one commit, so N uploads cause one rebuild. */
export async function putObjects(
  objects: { key: string; bytes: Uint8Array; meta?: { width?: number; height?: number; originalSize?: number } }[]
): Promise<StoredObject[]> {
  const driver = storageDriver();

  if (driver === "github" && objects.length > 1) {
    await commitFiles(
      objects.map((o) => ({ path: `${UPLOAD_PREFIX}/${o.key}`, content: o.bytes })),
      `Add ${objects.length} images`
    );
    return objects.map((o) => ({
      key: o.key,
      url: `${PUBLIC_PREFIX}/${o.key}`,
      size: o.bytes.byteLength,
      ...o.meta,
    }));
  }

  const out: StoredObject[] = [];
  for (const o of objects) out.push(await putObject(o.key, o.bytes, o.meta));
  return out;
}

/**
 * Lists previously uploaded files.
 *
 * Reads the deployed filesystem, which works under both drivers: images
 * committed by the github driver arrive on disk with the next deployment.
 * The consequence — an upload is not listed until the rebuild lands — is
 * surfaced in the editor rather than hidden.
 */
export async function listObjects(): Promise<StoredObject[]> {
  try {
    const names = await readdir(LOCAL_DIR);
    const out: StoredObject[] = [];
    for (const name of names) {
      if (name.startsWith(".")) continue;
      const full = path.join(LOCAL_DIR, name);
      const s = await stat(full);
      if (!s.isFile()) continue;
      let dims: { width?: number; height?: number } = {};
      try {
        const m = await sharp(full).metadata();
        dims = { width: m.width, height: m.height };
      } catch {
        /* not a raster image — list it without dimensions */
      }
      out.push({ key: name, url: `${PUBLIC_PREFIX}/${name}`, size: s.size, ...dims });
    }
    return out.sort((a, b) => b.key.localeCompare(a.key));
  } catch {
    return [];
  }
}
