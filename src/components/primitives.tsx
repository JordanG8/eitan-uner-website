import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { ImageRef } from "@/lib/types";

/**
 * Elements Eitan can insert between paragraphs: image, buttons, spacer,
 * divider and embed. Text, headings, lists, columns and coloured panels are
 * native to the Lexical editor; these cover what text cannot. Every size and
 * colour here is a field in the editor.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const px = (v: unknown) => (v === "" || v === undefined || v === null || Number.isNaN(Number(v)) ? undefined : `${Number(v)}px`);

/* --------------------------------------------------------------- links */

/** Lets through site paths, anchors, web, mail, phone and WhatsApp links only. */
export function safeHref(href?: string): string | undefined {
  const h = (href ?? "").trim();
  if (!h) return undefined;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(h)) return h;
  if (/^[\p{L}\p{N}][^:]*$/u.test(h)) return `/${h}`;
  return undefined;
}

function SmartLink({ href, newTab, className, style, children }: { href: string; newTab?: boolean; className?: string; style?: CSSProperties; children: ReactNode }) {
  const external = /^(https?:|mailto:|tel:)/i.test(href);
  if (external || newTab) {
    return (
      <a href={href} className={className} style={style} {...(newTab || /^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={className} style={style}>{children}</Link>;
}

/* -------------------------------------------------------------- image */

export interface ImageBlockProps {
  image?: ImageRef;
  width?: number;
  maxWidth?: number;
  ratio?: "auto" | "1/1" | "4/3" | "3/4" | "3/2" | "16/9" | "21/9";
  fit?: "cover" | "contain";
  radius?: number;
  shadow?: boolean;
  border?: string;
  caption?: string;
  link?: string;
  align?: "start" | "center" | "end";
  grayscale?: boolean;
  hover?: boolean;
}

export function ImageBlock(p: ImageBlockProps) {
  if (!p.image?.src) {
    return <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-hairline text-sm text-ink-soft">בחרו תמונה</div>;
  }
  const ratio = p.ratio && p.ratio !== "auto" ? p.ratio : undefined;
  const w = p.image.width ?? 1600;
  const h = p.image.height ?? 1200;
  const frame: CSSProperties = {
    width: `${p.width ?? 100}%`,
    maxWidth: px(p.maxWidth),
    marginInlineStart: p.align === "center" || p.align === "end" ? "auto" : undefined,
    marginInlineEnd: p.align === "center" ? "auto" : undefined,
    borderRadius: `calc(${px(p.radius ?? 24)} * var(--radius-scale))`,
    border: p.border ? `1px solid ${p.border}` : undefined,
    aspectRatio: ratio,
  };
  const img = (
    <Image
      src={p.image.src}
      alt={p.image.alt ?? ""}
      width={w}
      height={h}
      sizes="(max-width: 768px) 100vw, 60vw"
      className={`h-auto w-full ${ratio ? "h-full" : ""} ${p.hover ? "transition-transform duration-700 group-hover:scale-[1.03]" : ""}`}
      style={{ objectFit: p.fit ?? "cover", filter: p.grayscale ? "grayscale(1)" : undefined, height: ratio ? "100%" : "auto" }}
    />
  );
  const href = safeHref(p.link);
  const body = (
    <div className={`group overflow-hidden ${p.shadow ? "photo-frame" : ""}`} style={frame}>
      {href ? <SmartLink href={href} className="block h-full">{img}</SmartLink> : img}
    </div>
  );
  return p.caption ? (
    <figure>
      {body}
      <figcaption className="mt-3 text-sm text-ink-soft" style={{ textAlign: p.align ?? "start" }}>{p.caption}</figcaption>
    </figure>
  ) : body;
}

/* ------------------------------------------------------------ buttons */

export interface ButtonItem {
  label: string;
  href: string;
  style?: "solid" | "outline" | "solidWhite" | "outlineWhite" | "link" | "custom";
  background?: string;
  color?: string;
  newTab?: boolean;
}

export interface ButtonsProps {
  buttons?: ButtonItem[];
  align?: "start" | "center" | "end";
  size?: "s" | "m" | "l";
  fullWidth?: boolean;
}

const BTN_TONE: Record<string, string> = {
  solid: "bg-brand-600 text-white border border-brand-600 shadow-[0_10px_25px_rgb(14_106_105_/_0.18)] hover:-translate-y-0.5 hover:bg-brand-800 hover:border-brand-800",
  outline: "bg-transparent text-brand-700 border border-brand-300 hover:-translate-y-0.5 hover:bg-brand-50 hover:border-brand-500",
  solidWhite: "bg-white text-brand-800 border border-white shadow-[0_10px_30px_rgb(0_0_0_/_0.12)] hover:-translate-y-0.5 hover:bg-brand-50",
  outlineWhite: "bg-white/5 text-white border border-white/45 hover:-translate-y-0.5 hover:bg-white/12 hover:border-white/80",
  link: "text-brand-700 underline underline-offset-4 hover:text-brand-900",
  custom: "border border-transparent hover:-translate-y-0.5 hover:brightness-110",
};
const BTN_SIZE = { s: "min-h-10 px-4 text-sm", m: "min-h-12 px-6 text-[15px]", l: "min-h-14 px-8 text-lg" };

export function Buttons(p: ButtonsProps) {
  const items = (p.buttons ?? []).filter((b) => b?.label);
  if (!items.length) return null;
  const justify = p.align === "center" ? "justify-center" : p.align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex flex-wrap gap-3 ${justify}`}>
      {items.map((b, i) => {
        const tone = b.style ?? "solid";
        const href = safeHref(b.href) ?? "#";
        const style: CSSProperties = tone === "custom" ? { background: b.background || undefined, color: b.color || undefined } : {};
        return (
          <SmartLink
            key={i}
            href={href}
            newTab={b.newTab}
            style={style}
            className={`inline-flex items-center justify-center font-semibold transition-all duration-300 ${tone === "link" ? "min-h-11" : `rounded-(--radius-button) py-2.5 ${BTN_SIZE[p.size ?? "m"]}`} ${BTN_TONE[tone]} ${p.fullWidth ? "w-full" : ""}`}
          >
            {b.label}
          </SmartLink>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- spacer */

export function Spacer({ height = 48, heightMobile }: { height?: number; heightMobile?: number }) {
  return (
    <div
      aria-hidden="true"
      className="h-(--sp-m) md:h-(--sp)"
      style={{ "--sp": `${height}px`, "--sp-m": `${heightMobile ?? Math.round(height * 0.6)}px` } as Vars}
    />
  );
}

/* ------------------------------------------------------------ divider */

export interface DividerProps {
  variant?: "line" | "dashed" | "dotted" | "rule" | "ornament";
  color?: string;
  thickness?: number;
  width?: number;
  align?: "start" | "center" | "end";
}

export function Divider(p: DividerProps) {
  const color = p.color || "var(--color-hairline)";
  const margin = p.align === "start" ? "0 auto 0 0" : p.align === "end" ? "0 0 0 auto" : "0 auto";
  if (p.variant === "rule" || p.variant === "ornament") {
    return (
      <div className={`flex items-center gap-2 ${p.align === "start" ? "justify-start" : p.align === "end" ? "justify-end" : "justify-center"}`} aria-hidden="true">
        <span className="h-px w-16" style={{ background: p.color || "var(--color-accent)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: p.color || "var(--color-accent)" }} />
        {p.variant === "ornament" && <span className="h-px w-16" style={{ background: p.color || "var(--color-accent)" }} />}
      </div>
    );
  }
  return (
    <hr
      style={{
        border: 0,
        borderTop: `${p.thickness ?? 1}px ${p.variant === "dashed" ? "dashed" : p.variant === "dotted" ? "dotted" : "solid"} ${color}`,
        width: `${p.width ?? 100}%`,
        margin,
      }}
    />
  );
}

/* -------------------------------------------------------------- embed */

export interface EmbedProps {
  url?: string;
  html?: string;
  title?: string;
  ratio?: "16/9" | "4/3" | "1/1" | "auto";
  height?: number;
  maxWidth?: number;
}

/** YouTube/Vimeo/Maps links become their embeddable form. */
export function embedSrc(url: string): string | null {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return /^https:\/\//i.test(u) ? u : null;
}

export function Embed(p: EmbedProps) {
  const frame: CSSProperties = {
    maxWidth: px(p.maxWidth),
    marginInline: "auto",
    width: "100%",
    aspectRatio: p.ratio && p.ratio !== "auto" ? p.ratio : undefined,
    height: !p.ratio || p.ratio === "auto" ? px(p.height ?? 450) : undefined,
  };
  if (p.html?.trim()) {
    // Authored by Eitan behind the editor login; rendered as-is so that
    // third-party widgets (booking forms, Instagram, maps) can be pasted in.
    return <div className="eu-embed overflow-hidden rounded-2xl" style={{ maxWidth: px(p.maxWidth), marginInline: "auto" }} dangerouslySetInnerHTML={{ __html: p.html }} />;
  }
  const src = p.url ? embedSrc(p.url) : null;
  if (!src) return <div className="rounded-2xl border border-dashed border-hairline p-8 text-center text-sm text-ink-soft">הדביקו קישור (YouTube, Vimeo, Google Maps…) או קוד הטמעה</div>;
  return (
    <div className="overflow-hidden rounded-2xl bg-black/5" style={frame}>
      <iframe src={src} title={p.title || "תוכן מוטמע"} className="h-full w-full" loading="lazy" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}
