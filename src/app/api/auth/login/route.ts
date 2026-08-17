import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  authConfig,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

/**
 * Login.
 *
 * Deliberately slow to fail: a fixed delay on a wrong password blunts online
 * guessing without needing a rate-limit store. The response never distinguishes
 * "no such user" from "wrong password" because there is only one account.
 */

const WRONG_PASSWORD_DELAY_MS = 600;

export async function POST(request: Request) {
  const cfg = authConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "העריכה לא מוגדרת בשרת." },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!password || !(await verifyPassword(password, cfg.hash))) {
    await new Promise((r) => setTimeout(r, WRONG_PASSWORD_DELAY_MS));
    return NextResponse.json({ error: "הסיסמה שגויה" }, { status: 401 });
  }

  const token = await createSessionToken("editor", cfg.secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
