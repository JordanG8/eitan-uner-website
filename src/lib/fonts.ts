/* ----------------------------------------------------------------- fonts */

/**
 * Fonts Eitan can choose from. All have Hebrew glyphs. `weights` is the exact
 * axis Google Fonts serves for that family — asking for a weight a family
 * does not have fails the whole stylesheet request, so each is requested on
 * its own.
 */
export const FONTS: { name: string; label: string; weights?: string; serif?: boolean }[] = [
  { name: "Assistant", label: "Assistant (ברירת מחדל)" },
  { name: "Heebo", label: "Heebo", weights: "100..900" },
  { name: "Rubik", label: "Rubik", weights: "300..900" },
  { name: "Noto Sans Hebrew", label: "Noto Sans Hebrew", weights: "100..900" },
  { name: "IBM Plex Sans Hebrew", label: "IBM Plex Sans Hebrew", weights: "100;200;300;400;500;600;700" },
  { name: "Open Sans", label: "Open Sans", weights: "300..800" },
  { name: "Varela Round", label: "Varela Round (מעוגל)" },
  { name: "Alef", label: "Alef", weights: "400;700" },
  { name: "Fredoka", label: "Fredoka (מעוגל, שובב)", weights: "300..700" },
  { name: "Secular One", label: "Secular One (כותרות עבות)" },
  { name: "Suez One", label: "Suez One (כותרות עם תגים)", serif: true },
  { name: "Frank Ruhl Libre", label: "Frank Ruhl Libre (סריף קלאסי)", weights: "300..900", serif: true },
  { name: "Noto Serif Hebrew", label: "Noto Serif Hebrew (סריף)", weights: "100..900", serif: true },
  { name: "David Libre", label: "David Libre (סריף)", weights: "400;500;700", serif: true },
  { name: "Miriam Libre", label: "Miriam Libre", weights: "400..700" },
  { name: "Bellefair", label: "Bellefair (אלגנטי)", serif: true },
  { name: "Karantina", label: "Karantina (צר ודרמטי)", weights: "300;400;700" },
  { name: "Amatic SC", label: "Amatic SC (כתב יד)", weights: "400;700" },
  { name: "Arial", label: "Arial (גופן מערכת)" },
];

/** Assistant is self-hosted through next/font; Arial ships with every OS. */
const LOCAL_FONTS = new Set(["Assistant", "Arial"]);

export function fontStack(name: string): string {
  if (name === "Assistant") return "var(--font-assistant), system-ui, sans-serif";
  const font = FONTS.find((f) => f.name === name);
  const fallback = font?.serif ? "Georgia, serif" : "system-ui, sans-serif";
  return `"${name.replace(/"/g, "")}", ${fallback}`;
}

export function fontHref(name: string): string | null {
  if (LOCAL_FONTS.has(name)) return null;
  const font = FONTS.find((f) => f.name === name);
  if (!font) return null;
  const family = font.name.replace(/ /g, "+");
  const axis = font.weights ? `:wght@${font.weights}` : "";
  return `https://fonts.googleapis.com/css2?family=${family}${axis}&display=swap`;
}
