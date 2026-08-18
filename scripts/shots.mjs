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
/**
 * deviceScaleFactor 1, deliberately.
 *
 * At 2 the tiles come out 2880x1800 and get downscaled again when a critic
 * reads them, which is how four separate reviewers ended up asserting type
 * sizes that were off by two to three times. At 1 a "1440x900 tile" really is
 * 1440x900, and a claim about type size can be trusted or checked.
 */
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
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
  // tiles are taken, otherwise half the page shoots as empty placeholders.
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y < document.body.scrollHeight && y < 40000) setTimeout(step, 110);
        else {
          window.scrollTo(0, 0);
          setTimeout(res, 700);
        }
      };
      step();
    });
  });
  await page.waitForTimeout(1200);

  /**
   * Tiles, not one enormous fullPage capture.
   *
   * Two separate failures came out of the fullPage approach, and both quietly
   * corrupted a whole round of judging before they were caught:
   *
   *  1. Past roughly 15,000px Chromium stopped painting and returned blank.
   *     A 9,900px-tall page rendered its last quarter — including the entire
   *     footer — as empty ground, and two critics independently reported the
   *     page "stopped rather than closed". That criticism was of the harness.
   *  2. Even when it worked, a 20,000px image is downscaled so hard when read
   *     that absolute type sizes are unrecoverable. Critics confidently
   *     reported heading sizes that were wrong by 2-3x and prescribed fixes
   *     for problems that did not exist.
   *
   * Sampling evenly-spaced viewport tiles at 1:1 fixes both: nothing is
   * downscaled, and nothing past an arbitrary height is dropped.
   */
  const TILES = 6;
  const scrollable = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  for (let t = 0; t < TILES; t++) {
    const y = Math.round((scrollable * t) / (TILES - 1));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(650);
    await page.screenshot({
      path: path.join(dir, `${label}-t${String(t + 1).padStart(2, "0")}.png`),
    });
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.close();
  console.log(`${label}  <-  ${t.id}`);
}

await browser.close();
await writeFile(path.join(dir, "KEY.json"), JSON.stringify(key, null, 2));
console.log(`\nwrote ${dir}`);
console.log("KEY.json holds the mapping — do not show it to a critic.");
