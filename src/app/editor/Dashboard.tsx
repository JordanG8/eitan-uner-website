"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { PageEntry } from "@/lib/cms";
import { btn, HistoryDialog, StatusToast, StorageBanner, type Status } from "./shared";

const card: CSSProperties = { background: "#fff", border: "1px solid #d0d7de", borderRadius: 14, padding: 20 };
const input: CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #d0d7de", borderRadius: 8, fontSize: 14 };

const href = (slug: string) => (slug === "/" ? "/" : `/${slug}`);

export function Dashboard({ pages: initial, driver }: { pages: PageEntry[]; driver: string }) {
  const router = useRouter();
  const [pages, setPages] = useState(initial);
  const [status, setStatus] = useState<Status>(null);
  const [history, setHistory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", slug: "", copyFrom: "", addToNav: true });
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => pages.filter((p) => !query || p.title.includes(query) || p.slug.includes(query)),
    [pages, query]
  );

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `שגיאה ${res.status}`);
    return body;
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus({ text: "יוצר עמוד…", tone: "busy" });
    try {
      const body = await call("/api/editor/pages", {
        method: "POST",
        body: JSON.stringify({ ...form, copyFrom: form.copyFrom || undefined }),
      });
      router.push(`/editor/pages/${body.id}`);
    } catch (err) {
      setStatus({ text: (err as Error).message, tone: "bad" });
      setBusy(false);
    }
  }

  async function duplicate(p: PageEntry) {
    const title = prompt("שם לעותק:", `${p.title} (עותק)`);
    if (!title) return;
    const slug = prompt("כתובת לעותק:", `${p.slug === "/" ? "בית" : p.slug}-עותק`);
    if (!slug) return;
    setStatus({ text: "משכפל…", tone: "busy" });
    try {
      const body = await call("/api/editor/pages", { method: "POST", body: JSON.stringify({ title, slug, copyFrom: p.id }) });
      router.push(`/editor/pages/${body.id}`);
    } catch (err) {
      setStatus({ text: (err as Error).message, tone: "bad" });
    }
  }

  async function remove(p: PageEntry) {
    if (!confirm(`למחוק את "${p.title}"?\nהעמוד יוסר מהאתר, וגם קישורים אליו בתפריט יוסרו.`)) return;
    setStatus({ text: "מוחק…", tone: "busy" });
    try {
      await call(`/api/editor/pages?id=${encodeURIComponent(p.id)}`, { method: "DELETE" });
      setPages((list) => list.filter((x) => x.id !== p.id));
      setStatus({ text: "העמוד נמחק", tone: "ok" });
    } catch (err) {
      setStatus({ text: (err as Error).message, tone: "bad" });
    }
  }

  async function move(index: number, delta: number) {
    const next = [...pages];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setPages(next);
    try {
      await call("/api/editor/pages", { method: "PATCH", body: JSON.stringify({ order: next.map((p) => p.id) }) });
    } catch (err) {
      setStatus({ text: (err as Error).message, tone: "bad" });
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f6f8fa", color: "#1f2328", fontFamily: "var(--font-sans)" }}>
      <StorageBanner driver={driver} />
      <header style={{ background: "#fff", borderBottom: "1px solid #d0d7de" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, flex: 1 }}>ניהול האתר</h1>
          <a href="/" target="_blank" rel="noopener noreferrer" style={btn()}>צפייה באתר ↗</a>
          <button type="button" onClick={logout} style={btn()}>יציאה</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 20, display: "grid", gap: 20 }}>
        <section style={{ ...card, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", background: "linear-gradient(135deg, #0e6a69, #0b3436)", color: "#fff", border: 0 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>🎨 עיצוב האתר</h2>
            <p style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>צבעים, גופנים, ריווחים, תפריט, כותרת עליונה ותחתונה ופרטי קשר — לכל האתר בבת אחת.</p>
          </div>
          <Link href="/editor/site" style={{ ...btn(), background: "#fff", color: "#0b3436", border: 0, padding: "10px 18px", fontSize: 15 }}>לעריכת העיצוב</Link>
        </section>

        <section style={card}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, flex: 1 }}>העמודים ({pages.length})</h2>
            <input type="search" placeholder="חיפוש עמוד…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...input, width: 220 }} />
          </div>
          <ul style={{ display: "grid", gap: 6 }}>
            {filtered.map((p) => {
              const i = pages.indexOf(p);
              return (
                <li key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", border: "1px solid #e4e8ec", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Link href={`/editor/pages/${p.id}`} style={{ fontWeight: 700, color: "#0b3436", textDecoration: "none" }}>
                      {p.slug === "/" ? "🏠 " : p.slug.includes("/") ? "↳ " : ""}
                      {p.title}
                    </Link>
                    <div dir="ltr" style={{ fontSize: 12, color: "#6b7785", textAlign: "right" }}>{decodeURIComponent(href(p.slug))}</div>
                  </div>
                  {!query && (
                    <>
                      <button type="button" aria-label="הזזה למעלה" disabled={i === 0} onClick={() => move(i, -1)} style={btn()}>↑</button>
                      <button type="button" aria-label="הזזה למטה" disabled={i === pages.length - 1} onClick={() => move(i, 1)} style={btn()}>↓</button>
                    </>
                  )}
                  <Link href={`/editor/pages/${p.id}`} style={btn(true)}>עריכה</Link>
                  <a href={href(p.slug)} target="_blank" rel="noopener noreferrer" style={btn()}>צפייה</a>
                  <button type="button" onClick={() => duplicate(p)} style={btn()}>שכפול</button>
                  <button type="button" onClick={() => setHistory(p.id)} style={btn()}>היסטוריה</button>
                  {p.slug !== "/" && (
                    <button type="button" onClick={() => remove(p)} style={{ ...btn(), color: "#b42318", borderColor: "#f0b4ae" }}>מחיקה</button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section style={card}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>➕ עמוד חדש</h2>
          <form onSubmit={create} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "end" }}>
            <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600 }}>
              שם העמוד
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="לדוגמה: סדנאות קיץ" style={input} />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600 }}>
              כתובת (לא חובה)
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={form.title ? form.title.trim().replace(/\s+/g, "-") : "סדנאות-קיץ"} style={input} />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600 }}>
              להתחיל מ…
              <select value={form.copyFrom} onChange={(e) => setForm({ ...form, copyFrom: e.target.value })} style={input}>
                <option value="">עמוד ריק</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>עותק של: {p.title}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={form.addToNav} onChange={(e) => setForm({ ...form, addToNav: e.target.checked })} />
              להוסיף לתפריט
            </label>
            <button type="submit" disabled={busy || driver === "unavailable"} style={{ ...btn(true), justifyContent: "center", padding: "10px 16px", fontSize: 15 }}>
              יצירת העמוד
            </button>
          </form>
        </section>
      </main>

      {history && (
        <HistoryDialog doc={`page-${history}`} onClose={() => setHistory(null)} onRestored={() => { setHistory(null); setStatus({ text: "הגרסה שוחזרה ✓", tone: "ok" }); router.refresh(); }} />
      )}
      <StatusToast status={status} onClose={() => setStatus(null)} />
    </div>
  );
}
