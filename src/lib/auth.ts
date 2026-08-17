/**
 * Session auth for the editing surfaces.
 *
 * Web Crypto only — no node:crypto — so the same helpers run in middleware
 * (edge runtime) and in route handlers.
 *
 * Shape: the password is never stored, only a PBKDF2 hash in EDITOR_PASSWORD_HASH.
 * On success we mint an HMAC-signed cookie containing just a subject and an
 * expiry. There is no session table to keep, and a leaked cookie expires on its
 * own. Rotating AUTH_SECRET invalidates every session at once.
 */

const encoder = new TextEncoder();

export const SESSION_COOKIE = "eu_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

const PBKDF2_ITERATIONS = 210_000;

/* ------------------------------------------------------------ base64url */

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Constant-time comparison, so a wrong guess leaks no timing signal. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/* ------------------------------------------------------------- password */

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

/**
 * Produces the string to put in EDITOR_PASSWORD_HASH.
 *
 * Colon-separated, not the conventional `$`: Next.js performs `$VAR` expansion
 * when parsing .env files, which silently mangles a `$`-delimited hash and shows
 * up as "correct password rejected". base64url never contains a colon, so this
 * is unambiguous.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${toBase64Url(salt)}:${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const salt = fromBase64Url(parts[2]);
  const expected = fromBase64Url(parts[3]);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: Number(parts[1]) || PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    expected.length * 8
  );
  return timingSafeEqual(new Uint8Array(bits), expected);
}

/* -------------------------------------------------------------- session */

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(subject: string, secret: string): Promise<string> {
  const payload = { sub: subject, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<{ sub: string } | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    fromBase64Url(sig) as BufferSource,
    encoder.encode(body)
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return { sub: String(payload.sub) };
  } catch {
    return null;
  }
}

/**
 * Config check used by both middleware and the login route, so a half-configured
 * deployment fails closed instead of leaving /editor open.
 */
export function authConfig(): { secret: string; hash: string } | null {
  const secret = process.env.AUTH_SECRET;
  const hash = process.env.EDITOR_PASSWORD_HASH;
  if (!secret || secret.length < 32 || !hash) return null;
  return { secret, hash };
}
