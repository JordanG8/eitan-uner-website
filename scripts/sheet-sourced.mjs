/**
 * Numbered contact sheet of the sourced camera candidates.
 * One image to read instead of opening 69 files.
 *   node scripts/sheet-sourced.mjs [out.png]
 */
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), ".sourced");
const OUT = process.argv[2] ?? path.join(SRC, "sheet.png");
const CELL = 240, COLS = 8, LABEL = 24;

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
const rows = Math.ceil(files.length / COLS);
const W = COLS * CELL, H = rows * (CELL + LABEL);

const layers = [];
for (let i = 0; i < files.length; i++) {
  const x = (i % COLS) * CELL, y = Math.floor(i / COLS) * (CELL + LABEL);
  try {
    const buf = await sharp(path.join(SRC, files[i]))
      .resize(CELL, CELL, { fit: "cover" }).png().toBuffer();
    layers.push({ input: buf, left: x, top: y + LABEL });
  } catch { continue; }
  const svg = Buffer.from(
    `<svg width="${CELL}" height="${LABEL}"><rect width="${CELL}" height="${LABEL}" fill="#111"/>` +
    `<text x="6" y="17" font-family="monospace" font-size="14" fill="#0f0">${files[i]}</text></svg>`
  );
  layers.push({ input: svg, left: x, top: y });
}

await sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
  .composite(layers).png().toFile(OUT);
console.log(`${files.length} cells -> ${OUT}`);
