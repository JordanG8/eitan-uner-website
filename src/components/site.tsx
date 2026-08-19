import Link from "next/link";
import type { ReactNode } from "react";
import type { Cta, CtaTone } from "@/lib/types";

/**
 * Shared primitives, retuned against the bars (see GAUNTLET.md).
 *
 * The prop *contract* is unchanged — `background="brand"` and `onBrand` still
 * exist, and content.ts is untouched — but what they mean has changed. "brand"
 * used to paint a flat turquoise slab across the viewport; neither bar has a
 * single flat colour block anywhere, so it now paints the near-black inverted
 * treatment instead. Same content, different design.
 */

const toneClass: Record<CtaTone, string> = {
  // Squared, not pill. Both bars are entirely square-cornered; a rounded
  // button is the loudest single "template" signal on a page.
  solid:
    "bg-ink text-paper border border-ink hover:bg-brand-700 hover:border-brand-700",
  outline:
    "bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink hover:text-paper",
  solidWhite: "bg-paper text-ink border border-paper hover:bg-transparent hover:text-paper",
  outlineWhite:
    "bg-transparent text-paper border border-paper/40 hover:border-paper hover:bg-paper hover:text-ink",
};

export function Button({ cta }: { cta: Cta }) {
  const tone = cta.tone ?? "solid";
  const external = /^https?:\/\//.test(cta.href);
  const className =
    "inline-flex min-h-12 items-center justify-center px-8 py-3 text-[0.95rem] " +
    "font-normal tracking-wide transition-colors duration-200 " +
    toneClass[tone];

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
  onDark = false,
}: {
  ctas?: Cta[];
  align?: "start" | "center";
  onDark?: boolean;
}) {
  if (!ctas?.length) return null;

  /**
   * content.ts pins several CTAs to the "…White" tones, because in the old
   * design they sat on a flat turquoise panel. Almost nothing sits on a dark
   * ground now, and a white-on-paper button is invisible. Rather than edit the
   * frozen content, translate the tone to its light-ground equivalent unless
   * the caller really is on a dark section.
   */
  const resolve = (t: CtaTone | undefined): CtaTone => {
    const tone = t ?? "solid";
    if (onDark) return tone;
    if (tone === "solidWhite") return "solid";
    if (tone === "outlineWhite") return "outline";
    return tone;
  };
  return (
    <div
      className={`mt-10 flex flex-wrap gap-3 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      {ctas.map((c) => (
        <Button key={c.label + c.href} cta={{ ...c, tone: resolve(c.tone) }} />
      ))}
    </div>
  );
}

/**
 * Section heading.
 *
 * The old treatment centred a small bold title over a decorative rule-and-dot.
 * Both bars instead set the heading large and light, hard against the reading
 * edge, with a hairline running the full width beneath it — the heading marks
 * a boundary in the page rather than decorating a box.
 *
 * `index` renders the 01 / 02 / 03 marker Cine Casero uses to number its
 * sections. It is optional; unnumbered headings just omit the column.
 */
export function SectionHeading({
  children,
  align = "start",
  onBrand = false,
  index,
}: {
  children: ReactNode;
  align?: "start" | "center";
  onBrand?: boolean;
  index?: string;
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-start"}>
      <div
        className={`flex items-baseline gap-4 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        {index && (
          <span
            className={`index-num text-base ${onBrand ? "text-paper/40" : ""}`}
            aria-hidden="true"
          >
            {index}
          </span>
        )}
        <h2
          className={`text-section font-light ${onBrand ? "text-paper" : "text-ink"}`}
        >
          {children}
        </h2>
      </div>
      <div
        className={`mt-6 h-px w-full ${onBrand ? "bg-paper/20" : "bg-hairline"}`}
        aria-hidden="true"
      />
    </div>
  );
}

/** Short rule under in-block headings. Hairline, not a 3px bar. */
export function Rule({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <span
      className={`mt-6 mb-7 block h-px w-16 ${onBrand ? "bg-paper/30" : "bg-brand-500"}`}
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
          <strong key={i} className="font-semibold">
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
  // "brand" no longer means a turquoise fill — see the note at the top. It is
  // now a tonal shift on the same paper. Four inverted bands in one page read
  // as stripes; the single dark moment is the pull-quote.
  const bg =
    background === "brand" || background === "alt" ? "bg-paper-deep" : "bg-paper";

  // Both bars breathe far harder than the old 4rem. Dieste runs an 11,673px
  // document for a comparable amount of content; whitespace is the medium.
  return (
    <section id={id} className={`${bg} ${padded ? "py-24 sm:py-32 lg:py-40" : ""}`}>
      <div className="mx-auto max-w-(--container-content) px-6 lg:px-10">{children}</div>
    </section>
  );
}
