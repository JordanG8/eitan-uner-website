"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CameraMark } from "@/components/Logo";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "הכניסה נכשלה");
    } catch {
      setError("שגיאת רשת — נסו שוב");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-hairline bg-white p-8 shadow-sm"
      >
        <div className="flex flex-col items-center text-brand-600">
          <CameraMark className="h-10 w-auto" />
          <h1 className="mt-4 text-xl font-bold text-ink">כניסה לעריכת האתר</h1>
        </div>

        <label htmlFor="password" className="mt-8 block text-[15px] font-medium text-ink">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-hairline px-3 py-2.5 text-[16px] outline-none focus:border-brand-500"
        />

        {error && (
          <p role="alert" className="mt-4 text-[14px] text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-6 min-h-11 w-full bg-brand-500 px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "מתחבר…" : "כניסה"}
        </button>
      </form>
    </div>
  );
}
