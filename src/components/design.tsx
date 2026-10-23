import type { CSSProperties, ReactNode } from "react";
import { fontHref, fontStack } from "@/lib/fonts";
import type { ImageRef } from "@/lib/types";

/**
 * Per-section design overrides.
 *
 * Every block on every page carries an optional `design` object, edited in the
 * "עיצוב" panel of the editor. When it is empty the block renders exactly as
 * designed — no wrapper, no extra DOM. When anything is set, the block is
 * wrapped in a `.eu-block` that applies the overrides.
 *
 * Colours work by redefining the palette variables *locally*: every Tailwind
 * colour utility inside resolves through `var(--color-…)`, so the block's own
 * markup picks up the new values without knowing it has been restyled. The
 * few things variables cannot reach (padding the block hard-codes, text that
 * uses literal white) are handled by the `.eu-block[data-*]` rules in
 * globals.css.
 */

export interface BlockDesign {
  background?: string;
  backgroundImage?: ImageRef;
  /** 0–90: strength of the tint laid over a background photo. */
  overlay?: number;
  overlayColor?: string;
  textColor?: string;
  headingColor?: string;
  accentColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  width?: "" | "narrow" | "normal" | "wide" | "full";
  align?: "" | "start" | "center" | "end";
  font?: string;
  headingFont?: string;
  /** Percent, like the site-wide radius. Empty = inherit. */
  radius?: number | "";
  hide?: "" | "mobile" | "desktop";
  animation?: "" | "fade" | "up" | "zoom" | "side";
  anchor?: string;
  className?: string;
}

export const SPACING: Record<string, string> = {
  "0": "0",
  xs: "1rem",
  s: "2.5rem",
  m: "4.5rem",
  l: "7rem",
  xl: "10rem",
};

export const WIDTHS: Record<string, string> = {
  narrow: "760px",
  wide: "1480px",
  full: "100%",
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Brand shades from one colour, with the same ratios ThemeStyle uses. */
export function brandScale(primary: string, dark?: string): Vars {
  const deep = dark || `color-mix(in srgb, ${primary} 32%, black)`;
  return {
    "--color-brand-50": `color-mix(in srgb, ${primary} 6%, white)`,
    "--color-brand-100": `color-mix(in srgb, ${primary} 16%, white)`,
    "--color-brand-200": `color-mix(in srgb, ${primary} 32%, white)`,
    "--color-brand-300": `color-mix(in srgb, ${primary} 55%, white)`,
    "--color-brand-400": `color-mix(in srgb, ${primary} 80%, white)`,
    "--color-brand-500": primary,
    "--color-brand-600": `color-mix(in srgb, ${primary} 72%, ${deep})`,
    "--color-brand-700": `color-mix(in srgb, ${primary} 48%, ${deep})`,
    "--color-brand-800": `color-mix(in srgb, ${primary} 27%, ${deep})`,
    "--color-brand-900": deep,
  };
}

export function radiusVars(percent: number): Vars {
  const r = Math.max(0, percent) / 100;
  return {
    "--radius-scale": r,
    "--radius-lg": `calc(0.5rem * ${r})`,
    "--radius-xl": `calc(0.75rem * ${r})`,
    "--radius-2xl": `calc(1rem * ${r})`,
    "--radius-3xl": `calc(1.5rem * ${r})`,
  };
}

const has = (v: unknown) => v !== undefined && v !== null && v !== "";

export function hasDesign(d?: BlockDesign | null): d is BlockDesign {
  if (!d || typeof d !== "object") return false;
  return Object.entries(d).some(([k, v]) =>
    k === "backgroundImage" ? Boolean((v as ImageRef | undefined)?.src) : k === "overlay" ? Number(v) > 0 : has(v)
  );
}

/** Inline style + data attributes for a design object. Shared with the free-layout primitives. */
export function designProps(d: BlockDesign): {
  style: Vars;
  data: Record<string, string>;
  className: string;
  fonts: string[];
} {
  const style: Vars = {};
  const data: Record<string, string> = {};
  const classes: string[] = ["eu-block"];
  const fonts: string[] = [];

  const bgImage = d.backgroundImage?.src;
  if (has(d.background) || bgImage) {
    data["data-bg"] = "";
    style["--eu-bg"] = [
      bgImage ? `url("${bgImage.replace(/"/g, "%22")}") center / cover no-repeat` : "",
      has(d.background) ? d.background! : "",
    ]
      .filter(Boolean)
      .join(", ");
  }
  if (bgImage && Number(d.overlay) > 0) {
    data["data-overlay"] = "";
    style["--eu-overlay"] = `color-mix(in srgb, ${d.overlayColor || "#000"} ${Math.min(90, Number(d.overlay))}%, transparent)`;
  }
  if (has(d.textColor)) {
    data["data-text"] = "";
    style["--eu-text"] = d.textColor!;
    style["--color-ink"] = d.textColor!;
    style["--color-ink-soft"] = `color-mix(in srgb, ${d.textColor} 78%, transparent)`;
    style.color = d.textColor;
  }
  if (has(d.headingColor)) {
    data["data-heading"] = "";
    style["--eu-heading"] = d.headingColor!;
  }
  if (has(d.accentColor)) Object.assign(style, brandScale(d.accentColor!));
  if (has(d.paddingTop) && SPACING[d.paddingTop!]) {
    data["data-pt"] = "";
    style["--eu-pt"] = SPACING[d.paddingTop!];
  }
  if (has(d.paddingBottom) && SPACING[d.paddingBottom!]) {
    data["data-pb"] = "";
    style["--eu-pb"] = SPACING[d.paddingBottom!];
  }
  if (d.width && WIDTHS[d.width]) style["--container-content"] = WIDTHS[d.width];
  if (has(d.align)) {
    data["data-align"] = "";
    style["--eu-align"] = d.align!;
  }
  if (has(d.font)) {
    style["--font-sans"] = fontStack(d.font!);
    style.fontFamily = fontStack(d.font!);
    fonts.push(d.font!);
    if (!has(d.headingFont)) style["--font-heading"] = fontStack(d.font!);
  }
  if (has(d.headingFont)) {
    style["--font-heading"] = fontStack(d.headingFont!);
    fonts.push(d.headingFont!);
  }
  if (has(d.radius)) Object.assign(style, radiusVars(Number(d.radius)));
  if (d.hide === "mobile") classes.push("max-md:hidden");
  if (d.hide === "desktop") classes.push("md:hidden");
  if (d.animation) classes.push(`eu-anim eu-anim--${d.animation}`);
  if (d.className) classes.push(d.className.replace(/[^\w\s-]/g, ""));

  return { style, data, className: classes.join(" "), fonts };
}

export function FontLinks({ fonts }: { fonts: string[] }) {
  return (
    <>
      {[...new Set(fonts)].map((name) => {
        const href = fontHref(name);
        // React hoists precedence stylesheets into <head> and dedupes them.
        return href ? <link key={href} rel="stylesheet" href={href} precedence="default" /> : null;
      })}
    </>
  );
}

export function Designed({ design, children }: { design?: BlockDesign | null; children: ReactNode }) {
  if (!hasDesign(design)) return <>{children}</>;
  const { style, data, className, fonts } = designProps(design);
  return (
    <div id={design.anchor || undefined} className={className} style={style} {...data}>
      <FontLinks fonts={fonts} />
      {children}
    </div>
  );
}
