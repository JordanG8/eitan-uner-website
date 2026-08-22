"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import type { SiteSettings } from "@/lib/types";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-7" aria-hidden="true">
      <span
        className={`absolute start-0 top-0.5 h-0.5 w-7 rounded-full bg-current transition-transform duration-500 ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute start-0 top-[9px] h-0.5 rounded-full bg-current transition-all duration-300 ${
          open ? "w-0 opacity-0" : "w-5 opacity-100"
        }`}
      />
      <span
        className={`absolute start-0 top-[17px] h-0.5 w-7 rounded-full bg-current transition-transform duration-500 ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function Header({ site }: { site: SiteSettings }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const primary = site.nav.filter((item) => item.href !== "#" && !item.children);
  const secondary = site.nav.flatMap((item) => item.children ?? []);

  const closeMenu = (restoreFocus = true) => {
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (!menuOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !overlayRef.current) return;

      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline/80 bg-surface/92">
        <div className="relative mx-auto flex min-h-[5.5rem] max-w-(--container-content) items-center justify-between gap-4 px-5 lg:min-h-[6rem] lg:px-8">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label="פתיחת התפריט"
            className="group flex min-h-13 items-center gap-3 rounded-full bg-brand-900 px-4 text-white shadow-[0_10px_30px_rgb(11_52_54_/_0.18)] transition-all hover:-translate-y-0.5 hover:bg-brand-800 sm:px-5"
          >
            <MenuGlyph open={false} />
            <span className="hidden text-[15px] font-bold sm:inline">תפריט</span>
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2"
            aria-label="לדף הבית"
          >
            <Logo />
          </Link>

          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-12 items-center gap-2 rounded-full border border-brand-200 bg-white px-5 text-[14px] font-bold text-brand-800 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 sm:flex"
          >
            <span>בואו נדבר</span>
            <svg viewBox="0 0 20 20" className="h-4 w-4 rotate-180" fill="currentColor" aria-hidden="true">
              <path d="M7 4l6 6-6 6z" />
            </svg>
          </a>
        </div>
      </header>

      <div
        ref={overlayRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="תפריט האתר"
        aria-hidden={!menuOpen}
        data-open={menuOpen ? "true" : "false"}
        className="menu-overlay fixed inset-0 z-[100] bg-brand-900 text-white"
      >
        <div className="flex h-full flex-col">
          <div className="mx-auto flex min-h-[5.5rem] w-full max-w-[1600px] items-center justify-between border-b border-white/10 px-5 lg:min-h-[6.5rem] lg:px-10">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => closeMenu()}
              aria-label="סגירת התפריט"
              className="group flex min-h-13 items-center gap-3 rounded-full bg-white px-4 text-brand-900 transition-transform hover:scale-[1.03] sm:px-5"
            >
              <MenuGlyph open />
              <span className="hidden text-[15px] font-bold sm:inline">סגירה</span>
            </button>

            <Link href="/" onClick={() => closeMenu(false)} aria-label="לדף הבית" className="rounded-xl bg-white px-4 py-2">
              <Logo compact />
            </Link>

            <p className="hidden text-[13px] font-bold tracking-[0.12em] text-white/45 sm:block">
              צילום · רגש · סיפור
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto grid min-h-full max-w-[1600px] lg:grid-cols-[1.12fr_.88fr]">
              <nav aria-label="ניווט ראשי" className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 lg:py-12 xl:px-20">
                <p className="mb-5 text-[12px] font-bold tracking-[0.16em] text-accent-soft/70">עמודים ראשיים</p>
                <ol>
                  {primary.map((item, index) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => closeMenu(false)}
                        aria-current={isActive(pathname, item.href) ? "page" : undefined}
                        className={`menu-primary-link group grid grid-cols-[2.3rem_1fr_auto] items-center gap-3 border-b border-white/12 py-3 sm:grid-cols-[3rem_1fr_auto] sm:py-4 ${
                          isActive(pathname, item.href) ? "is-active" : ""
                        }`}
                      >
                        <span className="text-[11px] font-bold tabular-nums text-accent-soft/50">0{index + 1}</span>
                        <span className="text-[clamp(2rem,4.4vw,4.75rem)] font-bold leading-none tracking-[-0.045em] transition-transform duration-500 group-hover:-translate-x-2">
                          {item.label}
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-brand-900 sm:h-12 sm:w-12">
                          <svg viewBox="0 0 20 20" className="h-4 w-4 rotate-180" fill="currentColor" aria-hidden="true">
                            <path d="M7 4l6 6-6 6z" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>

              <aside className="menu-side relative overflow-hidden border-t border-white/10 bg-[#082a2c] px-5 py-10 sm:px-10 lg:border-t-0 lg:border-r lg:px-12 lg:py-12">
                <Image
                  src="/images/eitan-crouching.webp"
                  alt="איתן אונר מצלם בשטח"
                  fill
                  sizes="(max-width: 1024px) 0px, 44vw"
                  className="menu-side-image object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,42,44,.84)_0%,rgba(8,42,44,.95)_58%,#082a2c_100%)]" aria-hidden="true" />

                <div className="relative flex min-h-full flex-col">
                  <p className="text-[12px] font-bold tracking-[0.16em] text-accent-soft/70">גלו עוד</p>
                  <nav aria-label="עמודים נוספים" className="mt-6">
                    <ul className="grid grid-cols-1 gap-x-7 sm:grid-cols-2">
                      {secondary.map((item) => (
                        <li key={item.href} className="border-b border-white/10">
                          <Link
                            href={item.href}
                            onClick={() => closeMenu(false)}
                            aria-current={isActive(pathname, item.href) ? "page" : undefined}
                            className={`group flex items-center justify-between gap-3 py-3 text-[15px] font-semibold transition-colors hover:text-accent-soft ${
                              isActive(pathname, item.href) ? "text-accent-soft" : "text-white/75"
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">←</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div className="mt-auto pt-10">
                    <p className="text-[12px] font-bold tracking-[0.16em] text-white/35">מתחילים שיחה</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={site.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-accent px-5 py-2.5 text-[14px] font-bold text-brand-900 transition-transform hover:-translate-y-0.5"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${site.phone}`}
                        className="rounded-full border border-white/20 px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-white/10"
                      >
                        {site.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
