/**
 * Indexed contact sheet of the high-resolution source photos.
 *
 * Cheap way to identify 60+ images: one montage with numbers burned in, read
 * once, instead of opening each file. Print the index alongside so a chosen
 * cell maps back to a filename.
 *
 *   node scripts/contact-sheet.mjs [minMegapixels] [outfile]
 */
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SRC = "C:/Users/jorda/Downloads/eitanuner";
const MIN_MP = Number(process.argv[2] ?? 6);
const MAX_MP = Number(process.env.MAX_MP ?? Infinity);
const OUT = process.argv[3] ?? "C:/Users/jorda/AppData/Local/Temp/claude/C--Users-jorda-OneDrive-Desktop/c83a2b5b-69e1-40ba-862c-6aa35500606b/scratchpad/sheet.png";

const CELL = 260;
const COLS = 8;
const LABEL = 26;

const isPhoto = (f) =>
  /\.(jpe?g|png|tiff?)$/i.test(f) && !/^צילום מסך|^סריקה/.test(f);

const files = readdirSync(SRC).filter(isPhoto);
const kept = [];
for (const f of files) {
  try {
    const m = await sharp(path.join(SRC, f)).metadata();
    const mp=(m.width*m.height)/1e6;
    if (mp >= MIN_MP && mp < MAX_MP) {
      kept.push({ f, w: m.width, h: m.height });
    }
  } catch {}
}
kept.sort((a, b) => a.f.localeCompare(b.f, "he"));

const rows = Math.ceil(kept.length / COLS);
const W = COLS * CELL;
const H = rows * (CELL + LABEL);

const layers = [];
for (let i = 0; i < kept.length; i++) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = col * CELL;
  const y = row * (CELL + LABEL);

  const thumb = await sharp(path.join(SRC, kept[i].f))
    .rotate()
    .resize(CELL, CELL, { fit: "cover" })
    .toBuffer();
  layers.push({ input: thumb, left: x, top: y + LABEL });

  const label = Buffer.from(
    `<svg width="${CELL}" height="${LABEL}">
       <rect width="100%" height="100%" fill="#111"/>
       <text x="6" y="18" font-family="monospace" font-size="15" fill="#fff">${String(i).padStart(2, "0")}  ${kept[i].w}x${kept[i].h}</text>
     </svg>`
  );
  layers.push({ input: label, left: x, top: y });
}

await sharp({
  create: { width: W, height: H, channels: 3, background: "#000" },
})
  .composite(layers)
  .png()
  .toFile(OUT);

const index = kept.map((k, i) => `${String(i).padStart(2, "0")}\t${k.w}x${k.h}\t${k.f}`).join("\n");
writeFileSync(OUT.replace(/\.png$/, ".txt"), index, "utf8");

console.log(`${kept.length} photos >= ${MIN_MP}MP -> ${OUT}`);
console.log(index);
