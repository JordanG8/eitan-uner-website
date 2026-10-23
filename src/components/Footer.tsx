import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import type { FooterSettings, HeaderSettings } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer({ site, footer, header }: { site: SiteSettings; footer: FooterSettings; header: HeaderSettings }) {
  const links = site.nav.flatMap((n) => (n.children ? n.children : n.href === "#" ? [] : [n]));
  const all = [...new Map(links.map((item) => [item.href, item])).values()];

  return (
    <footer
      className="bg-brand-900 text-white"
      style={{
        ...(footer.background ? { background: footer.background } : {}),
        ...(footer.text ? { color: footer.text } : {}),
      }}
    >
      <div className="mx-auto max-w-(--container-content) px-5 py-14 lg:px-8 lg:py-18">
        <div className="flex flex-col items-center gap-5 border-b border-white/10 pb-10">
          <div className="rounded-2xl bg-white px-5 py-3">
            <Logo compact text={header.logoText} showMark={header.showLogoMark} image={header.logoImage?.src ? header.logoImage : undefined} height={header.logoHeight} />
          </div>
          {footer.tagline && (
            <p className={`max-w-xl text-center text-[15px] leading-relaxed ${footer.text ? "opacity-65" : "text-white/65"}`}>
              {footer.tagline}
            </p>
          )}
        </div>
        {(site.facebookUrl || site.instagramUrl) && (
          <div className="mt-8 flex justify-center gap-3">
            {site.instagramUrl && <a
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="אינסטגרם"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
              </svg>
            </a>}
            {site.facebookUrl && <a
              href={site.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="פייסבוק"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.6V13h2.7v8h3.2z" />
              </svg>
            </a>}
          </div>
        )}

        {footer.showNav && <nav aria-label="ניווט תחתון" className="mt-7">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px]">
            {all.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-opacity hover:opacity-70">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>}

        <div className={`mt-8 space-y-1 text-center text-[13px] ${footer.text ? "opacity-85" : "text-white/85"}`}>
          {footer.showContact && <p>
            <a href={`tel:${site.phone}`} className="hover:underline">
              {site.phoneDisplay}
            </a>
            <span aria-hidden="true"> · </span>
            <a href={`mailto:${site.email}`} className="hover:underline">
              {site.email}
            </a>
            <span aria-hidden="true"> · </span>
            {site.location}
          </p>}
          {footer.copyright && (
            <p>
              {/* Separate text nodes around the year and each " · ", exactly as
                  the original markup had them: Chrome shapes each node on its
                  own, so merging them shifts glyphs by a pixel. */}
              {footer.copyright.split("{year}").flatMap((part, i) => [
                ...(i > 0 ? [String(new Date().getFullYear())] : []),
                ...part.split(/( · )/).filter(Boolean),
              ])}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
