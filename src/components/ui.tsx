import Link from "next/link";
import type { ReactNode } from "react";
import type { Cta, CtaTone } from "@/lib/types";

const toneClass: Record<CtaTone, string> = {
  solid:
    "bg-brand-500 text-white border border-brand-500 hover:bg-brand-700 hover:border-brand-700",
  outline:
    "bg-transparent text-brand-600 border border-brand-400 hover:bg-brand-50 hover:border-brand-500",
  solidWhite:
    "bg-white text-brand-700 border border-white hover:bg-brand-50",
  outlineWhite:
    "bg-transparent text-white border border-white/80 hover:bg-white/12",
};

export function Button({ cta }: { cta: Cta }) {
  const tone = cta.tone ?? "solid";
  const external = /^https?:\/\//.test(cta.href);
  const className = `inline-flex min-h-11 items-center justify-center px-6 py-2.5 text-[15px] font-medium transition-colors ${toneClass[tone]}`;

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
        className={`text-3xl font-normal sm:text-4xl ${
          onBrand ? "text-white" : "text-ink"
        }`}
      >
        {children}
      </h2>
      <div
        className={`mt-4 flex items-center gap-2 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <span
          className={`h-px w-24 ${onBrand ? "bg-white/50" : "bg-brand-300"}`}
          aria-hidden="true"
        />
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            onBrand ? "bg-white" : "bg-brand-500"
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
      className={`mt-5 mb-6 block h-[3px] w-20 ${
        onBrand ? "bg-white" : "bg-brand-500"
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
      ? "bg-brand-500 text-white"
      : background === "alt"
        ? "bg-surface-alt"
        : "bg-white";
  return (
    <section id={id} className={`${bg} ${padded ? "py-16 sm:py-20" : ""}`}>
      <div className="mx-auto max-w-(--container-content) px-4 lg:px-6">{children}</div>
    </section>
  );
}
