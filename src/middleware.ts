import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, authConfig, verifySessionToken } from "@/lib/auth";

/**
 * Gate on the editing surfaces.
 *
 * Fails closed: if AUTH_SECRET or EDITOR_PASSWORD_HASH is missing, /editor is
 * blocked rather than left open. A misconfigured deploy should lock us out, not
 * the internet in.
 */
export const config = {
  matcher: ["/editor/:path*", "/api/puck/:path*", "/api/media/:path*"],
};

export async function middleware(request: NextRequest) {
  const cfg = authConfig();
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  if (!cfg) {
    return isApi
      ? NextResponse.json(
          { error: "Auth is not configured: set AUTH_SECRET and EDITOR_PASSWORD_HASH." },
          { status: 503 }
        )
      : new NextResponse(
          "<!doctype html><html lang=he dir=rtl><meta charset=utf-8>" +
            "<body style='font-family:system-ui;padding:3rem;line-height:1.8'>" +
            "<h1>העריכה לא מוגדרת</h1><p>יש להגדיר את משתני הסביבה " +
            "<code>AUTH_SECRET</code> ו־<code>EDITOR_PASSWORD_HASH</code>.</p></body></html>",
          { status: 503, headers: { "content-type": "text/html; charset=utf-8" } }
        );
  }

  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    cfg.secret
  );
  if (session) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}
