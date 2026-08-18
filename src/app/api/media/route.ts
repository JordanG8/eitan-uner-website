import { NextResponse } from "next/server";
import { IMAGE_OPTIONS, CLIENT_LOGOS } from "@/puck/assets";
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  listObjects,
  optimize,
  putObjects,
  storageDriver,
} from "@/lib/storage";

/**
 * Media library.
 *
 * GET  — everything pickable: images shipped in the repo, plus uploads.
 * POST — upload, re-encode, store. Multiple files land in a single commit.
 */

export const runtime = "nodejs";
export const maxDuration = 60; // re-encoding several large photos is not instant

function builtIns() {
  return [...IMAGE_OPTIONS, ...CLIENT_LOGOS].map((o) => ({
    key: o.value,
    url: o.value,
    label: o.label,
    builtIn: true as const,
    size: 0,
  }));
}

export async function GET() {
  const uploads = (await listObjects()).map((o) => ({ ...o, builtIn: false as const }));
  return NextResponse.json({
    driver: storageDriver(),
    items: [...uploads, ...builtIns()],
  });
}

export async function POST(request: Request) {
  if (storageDriver() === "unavailable") {
    return NextResponse.json(
      {
        error:
          "אין אחסון מוגדר. יש להגדיר GITHUB_TOKEN ו־GITHUB_REPO בהגדרות הפרויקט.",
      },
      { status: 501 }
    );
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

  const prepared = [];
  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: `סוג קובץ לא נתמך: ${file.type || "לא ידוע"}` },
        { status: 415 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `הקובץ ${file.name} גדול מדי (${Math.round(file.size / 1024 / 1024)}MB). המקסימום ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`,
        },
        { status: 413 }
      );
    }

    const original = new Uint8Array(await file.arrayBuffer());
    try {
      const { bytes, key, width, height } = await optimize(original, file.type, file.name);
      prepared.push({
        key,
        bytes,
        meta: { width, height, originalSize: original.byteLength },
      });
    } catch (err) {
      return NextResponse.json(
        { error: `לא ניתן לעבד את ${file.name}: ${(err as Error).message}` },
        { status: 422 }
      );
    }
  }

  try {
    const items = await putObjects(prepared);
    return NextResponse.json({ ok: true, items, driver: storageDriver() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
