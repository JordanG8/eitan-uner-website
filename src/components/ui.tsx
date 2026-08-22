import Link from "next/link";
import type { ReactNode } from "react";
import type { Cta, CtaTone } from "@/lib/types";

const toneClass: Record<CtaTone, string> = {
  solid:
    "bg-brand-600 text-white border border-brand-600 shadow-[0_10px_25px_rgb(14_106_105_/_0.18)] hover:-translate-y-0.5 hover:bg-brand-800 hover:border-brand-800",
  outline:
    "bg-transparent text-brand-700 border border-brand-300 hover:-translate-y-0.5 hover:bg-brand-50 hover:border-brand-500",
  solidWhite:
    "bg-white text-brand-800 border border-white shadow-[0_10px_30px_rgb(0_0_0_/_0.12)] hover:-translate-y-0.5 hover:bg-brand-50",
  outlineWhite:
    "bg-white/5 text-white border border-white/45 backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/12 hover:border-white/80",
};

export function Button({ cta }: { cta: Cta }) {
  const tone = cta.tone ?? "solid";
  const external = /^https?:\/\//.test(cta.href);
  const className = `inline-flex min-h-12 items-center justify-center rounded-full px-6 py-2.5 text-[15px] font-semibold transition-all duration-300 ${toneClass[tone]}`;

  if (external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}

export function CtaRow({
  ctas,
  align = "start",
}: {
  ctas?: Cta[];
  align?: "start" | "center";
}) {
  if (!ctas?.length) return null;
  return (
    <div
      className={`mt-7 flex flex-wrap gap-3 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      {ctas.map((c) => (
        <Button key={c.label + c.href} cta={c} />
      ))}
    </div>
  );
}

/**
 * The section heading treatment from the original: title, then a short rule
 * with a single dot offset to its side.
 */
export function SectionHeading({
  children,
  align = "center",
  onBrand = false,
}: {
  children: ReactNode;
  align?: "start" | "center";
  onBrand?: boolean;
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-start"}>
      <h2
        className={`text-3xl font-bold sm:text-[2.65rem] ${
          onBrand ? "text-white" : "text-ink"
        }`}
      >
        {children}
      </h2>
      <div
        className={`mt-5 flex items-center gap-2 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <span
          className={`h-px w-16 ${onBrand ? "bg-white/50" : "bg-accent"}`}
          aria-hidden="true"
        />
        <span
          className={`h-2 w-2 rounded-full ${
            onBrand ? "bg-accent-soft" : "bg-accent"
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/** Short rule used under headings inside text/image blocks. */
export function Rule({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <span
      className={`mt-5 mb-7 block h-0.5 w-14 ${
        onBrand ? "bg-accent-soft" : "bg-accent"
      }`}
      aria-hidden="true"
    />
  );
}

/**
 * Renders **bold** runs inside otherwise plain paragraph text, so the seed
 * content can stay as readable strings instead of nested arrays.
 */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function Section({
  children,
  background = "white",
  padded = true,
  id,
}: {
  children: ReactNode;
  background?: "white" | "alt" | "brand";
  padded?: boolean;
  id?: string;
}) {
  const bg =
    background === "brand"
      ? "bg-brand-900 text-white"
      : background === "alt"
        ? "bg-surface-alt"
        : "bg-surface";
  return (
    <section id={id} className={`${bg} ${padded ? "py-20 sm:py-28" : ""}`}>
      <div className="mx-auto max-w-(--container-content) px-5 lg:px-8">{children}</div>
    </section>
  );
}
