import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";

export function Footer({ site }: { site: SiteSettings }) {
  const links = site.nav.flatMap((n) => (n.children ? n.children : n.href === "#" ? [] : [n]));
  const primary = site.nav.filter((n) => n.href !== "#");
  const all = [...primary, ...links];

  return (
    <footer className="bg-brand-900 text-white">
      <div className="mx-auto max-w-(--container-content) px-5 py-14 lg:px-8 lg:py-18">
        <div className="flex flex-col items-center gap-5 border-b border-white/10 pb-10">
          <div className="rounded-2xl bg-white px-5 py-3"><Logo compact /></div>
          <p className="max-w-xl text-center text-[15px] leading-relaxed text-white/65">
            צילום, התבוננות ושיחה שמאפשרים לסיפור לקבל מקום.
          </p>
        </div>
        {site.facebookUrl && (
          <div className="mt-8 flex justify-center">
            <a
              href={site.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="פייסבוק"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.6V13h2.7v8h3.2z" />
              </svg>
            </a>
          </div>
        )}

        <nav aria-label="ניווט תחתון" className="mt-7">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px]">
            {all.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-opacity hover:opacity-70">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 space-y-1 text-center text-[13px] text-white/85">
          <p>
            <a href={`tel:${site.phone}`} className="hover:underline">
              {site.phoneDisplay}
            </a>
            <span aria-hidden="true"> · </span>
            <a href={`mailto:${site.email}`} className="hover:underline">
              {site.email}
            </a>
            <span aria-hidden="true"> · </span>
            {site.location}
          </p>
          <p>
            זכויות יוצרים © {new Date().getFullYear()} · {site.siteName}
          </p>
        </div>
      </div>
    </footer>
  );
}
