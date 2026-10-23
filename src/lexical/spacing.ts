import type { CSSProperties } from "react";

/**
 * Margin and padding, Elementor-style: four sides and a unit.
 *
 * Shared by the editor (which applies it to the live DOM) and the public
 * renderer (which emits it as inline style), so both lay out the same. Only
 * the sides Eitan has filled in are emitted — an empty side keeps the
 * design's own spacing.
 */

export type Unit = "px" | "rem" | "%";

export interface Box {
  top?: number | "";
  right?: number | "";
  bottom?: number | "";
  left?: number | "";
  unit?: Unit;
}

export interface Spacing {
  margin?: Box;
  padding?: Box;
}

const SIDES = ["top", "right", "bottom", "left"] as const;
const CAP = { top: "Top", right: "Right", bottom: "Bottom", left: "Left" } as const;

function sides(box: Box | undefined, prop: "margin" | "padding"): Record<string, string> {
  const out: Record<string, string> = {};
  if (!box) return out;
  const unit = box.unit === "rem" || box.unit === "%" ? box.unit : "px";
  for (const s of SIDES) {
    const v = box[s];
    if (v === "" || v === undefined || v === null || Number.isNaN(Number(v))) continue;
    out[`${prop}${CAP[s]}`] = `${Number(v)}${unit}`;
  }
  return out;
}

/** React style for a spacing value. */
export function spacingStyle(sp: Spacing | undefined): CSSProperties | undefined {
  const style = { ...sides(sp?.margin, "margin"), ...sides(sp?.padding, "padding") };
  return Object.keys(style).length ? (style as CSSProperties) : undefined;
}

/** The same, for setting on a DOM element in the editor. */
export function applySpacing(dom: HTMLElement, sp: Spacing | undefined) {
  for (const prop of ["margin", "padding"] as const)
    for (const s of SIDES) dom.style.removeProperty(`${prop}-${s}`);
  const style = spacingStyle(sp) as Record<string, string> | undefined;
  for (const [k, v] of Object.entries(style ?? {})) dom.style[k as "marginTop"] = v;
}

export function hasSpacing(sp: Spacing | undefined): boolean {
  return Boolean(spacingStyle(sp));
}
