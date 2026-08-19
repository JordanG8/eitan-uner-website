import Link from "next/link";
import type { ReactNode } from "react";
import type { Cta, CtaTone } from "@/lib/types";
import { Button as UiButton } from "./ui/button";
import { Separator } from "./ui/separator";

/**
 * Site-level composition over the shadcn primitives in ./ui.
 *
 * This file used to be `ui.tsx` and used to own the button's padding, its
 * hover states and its four tone strings inline. That namespace now belongs to
 * the copied MIT primitives, and the split is the point: ./ui knows how a
 * button behaves, this file knows what a CTA *is* in this site's content model.
 *
 * The prop contract is unchanged — `background="brand"` and `onBrand` still
 * exist, and content.ts is untouched — but what they mean has changed. "brand"
 * used to paint a flat turquoise slab across the viewport; neither bar has a
 * single flat colour block anywhere, so it now paints the near-black inverted
 * treatment instead. Same content, different design.
 */

/**
 * content.ts speaks in tones that were named for the old design, where
 * "…White" meant "this sits on a turquoise panel". Translating them here
 * rather than editing the frozen content is the same trick CtaRow already
 * used; it now happens in exactly one place instead of two.
 */
const toneToVariant: Record<CtaTone, "default" | "outline" | "inverse" | "inverseOutline"> = {
  solid: "default",
  outline: "outline",
  solidWhite: "inverse",
  outlineWhite: "inverseOutline",
};

export function Button({ cta }: { cta: Cta }) {
  const variant = toneToVariant[cta.tone ?? "solid"];
  const external = /^https?:\/\//.test(cta.href);

  /* asChild is why adopting shadcn's Button was worth it here: the site needs
     the same box on a next/link, an <a target=_blank> and (in the editor) a
     plain button, and the old version reimplemented the class string for each
     branch. Now there is one box and the caller chooses the element. */
  return (
    <UiButton asChild variant={variant}>
      {external ? (
        <a href={cta.href} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      ) : (
        <Link href={cta.href}>{cta.label}</Link>
      )}
    </UiButton>
  );
}

/**
 * The quiet tertiary action: a ruled label, not a box.
 *
 * Three places were hand-rolling this — the hero's secondary CTA, every card's
 * "read more", and the map's "open in Google Maps" — at three different sizes
 * (0.95rem, 0.9rem, 0.9rem), two different border opacities and two different
 * hover treatments. It is one component now.
 */
export function QuietLink({
  href,
  children,
  onDark = false,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  onDark?: boolean;
  external?: boolean;
  className?: string;
}) {
  /* `tap-hit` rather than padding: this treatment is a label with a hairline
     ruled tight under it, and padding the box to 44px moves the rule, not the
     text. See globals.css. Measured 91x31 and 109x31 at 375 before. */
  const cls =
    `tap-hit inline-block self-start border-b pb-0.5 text-body transition-colors ${
      onDark
        ? "border-paper/40 text-paper-soft hover:border-paper hover:text-paper"
        : "border-ink/25 text-ink-soft hover:border-ink hover:text-ink"
    } ${className}`;

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
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
   * Almost nothing sits on a dark ground now, and a white-on-paper button is
   * invisible. Rather than edit the frozen content, translate the tone to its
   * light-ground equivalent unless the caller really is on a dark section.
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
 * The `index` prop and the 01 / 02 / 03 numerals it rendered are gone. See
 * GAUNTLET.md round 7: they were added in round 3 for a documented reason and
 * the site owner has now rejected them outright.
 */
export function SectionHeading({
  children,
  align = "start",
  onBrand = false,
}: {
  children: ReactNode;
  align?: "start" | "center";
  onBrand?: boolean;
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-start"}>
      <h2 className={`text-section font-light ${onBrand ? "text-paper" : "text-ink"}`}>
        {children}
      </h2>
      <Separator className="mt-6" tone={onBrand ? "dark" : "paper"} />
    </div>
  );
}

/** Short rule under in-block headings. Hairline, not a 3px bar. */
export function Rule({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <Separator
      className={`mt-6 mb-7 w-16 ${onBrand ? "" : "bg-brand-500"}`}
      tone={onBrand ? "dark" : "paper"}
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

/**
 * A full-width band on the page's own ground.
 *
 * `.band` carries the vertical rhythm (see globals.css). It used to be spelled
 * `py-24 sm:py-32 lg:py-40` here and repeated verbatim in Gallery, Quote and
 * Contact — the same value in four files, which is four chances to drift.
 */
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

  return (
    <section id={id} className={`${bg} ${padded ? "band" : ""}`}>
      <div className="mx-auto max-w-(--container-content) px-6 lg:px-10">{children}</div>
    </section>
  );
}
