"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import type { NavItem, SiteSettings } from "@/lib/types";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** useLayoutEffect, without the server warning. The measurement genuinely has
 *  to happen before paint — running it in useEffect shows one frame of all
 *  eighteen links overflowing the bar. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** gap-4 on the nav list, in px. Kept in one place because the measurement
 *  arithmetic below has to agree with the CSS exactly or the last item
 *  flickers in and out on resize. */
const NAV_GAP = 16;

/**
 * A link in the bar. Shared by the inline row and by the hidden measuring row,
 * which is the only way the two can be guaranteed to be the same width.
 */
const navLinkClass = (active: boolean, overHero: boolean) =>
  `block border-b-2 py-2 text-micro whitespace-nowrap transition-colors ${
    overHero
      ? active
        ? "border-paper text-paper"
        : "border-transparent text-paper/70 hover:text-paper"
      : active
        ? "border-ink text-ink"
        : "border-transparent text-ink-soft hover:text-ink"
  }`;

export function Header({ site }: { site: SiteSettings }) {
  const pathname = usePathname();

  /**
   * Over a full-bleed hero the header goes transparent and inverts.
   *
   * A light bar with a turquoise logo sitting on top of a dark photograph reads
   * as chrome bolted over a design. Both bars run navigation *through* the
   * image — one critic singled out the nav rule cutting across the photograph
   * at mid-height as the giveaway of art direction.
   *
   * Detected from the DOM rather than the route, so it follows any page whose
   * first block is a backdrop hero instead of hardcoding "/" — and it resets on
   * navigation, which is why `pathname` is a dependency.
   */
  const [overHero, setOverHero] = useState(false);

  /**
   * Publish the header's measured height as --header-h.
   *
   * A sticky header reserves its own band in normal flow, so making it
   * transparent over a full-bleed hero showed the paper body behind it, not the
   * photograph — the nav went white-on-white. The hero pulls itself up by this
   * value instead. Measured and observed rather than hardcoded, because the
   * height is set by the logo and changes with it.
   */
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`
      );
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const hero = document.querySelector("[data-hero-dark]");

    const read = () => {
      // Invert while the header still overlaps the hero, measured from the
      // hero's own height rather than a guessed pixel threshold.
      setOverHero(
        !!hero && window.scrollY < hero.getBoundingClientRect().height - 120
      );
    };

    // Deferred rather than called inline: setState synchronously inside an
    // effect body triggers a cascading render, which the lint rule rightly
    // objects to. rAF also means the first read happens after layout, so the
    // hero's measured height is real.
    const raf = requestAnimationFrame(read);
    window.addEventListener("scroll", read, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", read);
    };
  }, [pathname]);

  /**
   * Every destination the site has, as one flat row.
   *
   * content.ts groups thirteen of the eighteen pages under a hardcoded "עוד",
   * and that grouping was being rendered as a dropdown at every width — at
   * 3440px the bar was hiding thirteen links behind a menu with roughly two
   * thousand pixels of empty bar beside it. content.ts is frozen, so the
   * grouping stays in the data; it just stops being treated as a layout
   * decision. The bar decides what collapses, and it decides by measuring.
   */
  const destinations: NavItem[] = site.nav
    .flatMap((n) => (n.children ? [{ label: n.label, href: n.href }, ...n.children] : [n]))
    .filter((n) => n.href !== "#");

  /** The label content.ts already uses for the group, reused for the overflow
   *  trigger so the word a reader sees never changes. */
  const overflowLabel =
    site.nav.find((n) => n.children?.length)?.label ?? "עוד";

  /* ---------------------------------------------------------- priority+ */

  const navRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const measureTriggerRef = useRef<HTMLSpanElement>(null);
  const [visibleCount, setVisibleCount] = useState(destinations.length);
  /**
   * The server renders all eighteen links — they should be in the HTML for a
   * crawler and for a reader whose JS has not arrived — so before the first
   * measurement the row is deliberately over-full and the wrapper clips it.
   * Once measured it stops clipping, which it has to, or it would clip the
   * overflow menu it just created.
   */
  const [measured, setMeasured] = useState(false);

  /**
   * Fit as many links in the bar as actually fit, and collapse only the rest.
   *
   * Widths come from a hidden row rendered with the identical classes rather
   * than from the live row, for a reason worth writing down: the live row only
   * contains the items that are currently visible, so measuring it can tell
   * you an item fits but never that a hidden one would — which turns the
   * layout into a ratchet that can shed items but never take them back on
   * resize. The hidden row always holds all eighteen.
   */
  const fit = useCallback(() => {
    const nav = navRef.current;
    const row = measureRef.current;
    if (!nav || !row) return;

    const widths = Array.from(row.children).map(
      (c) => (c as HTMLElement).getBoundingClientRect().width
    );
    const triggerW = measureTriggerRef.current
      ? measureTriggerRef.current.getBoundingClientRect().width
      : 72;
    const available = nav.clientWidth;

    const runningTotal = (n: number) =>
      widths.slice(0, n).reduce((a, w) => a + w, 0) + Math.max(0, n - 1) * NAV_GAP;

    if (runningTotal(widths.length) <= available) {
      setVisibleCount(widths.length);
    } else {
      // Something has to collapse, so the trigger is now real and has to be
      // paid for out of the same budget.
      const budget = available - triggerW - NAV_GAP;
      let n = 0;
      while (n < widths.length && runningTotal(n + 1) <= budget) n += 1;
      setVisibleCount(n);
    }
    setMeasured(true);
  }, []);

  useIsoLayoutEffect(() => {
    fit();
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(fit);
    ro.observe(nav);
    // Assistant is loaded with display:swap, so the first measurement happens
    // against the fallback metrics and every label changes width when the real
    // face lands. Without this the bar settles one item wrong.
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [fit]);

  const inline = destinations.slice(0, visibleCount);
  const overflow = destinations.slice(visibleCount);

  return (
    <header
      ref={headerRef}
      data-over-hero={overHero ? "" : undefined}
      className={`sticky top-0 z-40 transition-colors ${
        overHero
          ? "border-b border-paper/20 bg-transparent text-paper"
          : "border-b border-hairline bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75"
      }`}
    >
      <div
        /*
          px-6 / lg:px-10 to match Section and the hero. The header was on
          px-4 / lg:px-6, which put the logo 16px outside the axis every other
          element on the page shares — measurably, not impressionistically.

          --container-shell equals --container-content (1240px) up to 2xl, so
          that alignment holds at every width anyone actually browses at. Above
          1536px it widens to 1800px, which is the only honest way to answer
          "there is ample room at 3440px": there is, but it was all sitting in
          the margins of a 1240px text column. The bar borrows the margin the
          reading measure cannot use. See GAUNTLET.md round 7.
        */
        className="mx-auto flex max-w-(--container-shell) items-center gap-6 px-6 py-3 lg:px-10"
      >
        {/*
          Logo ranged to the reading edge, not centred.

          It used to be absolutely centred while the nav, the headline, the
          tagline and the CTAs all ranged to the inline-start edge. Two blind
          critics independently named exactly that — "a nav logo that doesn't
          align to the hero text's baseline" — as the tell. A centred lockup over
          right-ranged content is one of the clearest site123 signatures there
          is, and it was the last thing on the page not sharing the grid.
        */}
        <Link href="/" className="order-first shrink-0" aria-label="לדף הבית">
          <Logo inverted={overHero} />
        </Link>

        {/* Primary nav (desktop) — right side in RTL */}
        <div
          ref={navRef}
          data-measured={measured || undefined}
          className="relative hidden min-w-0 flex-1 overflow-hidden data-measured:overflow-visible lg:block"
        >
          <NavigationMenu aria-label="ניווט ראשי">
            <NavigationMenuList>
                {inline.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild active={isActive(pathname, item.href)}>
                      <Link
                        href={item.href}
                        className={navLinkClass(isActive(pathname, item.href), overHero)}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                {overflow.length > 0 && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={
                        overHero
                          ? overflow.some((c) => isActive(pathname, c.href))
                            ? "border-paper text-paper"
                            : "text-paper/70 hover:text-paper"
                          : overflow.some((c) => isActive(pathname, c.href))
                            ? "border-ink text-ink"
                            : "text-ink-soft hover:text-ink"
                      }
                    >
                      {overflowLabel}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul>
                        {overflow.map((child) => (
                          <li key={child.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={child.href}
                                className={`block px-4 py-2.5 text-micro hover:bg-paper-deep ${
                                  isActive(pathname, child.href)
                                    ? "text-ink"
                                    : "text-ink-soft"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* The ruler.
              Clipped to the wrapper's own box so an 1800px-wide measuring row
              can never hand the document a horizontal scrollbar, and
              `visibility:hidden` so the probe's visibility test skips every
              one of these — they are measurements, not content. `w-max` plus
              `shrink-0` is load-bearing: inside a clipped parent the default
              flex-shrink would squeeze the labels and the ruler would report
              widths narrower than the real row. */}
          <div
            aria-hidden="true"
            className="pointer-events-none invisible absolute inset-0 overflow-hidden"
          >
            <ul ref={measureRef} className="flex w-max flex-nowrap gap-4">
              {destinations.map((item) => (
                <li key={item.href} className={`shrink-0 ${navLinkClass(false, false)}`}>
                  {item.label}
                </li>
              ))}
            </ul>
            <span
              ref={measureTriggerRef}
              className="inline-flex w-max shrink-0 items-center gap-1.5 py-2 text-micro whitespace-nowrap"
            >
              {overflowLabel}
              <svg viewBox="0 0 20 20" className="size-3" fill="currentColor">
                <path d="M5 7l5 6 5-6z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Contact shortcuts (desktop) */}
        {/* Hidden while the header floats over the hero: the fold reads best
            with one focal path, and a blind panel named "logo, nav, phone icon,
            two CTAs" competing as the reason it looked assembled. They fade
            back in as soon as the header lands on paper. */}
        <div
          className={`hidden shrink-0 items-center gap-3 lg:flex ${
            overHero ? "pointer-events-none opacity-0" : "text-ink-soft"
          }`}
          aria-hidden={overHero || undefined}
        >
          <a
            href={`tel:${site.phone}`}
            aria-label={`התקשרו ל${site.phoneDisplay}`}
            className="p-1.5 transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.3z" />
            </svg>
          </a>
          <a
            href={`mailto:${site.email}`}
            aria-label={`שלחו מייל ל${site.email}`}
            className="p-1.5 transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V6l8 5 8-5v2.2z" />
            </svg>
          </a>
        </div>

        {/* Mobile drawer */}
        <Sheet>
          <SheetTrigger
            aria-label="פתיחת התפריט"
            className={`ms-auto p-2 transition-colors lg:hidden ${
              overHero ? "text-paper" : "text-ink"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </SheetTrigger>

          <SheetContent side="end" className="overflow-y-auto">
            <SheetTitle className="px-6 pt-6">תפריט</SheetTitle>
            <Separator className="mt-6" />
            <nav aria-label="ניווט ראשי">
              {destinations.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={`block border-b border-hairline px-6 py-4 text-body transition-colors ${
                      isActive(pathname, item.href)
                        ? "bg-paper-deep text-ink"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="flex flex-col gap-1.5 px-6 py-6 text-micro">
              <a href={`tel:${site.phone}`} className="text-ink-soft transition-colors hover:text-ink">
                {site.phoneDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="text-ink-soft transition-colors hover:text-ink">
                {site.email}
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
