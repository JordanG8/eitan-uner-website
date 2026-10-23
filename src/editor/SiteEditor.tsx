"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { btn, EditorFrame, HistoryDialog, StatusToast, StorageBanner, type Status } from "@/app/editor/shared";
import type { PageData } from "@/lexical/doc";
import { LexicalContent } from "@/lexical/Render";
import { normalizeSite, siteSettings, type SiteDoc } from "@/lib/site";
import { EditorContext } from "./fields";
import { FieldsForm } from "./Form";
import { siteFields } from "./site-fields";

/**
 * The site-design editor: palette, fonts, spacing, header, menu, footer and
 * contact details, previewed live on the real homepage as you change them.
 */
export function SiteEditor({ site, preview, pages, driver }: { site: SiteDoc; preview: PageData | null; pages: { slug: string; title: string }[]; driver: string }) {
  const [doc, setDoc] = useState<SiteDoc>(site);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [history, setHistory] = useState(false);
  const live = useMemo(() => normalizeSite(doc), [doc]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function publish() {
    setStatus({ text: "מפרסם…", tone: "busy" });
    try {
      const res = await fetch("/api/editor/site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return setStatus({ text: body.error ?? `שגיאה ${res.status}`, tone: "bad" });
      setDirty(false);
      setStatus({ text: "פורסם ✓ — העיצוב החדש כבר באתר", tone: "ok" });
    } catch (err) {
      setStatus({ text: `שגיאה: ${(err as Error).message}`, tone: "bad" });
    }
  }

  return (
    <EditorContext.Provider value={{ pages }}>
      <div dir="rtl" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#eef1f4" }}>
        <StorageBanner driver={driver} />
        <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", borderBottom: "1px solid #d0d7de", fontFamily: "system-ui, sans-serif", flexWrap: "wrap" }}>
          <Link href="/editor" style={btn()}>→ כל העמודים</Link>
          <strong style={{ fontSize: 15, flex: 1 }}>🎨 עיצוב האתר</strong>
          <button type="button" onClick={() => setHistory(true)} style={btn()}>היסטוריה</button>
          <a href="/" target="_blank" rel="noopener noreferrer" style={btn()}>צפייה באתר ↗</a>
          <button type="button" onClick={publish} disabled={driver === "unavailable"} style={{ ...btn(true), padding: "8px 18px", fontSize: 14 }}>
            {dirty ? "● פרסום" : "פרסום"}
          </button>
        </header>
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }} className="eu-editor-canvas" inert>
            <EditorFrame site={live}>
              {preview ? <LexicalContent state={preview.content} ctx={{ site: siteSettings(live) }} /> : <p style={{ padding: 40 }}>אין תצוגה מקדימה</p>}
            </EditorFrame>
          </div>
          <aside aria-label="עיצוב האתר" style={{ width: 380, flex: "0 0 380px", borderInlineStart: "1px solid #d0d7de", background: "#fff", overflowY: "auto", padding: 16, fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 1.4, color: "#1f2328" }}>
            <p style={{ fontSize: 12, color: "#6b7785", marginBottom: 14, lineHeight: 1.5 }}>כל שינוי מוצג מיד בתצוגה המקדימה. הוא יעלה לאתר רק אחרי לחיצה על ״פרסום״.</p>
            <FieldsForm
              fields={siteFields}
              value={doc as unknown as Record<string, unknown>}
              onChange={(v) => {
                setDoc(v as unknown as SiteDoc);
                setDirty(true);
              }}
            />
          </aside>
        </div>
      </div>
      {history && <HistoryDialog doc="site" onClose={() => setHistory(false)} onRestored={() => window.location.reload()} />}
      <StatusToast status={status} onClose={() => setStatus(null)} />
    </EditorContext.Provider>
  );
}
