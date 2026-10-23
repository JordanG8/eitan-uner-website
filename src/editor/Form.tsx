"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { Field, Fields } from "./schema";

/**
 * Renders a field schema as a form. Used for the selected block's settings,
 * the page settings and the site design panel.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const s = {
  field: { marginBottom: 14 } as CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#3b4652", marginBottom: 5 } as CSSProperties,
  input: { width: "100%", padding: "7px 9px", border: "1px solid #d0d7de", borderRadius: 6, fontSize: 13, background: "#fff", fontFamily: "inherit" } as CSSProperties,
  group: { border: "1px solid #d0d7de", borderRadius: 8, background: "#f6f8fa" } as CSSProperties,
  groupHead: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "9px 12px", background: "none", border: 0, cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "start", color: "#1f2328" } as CSSProperties,
  icon: { border: "1px solid #d0d7de", borderRadius: 6, background: "#fff", padding: "2px 7px", cursor: "pointer", fontSize: 12 } as CSSProperties,
};

function Group({ title, children, defaultOpen = false, actions }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; actions?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={s.group}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} style={s.groupHead}>
          <span>{title}</span>
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
        {actions && <div style={{ display: "flex", gap: 4, paddingInlineEnd: 8 }}>{actions}</div>}
      </div>
      {open && <div style={{ padding: "4px 12px 12px", background: "#fff", borderTop: "1px solid #e4e8ec", borderRadius: "0 0 8px 8px" }}>{children}</div>}
    </div>
  );
}

function ArrayInput({ field, value, onChange }: { field: Extract<Field, { type: "array" }>; value: any[] | undefined; onChange: (v: any[]) => void }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i: number, item: any) => onChange(items.map((x, j) => (j === i ? item : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  const canAdd = !field.max || items.length < field.max;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {items.map((item, i) => (
        <Group
          key={i}
          title={field.getItemSummary?.(item, i) || `פריט ${i + 1}`}
          actions={
            <>
              <button type="button" aria-label="למעלה" disabled={i === 0} onClick={() => move(i, -1)} style={s.icon}>↑</button>
              <button type="button" aria-label="למטה" disabled={i === items.length - 1} onClick={() => move(i, 1)} style={s.icon}>↓</button>
              <button type="button" aria-label="מחיקה" onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ ...s.icon, color: "#b42318" }}>✕</button>
            </>
          }
        >
          <FieldsForm fields={field.arrayFields} value={item ?? {}} onChange={(v) => set(i, v)} />
        </Group>
      ))}
      {canAdd && (
        <button type="button" onClick={() => onChange([...items, { ...(field.defaultItemProps ?? {}) }])} style={{ ...s.icon, padding: "7px", fontSize: 13, fontWeight: 600 }}>
          + הוספה
        </button>
      )}
    </div>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case "text":
      return <input type="text" dir="auto" value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} style={s.input} />;
    case "textarea":
      return <textarea dir="auto" rows={4} value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...s.input, resize: "vertical" }} />;
    case "number":
      return <input type="number" min={field.min} max={field.max} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} style={s.input} />;
    case "select":
      return (
        <select value={value === undefined ? "" : String(value)} onChange={(e) => onChange(field.options.find((o) => String(o.value) === e.target.value)?.value)} style={s.input}>
          {value === undefined && <option value="">—</option>}
          {field.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div role="radiogroup" style={{ display: "flex", flexWrap: "wrap", border: "1px solid #d0d7de", borderRadius: 6, overflow: "hidden" }}>
          {field.options.map((o) => {
            const on = value === o.value;
            return (
              <button key={String(o.value)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)} style={{ flex: "1 1 auto", padding: "6px 8px", border: 0, borderInlineEnd: "1px solid #e4e8ec", background: on ? "#0e6a69" : "#fff", color: on ? "#fff" : "#1f2328", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {o.label}
              </button>
            );
          })}
        </div>
      );
    case "array":
      return <ArrayInput field={field} value={value} onChange={onChange} />;
    case "object":
      return <FieldsForm fields={field.objectFields} value={value ?? {}} onChange={onChange} />;
    case "custom":
      return <>{field.render({ value, onChange })}</>;
  }
}

/** A set of fields bound to one object value. */
export function FieldsForm({ fields, value, onChange }: { fields: Fields; value: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  return (
    <div>
      {Object.entries(fields).map(([key, field]) => {
        const input = <FieldInput field={field} value={value?.[key]} onChange={(v) => onChange({ ...value, [key]: v })} />;
        if (field.type === "object") {
          return (
            <div key={key} style={s.field}>
              <Group title={field.label}>{input}</Group>
            </div>
          );
        }
        // The design panel draws its own header.
        if (key === "design") return <div key={key} style={s.field}>{input}</div>;
        return (
          <div key={key} style={s.field}>
            <span style={s.label}>{field.label}</span>
            {input}
          </div>
        );
      })}
    </div>
  );
}
