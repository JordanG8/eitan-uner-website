import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, authConfig, verifySessionToken } from "./auth";

/**
 * Session check for route handlers.
 *
 * proxy.ts already gates /editor and the editing APIs; this repeats the check
 * where the write happens, so an API can never be reached by a request that
 * slipped past the proxy matcher.
 */
export async function isEditor(): Promise<boolean> {
  const cfg = authConfig();
  if (!cfg) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token, cfg.secret));
}

/** null when signed in, otherwise the response to return. */
export async function requireEditor(): Promise<NextResponse | null> {
  if (await isEditor()) return null;
  return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
}
