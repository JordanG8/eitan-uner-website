import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireEditor } from "@/lib/session";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, optimize } from "@/lib/media";
import { deleteMedia, listMedia, putMedia, storageDriver, UNAVAILABLE_MESSAGE } from "@/lib/store";
import { IMAGE_OPTIONS, CLIENT_LOGOS } from "@/lib/assets";

/**
 * Media library.
 *
 * GET    — everything pickable: uploads, plus the images shipped with the site.
 * POST   — upload, re-encode, store.
 * DELETE — remove an upload (?key=…).
 */

export const runtime = "nodejs";
export const maxDuration = 60; // re-encoding several large photos is not instant

let builtInCache: Promise<unknown[]> | null = null;

/** The shipped images, with dimensions read once per server instance. */
function builtIns() {
  builtInCache ??= Promise.all(
    [...IMAGE_OPTIONS, ...CLIENT_LOGOS].map(async (o) => {
      let dims: { width?: number; height?: number } = {};
      try {
        const m = await sharp(path.join(process.cwd(), "public", o.value)).metadata();
        dims = { width: m.width, height: m.height };
      } catch {
        /* listed without dimensions */
      }
      return { key: o.value, url: o.value, label: o.label, builtIn: true as const, size: 0, ...dims };
    })
  );
  return builtInCache;
}

export async function GET() {
  const denied = await requireEditor();
  if (denied) return denied;
  try {
    const uploads = (await listMedia()).map((o) => ({ ...o, label: o.key, builtIn: false as const }));
    return NextResponse.json({ driver: storageDriver(), items: [...uploads, ...(await builtIns())] });
  } catch (err) {
    return NextResponse.json({ driver: storageDriver(), items: await builtIns(), error: (err as Error).message });
  }
}

export async function POST(request: Request) {
  const denied = await requireEditor();
  if (denied) return denied;
  if (storageDriver() === "unavailable") {
    return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 501 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) {
    return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
  }

  const items = [];
  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: `סוג קובץ לא נתמך: ${file.type || "לא ידוע"}` }, { status: 415 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `הקובץ ${file.name} גדול מדי (${Math.round(file.size / 1024 / 1024)}MB). המקסימום ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`,
        },
        { status: 413 }
      );
    }

    try {
      const original = new Uint8Array(await file.arrayBuffer());
      const { bytes, key, contentType } = await optimize(original, file.type, file.name);
      items.push(await putMedia(key, bytes, contentType));
    } catch (err) {
      return NextResponse.json({ error: `לא ניתן לשמור את ${file.name}: ${(err as Error).message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, items, driver: storageDriver() });
}

export async function DELETE(request: Request) {
  const denied = await requireEditor();
  if (denied) return denied;
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "חסר מפתח" }, { status: 400 });
  try {
    await deleteMedia(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
