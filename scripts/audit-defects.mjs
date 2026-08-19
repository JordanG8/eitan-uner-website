/**
 * Defect audit — the measurement side of the fix backlog.
 *
 * probe.mjs answers "what does this page look like in aggregate": the type
 * ramp, the colour census, the spacing census. That is the right instrument
 * for a critic panel and the wrong one for a defect list, because almost every
 * item on this backlog is a *state*: a cursor on a button, an outline colour
 * 30ms into a focus, a header sampled either side of a scroll threshold, a
 * hover diff on an element that only inverts over a hero.
 *
 * None of that is visible in a static census, which is exactly why the
 * backlog's items survived seven rounds of judging. This script drives the
 * states and reports the computed values on both sides of each one, so a fix
 * can be shown to have moved a number rather than asserted.
 *
 * Round 6's rule applies here more than anywhere: when a measurement indicts
 * everything, suspect the instrument. Every check below reports the raw
 * computed value, not a pass/fail, so a wrong instrument shows up as a
 * nonsense number rather than as a confident verdict.
 *
 *   node scripts/audit-defects.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const R = {};

const px = (v) => Math.round(parseFloat(v) * 100) / 100;

/* ------------------------------------------------------------------ 375 */
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  R["1_cursor_mobile"] = await page.evaluate(() => {
    const out = {};
    const t = document.querySelector('header button[aria-label="פתיחת התפריט"]');
    if (t) out.hamburger = getComputedStyle(t).cursor;
    for (const a of document.querySelectorAll("a[href]")) {
      const r = a.getBoundingClientRect();
      if (r.width > 0) { out.sampleAnchor = getComputedStyle(a).cursor; break; }
    }
    return out;
  });

  /* 12 — tap targets at 375. Named by their accessible name so the report
     survives a class change. */
  R["12_tap_targets_375"] = await page.evaluate(() => {
    const wanted = [
      'header button[aria-label="פתיחת התפריט"]',
      'a[href="/תמונות-לרכישה"]',
      'a[href*="google.com/maps/search"]',
      'footer a[href^="tel:"]',
      'footer a[href^="mailto:"]',
      'footer a[href="/צרו-קשר"]',
      'footer a[href="/הצהרת-נגישות"]',
      'a[aria-label="שליחת הודעה בוואטסאפ"]',
    ];
    const out = {};
    for (const sel of wanted) {
      const el = document.querySelector(sel);
      if (!el) { out[sel] = "NOT FOUND"; continue; }
      const r = el.getBoundingClientRect();
      out[sel] = `${Math.round(r.width)}x${Math.round(r.height)}`;
    }
    return out;
  });

  R["10_band_padding"] = {};
  for (const w of [375, 640, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(120);
    R["10_band_padding"][w] = await page.evaluate(() => {
      const b = document.querySelector(".band");
      if (!b) return null;
      const s = getComputedStyle(b);
      const h = document.querySelector("main h2, main h1");
      return {
        bandPy: Math.round(parseFloat(s.paddingTop)),
        headingFontSize: h ? Math.round(parseFloat(getComputedStyle(h).fontSize) * 100) / 100 : null,
      };
    });
  }
  await page.close();
}

/* ------------------------------------------------------------ desktop / */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1800);

  /* 7 + 8 — the radius law. A probe element rather than a live one, because
     the point is what a bare `rounded` *resolves to*, live usage or not. */
  R["7_radius"] = await page.evaluate(() => {
    const mk = (cls) => {
      const d = document.createElement("div");
      d.className = cls;
      d.style.position = "fixed";
      d.style.width = d.style.height = "40px";
      document.body.appendChild(d);
      const r = getComputedStyle(d).borderRadius;
      d.remove();
      return r;
    };
    return {
      rounded: mk("rounded"),
      roundedFull: mk("rounded-full"),
      roundedMd: mk("rounded-md"),
      varRadius: getComputedStyle(document.documentElement).getPropertyValue("--radius") || "(unset)",
    };
  });

  /* 2 + 8 — the focus ring: is it instant, and does it round the box? */
  R["2_focus_ring"] = await page.evaluate(async () => {
    const a = [...document.querySelectorAll("main a[href], footer a[href]")].find(
      (e) => e.getBoundingClientRect().width > 0
    );
    if (!a) return "no link";
    const s0 = getComputedStyle(a);
    const before = {
      transitionProperty: s0.transitionProperty,
      transitionDuration: s0.transitionDuration,
      restColor: s0.color,
    };
    a.focus({ focusVisible: true });
    // Chrome only paints :focus-visible for keyboard-ish focus; .focus() from
    // script counts when the element was not last interacted with by pointer.
    const at = (ms) =>
      new Promise((res) =>
        setTimeout(() => {
          const s = getComputedStyle(a);
          res({ t: ms, outlineColor: s.outlineColor, outlineWidth: s.outlineWidth, borderRadius: s.borderRadius });
        }, ms)
      );
    const samples = [];
    samples.push(await at(0));
    samples.push(await at(30));
    samples.push(await at(120));
    samples.push(await at(300));
    return { ...before, samples, focusTransitionDuration: getComputedStyle(a).transitionDuration };
  });

  R["2_transition_colors_population"] = await page.evaluate(
    () =>
      [...document.querySelectorAll("*")].filter((e) =>
        getComputedStyle(e).transitionProperty.includes("outline-color")
      ).length
  );

  /* 3 — the header either side of the scroll threshold. */
  R["3_header_scroll"] = await page.evaluate(async () => {
    const h = document.querySelector("header");
    const read = () => {
      const s = getComputedStyle(h);
      return {
        bg: s.backgroundColor,
        backdrop: s.backdropFilter || s.webkitBackdropFilter,
        transitionProperty: s.transitionProperty,
        transitionDuration: s.transitionDuration,
      };
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.scrollTo(0, 650);
    await wait(400);
    const at650 = read();
    window.scrollTo(0, 700);
    await wait(16);
    const at700_1frame = read();
    await wait(400);
    const at700_settled = read();
    window.scrollTo(0, 0);
    await wait(400);
    return { at650, at700_1frame, at700_settled };
  });

  /* 4 + 5 — header hover diffs, in both header states. */
  const hoverDiff = async (sel, label) => {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) return { [label]: "NOT FOUND" };
    const read = () =>
      el.evaluate((e) => {
        const s = getComputedStyle(e);
        const inner = e.querySelector("span, svg");
        const si = inner ? getComputedStyle(inner) : null;
        return {
          color: s.color,
          transitionProperty: s.transitionProperty,
          transitionDuration: s.transitionDuration,
          innerColor: si ? si.color : null,
        };
      });
    const rest = await read();
    await el.hover({ force: true });
    await page.waitForTimeout(350);
    const hover = await read();
    await page.mouse.move(5, 500);
    await page.waitForTimeout(250);
    return { rest, hover, changed: JSON.stringify(rest) !== JSON.stringify(hover) };
  };

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  R["4_contact_icons_overHero"] = {
    tel: await hoverDiff('header a[href^="tel:"]', "tel"),
    mailto: await hoverDiff('header a[href^="mailto:"]', "mailto"),
    wrapperOpacity: await page.evaluate(() => {
      const a = document.querySelector('header a[href^="tel:"]');
      return a ? getComputedStyle(a.parentElement).opacity : null;
    }),
  };
  R["5_logo_overHero"] = await hoverDiff('header a[aria-label="לדף הבית"]', "logo");

  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(600);
  R["4_contact_icons_light"] = {
    tel: await hoverDiff('header a[href^="tel:"]', "tel"),
  };
  R["5_logo_light"] = await hoverDiff('header a[aria-label="לדף הבית"]', "logo");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  /* 6 — the three "primary" buttons. */
  R["6_primary_buttons"] = {};
  for (const [label, sel] of [
    ["hero על פוטותרפיה", 'main a[data-slot="button"]'],
    ["whatsapp FAB", 'a[aria-label="שליחת הודעה בוואטסאפ"]'],
  ]) {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) { R["6_primary_buttons"][label] = "NOT FOUND"; continue; }
    const read = () =>
      el.evaluate((e) => {
        const s = getComputedStyle(e);
        return { variant: e.dataset.variant, bg: s.backgroundColor, color: s.color, border: s.borderColor };
      });
    const rest = await read();
    await el.hover({ force: true });
    await page.waitForTimeout(350);
    const hover = await read();
    await page.mouse.move(5, 500);
    R["6_primary_buttons"][label] = { rest, hover };
  }

  /* Every distinct button variant's rest/hover pair, from the DOM. */
  R["6_variant_matrix"] = await page.evaluate(() => {
    const out = {};
    for (const e of document.querySelectorAll('[data-slot="button"]')) {
      const s = getComputedStyle(e);
      out[e.dataset.variant ?? "?"] ??= { rest: `${s.backgroundColor} / ${s.color}`, text: e.textContent.trim().slice(0, 24) };
    }
    return out;
  });

  /* 9 — the paper alpha census, as rendered. */
  R["9_paper_alphas"] = await page.evaluate(() => {
    const isPaperish = (c) => {
      const m = c.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
      if (!m) return false;
      const [r, g, b] = [+m[1], +m[2], +m[3]];
      return Math.abs(r - 239) < 3 && Math.abs(g - 237) < 3 && Math.abs(b - 230) < 3;
    };
    const colors = new Map();
    for (const e of document.querySelectorAll("*")) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || !(e.textContent || "").trim()) continue;
      const s = getComputedStyle(e);
      if (isPaperish(s.color) || s.color.startsWith("rgba(239")) {
        colors.set(s.color, (colors.get(s.color) ?? 0) + 1);
      }
    }
    return [...colors.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} x${v}`);
  });

  /* 13/14/15 — the keyboard path. */
  R["13_14_15_a11y"] = await page.evaluate(() => {
    const main = document.getElementById("main");
    const frames = [...document.querySelectorAll("iframe")].map((f) => ({
      title: f.title,
      tabIndex: f.getAttribute("tabindex"),
      outlineStyle: getComputedStyle(f).outlineStyle,
    }));
    const trigger = [...document.querySelectorAll("header button")].find((b) =>
      /עוד/.test(b.textContent || "")
    );
    return {
      mainTabIndex: main ? main.getAttribute("tabindex") : "no #main",
      iframes: frames,
      overflowTrigger: trigger
        ? { ariaHaspopup: trigger.getAttribute("aria-haspopup"), ariaExpanded: trigger.getAttribute("aria-expanded"), cursor: getComputedStyle(trigger).cursor }
        : "not rendered at this width",
      ariaLiveCount: document.querySelectorAll("[aria-live]").length,
    };
  });

  /* 16 — the carousel. */
  R["16_carousel"] = await page.evaluate(() => {
    const bq = [...document.querySelectorAll("blockquote")].find((b) => b.closest("figure"));
    if (!bq) return "no figure blockquote";
    const s = getComputedStyle(bq);
    const fig = bq.closest("figure");
    const btns = [...document.querySelectorAll('button[aria-label="ההמלצה הבאה"], button[aria-label="המלצה קודמת"]')];
    const indicator = [...document.querySelectorAll("p")].find((p) => /^\s*\d+\s*\/\s*\d+\s*$/.test(p.textContent));
    return {
      transitionDuration: s.transitionDuration,
      animationName: s.animationName,
      figureAriaLive: fig.getAttribute("aria-live"),
      arrowCursor: btns[0] ? getComputedStyle(btns[0]).cursor : null,
      arrowCount: btns.length,
      indicatorText: indicator ? indicator.textContent.trim().replace(/\s+/g, " ") : "(none found)",
    };
  });

  /* 17 — ::selection, read off the stylesheets rather than guessed. */
  R["17_selection"] = await page.evaluate(() => {
    let hits = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      const walk = (rs) => {
        for (const r of rs) {
          if (r.cssRules) walk(r.cssRules);
          else if (r.selectorText && r.selectorText.includes("selection")) hits.push(r.cssText.slice(0, 160));
        }
      };
      walk(rules);
    }
    return hits.length ? hits : "NO ::selection RULE";
  });

  /* 18 — the skip link, focused. */
  R["18_skip_link"] = await page.evaluate(async () => {
    const a = document.querySelector('a[href="#main"]');
    if (!a) return "no skip link";
    a.focus();
    await new Promise((r) => setTimeout(r, 260));
    const s = getComputedStyle(a);
    const out = { color: s.color, background: s.backgroundColor, height: Math.round(a.getBoundingClientRect().height), width: Math.round(a.getBoundingClientRect().width) };
    a.blur();
    return out;
  });

  /* 19 — one role, how many leadings? */
  R["19_rise_leading"] = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll("h1,h2,h3,h4,p,blockquote")) {
      const s = getComputedStyle(e);
      if (Math.abs(parseFloat(s.fontSize) - 25) > 0.6) continue;
      const r = e.getBoundingClientRect();
      if (r.width === 0) continue;
      out.push({
        tag: e.tagName,
        text: (e.textContent || "").trim().slice(0, 22),
        fontSize: Math.round(parseFloat(s.fontSize) * 100) / 100,
        lineHeight: Math.round(parseFloat(s.lineHeight) * 100) / 100,
        ratio: Math.round((parseFloat(s.lineHeight) / parseFloat(s.fontSize)) * 1000) / 1000,
      });
    }
    return out;
  });

  await page.close();
}

/* ------------------------------------------------------------- gutters */
R["11_gutters"] = {};
for (const w of [1024, 1440, 1920, 3440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base, { waitUntil: "load" });
  await page.waitForTimeout(1600);
  R["11_gutters"][w] = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    // RTL: the shared axis is the *right* edge of the viewport.
    const startGutter = (el) => (el ? Math.round(vw - el.getBoundingClientRect().right) : null);
    const logo = document.querySelector('header a[aria-label="לדף הבית"]');
    const h1 = document.querySelector("main h1");
    const p = document.querySelector("main p");
    const h2 = document.querySelector("main h2");
    return {
      logo: startGutter(logo),
      h1: startGutter(h1),
      firstParagraph: startGutter(p),
      firstH2: startGutter(h2),
      navInlineLinks: [...document.querySelectorAll("header nav a")].filter(
        (a) => a.getBoundingClientRect().width > 0
      ).length,
      overflowTriggerPresent: [...document.querySelectorAll("header button")].some(
        (b) => b.getBoundingClientRect().width > 0 && /עוד/.test(b.textContent || "")
      ),
    };
  });
  await page.close();
}

/* --------------------------------------------------------------- /404 */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/definitely-not-a-page`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  R["19_rise_leading_404"] = await page.evaluate(() => {
    const h = document.querySelector("main h1");
    if (!h) return null;
    const s = getComputedStyle(h);
    return {
      fontSize: Math.round(parseFloat(s.fontSize) * 100) / 100,
      lineHeight: Math.round(parseFloat(s.lineHeight) * 100) / 100,
      ratio: Math.round((parseFloat(s.lineHeight) / parseFloat(s.fontSize)) * 1000) / 1000,
    };
  });
  await page.close();
}

console.log(JSON.stringify(R, null, 1));
await browser.close();
