"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import type { NavItem, SiteSettings } from "@/lib/types";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Desktop "עוד" dropdown. Opens on hover and on click, closes on Escape. */
function MoreMenu({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const childActive = item.children?.some((c) => isActive(pathname, c.href));

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-semibold transition-colors ${
          childActive ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-brand-50 hover:text-brand-700"
        }`}
      >
        {item.label}
        <svg
          viewBox="0 0 20 20"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 7l5 6 5-6z" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 top-[calc(100%+0.75rem)] z-50 min-w-[16rem] overflow-hidden rounded-2xl border border-hairline bg-surface/95 p-2 shadow-[0_22px_55px_rgb(18_42_43_/_0.16)] backdrop-blur-xl">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-2.5 text-[15px] transition-colors hover:bg-brand-50 ${
                isActive(pathname, child.href)
                  ? "text-brand-600 font-semibold"
                  : "text-ink"
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({ site }: { site: SiteSettings }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const flat: NavItem[] = site.nav.flatMap((n) =>
    n.children ? [{ label: n.label, href: n.href }, ...n.children] : [n]
  );

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/80 bg-surface/90 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex min-h-[5.25rem] max-w-(--container-content) items-center justify-between gap-4 px-5 lg:px-8">
        {/* Primary nav (desktop) — right side in RTL */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="ניווט ראשי">
          {site.nav.map((item) =>
            item.children ? (
              <MoreMenu key={item.label} item={item} pathname={pathname} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                  isActive(pathname, item.href)
                    ? "bg-brand-800 text-white"
                    : "text-ink hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Logo — centred on desktop, leading on mobile */}
        <Link
          href="/"
          className="order-first shrink-0 lg:order-none lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          aria-label="לדף הבית"
        >
          <Logo />
        </Link>

        {/* Contact shortcuts (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${site.phone}`}
            aria-label={`התקשרו ל${site.phoneDisplay}`}
            className="flex min-h-11 items-center gap-2 rounded-full bg-brand-800 px-4 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgb(11_52_54_/_0.16)] transition-all hover:-translate-y-0.5 hover:bg-brand-900"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.3z" />
            </svg>
            <span>דברו איתי</span>
          </a>
          <a
            href={`mailto:${site.email}`}
            aria-label={`שלחו מייל ל${site.email}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5v2.2z" />
            </svg>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "סגירת התפריט" : "פתיחת התפריט"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-brand-800 lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="ניווט ראשי"
          className="max-h-[calc(100vh-5.25rem)] overflow-y-auto border-t border-hairline bg-surface px-3 py-3 lg:hidden"
        >
          {flat
            .filter((i) => i.href !== "#")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-4 py-3 text-[16px] font-semibold ${
                  isActive(pathname, item.href)
                    ? "bg-brand-800 text-white"
                    : "text-ink hover:bg-brand-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-brand-50 px-5 py-4 text-[15px]">
            <a href={`tel:${site.phone}`} className="text-brand-600">
              {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="text-brand-600">
              {site.email}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
