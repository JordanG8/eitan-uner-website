import { NextResponse } from "next/server";
import { EditorError } from "@/lib/pages";
import { requireEditor } from "@/lib/session";
import { storageDriver, UNAVAILABLE_MESSAGE } from "@/lib/store";

/** Auth, storage check and error shaping shared by the editor's API routes. */
export async function handle<T>(fn: () => Promise<T>, { write = true } = {}): Promise<NextResponse> {
  const denied = await requireEditor();
  if (denied) return denied;
  if (write && storageDriver() === "unavailable") {
    return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 501 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await fn()) });
  } catch (err) {
    const status = err instanceof EditorError ? err.status : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}

export async function body<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new EditorError("בקשה לא תקינה");
  }
}
