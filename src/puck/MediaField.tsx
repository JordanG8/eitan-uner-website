"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Media picker used as a Puck custom field.
 *
 * Replaces the dropdown-of-known-paths from the spike: a thumbnail grid of
 * everything available, plus drag-or-click upload. It manages the {src, alt}
 * pair together, because an image without alt text is a bug we don't want to
 * make easy.
 */

export interface MediaValue {
  src?: string;
  alt?: string;
}

interface MediaItem {
  key: string;
  url: string;
  label?: string;
  builtIn: boolean;
  size: number;
  width?: number;
  height?: number;
}

export function MediaField({
  value,
  onChange,
}: {
  value: MediaValue | undefined;
  onChange: (v: MediaValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [driver, setDriver] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      setItems(body.items ?? []);
      setDriver(body.driver ?? "");
    } catch (e) {
      setError(`לא ניתן לטעון את ספריית המדיה (${(e as Error).message})`);
      setItems([]);
    }
  }, []);

  /** Loaded when the library is first opened, not on mount — the field is
   *  rendered for every image on the page and most are never opened. */
  function toggleOpen() {
    setOpen((wasOpen) => {
      if (!wasOpen && items === null) void load();
      return !wasOpen;
    });
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      for (const f of Array.from(files)) form.append("file", f);
      const res = await fetch("/api/media", { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `שגיאה ${res.status}`);
      // Select the first newly uploaded file straight away.
      const first = body.items?.[0];
      if (first?.url) onChange({ src: first.url, alt: value?.alt ?? "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const filtered = (items ?? []).filter((i) =>
    query ? (i.label ?? i.key).toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <div dir="rtl" style={{ fontFamily: "inherit" }}>
      {/* Current selection */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div
          style={{
            width: 76,
            height: 76,
            flex: "0 0 auto",
            border: "1px solid #ddd",
            background: "#f4f6f8",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {value?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 11, color: "#888" }}>ללא תמונה</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={toggleOpen}
            style={{
              width: "100%",
              padding: "7px 10px",
              border: "1px solid #14888D",
              background: open ? "#14888D" : "#fff",
              color: open ? "#fff" : "#14888D",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {open ? "סגירת הספרייה" : value?.src ? "החלפת תמונה" : "בחירת תמונה"}
          </button>
          <input
            type="text"
            value={value?.alt ?? ""}
            onChange={(e) => onChange({ src: value?.src, alt: e.target.value })}
            placeholder="תיאור התמונה (לגוגל ולקוראי מסך)"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ddd",
              fontSize: 12,
            }}
          />
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 10, border: "1px solid #e2e8ec", padding: 10 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש…"
              style={{ flex: 1, padding: "6px 8px", border: "1px solid #ddd", fontSize: 12 }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              style={{
                padding: "6px 12px",
                border: "1px solid #14888D",
                background: "#14888D",
                color: "#fff",
                cursor: busy ? "wait" : "pointer",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {busy ? "מעלה…" : "העלאה"}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => void upload(e.target.files)}
            />
          </div>

          {driver === "unavailable" && (
            <p style={{ fontSize: 11, color: "#a15c00", marginBottom: 8 }}>
              העלאה לא זמינה בסביבה הזו — יש לחבר אחסון אובייקטים.
            </p>
          )}
          {error && (
            <p role="alert" style={{ fontSize: 11, color: "#b00020", marginBottom: 8 }}>
              {error}
            </p>
          )}

          {items === null ? (
            <p style={{ fontSize: 12, color: "#888" }}>טוען…</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
                gap: 6,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {filtered.map((item) => {
                const selected = value?.src === item.url;
                return (
                  <button
                    key={item.key}
                    type="button"
                    title={item.label ?? item.key}
                    onClick={() => {
                      onChange({ src: item.url, alt: value?.alt ?? item.label ?? "" });
                      setOpen(false);
                    }}
                    style={{
                      aspectRatio: "1",
                      padding: 0,
                      border: selected ? "3px solid #14888D" : "1px solid #ddd",
                      background: "#f4f6f8",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt=""
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                );
              })}
              {!filtered.length && (
                <p style={{ fontSize: 12, color: "#888", gridColumn: "1/-1" }}>
                  לא נמצאו תמונות
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
