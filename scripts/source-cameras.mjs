/**
 * Source camera photography for the accent slots, CC0 / public domain only.
 *
 * Licence is a hard filter, not a preference. This project exists to be handed
 * to Eitan's own accounts, so an asset carrying a per-use attribution or
 * share-alike obligation is a liability that travels with the site forever.
 * CC0 and PD carry none.
 *
 * Two sources because they fail in opposite directions: StockSnap (via the
 * Openverse index) is art-directed but capped at 960w by its CDN, Wikimedia
 * Commons serves true originals but skews towards documentation shots. Pull
 * both, then pick by eye off a contact sheet.
 *
 * Unsplash is deliberately not used: it sits behind bot protection that returns
 * 403 to automated clients, and working around that is not on the table.
 *
 *   node scripts/source-cameras.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const UA = "eitan-uner-site/1.0 (contact: jordangoren1234@gmail.com)";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const OUT = path.join(process.cwd(), ".sourced");
await mkdir(OUT, { recursive: true });

const QUERIES = [
  "vintage film camera",
  "camera lens",
  "camera on table",
  "film rolls",
  "photographer camera",
  "camera shutter",
  "darkroom photography",
  "camera viewfinder",
];

const picks = [];

/* ---------- Openverse / StockSnap ---------- */
for (const q of QUERIES) {
  const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
    q
  )}&license=cc0,pdm&size=large&page_size=12`;
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (!r.ok) { console.log(`openverse ${q}: HTTP ${r.status}`); continue; }
    const d = await r.json();
    for (const it of d.results ?? []) {
      if (!it.url) continue;
      picks.push({
        src: "openverse",
        q,
        title: it.title,
        license: it.license,
        creator: it.creator,
        landing: it.foreign_landing_url,
        url: it.url,
        w: it.width,
        h: it.height,
      });
    }
    console.log(`openverse ${q.padEnd(24)} ${d.results?.length ?? 0}`);
  } catch (e) {
    console.log(`openverse ${q}: ${e.message}`);
  }
}

/* ---------- Wikimedia Commons, CC0/PD only ---------- */
for (const q of QUERIES) {
  const u =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=12` +
    `&prop=imageinfo&iiprop=url|size|extmetadata`;
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (!r.ok) { console.log(`commons ${q}: HTTP ${r.status}`); continue; }
    const d = await r.json();
    const pages = d.query?.pages ?? {};
    let n = 0;
    for (const p of Object.values(pages)) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const lic = (ii.extmetadata?.LicenseShortName?.value ?? "").toLowerCase();
      const ok = lic.includes("cc0") || lic.includes("public domain");
      if (!ok) continue;
      if (!/\.(jpe?g|png)$/i.test(ii.url)) continue;
      if ((ii.width ?? 0) < 1600) continue;
      picks.push({
        src: "commons",
        q,
        title: p.title,
        license: ii.extmetadata?.LicenseShortName?.value,
        creator: (ii.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, "").slice(0, 60),
        landing: ii.descriptionurl,
        url: ii.url,
        w: ii.width,
        h: ii.height,
      });
      n++;
    }
    console.log(`commons   ${q.padEnd(24)} ${n}`);
  } catch (e) {
    console.log(`commons ${q}: ${e.message}`);
  }
}

/* ---------- download ---------- */
const seen = new Set();
const kept = [];
let i = 0;
for (const p of picks) {
  if (seen.has(p.url)) continue;
  seen.add(p.url);
  const ext = p.url.split("?")[0].split(".").pop().toLowerCase();
  const name = `c${String(++i).padStart(3, "0")}.${ext === "png" ? "png" : "jpg"}`;
  const dest = path.join(OUT, name);
  try {
    const r = await fetch(p.url, {
      headers: { "User-Agent": BROWSER_UA, Referer: "https://stocksnap.io/" },
    });
    if (!r.ok) continue;
    await pipeline(Readable.fromWeb(r.body), createWriteStream(dest));
    kept.push({ file: name, ...p });
  } catch {
    /* skip */
  }
}

await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(kept, null, 2));
console.log(`\ndownloaded ${kept.length} -> ${OUT}`);
