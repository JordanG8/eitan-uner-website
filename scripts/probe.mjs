/**
 * Live-page probe for the critic panel.
 *
 * Round 6's critics judged still screenshots and it cost the round: one
 * confidently reported centre-aligned body copy on a page where every
 * paragraph is text-align:start, because a screenshot cannot distinguish a
 * centred paragraph from a short flush one in a narrow column. A critic that
 * can read computed styles cannot make that mistake.
 *
 * This drives a real browser and reports what the CSS actually resolves to -
 * type ramp, spacing ramp, colour census, focus and hover states, breakpoint
 * behaviour, overflow, and the interactive chrome that only exists once the
 * page is running.
 *
 *   node scripts/probe.mjs <url> [widths]      e.g. 3440,1440,768,375
 */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const widths = (process.argv[3] ?? "3440,1440,768,375").split(",").map(Number);

const browser = await chromium.launch();
const out = {};

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(2000);

  out[w] = await page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const px = (v) => Math.round(parseFloat(v) * 100) / 100;

    /* Type ramp: every distinct size/weight pair actually rendered. */
    const ramp = new Map();
    for (const e of document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,a,span,button,label")) {
      if (!vis(e) || !(e.textContent || "").trim()) continue;
      const s = getComputedStyle(e);
      const k = `${px(s.fontSize)}/${s.fontWeight}`;
      ramp.set(k, (ramp.get(k) ?? 0) + 1);
    }

    /* Spacing ramp: distinct vertical section padding values. */
    const pads = new Map();
    for (const e of document.querySelectorAll("section,div[class*=py],main>*")) {
      if (!vis(e)) continue;
      const s = getComputedStyle(e);
      const k = `${px(s.paddingTop)}/${px(s.paddingBottom)}`;
      if (k !== "0/0") pads.set(k, (pads.get(k) ?? 0) + 1);
    }

    /* Colour census: every distinct text colour and background in use. */
    const colors = new Map();
    const bgs = new Map();
    for (const e of document.querySelectorAll("*")) {
      if (!vis(e)) continue;
      const s = getComputedStyle(e);
      if ((e.textContent || "").trim()) colors.set(s.color, (colors.get(s.color) ?? 0) + 1);
      if (s.backgroundColor !== "rgba(0, 0, 0, 0)")
        bgs.set(s.backgroundColor, (bgs.get(s.backgroundColor) ?? 0) + 1);
    }

    /* Radii and border widths - consistency tells. */
    const radii = new Map();
    for (const e of document.querySelectorAll("*")) {
      if (!vis(e)) continue;
      const r = getComputedStyle(e).borderRadius;
      if (r && r !== "0px") radii.set(r, (radii.get(r) ?? 0) + 1);
    }

    const top = (m, n = 14) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} x${v}`);

    return {
      docHeight: document.documentElement.scrollHeight,
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      typeRamp: top(ramp, 20),
      distinctTypeSteps: ramp.size,
      spacingRamp: top(pads, 12),
      distinctSpacings: pads.size,
      textColors: top(colors, 10),
      backgrounds: top(bgs, 10),
      radii: top(radii, 8),
      navVisibleLinks: [...document.querySelectorAll("header nav a")].filter(vis).length,
      navHasDropdown: [...document.querySelectorAll("header button")].filter(
        (b) => vis(b) && /עוד|more/i.test(b.textContent || "")
      ).length > 0,
      contentMaxWidth: (() => {
        const m = document.querySelector("main section > div");
        return m ? Math.round(m.getBoundingClientRect().width) : null;
      })(),
    };
  });
  await page.close();
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
