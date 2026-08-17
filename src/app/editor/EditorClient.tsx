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
 * site's own `dir="rtl"`, which is the combination that actually reads correctly.
 */
export function EditorClient({ data }: { data: Data }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  async function publish(next: Data) {
    setStatus("שומר…");
    try {
      const res = await fetch("/api/puck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const body = await res.json().catch(() => ({}));
      setStatus(res.ok ? "נשמר ✓" : `שגיאה: ${body.error ?? res.status}`);
    } catch (err) {
      setStatus(`שגיאה: ${(err as Error).message}`);
    }
  }

  return (
    <div dir="ltr" className="h-screen">
      {status && (
        <div
          dir="rtl"
          className="fixed bottom-4 left-4 z-[9999] rounded bg-black/85 px-4 py-2 text-sm text-white"
        >
          {status}
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

      <Puck
        config={config}
        data={data}
        onPublish={publish}
        iframe={{ enabled: true }}
      />
    </div>
  );
}
