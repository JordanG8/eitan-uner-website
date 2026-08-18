/**
 * Every rendered image, checked against the slot it actually lands in.
 *
 * The ratio that matters is naturalWidth / rendered CSS width. Below 2 the
 * image is soft on a retina display; below 1 it is being upscaled outright.
 * Declared width in the content registry drives what next/image generates, so
 * a stale declaration silently caps the srcset - which is exactly how a
 * 3200px photograph ended up serving at 1400.
 *
 *   node scripts/audit-images.mjs [url]
 */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
/**
 * deviceScaleFactor 2, and that is the whole point of this script.
 *
 * At DPR 1 the browser correctly selects 1x entries from the srcset, so
 * naturalWidth/cssWidth lands near 1.0 for every well-behaved image on the
 * page - which reads as "26 soft images" and is in fact next/image working
 * exactly as designed. The question being asked here is whether a 2x variant
 * exists and is large enough, so the measurement has to be taken on a 2x
 * device. Measuring at DPR 1 answers a different question and answers it
 * misleadingly.
 */
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

// Force every lazy image to decode before measuring.
await page.evaluate(async () => {
  await new Promise((res) => {
    let y = 0;
    const step = () => {
      window.scrollBy(0, window.innerHeight);
      y += window.innerHeight;
      if (y < document.body.scrollHeight && y < 40000) setTimeout(step, 90);
      else { window.scrollTo(0, 0); setTimeout(res, 1500); }
    };
    step();
  });
});
await page.waitForTimeout(3000);
await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));

const rows = await page.evaluate(() =>
  Array.from(document.querySelectorAll("img"))
    .map((i) => {
      const r = i.getBoundingClientRect();
      return {
        src: (i.currentSrc || i.src).split("?")[0].split("/").pop(),
        url: (i.currentSrc || i.src).includes("url=")
          ? decodeURIComponent((i.currentSrc || i.src).split("url=")[1].split("&")[0]).split("/").pop()
          : null,
        css: Math.round(r.width),
        nat: i.naturalWidth,
      };
    })
    .filter((r) => r.css > 8)
);

const seen = new Map();
for (const r of rows) {
  const name = r.url ?? r.src;
  const ratio = r.css ? r.nat / r.css : 0;
  const prev = seen.get(name + r.css);
  if (!prev || ratio > prev.ratio) seen.set(name + r.css, { name, ...r, ratio });
}

const list = [...seen.values()].sort((a, b) => a.ratio - b.ratio);
let bad = 0;
console.log("ratio  css   nat   file");
for (const r of list) {
  const flag = r.ratio < 2 ? (r.ratio < 1 ? "  <-- UPSCALED" : "  <-- soft at 2x") : "";
  if (r.ratio < 2) bad++;
  console.log(
    String(r.ratio.toFixed(2)).padStart(5),
    String(r.css).padStart(5),
    String(r.nat).padStart(5),
    " " + r.name.slice(0, 40) + flag
  );
}
console.log(`\n${list.length} images, ${bad} below 2x`);
await browser.close();
process.exit(bad > 0 ? 1 : 0);
