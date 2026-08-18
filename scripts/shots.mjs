/**
 * Screenshot harness for the gauntlet loop.
 *
 * Captures the candidate and the bars at an identical viewport so the critic
 * compares like with like. Output filenames are deliberately neutral — the
 * critic must not be able to tell which is ours from a filename, or the blind
 * comparison is void. The mapping is written to a separate key file that the
 * critic is never shown.
 *
 *   node scripts/shots.mjs <round>
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = process.env.SHOT_DIR ?? path.join(process.cwd(), ".shots");
const round = process.argv[2] ?? "1";

const TARGETS = [
  { id: "candidate", url: "http://localhost:3000" },
  { id: "bar-cinecasero", url: "https://www.cinecasero.uy/" },
  { id: "bar-dieste", url: "https://www.eladiodieste.com/" },
];

/** Fisher-Yates, so label order is not stable between rounds. */
function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const dir = path.join(OUT, `round-${round}`);
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const labels = shuffle(["A", "B", "C"]);
const key = {};

for (let i = 0; i < TARGETS.length; i++) {
  const t = TARGETS[i];
  const label = labels[i];
  key[label] = t.id;

  const page = await ctx.newPage();
  try {
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 60_000 });
  } catch {
    // networkidle never settles on pages with looping media; a load event plus
    // a settle pause is enough for a screenshot.
    await page.waitForLoadState("load").catch(() => {});
  }
  await page.waitForTimeout(2500);

  /**
   * Some sites open on an intro/splash state that only clears on interaction
   * or after its animation finishes. Round 1 captured one of the bars as a
   * single dark screen holding nothing but a wordmark, and a critic correctly
   * called it unjudgeable — which quietly voided that whole comparison.
   * Nudge the page, then wait for it to actually have a page's worth of
   * height before believing what we see.
   */
  await page.mouse.move(720, 450);
  await page.mouse.click(720, 450).catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
  for (let n = 0; n < 12; n++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    if (h > 1400) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(dir, `${label}-fold.png`) });

  // Scroll the full height once so lazy-loaded imagery is decoded before the
  // full-page capture, otherwise half the page shoots as empty placeholders.
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y < document.body.scrollHeight && y < 30000) setTimeout(step, 120);
        else {
          window.scrollTo(0, 0);
          setTimeout(res, 600);
        }
      };
      step();
    });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(dir, `${label}-full.png`), fullPage: true });

  await page.close();
  console.log(`${label}  <-  ${t.id}`);
}

await browser.close();
await writeFile(path.join(dir, "KEY.json"), JSON.stringify(key, null, 2));
console.log(`\nwrote ${dir}`);
console.log("KEY.json holds the mapping — do not show it to a critic.");
