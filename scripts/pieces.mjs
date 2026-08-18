/**
 * Build blind, per-piece comparison sets for the gauntlet.
 *
 * Whole-page verdicts are diffuse: a critic hands back one vague gap for an
 * entire site, and the earlier rounds of this loop proved it. A piece is
 * judgeable if a stranger can look at yours and the bar's and say which is the
 * amateur without reading either — so the page is cut into pieces and each gets
 * its own panel.
 *
 * Slices the tiles a capture round already produced, so no re-shooting is
 * needed. Labels are randomised per piece and the key is written OUTSIDE the
 * blind directory: a critic that can find the mapping has not run blind.
 *
 *   node scripts/pieces.mjs <round> [outName]
 */
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const SCRATCH =
  "C:/Users/jorda/AppData/Local/Temp/claude/C--Users-jorda-OneDrive-Desktop/c83a2b5b-69e1-40ba-862c-6aa35500606b/scratchpad";

const round = process.argv[2];
if (!round) {
  console.error("usage: node scripts/pieces.mjs <round> [outName]");
  process.exit(1);
}
const outName = process.argv[3] ?? `pieces-${round}`;

const roundDir = path.join(SCRATCH, "shots", `round-${round}`);
const key = JSON.parse(readFileSync(path.join(roundDir, "KEY.json"), "utf8"));
const label = Object.fromEntries(Object.entries(key).map(([k, v]) => [v, k]));

/**
 * The pieces, and which tile of the capture shows each.
 *
 * Tiles are evenly spaced across the scroll, so the same tile index lands on
 * roughly the same *proportional* place in both pages — which is the fair
 * comparison when the two sites have different content volumes. `fold` and the
 * last tile are exact: the top of the page and the very bottom.
 */
const PIECES = [
  { id: "01-masthead", tile: "fold", asks: "the opening screen" },
  { id: "02-upper-band", tile: "t02", asks: "an editorial content band" },
  { id: "03-index", tile: "t03", asks: "a list or index of work" },
  { id: "04-lower-band", tile: "t04", asks: "a later content band" },
  { id: "05-close", tile: "t06", asks: "the bottom of the page and how it ends" },
];

const CANDIDATE = "candidate";
const BAR = "bar-dieste";

const outDir = path.join(SCRATCH, outName);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const answers = {};
const manifest = [];

for (const piece of PIECES) {
  const dir = path.join(outDir, piece.id);
  mkdirSync(dir, { recursive: true });

  // Fresh coin flip per piece: a critic must not be able to learn from an
  // earlier piece that "A is always the bar".
  const candidateIsA = Math.random() < 0.5;
  const assign = candidateIsA
    ? { A: CANDIDATE, B: BAR }
    : { A: BAR, B: CANDIDATE };

  let ok = true;
  for (const [slot, who] of Object.entries(assign)) {
    const src = path.join(roundDir, `${label[who]}-${piece.tile}.png`);
    if (!existsSync(src)) {
      console.error(`missing ${src}`);
      ok = false;
      break;
    }
    copyFileSync(src, path.join(dir, `${slot}.png`));
  }
  if (!ok) continue;

  answers[piece.id] = assign;
  manifest.push({ ...piece, dir });
  console.log(`${piece.id}  A=${assign.A}  B=${assign.B}`);
}

writeFileSync(
  path.join(SCRATCH, `${outName}-KEY.json`),
  JSON.stringify(answers, null, 2)
);
writeFileSync(
  path.join(outDir, "PIECES.json"),
  JSON.stringify(manifest.map(({ id, asks }) => ({ id, asks })), null, 2)
);

console.log(`\n${manifest.length} pieces -> ${outDir}`);
console.log(`key -> ${outName}-KEY.json  (outside the blind dir)`);
