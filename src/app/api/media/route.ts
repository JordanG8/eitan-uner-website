import { NextResponse } from "next/server";
import { IMAGE_OPTIONS, CLIENT_LOGOS } from "@/puck/assets";
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  listObjects,
  putObject,
  safeKey,
  storageDriver,
} from "@/lib/storage";

/**
 * Media library.
 *
 * GET  — everything pickable: images already committed to the repo, plus uploads.
 * POST — multipart upload, one or more files.
 *
 * Auth is enforced by middleware for /api/media, so these handlers assume a
 * valid session.
 */

export const runtime = "nodejs";

/** The curated images shipped in the repo. Not deletable from the UI. */
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
          "אין אחסון מוגדר בסביבת הייצור. יש לחבר אחסון אובייקטים (Cloudflare R2) או להריץ על שרת עם דיסק.",
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

  const uploaded = [];
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
          error: `הקובץ ${file.name} גדול מדי (${Math.round(file.size / 1024 / 1024)}MB). המקסימום הוא ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`,
        },
        { status: 413 }
      );
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    uploaded.push(await putObject(safeKey(file.name), bytes));
  }

  return NextResponse.json({ ok: true, items: uploaded });
}
