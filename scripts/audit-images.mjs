/**
 * Are the source files big enough for the slots they land in?
 *
 * This deliberately does NOT read naturalWidth. Two rounds of trying that
 * produced confident, wrong answers:
 *
 *  - At DPR 1 the browser correctly picks 1x srcset entries, so every image
 *    reports ~1.0 and the page looks uniformly broken. It is not; that is
 *    next/image working.
 *  - At DPR 2, naturalWidth came back stale even with complete === true and
 *    every image awaited - contradicting itself across runs, and disagreeing
 *    with the optimiser, which when fetched directly returned full-size
 *    images every time.
 *
 * Worse, the scroll-everything pass used to force lazy images to decode trips
 * Chromium's preload scanner before layout, so `sizes` falls back to 100vw and
 * 144px logos request w=3840. That looked exactly like a real performance bug
 * and was purely self-inflicted.
 *
 * So: measure the rendered CSS width with a gentle, layout-settled pass, and
 * compare it against the intrinsic size of the file on disk. Both halves are
 * stable, and the ratio is the one that actually decides sharpness - if the
 * source has fewer than 2x the CSS pixels, no amount of correct srcset
 * behaviour will save it.
 *
 *   node scripts/audit-images.mjs [url]
 */
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "load", timeout: 60_000 });
await page.waitForTimeout(2500);

// Reveal lazy content without the preload-scanner side effects: step down the
// page, let layout settle at each stop, then measure in place.
const slots = await page.evaluate(async () => {
  const seen = new Map();
  const collect = () => {
    for (const i of Array.from(document.images)) {
      const r = i.getBoundingClientRect();
      if (r.width <= 8) continue;
      const raw = i.currentSrc || i.src;
      const m = raw.includes("url=") ? decodeURIComponent(raw.split("url=")[1].split("&")[0]) : raw;
      const file = m.split("?")[0];
      const css = Math.round(r.width);
      const key = file + "@" + css;
      if (!seen.has(key)) seen.set(key, { file, css });
    }
  };
  for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 550));
    collect();
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 400));
  collect();
  return [...seen.values()];
});
await browser.close();

const rows = [];
for (const s of slots) {
  if (!s.file.startsWith("/")) continue;
  const disk = path.join(process.cwd(), "public", s.file);
  try {
    const m = await sharp(disk).metadata();
    rows.push({ ...s, src: m.width, ratio: m.width / s.css });
  } catch {
    rows.push({ ...s, src: 0, ratio: 0 });
  }
}

rows.sort((a, b) => a.ratio - b.ratio);
let bad = 0;
console.log("ratio   css    source  file");
for (const r of rows) {
  const flag = r.ratio < 2 ? "   <-- under 2x" : "";
  if (r.ratio < 2) bad++;
  console.log(
    r.ratio.toFixed(2).padStart(5),
    String(r.css).padStart(6),
    String(r.src).padStart(8),
    "  " + r.file.replace("/images/", "").slice(0, 40) + flag
  );
}
console.log(`\n${rows.length} slots, ${bad} whose source cannot fill them at 2x`);
