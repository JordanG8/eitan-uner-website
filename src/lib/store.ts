import { del, list, put } from "@vercel/blob";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Persistent storage for everything Eitan edits.
 *
 * Two drivers behind one interface:
 *
 *  - `blob` — production. Vercel Blob, a store that lives inside the Vercel
 *             project itself (no extra account). A publish is live the moment
 *             it is written: no commit, no rebuild.
 *  - `fs`   — development, or any server with a real disk. Writes to `.data/`.
 *
 * Vercel's runtime filesystem is read-only, so `fs` cannot work there. If
 * neither driver is configured we report `unavailable` instead of failing at
 * write time.
 *
 * ── Documents are versioned, never overwritten ───────────────────────────
 *
 * Every save of a document writes a *new* immutable file,
 * `content/<doc>/<version>.json`, and the newest version wins. Two things fall
 * out of that for free:
 *
 *  - History. The last KEEP_VERSIONS saves of every page and of the site
 *    design can be listed and restored from the editor.
 *  - Consistency. A blob URL is cached by the CDN, so overwriting one file in
 *    place could serve the old content for a while after a publish. A new path
 *    per version can never be stale.
 */

export type Driver = "blob" | "fs" | "unavailable";

export function storageDriver(): Driver {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.VERCEL) return "unavailable";
  return "fs";
}

export const UNAVAILABLE_MESSAGE =
  "אין אחסון מוגדר. יש לחבר Vercel Blob לפרויקט (Storage → Blob) ולפרסם מחדש.";

function assertWritable(): "blob" | "fs" {
  const driver = storageDriver();
  if (driver === "unavailable") throw new Error(UNAVAILABLE_MESSAGE);
  return driver;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const KEEP_VERSIONS = 30;

/* ------------------------------------------------------------ documents */

export interface Version {
  id: string;
  /** ISO timestamp of the save. */
  at: string;
  size: number;
}

/** Sorts lexicographically in save order. */
function newVersionId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString().padStart(15, "0")}-${rand}`;
}

function versionAt(id: string): string {
  const ms = Number(id.split("-")[0]);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : "";
}

/** Document names are internal ("site", "pages", "page-ab12"), never user input. */
function docPrefix(doc: string): string {
  if (!/^[a-z0-9-]+$/.test(doc)) throw new Error(`Invalid document name: ${doc}`);
  return `content/${doc}/`;
}

interface BlobEntry {
  pathname: string;
  url: string;
  size: number;
  uploadedAt?: Date;
}

async function blobList(prefix: string): Promise<BlobEntry[]> {
  const out: BlobEntry[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    out.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function blobVersions(doc: string) {
  const prefix = docPrefix(doc);
  const blobs = await blobList(prefix);
  return blobs
    .filter((b) => b.pathname.endsWith(".json"))
    .map((b) => ({ id: b.pathname.slice(prefix.length, -5), url: b.url, size: b.size }))
    .sort((a, b) => b.id.localeCompare(a.id));
}

export async function listVersions(doc: string): Promise<Version[]> {
  const driver = storageDriver();
  if (driver === "blob") {
    return (await blobVersions(doc)).map(({ id, size }) => ({ id, size, at: versionAt(id) }));
  }
  if (driver === "fs") {
    const dir = path.join(DATA_DIR, docPrefix(doc));
    try {
      const names = (await readdir(dir)).filter((n) => n.endsWith(".json"));
      const out = await Promise.all(
        names.map(async (n) => {
          const id = n.slice(0, -5);
          return { id, at: versionAt(id), size: (await stat(path.join(dir, n))).size };
        })
      );
      return out.sort((a, b) => b.id.localeCompare(a.id));
    } catch {
      return [];
    }
  }
  return [];
}

async function readBlobJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Storage read failed (${res.status})`);
  return (await res.json()) as T;
}

/** A specific saved version, or null if it does not exist. */
export async function readVersion<T>(doc: string, id: string): Promise<T | null> {
  const driver = storageDriver();
  if (driver === "blob") {
    const hit = (await blobVersions(doc)).find((v) => v.id === id);
    return hit ? readBlobJson<T>(hit.url) : null;
  }
  if (driver === "fs") {
    if (!/^[0-9a-z-]+$/.test(id)) return null;
    try {
      const raw = await readFile(path.join(DATA_DIR, docPrefix(doc), `${id}.json`), "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return null;
}

/** The newest saved version, or null if the document was never saved. */
export async function readDoc<T>(doc: string): Promise<T | null> {
  const driver = storageDriver();
  if (driver === "blob") {
    const [latest] = await blobVersions(doc);
    return latest ? readBlobJson<T>(latest.url) : null;
  }
  if (driver === "fs") {
    const [latest] = await listVersions(doc);
    return latest ? readVersion<T>(doc, latest.id) : null;
  }
  return null;
}

/** Saves a new version and trims history beyond KEEP_VERSIONS. */
export async function writeDoc(doc: string, data: unknown): Promise<Version> {
  const driver = assertWritable();
  const id = newVersionId();
  const json = JSON.stringify(data);
  const rel = `${docPrefix(doc)}${id}.json`;

  if (driver === "blob") {
    await put(rel, json, {
      access: "public",
      contentType: "application/json; charset=utf-8",
      addRandomSuffix: false,
      // Immutable: a version's path is never reused.
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    const old = (await blobVersions(doc)).slice(KEEP_VERSIONS);
    if (old.length) await del(old.map((v) => v.url));
  } else {
    const dir = path.join(DATA_DIR, docPrefix(doc));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(DATA_DIR, rel), json, "utf8");
    const old = (await listVersions(doc)).slice(KEEP_VERSIONS);
    await Promise.all(old.map((v) => rm(path.join(dir, `${v.id}.json`), { force: true })));
  }

  return { id, at: versionAt(id), size: json.length };
}

/** Removes a document and its whole history. */
export async function deleteDoc(doc: string): Promise<void> {
  const driver = assertWritable();
  if (driver === "blob") {
    const all = await blobVersions(doc);
    if (all.length) await del(all.map((v) => v.url));
  } else {
    await rm(path.join(DATA_DIR, docPrefix(doc)), { recursive: true, force: true });
  }
}

/* ---------------------------------------------------------------- media */

const MEDIA_PREFIX = "media/";
/** Served by src/app/uploads/[key]/route.ts under the fs driver. */
export const LOCAL_MEDIA_URL = "/uploads/";

export interface StoredObject {
  key: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Dimensions travel in the filename (`name-stamp_1200x800.webp`) so listing
 * the library needs no image decoding and no separate index to keep in sync.
 * The gallery lays out by intrinsic ratio, so these must never be lost.
 */
export function mediaKey(base: string, ext: string, width?: number, height?: number): string {
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const dims = width && height ? `_${width}x${height}` : "";
  return `${base || "image"}-${stamp}${dims}${ext}`;
}

function parseDims(key: string): { width?: number; height?: number } {
  const m = key.match(/_(\d+)x(\d+)\.[a-z0-9]+$/i);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : {};
}

export function isSafeMediaKey(key: string): boolean {
  return /^[\p{L}\p{N}_.-]+$/u.test(key) && !key.startsWith(".") && !key.includes("..");
}

export async function putMedia(
  key: string,
  bytes: Uint8Array,
  contentType: string
): Promise<StoredObject> {
  const driver = assertWritable();
  if (driver === "blob") {
    const res = await put(`${MEDIA_PREFIX}${key}`, Buffer.from(bytes), {
      access: "public",
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { key, url: res.url, size: bytes.byteLength, ...parseDims(key) };
  }
  const dir = path.join(DATA_DIR, MEDIA_PREFIX);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), bytes);
  return { key, url: `${LOCAL_MEDIA_URL}${encodeURIComponent(key)}`, size: bytes.byteLength, ...parseDims(key) };
}

export async function listMedia(): Promise<StoredObject[]> {
  const driver = storageDriver();
  let out: StoredObject[] = [];
  if (driver === "blob") {
    out = (await blobList(MEDIA_PREFIX)).map((b) => {
      const key = b.pathname.slice(MEDIA_PREFIX.length);
      return { key, url: b.url, size: b.size, ...parseDims(key) };
    });
  } else if (driver === "fs") {
    try {
      const dir = path.join(DATA_DIR, MEDIA_PREFIX);
      const names = (await readdir(dir)).filter((n) => !n.startsWith("."));
      out = await Promise.all(
        names.map(async (key) => ({
          key,
          url: `${LOCAL_MEDIA_URL}${encodeURIComponent(key)}`,
          size: (await stat(path.join(dir, key))).size,
          ...parseDims(key),
        }))
      );
    } catch {
      out = [];
    }
  }
  return out.sort((a, b) => b.key.localeCompare(a.key));
}

export async function deleteMedia(key: string): Promise<void> {
  const driver = assertWritable();
  if (!isSafeMediaKey(key)) throw new Error("Invalid key");
  if (driver === "blob") {
    const hit = (await blobList(`${MEDIA_PREFIX}${key}`)).find(
      (b) => b.pathname === `${MEDIA_PREFIX}${key}`
    );
    if (hit) await del(hit.url);
  } else {
    await rm(path.join(DATA_DIR, MEDIA_PREFIX, key), { force: true });
  }
}

/** fs driver only: raw bytes for the local media route. */
export async function readLocalMedia(key: string): Promise<Uint8Array | null> {
  if (storageDriver() !== "fs" || !isSafeMediaKey(key)) return null;
  try {
    return new Uint8Array(await readFile(path.join(DATA_DIR, MEDIA_PREFIX, key)));
  } catch {
    return null;
  }
}
