"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";

function reference(image: ImageRef) {
  return `EU-${image.src.split("/").pop()?.replace(/\.[^.]+$/, "").replace(/^gallery-/, "").toUpperCase()}`;
}

export function ImageGallery({ images, prints = false, whatsappUrl, email }: {
  images: ImageRef[];
  prints?: boolean;
  whatsappUrl: string;
  email: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const current = index === null ? undefined : images[index];
  const move = (delta: number) => setIndex((value) => value === null ? null : (value + delta + images.length) % images.length);
  const message = current ? `שלום איתן, אשמח ${prints ? "לברר על הדפסה, גדלים ומסגור של" : "לשמוע עוד על"} הצילום: ${current.alt} (${reference(current)}).` : "";

  return <>
    <p className="mb-6 text-center text-base text-ink-soft">לחצו על צילום לצפייה מלאה ולפרטים{prints ? " על הדפסה ורכישה" : ""}.</p>
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {images.map((im, i) => <figure key={`${im.src}-${i}`} className="break-inside-avoid rounded-2xl border border-hairline bg-white shadow-[0_10px_30px_rgb(18_42_43_/_0.08)]">
        <button type="button" className="group block w-full overflow-hidden rounded-t-2xl" aria-label={`הגדלת הצילום: ${im.alt}`} onClick={(event) => { opener.current = event.currentTarget; setIndex(i); }}>
          <Image src={im.src} alt={im.alt} width={im.width ?? 1200} height={im.height ?? 900} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.035]" />
        </button>
        <figcaption className="px-4 py-3">
          <span className="block text-base font-semibold text-ink">{im.alt}</span>
          <span dir="ltr" className="mt-1 block break-all text-xs text-ink-soft">{reference(im)}</span>
        </figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} className="gallery-dialog" aria-labelledby={titleId} onCancel={() => setIndex(null)} onClose={() => setIndex(null)} onClick={(event) => { if (event.target === event.currentTarget) setIndex(null); }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(-1); }
      if (event.key === "Tab") {
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      {current && <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-soft" role="status" aria-live="polite">צילום {(index ?? 0) + 1} מתוך {images.length}</p>
          <button type="button" autoFocus onClick={() => setIndex(null)} className="min-h-11 rounded-full border border-hairline px-5 font-semibold">סגירה ✕</button>
        </div>
        <div className="relative flex min-h-32 items-center justify-center rounded-xl bg-surface-alt">
          <Image src={current.src} alt={current.alt} width={current.width ?? 1200} height={current.height ?? 900} sizes="(max-width: 768px) 90vw, 1000px" className="h-auto max-h-[55svh] w-auto max-w-full object-contain" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => move(-1)} className="min-h-11 rounded-full border border-hairline px-4 text-sm font-semibold" aria-label="הצילום הקודם">→ הקודם</button>
          <button type="button" onClick={() => move(1)} className="min-h-11 rounded-full border border-hairline px-4 text-sm font-semibold" aria-label="הצילום הבא">הבא ←</button>
        </div>
        <h2 id={titleId} className="mt-5 text-2xl text-ink">{current.alt}</h2>
        <p dir="ltr" className="mt-2 break-all text-sm text-ink-soft">{reference(current)}</p>
        {prints && <p className="mt-3 text-base text-ink-soft">הדפסה בגדלים שונים. גודל, מסגור ומשלוח בתיאום עם איתן.</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`${whatsappUrl}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white">{prints ? "לבירור על רכישת הצילום" : "לשאלה על הצילום"} ב־WhatsApp</a>
          <a href={`mailto:${email}?subject=${encodeURIComponent(`פנייה לגבי צילום ${reference(current)}`)}&body=${encodeURIComponent(message)}`} className="inline-flex min-h-12 items-center rounded-full border border-brand-300 px-5 py-2 text-sm font-semibold text-brand-700">פנייה במייל</a>
        </div>
      </div>}
    </dialog>
  </>;
}
