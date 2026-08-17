/**
 * Generates the two env values the editor needs.
 *
 *   npx tsx scripts/set-password.mts "your-password-here"
 *
 * Prints AUTH_SECRET and EDITOR_PASSWORD_HASH to paste into .env.local and into
 * Vercel's environment variables. The password itself is never written anywhere.
 */

import { hashPassword } from "../src/lib/auth";

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error("Usage: npx tsx scripts/set-password.mts <password>");
  console.error("Use at least 10 characters.");
  process.exit(1);
}

const secretBytes = crypto.getRandomValues(new Uint8Array(32));
const secret = Buffer.from(secretBytes).toString("base64url");

const hash = await hashPassword(password);

console.log("\n# Paste into .env.local (and into Vercel → Settings → Environment Variables)\n");
console.log(`AUTH_SECRET=${secret}`);
console.log(`EDITOR_PASSWORD_HASH=${hash}`);
console.log("\n# Rotating AUTH_SECRET signs everyone out immediately.\n");
