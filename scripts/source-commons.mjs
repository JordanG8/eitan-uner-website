/**
 * High-resolution tier: Wikimedia Commons, CC0 / public domain only.
 *
 * Separate from the StockSnap pass because the two have opposite failure
 * modes. StockSnap is art-directed but its CDN caps at ~1024px, which is fine
 * behind a 480px card and nowhere near enough for a full-bleed band. Commons
 * serves true originals - 4000-6000px - so anything that has to run wide comes
 * from here.
 *
 * Note the %7C: the MediaWiki iiprop parameter is pipe-delimited, and passing
 * a literal "|" through fetch silently returns zero usable records rather than
 * erroring. The first pass lost every Commons result to exactly that.
 *
 *   node scripts/source-commons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const UA = "eitan-uner-site/1.0 (contact: jordangoren1234@gmail.com)";
const OUT = path.join(process.cwd(), ".sourced-hr");
await mkdir(OUT, { recursive: true });

const QUERIES = [
  "camera lens photography", "vintage camera", "camera aperture blades",
  "photographic lens", "twin lens reflex camera", "35mm film camera",
  "camera shutter mechanism", "medium format camera", "darkroom",
  "photographic film roll",
];

const picks = [];
for (const q of QUERIES) {
  const u =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=20` +
    `&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata`;
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    const d = await r.json();
    let n = 0;
    for (const p of Object.values(d.query?.pages ?? {})) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const lic = (ii.extmetadata?.LicenseShortName?.value ?? "").toLowerCase();
      if (!(lic.includes("cc0") || lic.includes("public domain"))) continue;
      if (!/\.(jpe?g|png)$/i.test(ii.url)) continue;
      if ((ii.width ?? 0) < 2200) continue;
      if (picks.some((x) => x.url === ii.url)) continue;
      picks.push({
        q, title: p.title, license: ii.extmetadata?.LicenseShortName?.value,
        creator: (ii.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim().slice(0, 60),
        landing: ii.descriptionurl, url: ii.url, w: ii.width, h: ii.height,
      });
      n++;
    }
    console.log(`${q.padEnd(30)} ${n}`);
  } catch (e) { console.log(`${q}: ${e.message}`); }
}

const kept = [];
let i = 0;
for (const p of picks) {
  const name = `h${String(++i).padStart(3, "0")}.jpg`;
  const dest = path.join(OUT, name);
  if (existsSync(dest)) { kept.push({ file: name, ...p }); continue; }
  try {
    const r = await fetch(p.url, { headers: { "User-Agent": UA } });
    if (!r.ok) continue;
    await pipeline(Readable.fromWeb(r.body), createWriteStream(dest));
    kept.push({ file: name, ...p });
  } catch { /* skip */ }
}
await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(kept, null, 2));
console.log(`\ndownloaded ${kept.length} -> ${OUT}`);
