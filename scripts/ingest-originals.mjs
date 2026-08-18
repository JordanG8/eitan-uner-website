/**
 * Re-ingest site imagery from Eitan's camera originals.
 *
 * The assets shipped so far were cropped out of site123 screenshots, which
 * capped the hero at 659px and every gallery frame at 1600px. That ceiling was
 * self-imposed: 61 of the photographs in the source folder are 12–24MP. Three
 * separate critic panels named image scale as the single largest gap and I
 * answered "the source is only 659px wide" each time, which was true of the
 * asset and false of the archive.
 *
 * Only same-subject replacements are listed here. Each mapping was confirmed by
 * eye against a contact sheet of the current assets, because the Hebrew alt text
 * in content.ts describes the specific photograph — swapping in a different
 * image would silently make every alt attribute a lie.
 *
 *   node scripts/ingest-originals.mjs [--dry]
 */
import sharp from "sharp";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SRC = "C:/Users/jorda/Downloads/eitanuner";
const DEST = "public/images";
const DRY = process.argv.includes("--dry");

/** Long edge. Generous — the layout can now ask for a full-bleed 1920 and get
 *  it without upscaling, and sharp re-encodes to WebP so the cost is modest. */
const MAX_EDGE = 3200;
const QUALITY = 86;

const MAP = [
  ["gallery-deadsea.webp", "פיצוץ ים המלח 7-1.jpg"],
  ["gallery-valley-dusk.webp", "עמק הנעלם 21-12-19 114.JPG"],
  ["gallery-white-dress.webp", "סיוון רגב 571.JPG"],
  ["gallery-white-dress-2.webp", "סיוון רגב 956.JPG"],
  ["gallery-white-flower.webp", "פרח 19.JPG"],
  ["gallery-palms-dusk.webp", "20241215_165459.jpg"],
  ["sculpture-lawn.webp", "פורים 2021 271.JPG"],
  // Mid-resolution band: smaller gains, but still real.
  ["gallery-iris.webp", "אירוס חתוך.jpg"],
  // memorial-flag deliberately absent. I mapped it to 20241224_085403.jpg on a
  // filename hunch and overwrote the memorial photograph with a picture of a
  // budding branch — the exact alt-text mismatch this file warns about two
  // paragraphs up. Every mapping here was eyeballed against a contact sheet;
  // that one was not. Its best source is 1920x1080, a marginal gain, so it stays
  // as shipped until it is confirmed visually.
];

/**
 * Deliberately NOT in the map: eitan-hero, eitan-portrait-bw, eitan-crouching.
 *
 * There is no high-resolution photograph of Eitan in the archive — every image
 * of him tops out around 1080px, because he is behind the camera in almost all
 * of them. That is a real constraint rather than the imagined one, and it is why
 * the fold leads with his work at full bleed and keeps his portrait inset: a
 * 659px portrait blown across a 1440px viewport would advertise the weakest
 * asset on the site. If he ever sends a proper headshot, the hero can invert.
 */

let upgraded = 0;
for (const [asset, original] of MAP) {
  const from = path.join(SRC, original);
  const to = path.join(DEST, asset);

  if (!existsSync(from)) {
    console.log(`SKIP  ${asset}  (original not found: ${original})`);
    continue;
  }

  // Read the destination through a buffer, never by path. sharp keeps a handle
  // on a file it opened, and with the dev server's image optimiser also touching
  // public/images that was enough to make writing back fail on Windows with
  // EPERM / "Invalid argument".
  const before = existsSync(to) ? await sharp(readFileSync(to)).metadata() : null;
  const srcMeta = await sharp(readFileSync(from)).metadata();

  if (before && Math.max(srcMeta.width, srcMeta.height) <= Math.max(before.width, before.height)) {
    console.log(`SKIP  ${asset}  (original is not larger)`);
    continue;
  }

  if (!DRY) {
    // .rotate() first so EXIF orientation is baked in rather than carried.
    const buf = await sharp(readFileSync(from))
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    writeFileSync(to, buf);
  }

  const after = DRY ? null : await sharp(readFileSync(to)).metadata();
  console.log(
    `OK    ${asset.padEnd(28)} ${before ? `${before.width}x${before.height}` : "new"}` +
      ` -> ${after ? `${after.width}x${after.height}` : `${srcMeta.width}x${srcMeta.height} (dry)`}`
  );
  upgraded++;
}

console.log(`\n${upgraded} asset(s) ${DRY ? "would be" : ""} upgraded.`);
