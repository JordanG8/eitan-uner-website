"use client";

import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import config from "@/puck/config";
import { Button } from "@/components/ui/button";

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
 *
 * ---------------------------------------------------------------------------
 * On the chrome below being on the site's tokens rather than on Tailwind's
 * defaults.
 *
 * This file was a second design system: `rounded`, `shadow`, `bg-white`,
 * `bg-amber-100`, `bg-red-700`, `bg-neutral-700`, `text-xs`, `text-sm`, and
 * physical `left-4` / `right-4` in a project whose every other file is
 * logical. It is behind a password, which is exactly why it drifted and
 * exactly why that argument does not hold: this is the one surface Eitan
 * himself opens daily, and the site is a thing he inherits. Every other
 * surface has been argued over for seven rounds; the one he uses had never
 * been looked at.
 *
 * `bg-white` is the sharpest of them. "Warm paper ground, never pure white"
 * is the first of the three moves the whole redesign is built on, and the
 * only white rectangle anywhere on this project was sitting in the owner's
 * own editor.
 *
 * The direction question, since it is subtle. Puck's panels are LTR and the
 * wrapper says so; these three floating elements carry Hebrew and each
 * declares `dir="rtl"`, which means `start` on THEM resolves to the right.
 * So `bottom-4 end-4` and `bottom-4 start-4` are logical, are correct for the
 * language they contain, and land on exactly the pixels the physical
 * `left-4` / `right-4` did. The banner drops its translate trick entirely for
 * `inset-inline-0 mx-auto w-fit`, which centres without caring about
 * direction at all.
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
          role="alert"
          className="fixed inset-x-0 top-2 z-[9999] mx-auto w-fit bg-destructive px-4 py-2 text-micro text-paper"
        >
          {banner}
        </div>
      )}

      {status && (
        <div
          dir="rtl"
          role="status"
          className={`fixed bottom-4 end-4 z-[9999] max-w-sm px-4 py-2 text-body text-paper ${
            status.tone === "bad"
              ? "bg-destructive"
              : status.tone === "busy"
                ? "bg-ink-soft"
                : "bg-brand-700"
          }`}
        >
          {status.text}
        </div>
      )}

      {/* The site's own Button, not a hand-rolled one. It is the only
          control in this file, and routing it through the primitive is what
          makes it inherit the four laws fixed elsewhere in this pass: a
          pointer cursor, an instant square focus ring, a 48px box, and the
          outline variant's one hover. */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={logout}
        dir="rtl"
        className="fixed bottom-4 start-4 z-[9999] bg-paper"
      >
        יציאה
      </Button>

      <Puck config={config} data={data} onPublish={publish} iframe={{ enabled: true }} />
    </div>
  );
}
