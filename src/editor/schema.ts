import type { ReactNode } from "react";

/**
 * The field schema the editor's side panel is generated from — for each
 * block type (src/blocks/fields.tsx) and for the site design
 * (src/editor/site-fields.tsx).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Option = { label: string; value: string | number | boolean };

export interface CustomField {
  type: "custom";
  label: string;
  render(props: { value: any; onChange(value: any): void }): ReactNode;
}

export type Field =
  | { type: "text" | "textarea"; label: string; placeholder?: string }
  | { type: "number"; label: string; min?: number; max?: number }
  | { type: "radio" | "select"; label: string; options: Option[] }
  | {
      type: "array";
      label: string;
      arrayFields: Fields;
      getItemSummary?: (item: any, index: number) => string;
      defaultItemProps?: Record<string, unknown>;
      max?: number;
    }
  | { type: "object"; label: string; objectFields: Fields }
  | CustomField;

export type Fields = Record<string, Field>;
