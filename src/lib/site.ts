import { site as seedSite } from "./content";
import type { ImageRef, NavItem, SiteSettings } from "./types";

/**
 * The site-wide design document.
 *
 * Everything that is not a page lives here: palette, typography, spacing,
 * header, footer, navigation and contact details. Eitan edits it at
 * /editor/site, where each top-level key below is one panel of fields.
 *
 * Every key has a default that reproduces the original hand-built design, and
 * a stored document is always merged over these defaults. That keeps old
 * saves valid when a new option is added later — it just appears at its
 * default.
 */

export interface ThemeColors {
  /** Main brand colour: buttons, links, logo. */
  primary: string;
  /** Deep brand colour: dark sections, menu, footer. */
  dark: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  background: string;
  surfaceAlt: string;
  hairline: string;
}

export interface Typography {
  bodyFont: string;
  headingFont: string;
  /** Percent of the browser default; scales every rem on the site. */
  baseSize: number;
  headingWeight: number;
  lineHeight: number;
  /** Letter spacing for headings, in thousandths of an em. */
  headingTracking: number;
}

export interface LayoutSettings {
  containerWidth: number;
  /** Percent; scales the vertical padding of every section. */
  sectionSpacing: number;
  /** Percent; scales the corner radius of cards, photos and panels. */
  radius: number;
  buttonShape: "pill" | "rounded" | "square";
}

export interface HeaderSettings {
  layout: "overlay" | "bar";
  sticky: boolean;
  background: string;
  text: string;
  logoText: string;
  showLogoMark: boolean;
  logoImage?: ImageRef;
  logoHeight: number;
  showCta: boolean;
  ctaLabel: string;
  ctaHref: string;
  menuKicker: string;
  menuTagline: string;
  menuContactLabel: string;
  menuImage?: ImageRef;
}

export interface FooterSettings {
  background: string;
  text: string;
  tagline: string;
  showNav: boolean;
  showContact: boolean;
  copyright: string;
}

export interface ContactSettings {
  siteName: string;
  tagline: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  location: string;
  hours: { text: string }[];
  whatsappUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  showWhatsappButton: boolean;
  whatsappButtonColor: string;
  seoDescription: string;
}

/** Editor list fields hold objects, so nav children are rows, not strings. */
export interface NavRow {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface SiteDoc {
  colors: ThemeColors;
  typography: Typography;
  layout: LayoutSettings;
  header: HeaderSettings;
  footer: FooterSettings;
  contact: ContactSettings;
  nav: NavRow[];
  customCss: string;
}

/* -------------------------------------------------------------- defaults */

export const DEFAULT_COLORS: ThemeColors = {
  primary: "#167f7d",
  dark: "#0b3436",
  accent: "#d99a58",
  accentSoft: "#f3dfc9",
  text: "#122a2b",
  textSoft: "#506364",
  background: "#fbfaf7",
  surfaceAlt: "#f1eee7",
  hairline: "#deddd7",
};

export function defaultSite(): SiteDoc {
  return {
    colors: { ...DEFAULT_COLORS },
    typography: {
      bodyFont: "Assistant",
      headingFont: "Assistant",
      baseSize: 100,
      headingWeight: 700,
      lineHeight: 1.75,
      headingTracking: -25,
    },
    layout: {
      containerWidth: 1240,
      sectionSpacing: 100,
      radius: 100,
      buttonShape: "pill",
    },
    header: {
      layout: "overlay",
      sticky: true,
      background: "",
      text: "",
      logoText: seedSite.siteName,
      showLogoMark: true,
      logoHeight: 36,
      showCta: true,
      ctaLabel: "בואו נדבר",
      ctaHref: seedSite.whatsappUrl,
      menuKicker: "סדנאות, צילום וקשר",
      menuTagline: "צילום · רגש · סיפור",
      menuContactLabel: "מתחילים שיחה",
      menuImage: { src: "/images/eitan-crouching.webp", alt: "איתן אונר מצלם בשטח", width: 498, height: 584 },
    },
    footer: {
      background: "",
      text: "",
      tagline: "צילום, התבוננות ושיחה שמאפשרים לסיפור לקבל מקום.",
      showNav: true,
      showContact: true,
      copyright: `זכויות יוצרים © {year} · ${seedSite.siteName}`,
    },
    contact: {
      siteName: seedSite.siteName,
      tagline: seedSite.tagline,
      phone: seedSite.phone,
      phoneDisplay: seedSite.phoneDisplay,
      email: seedSite.email,
      location: seedSite.location,
      hours: seedSite.hours.map((text) => ({ text })),
      whatsappUrl: seedSite.whatsappUrl,
      facebookUrl: seedSite.facebookUrl ?? "",
      instagramUrl: "",
      showWhatsappButton: true,
      whatsappButtonColor: "#1fae5b",
      seoDescription:
        "איתן אונר — צלם ופוטודוקותרפיסט. סדנאות פוטודוקותרפיה, פוטותרפיה, וידאותרפיה, " +
        "צילום חברתי, הרצאות ותיעוד. ריפוי והשראה דרך העדשה.",
    },
    nav: seedSite.nav.map((n) => ({
      label: n.label,
      href: n.href,
      children: n.children?.map((c) => ({ label: c.label, href: c.href })) ?? [],
    })),
    customCss: "",
  };
}

/** Stored values over defaults, one level deep, ignoring junk types. */
export function normalizeSite(stored: unknown): SiteDoc {
  const base = defaultSite();
  if (!stored || typeof stored !== "object") return base;
  const s = stored as Record<string, unknown>;
  const merge = <T extends object>(def: T, value: unknown): T => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return def;
    const out = { ...def } as Record<string, unknown>;
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined || v === null) continue;
      const d = (def as Record<string, unknown>)[k];
      if (d !== undefined && d !== null && typeof d !== "object" && typeof d !== typeof v) continue;
      out[k] = v;
    }
    return out as T;
  };
  return {
    colors: merge(base.colors, s.colors),
    typography: merge(base.typography, s.typography),
    layout: merge(base.layout, s.layout),
    header: merge(base.header, s.header),
    footer: merge(base.footer, s.footer),
    contact: merge(base.contact, s.contact),
    nav: Array.isArray(s.nav) ? (s.nav as NavRow[]) : base.nav,
    customCss: typeof s.customCss === "string" ? s.customCss : base.customCss,
  };
}

/* ------------------------------------------------------ derived shapes */

export function navItems(doc: SiteDoc): NavItem[] {
  return doc.nav
    .filter((n) => n?.label)
    .map((n) => {
      const children = (n.children ?? []).filter((c) => c?.label && c?.href);
      return children.length
        ? { label: n.label, href: n.href || "#", children }
        : { label: n.label, href: n.href || "#" };
    });
}

/** The flat settings shape the site's components were written against. */
export function siteSettings(doc: SiteDoc): SiteSettings {
  const c = doc.contact;
  return {
    siteName: c.siteName,
    tagline: c.tagline,
    phone: c.phone,
    phoneDisplay: c.phoneDisplay,
    email: c.email,
    location: c.location,
    hours: (c.hours ?? []).map((h) => h?.text).filter(Boolean),
    roles: [],
    facebookUrl: c.facebookUrl || undefined,
    instagramUrl: c.instagramUrl || undefined,
    whatsappUrl: c.whatsappUrl,
    nav: navItems(doc),
  };
}

export { FONTS, fontHref, fontStack } from "./fonts";
