import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Publish endpoint for the Puck spike.
 *
 * Deliberately local-only. Vercel's filesystem is read-only at runtime, so this
 * writes a JSON file when running locally and refuses clearly in production
 * rather than pretending to save. Choosing the real store — Postgres you own, or
 * a commit back to your own GitHub repo — is the open decision, and it is the
 * only thing standing between this spike and a working CMS.
 */

const STORE = path.join(process.cwd(), "puck-data.json");

export async function POST(request: Request) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "אין אפשרות לשמור בסביבת הייצור — יש לבחור מקום אחסון (בסיס נתונים או commit ל-git).",
      },
      { status: 501 }
    );
  }

  try {
    const data = await request.json();
    if (!data || typeof data !== "object" || !("content" in data)) {
      return NextResponse.json({ error: "Invalid Puck payload" }, { status: 400 });
    }
    await writeFile(STORE, JSON.stringify(data, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
