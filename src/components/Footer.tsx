import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

/**
 * Footer.
 *
 * Was a flat turquoise slab with everything centred. Now a near-black
 * colophon with the navigation set as columns and the contact details ranged
 * to the reading edge — the shape both bars end their pages on.
 */
export function Footer({ site }: { site: SiteSettings }) {
  const links = site.nav.flatMap((n) =>
    n.children ? n.children : n.href === "#" ? [] : [n]
  );
  const primary = site.nav.filter((n) => n.href !== "#");
  const all = [...primary, ...links];

  return (
    <footer className="bg-void text-paper">
      <div className="mx-auto max-w-(--container-content) px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="text-section font-light leading-tight text-paper">
              {site.siteName}
            </p>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-paper/55">
              {site.tagline}
            </p>

            {site.facebookUrl && (
              <a
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="פייסבוק"
                className="mt-8 inline-flex items-center gap-2 border-b border-paper/30 pb-1 text-[0.9rem] text-paper/70 transition-colors hover:border-paper hover:text-paper"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.6V13h2.7v8h3.2z" />
                </svg>
                פייסבוק
              </a>
            )}
          </div>

          <nav aria-label="ניווט תחתון" className="lg:col-span-4">
            <p className="mb-6 text-[0.75rem] tracking-[0.16em] text-paper/40">ניווט</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[0.9rem]">
              {all.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-paper/70 transition-colors hover:text-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="mb-6 text-[0.75rem] tracking-[0.16em] text-paper/40">צרו קשר</p>
            <ul className="space-y-2.5 text-[0.9rem]">
              <li>
                <a
                  href={`tel:${site.phone}`}
                  className="text-paper/70 transition-colors hover:text-paper"
                >
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="break-all text-paper/70 transition-colors hover:text-paper"
                >
                  {site.email}
                </a>
              </li>
              <li className="text-paper/70">{site.location}</li>
            </ul>
          </div>
        </div>

        <p className="mt-20 border-t border-paper/12 pt-8 text-[0.8rem] text-paper/40">
          זכויות יוצרים © {new Date().getFullYear()} כל הזכויות שמורות — {site.siteName}
        </p>
      </div>
    </footer>
  );
}
