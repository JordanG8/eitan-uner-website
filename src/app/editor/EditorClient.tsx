"use client";

import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import config from "@/puck/config";

/**
 * The editor shell.
 *
 * Puck's own chrome is LTR; the page being edited is RTL. `dir="ltr"` on the
 * wrapper keeps the editor panels sane while the iframe content inherits the
 * site's own `dir="rtl"`.
 *
 * Publishing is a git commit, so it takes about a minute to appear live. That
 * is stated plainly rather than hidden behind a spinner — a save that looks
 * instant but isn't is worse than a slow save that says so.
 */
export function EditorClient({
  data,
  slug,
  driver,
}: {
  data: Data;
  slug: string;
  driver: "github" | "local" | "unavailable";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<{ text: string; tone: "ok" | "busy" | "bad" } | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  async function publish(next: Data) {
    setStatus({ text: "שומר…", tone: "busy" });
    try {
      const res = await fetch("/api/puck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, data: next }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus({ text: body.error ?? `שגיאה ${res.status}`, tone: "bad" });
        return;
      }
      setStatus({
        text: body.committed
          ? "נשמר ✓ — השינויים יופיעו באתר בעוד כדקה"
          : "נשמר ✓ (מקומי)",
        tone: "ok",
      });
    } catch (err) {
      setStatus({ text: `שגיאה: ${(err as Error).message}`, tone: "bad" });
    }
  }

  const banner =
    driver === "unavailable"
      ? "אין אחסון מוגדר — לא ניתן לשמור בסביבה הזו."
      : null;

  return (
    <div dir="ltr" className="h-screen">
      {banner && (
        <div
          dir="rtl"
          className="fixed top-2 left-1/2 z-[9999] -translate-x-1/2 rounded bg-amber-100 px-4 py-2 text-xs text-amber-900 shadow"
        >
          {banner}
        </div>
      )}

      {status && (
        <div
          dir="rtl"
          role="status"
          className={`fixed bottom-4 left-4 z-[9999] max-w-sm rounded px-4 py-2 text-sm text-white shadow-lg ${
            status.tone === "bad"
              ? "bg-red-700"
              : status.tone === "busy"
                ? "bg-neutral-700"
                : "bg-brand-600"
          }`}
        >
          {status.text}
        </div>
      )}

      <button
        type="button"
        onClick={logout}
        dir="rtl"
        className="fixed bottom-4 right-4 z-[9999] rounded border border-hairline bg-white px-3 py-1.5 text-xs text-ink-soft shadow-sm hover:text-ink"
      >
        יציאה
      </button>

      <Puck config={config} data={data} onPublish={publish} iframe={{ enabled: true }} />
    </div>
  );
}
