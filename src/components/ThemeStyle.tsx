import { fontHref, fontStack } from "@/lib/fonts";
import { DEFAULT_COLORS, type SiteDoc } from "@/lib/site";

/**
 * Turns the design document into CSS.
 *
 * Every Tailwind colour utility on the site (`bg-brand-600`, `text-ink` …)
 * compiles to a `var(--color-…)` reference, so redefining those variables here
 * restyles the whole site at runtime with no rebuild. The same goes for the
 * font, radius, spacing and width variables the components read.
 *
 * The brand scale is derived from two colours Eitan picks (main and deep).
 * The mix ratios were fitted to the original hand-tuned palette, so a new pair
 * keeps the same relationships between shades. While both are at their
 * defaults nothing is emitted and globals.css's exact values stand.
 */

const LIGHT = { 50: 6, 100: 16, 200: 32, 300: 55, 400: 80 } as const;
const DEEP = { 600: 72, 700: 48, 800: 27 } as const;

/** Only colours reach the stylesheet: anything else would let a value close the rule. */
function safeColor(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\)|hsla?\([\d\s.,%/deg]+\)|[a-z]+)$/i.test(v) ? v : fallback;
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function themeCss(doc: SiteDoc): string {
  const c = doc.colors;
  const t = doc.typography;
  const l = doc.layout;
  const primary = safeColor(c.primary, DEFAULT_COLORS.primary);
  const dark = safeColor(c.dark, DEFAULT_COLORS.dark);

  const vars: string[] = [];
  if (primary !== DEFAULT_COLORS.primary || dark !== DEFAULT_COLORS.dark) {
    for (const [shade, pct] of Object.entries(LIGHT)) {
      vars.push(`--color-brand-${shade}: color-mix(in srgb, ${primary} ${pct}%, white);`);
    }
    vars.push(`--color-brand-500: ${primary};`);
    for (const [shade, pct] of Object.entries(DEEP)) {
      vars.push(`--color-brand-${shade}: color-mix(in srgb, ${primary} ${pct}%, ${dark});`);
    }
    vars.push(`--color-brand-900: ${dark};`);
  }

  const named: [string, keyof typeof DEFAULT_COLORS][] = [
    ["accent", "accent"],
    ["accent-soft", "accentSoft"],
    ["ink", "text"],
    ["ink-soft", "textSoft"],
    ["surface", "background"],
    ["surface-alt", "surfaceAlt"],
    ["hairline", "hairline"],
  ];
  for (const [token, key] of named) {
    const v = safeColor(c[key], DEFAULT_COLORS[key]);
    if (v !== DEFAULT_COLORS[key]) vars.push(`--color-${token}: ${v};`);
  }

  vars.push(`--font-sans: ${fontStack(t.bodyFont)};`);
  vars.push(`--font-heading: ${fontStack(t.headingFont)};`);
  vars.push(`--container-content: ${num(l.containerWidth, 1240, 720, 2400)}px;`);
  vars.push(`--space-scale: ${num(l.sectionSpacing, 100, 0, 300) / 100};`);
  vars.push(`--radius-scale: ${num(l.radius, 100, 0, 300) / 100};`);
  vars.push(
    `--radius-button: ${l.buttonShape === "square" ? "0" : l.buttonShape === "rounded" ? "0.6rem" : "9999px"};`
  );

  const rules = [
    `:root{${vars.join("")}}`,
    `html{font-size:${num(t.baseSize, 100, 70, 160)}%}`,
    `body{line-height:${num(t.lineHeight, 1.75, 1, 2.6)}}`,
    `h1,h2,h3,h4,h5,h6{font-weight:${num(t.headingWeight, 700, 100, 900)};letter-spacing:${num(t.headingTracking, -25, -100, 200) / 1000}em}`,
  ];

  // Custom CSS is Eitan's own escape hatch, entered behind the editor login.
  // Only stop it from closing the <style> element.
  const custom = (doc.customCss ?? "").replace(/<\/(style)/gi, "<\\/$1");
  return rules.join("\n") + (custom ? `\n/* custom */\n${custom}` : "");
}

export function ThemeStyle({ doc }: { doc: SiteDoc }) {
  const fonts = [...new Set([doc.typography.bodyFont, doc.typography.headingFont])]
    .map(fontHref)
    .filter((h): h is string => Boolean(h));

  return (
    <>
      {fonts.length > 0 && (
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      )}
      {fonts.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style id="eu-theme" dangerouslySetInnerHTML={{ __html: themeCss(doc) }} />
    </>
  );
}
