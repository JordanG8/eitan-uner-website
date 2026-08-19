/**
 * Side-by-side identification sheets for the stories re-ingest.
 *
 * Adapted from scripts/contact-sheet.mjs. Two differences that matter for the
 * task it was written for:
 *
 *  - It pages. 177 originals in one montage produced cells too small to
 *    recognise a face in; matching by CONTENT needs cells you can actually
 *    read, so it emits sheet-NN.png at PAGE cells each.
 *  - It includes every file regardless of megapixels. Filtering to >=6MP first
 *    hides the fact that a subject exists at all, and "there is no original"
 *    is a conclusion this task has to be able to reach honestly.
 *
 *   node scripts/sheet-match.mjs <srcDir> <outPrefix> [cell] [cols] [rows]
 */
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2];
const OUT = process.argv[3];
const CELL = Number(process.argv[4] ?? 300);
const COLS = Number(process.argv[5] ?? 6);
const ROWS = Number(process.argv[6] ?? 5);
const LABEL = 26;

const files = readdirSync(SRC)
  .filter((f) => /\.(jpe?g|png|tiff?|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "he"));

const meta = [];
for (const f of files) {
  try {
    const m = await sharp(fs.readFileSync(path.join(SRC, f))).metadata();
    // .rotate() is applied on the thumb; report the oriented dimensions so the
    // number on the sheet is the number that decides whether it is usable.
    const swap = m.orientation >= 5;
    meta.push({ f, w: swap ? m.height : m.width, h: swap ? m.width : m.height });
  } catch {
    meta.push({ f, w: 0, h: 0 });
  }
}

const PER = COLS * ROWS;
const pages = Math.ceil(meta.length / PER);
for (let p = 0; p < pages; p++) {
  const slice = meta.slice(p * PER, (p + 1) * PER);
  const rows = Math.ceil(slice.length / COLS);
  const layers = [];
  for (let i = 0; i < slice.length; i++) {
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * (CELL + LABEL);
    try {
      const thumb = await sharp(fs.readFileSync(path.join(SRC, slice[i].f)))
        .rotate()
        .resize(CELL, CELL, { fit: "cover" })
        .toBuffer();
      layers.push({ input: thumb, left: x, top: y + LABEL });
    } catch {}
    const idx = p * PER + i;
    const svg = Buffer.from(
      `<svg width="${CELL}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/>` +
        `<text x="6" y="19" font-family="monospace" font-size="16" fill="#0f0">${String(idx).padStart(3, "0")}  ${slice[i].w}x${slice[i].h}</text></svg>`
    );
    layers.push({ input: svg, left: x, top: y });
  }
  await sharp({
    create: { width: COLS * CELL, height: rows * (CELL + LABEL), channels: 3, background: "#000" },
  })
    .composite(layers)
    .png()
    .toFile(`${OUT}-${String(p).padStart(2, "0")}.png`);
}

writeFileSync(
  `${OUT}-index.txt`,
  meta.map((k, i) => `${String(i).padStart(3, "0")}\t${k.w}x${k.h}\t${k.f}`).join("\n"),
  "utf8"
);
console.log(`${meta.length} files -> ${pages} sheet(s) at ${OUT}-NN.png`);
