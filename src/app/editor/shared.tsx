"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ThemeStyle } from "@/components/ThemeStyle";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { assistant } from "@/lib/font";
import { fontStack } from "@/lib/fonts";
import { siteSettings, type SiteDoc } from "@/lib/site";

/**
 * Pieces shared by the page editor and the site-design editor.
 */

/* ------------------------------------------------------------- preview */

/**
 * Wraps the preview in the real header and footer, styled by the given design
 * document, so a page is edited in context. Header and footer are inert here:
 * clicking a menu link inside the editor must not navigate away from it.
 */
export function EditorFrame({ site, background, children }: { site: SiteDoc; background?: string; children: ReactNode }) {
  const settings = siteSettings(site);
  // The font variables resolve here, on an element that carries next/font's
  // class, because the iframe's own <html> does not.
  const style = {
    "--font-sans": fontStack(site.typography.bodyFont),
    "--font-heading": fontStack(site.typography.headingFont),
    fontFamily: "var(--font-sans)",
    lineHeight: site.typography.lineHeight,
    minHeight: "100vh",
  } as CSSProperties;
  return (
    <div dir="rtl" lang="he" className={`${assistant.variable} flex flex-col bg-surface text-ink antialiased`} style={style}>
      <ThemeStyle doc={site} />
      <div inert style={{ position: "relative", zIndex: 40 }}>
        <Header site={settings} header={{ ...site.header, sticky: false }} />
      </div>
      <main className="flex-1" style={background ? { background } : undefined}>
        {children}
      </main>
      <div inert>
        <Footer site={settings} footer={site.footer} header={site.header} />
        {/* The floating button is pinned to the window, so in the editor it
            would sit on top of the settings panel; it is shown at the end of
            the preview instead. */}
        {site.contact.showWhatsappButton && (
          <div style={{ position: "relative", height: 0 }}>
            <div className="eu-frame-fab">
              <WhatsAppFab url={settings.whatsappUrl} color={site.contact.whatsappButtonColor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- status */

export type Status = { text: string; tone: "ok" | "busy" | "bad" } | null;

export function StatusToast({ status, onClose }: { status: Status; onClose: () => void }) {
  useEffect(() => {
    if (status?.tone !== "ok") return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [status, onClose]);
  if (!status) return null;
  const bg = status.tone === "bad" ? "#b42318" : status.tone === "busy" ? "#3b4652" : "#0e6a69";
  return (
    <div
      dir="rtl"
      role={status.tone === "bad" ? "alert" : "status"}
      style={{ position: "fixed", bottom: 16, left: 16, zIndex: 10000, maxWidth: 420, borderRadius: 10, padding: "10px 14px", color: "#fff", background: bg, boxShadow: "0 12px 30px rgb(0 0 0 / .2)", fontSize: 14, display: "flex", gap: 12, alignItems: "center" }}
    >
      <span style={{ flex: 1 }}>{status.text}</span>
      {status.tone !== "busy" && (
        <button type="button" onClick={onClose} aria-label="סגירה" style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", fontSize: 16 }}>
          ✕
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- history */

interface Version {
  id: string;
  at: string;
  size: number;
}

const fmt = new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short" });

export function HistoryDialog({ doc, onClose, onRestored }: { doc: string; onClose: () => void; onRestored: () => void }) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/editor/history?doc=${encodeURIComponent(doc)}`)
      .then((r) => r.json())
      .then((b) => (b.error ? setError(b.error) : setVersions(b.versions ?? [])))
      .catch((e) => setError(String(e)));
  }, [doc]);

  async function restore(id: string) {
    if (!confirm("לשחזר את הגרסה הזו? היא תפורסם באתר מיד. הגרסה הנוכחית תישמר בהיסטוריה.")) return;
    setBusy(id);
    const res = await fetch("/api/editor/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc, version: id }) });
    const b = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setError(b.error ?? `שגיאה ${res.status}`);
    onRestored();
  }

  return (
    <div dir="rtl" role="dialog" aria-modal="true" aria-label="היסטוריית גרסאות" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgb(0 0 0 / .45)", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "min(520px, 100%)", maxHeight: "80vh", overflow: "auto", padding: 20, boxShadow: "0 24px 60px rgb(0 0 0 / .3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>היסטוריית גרסאות</h2>
          <button type="button" onClick={onClose} style={btn()}>סגירה</button>
        </div>
        <p style={{ fontSize: 13, color: "#57606a", marginBottom: 12 }}>כל פרסום נשמר. אפשר לחזור לכל אחת מ־30 הגרסאות האחרונות.</p>
        {error && <p role="alert" style={{ color: "#b42318", fontSize: 13 }}>{error}</p>}
        {!versions && !error && <p style={{ fontSize: 13 }}>טוען…</p>}
        {versions?.length === 0 && <p style={{ fontSize: 13 }}>עדיין אין גרסאות שמורות — העמוד מוצג בגרסת המקור שלו.</p>}
        <ol style={{ display: "grid", gap: 6 }}>
          {versions?.map((v, i) => (
            <li key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #d0d7de", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}>
              <span>
                {v.at ? fmt.format(new Date(v.at)) : v.id}
                {i === 0 && <strong style={{ marginInlineStart: 8, fontSize: 12, color: "#0e6a69" }}>(נוכחית)</strong>}
              </span>
              {i > 0 && (
                <button type="button" disabled={busy !== null} onClick={() => restore(v.id)} style={btn(true)}>
                  {busy === v.id ? "משחזר…" : "שחזור"}
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- misc */

export function btn(primary = false): CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${primary ? "#0e6a69" : "#d0d7de"}`,
    background: primary ? "#0e6a69" : "#fff",
    color: primary ? "#fff" : "#1f2328",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

export function StorageBanner({ driver }: { driver: string }) {
  if (driver === "blob") return null;
  const text =
    driver === "unavailable"
      ? "אין אחסון מחובר — שינויים לא יישמרו. יש לחבר Vercel Blob לפרויקט (Storage → Blob → Connect) ולפרסם מחדש."
      : "מצב פיתוח: השינויים נשמרים בתיקייה ‎.data‎ במחשב הזה.";
  return (
    <div dir="rtl" role="note" style={{ background: driver === "unavailable" ? "#fff4e5" : "#eef6ff", color: driver === "unavailable" ? "#8a4b00" : "#0a3069", fontSize: 13, padding: "8px 14px", borderBottom: "1px solid #d0d7de" }}>
      {text}
    </div>
  );
}
