"use client";

import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from "react";
import type { CustomField } from "./schema";
import type { BlockDesign } from "@/components/design";
import type { Box, Spacing } from "@/lexical/spacing";
import { FONTS } from "@/lib/fonts";
import { MediaField, type MediaValue } from "./MediaField";

/**
 * Editor field controls: colour, link, image, range, font, and the
 * per-section design panel. `Form.tsx` lays them out with their labels.
 */

export const EditorContext = createContext<{ pages: { slug: string; title: string }[] }>({ pages: [] });

const ui = {
  input: { width: "100%", padding: "6px 8px", border: "1px solid #d0d7de", borderRadius: 6, fontSize: 13, background: "#fff" } as CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#3b4652", marginBottom: 4 } as CSSProperties,
  row: { marginBottom: 12 } as CSSProperties,
  small: { fontSize: 11, color: "#6b7785" } as CSSProperties,
};

/* --------------------------------------------------------------- colour */

/** Palette tokens: picking one keeps the block in step with the site palette. */
const TOKENS: { value: string; label: string; preview: string }[] = [
  { value: "var(--color-brand-500)", label: "צבע ראשי", preview: "var(--color-brand-500, #167f7d)" },
  { value: "var(--color-brand-900)", label: "צבע כהה", preview: "var(--color-brand-900, #0b3436)" },
  { value: "var(--color-brand-50)", label: "ראשי בהיר", preview: "var(--color-brand-50, #edf7f5)" },
  { value: "var(--color-accent)", label: "הדגשה", preview: "var(--color-accent, #d99a58)" },
  { value: "var(--color-accent-soft)", label: "הדגשה בהירה", preview: "var(--color-accent-soft, #f3dfc9)" },
  { value: "var(--color-ink)", label: "טקסט", preview: "var(--color-ink, #122a2b)" },
  { value: "var(--color-surface)", label: "רקע האתר", preview: "var(--color-surface, #fbfaf7)" },
  { value: "var(--color-surface-alt)", label: "רקע משני", preview: "var(--color-surface-alt, #f1eee7)" },
  { value: "#ffffff", label: "לבן", preview: "#ffffff" },
  { value: "#000000", label: "שחור", preview: "#000000" },
  { value: "transparent", label: "שקוף", preview: "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px" },
];

const toHex = (v: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : /^#[0-9a-f]{3}$/i.test(v) ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : "#000000");

export function ColorInput({
  value,
  onChange,
  tokens = true,
  placeholder = "ברירת מחדל",
}: {
  value?: string;
  onChange: (v: string) => void;
  tokens?: boolean;
  placeholder?: string;
}) {
  const v = value ?? "";
  const swatches = tokens ? TOKENS : TOKENS.filter((t) => !t.value.startsWith("var(") && t.value !== "transparent");
  return (
    <div dir="rtl">
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="color"
          aria-label="בחירת צבע"
          value={toHex(v)}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 34, height: 30, padding: 0, border: "1px solid #d0d7de", borderRadius: 6, background: "none", cursor: "pointer", flex: "0 0 auto" }}
        />
        <input type="text" dir="ltr" value={v} placeholder={placeholder} onChange={(e) => onChange(e.target.value.trim())} style={ui.input} />
        {v && (
          <button type="button" onClick={() => onChange("")} title="איפוס" style={{ border: "1px solid #d0d7de", borderRadius: 6, background: "#fff", padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>
            ✕
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
        {swatches.map((t) => (
          <button
            key={t.value}
            type="button"
            title={t.label}
            aria-label={t.label}
            onClick={() => onChange(t.value)}
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: v === t.value ? "2px solid #0969da" : "1px solid #c5ccd3",
              background: t.preview,
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const colorField = (label: string, tokens = true): CustomField => ({
  type: "custom",
  label,
  render: ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
    <ColorInput value={value} onChange={onChange} tokens={tokens} />
  ),
});

/* ----------------------------------------------------------------- link */

export function LinkInput({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const { pages } = useContext(EditorContext);
  const id = useId();
  return (
    <div>
      <input type="text" dir="auto" list={id} value={value ?? ""} placeholder="/עמוד, https://… או #עוגן" onChange={(e) => onChange(e.target.value)} style={ui.input} />
      <datalist id={id}>
        {pages.map((p) => (
          <option key={p.slug} value={p.slug === "/" ? "/" : `/${p.slug}`}>
            {p.title}
          </option>
        ))}
      </datalist>
      <span style={ui.small}>התחילו להקליד כדי לבחור עמוד באתר</span>
    </div>
  );
}

export const linkField = (label: string): CustomField => ({
  type: "custom",
  label,
  render: ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => <LinkInput value={value} onChange={onChange} />,
});

/* ---------------------------------------------------------------- media */

export const imageField = (label: string): CustomField => ({
  type: "custom",
  label,
  render: ({ value, onChange }: { value?: MediaValue; onChange: (v: MediaValue) => void }) => (
    <MediaField value={value} onChange={onChange} />
  ),
});

/* ---------------------------------------------------------------- range */

export function RangeInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  fallback,
}: {
  value?: number | "";
  onChange: (v: number | "") => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  fallback: number;
}) {
  const v = value === "" || value === undefined || value === null ? undefined : Number(value);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }} dir="rtl">
      <input type="range" min={min} max={max} step={step} value={v ?? fallback} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1 }} />
      <span style={{ fontSize: 12, minWidth: 48, textAlign: "center", color: v === undefined ? "#8a949e" : "#1f2328" }} dir="ltr">
        {v ?? fallback}
        {unit}
      </span>
      {v !== undefined && (
        <button type="button" onClick={() => onChange("")} title="איפוס" style={{ border: "1px solid #d0d7de", borderRadius: 6, background: "#fff", padding: "2px 6px", cursor: "pointer", fontSize: 11 }}>
          ✕
        </button>
      )}
    </div>
  );
}

export const rangeField = (label: string, min: number, max: number, fallback: number, unit = "", step = 1): CustomField => ({
  type: "custom",
  label,
  render: ({ value, onChange }: { value?: number | ""; onChange: (v: number | "") => void }) => (
    <RangeInput value={value} onChange={onChange} min={min} max={max} step={step} unit={unit} fallback={fallback} />
  ),
});

/* --------------------------------------------------------------- design */

const SELECTS: Record<string, { label: string; options: [string, string][] }> = {
  paddingTop: { label: "ריווח עליון", options: [["", "ברירת מחדל"], ["0", "ללא"], ["xs", "קטן מאוד"], ["s", "קטן"], ["m", "בינוני"], ["l", "גדול"], ["xl", "גדול מאוד"]] },
  paddingBottom: { label: "ריווח תחתון", options: [["", "ברירת מחדל"], ["0", "ללא"], ["xs", "קטן מאוד"], ["s", "קטן"], ["m", "בינוני"], ["l", "גדול"], ["xl", "גדול מאוד"]] },
  width: { label: "רוחב התוכן", options: [["", "ברירת מחדל"], ["narrow", "צר"], ["wide", "רחב"], ["full", "מסך מלא"]] },
  align: { label: "יישור טקסט", options: [["", "ברירת מחדל"], ["start", "לימין"], ["center", "למרכז"], ["end", "לשמאל"]] },
  hide: { label: "הצגה", options: [["", "בכל המסכים"], ["mobile", "להסתיר בטלפון"], ["desktop", "להסתיר במחשב"]] },
  animation: { label: "אנימציה בגלילה", options: [["", "ללא"], ["fade", "הופעה הדרגתית"], ["up", "עלייה מלמטה"], ["zoom", "התקרבות"], ["side", "כניסה מהצד"]] },
};

const fontOptions: [string, string][] = [["", "כמו באתר"], ...FONTS.map((f) => [f.name, f.label] as [string, string])];

function Select({ value, onChange, options }: { value?: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={ui.input}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={ui.row}>
      <span style={ui.label}>{label}</span>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- spacing */

const SIDE_LABELS = [
  ["top", "למעלה"],
  ["right", "ימין"],
  ["bottom", "למטה"],
  ["left", "שמאל"],
] as const;

/**
 * Elementor's four-sides box: top, right, bottom, left and a unit, with a
 * link toggle that keeps all four equal. Empty = the design's own spacing.
 */
export function SpacingInput({ value, onChange }: { value?: Box; onChange: (v: Box | undefined) => void }) {
  const v = value ?? {};
  const filled = SIDE_LABELS.map(([k]) => v[k]).filter((x) => x !== "" && x !== undefined);
  const [linked, setLinked] = useState(filled.length === 4 && new Set(filled).size === 1);
  const set = (side: (typeof SIDE_LABELS)[number][0], raw: string) => {
    const n: number | "" = raw === "" ? "" : Number(raw);
    const next: Box = linked ? { ...v, top: n, right: n, bottom: n, left: n } : { ...v, [side]: n };
    onChange(SIDE_LABELS.every(([k]) => next[k] === "" || next[k] === undefined) ? undefined : next);
  };
  return (
    <div dir="rtl">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 4, alignItems: "end" }}>
        {SIDE_LABELS.map(([k, label]) => (
          <label key={k} style={{ display: "grid", gap: 2, fontSize: 10, color: "#6b7785", textAlign: "center" }}>
            <input
              type="number"
              inputMode="numeric"
              aria-label={label}
              value={v[k] ?? ""}
              onChange={(e) => set(k, e.target.value)}
              style={{ ...ui.input, padding: "5px 4px", textAlign: "center" }}
            />
            {label}
          </label>
        ))}
        <button
          type="button"
          aria-pressed={linked}
          title={linked ? "ביטול קישור הצדדים" : "קישור כל הצדדים"}
          onClick={() => setLinked(!linked)}
          style={{ height: 30, marginBottom: 16, border: "1px solid " + (linked ? "#0e6a69" : "#d0d7de"), background: linked ? "#e6f2f1" : "#fff", borderRadius: 6, cursor: "pointer", padding: "0 6px" }}
        >
          🔗
        </button>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
        {(["px", "rem", "%"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onChange({ ...v, unit: u })}
            style={{ padding: "2px 8px", fontSize: 11, borderRadius: 5, cursor: "pointer", border: "1px solid " + ((v.unit ?? "px") === u ? "#0e6a69" : "#d0d7de"), background: (v.unit ?? "px") === u ? "#0e6a69" : "#fff", color: (v.unit ?? "px") === u ? "#fff" : "#1f2328" }}
          >
            {u}
          </button>
        ))}
        {value && (
          <button type="button" onClick={() => onChange(undefined)} style={{ marginInlineStart: "auto", fontSize: 11, border: 0, background: "none", color: "#cf222e", cursor: "pointer" }}>
            איפוס
          </button>
        )}
      </div>
    </div>
  );
}

/** Margin + padding together, as Elementor's Advanced tab shows them. */
export function SpacingControls({ value, onChange }: { value?: Spacing; onChange: (v: Spacing) => void }) {
  const sp = value ?? {};
  return (
    <>
      <Row label="שוליים חיצוניים (Margin)">
        <SpacingInput value={sp.margin} onChange={(m) => onChange({ ...sp, margin: m })} />
      </Row>
      <Row label="ריווח פנימי (Padding)">
        <SpacingInput value={sp.padding} onChange={(p) => onChange({ ...sp, padding: p })} />
      </Row>
    </>
  );
}

/* --------------------------------------------------------------- design */

/**
 * A section's design settings, split as Elementor splits them: "style"
 * (colours, background, fonts, corners) and "advanced" (margin, padding,
 * width, animation, visibility, anchor, CSS class).
 */
export function DesignPanel({ value, onChange, part }: { value?: BlockDesign; onChange: (v: BlockDesign) => void; part?: "style" | "advanced" }) {
  const d = value ?? {};
  const [open, setOpen] = useState(false);
  const set = <K extends keyof BlockDesign>(key: K, v: BlockDesign[K]) => onChange({ ...d, [key]: v });
  const count = Object.entries(d).filter(([k, v]) => (k === "backgroundImage" ? (v as MediaValue)?.src : v !== "" && v !== undefined && v !== 0)).length;

  const style = (
    <>
      <Row label="צבע רקע">
        <ColorInput value={d.background} onChange={(v) => set("background", v)} />
      </Row>
      <Row label="תמונת רקע">
        <MediaField value={d.backgroundImage} onChange={(v) => set("backgroundImage", v as BlockDesign["backgroundImage"])} />
        {d.backgroundImage?.src && (
          <button type="button" onClick={() => set("backgroundImage", undefined)} style={{ marginTop: 6, fontSize: 12, border: 0, background: "none", color: "#cf222e", cursor: "pointer" }}>
            הסרת תמונת הרקע
          </button>
        )}
      </Row>
      {d.backgroundImage?.src && (
        <>
          <Row label="הכהיית תמונת הרקע">
            <RangeInput value={d.overlay} onChange={(v) => set("overlay", v === "" ? undefined : v)} min={0} max={90} fallback={0} unit="%" />
          </Row>
          <Row label="צבע ההכהיה">
            <ColorInput value={d.overlayColor} onChange={(v) => set("overlayColor", v)} placeholder="שחור" />
          </Row>
        </>
      )}
      <Row label="צבע טקסט">
        <ColorInput value={d.textColor} onChange={(v) => set("textColor", v)} />
      </Row>
      <Row label="צבע כותרות">
        <ColorInput value={d.headingColor} onChange={(v) => set("headingColor", v)} />
      </Row>
      <Row label="צבע מותג (כפתורים, קישורים, הדגשות)">
        <ColorInput value={d.accentColor} onChange={(v) => set("accentColor", v)} />
      </Row>
      <Row label="גופן טקסט">
        <Select value={d.font} onChange={(v) => set("font", v)} options={fontOptions} />
      </Row>
      <Row label="גופן כותרות">
        <Select value={d.headingFont} onChange={(v) => set("headingFont", v)} options={fontOptions} />
      </Row>
      <Row label="עיגול פינות">
        <RangeInput value={d.radius} onChange={(v) => set("radius", v)} min={0} max={300} step={10} fallback={100} unit="%" />
      </Row>
      <Row label={SELECTS.align.label}>
        <Select value={d.align as string} onChange={(v) => set("align", v as never)} options={SELECTS.align.options} />
      </Row>
    </>
  );

  const advanced = (
    <>
      <SpacingControls value={{ margin: d.margin, padding: d.padding }} onChange={(sp) => onChange({ ...d, margin: sp.margin, padding: sp.padding })} />
      <Row label={SELECTS.width.label}>
        <Select value={d.width as string} onChange={(v) => set("width", v as never)} options={SELECTS.width.options} />
      </Row>
      {(["animation", "hide"] as const).map((k) => (
        <Row key={k} label={SELECTS[k].label}>
          <Select value={d[k] as string} onChange={(v) => set(k, v as never)} options={SELECTS[k].options} />
        </Row>
      ))}
      <Row label="עוגן (לקישור ישיר: #שם)">
        <input type="text" dir="auto" value={d.anchor ?? ""} onChange={(e) => set("anchor", e.target.value.replace(/\s+/g, "-"))} style={ui.input} />
      </Row>
      <Row label="מחלקת CSS (מתקדם)">
        <input type="text" dir="ltr" value={d.className ?? ""} onChange={(e) => set("className", e.target.value)} style={ui.input} />
      </Row>
    </>
  );

  const reset = count > 0 && (
    <button type="button" onClick={() => onChange({})} style={{ width: "100%", padding: "7px", border: "1px solid #cf222e", color: "#cf222e", background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
      איפוס כל העיצוב של הקטע
    </button>
  );

  if (part) return <div dir="rtl">{part === "style" ? style : advanced}{part === "advanced" && reset}</div>;

  return (
    <div dir="rtl" style={{ border: "1px solid #d0d7de", borderRadius: 8, background: "#f6f8fa" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "none", border: 0, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
      >
        <span>🎨 עיצוב הקטע {count > 0 && <span style={{ background: "#0969da", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, marginInlineStart: 6 }}>{count}</span>}</span>
        <span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div style={{ padding: "4px 12px 12px" }}>
          {style}
          {advanced}
          {reset}
        </div>
      )}
    </div>
  );
}

export const designField: CustomField = {
  type: "custom",
  label: "עיצוב",
  render: ({ value, onChange }: { value?: BlockDesign; onChange: (v: BlockDesign) => void }) => (
    <DesignPanel value={value} onChange={onChange} />
  ),
};

export const fontField = (label: string): CustomField => ({
  type: "custom",
  label,
  render: ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
    <Select value={value} onChange={onChange} options={fontOptions} />
  ),
});
