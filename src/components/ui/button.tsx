import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button — copied MIT source, retuned to this design system.
 *
 * What was changed from the registry default, and why:
 *
 *  - `rounded-md` → nothing. The radius scale is zeroed in globals.css, so
 *    the class survives and computes to 0. Square is a documented law here.
 *  - `shadow-xs` on the outline variant → nothing. No shadows on this page.
 *  - the three-token focus ring (`focus-visible:ring-[3px] ring-ring/50`) →
 *    nothing. globals.css already defines one `:focus-visible` outline for
 *    the whole site; two focus treatments is worse than either alone.
 *  - `transition-all` → `transition-colors`. A blanket transition on a button
 *    that also happens to be a grid child animates layout.
 *  - the size scale (h-9 / h-8 / h-10) → the site's own. These are the only
 *    buttons on the page and they are editorial CTAs, not app chrome:
 *    min-h-12 so the tap target clears 48px, and body size, on the ramp.
 *  - variants: the registry's default/secondary/destructive palette is
 *    replaced by the four tones content.ts actually asks for, plus the pair
 *    of them inverted for the two dark bands. `default`, `outline`, `ghost`
 *    and `link` keep their upstream names so a primitive added later that
 *    expects them still renders.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-normal whitespace-nowrap " +
    "transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-ink bg-ink text-paper hover:border-brand-700 hover:bg-brand-700",
        outline:
          "border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
        /* On the two near-black bands: the fill and the outline, inverted. */
        inverse:
          "border border-paper bg-paper text-ink hover:bg-transparent hover:text-paper",
        inverseOutline:
          "border border-paper/40 bg-transparent text-paper hover:border-paper hover:bg-paper hover:text-ink",
        ghost: "border border-transparent bg-transparent text-ink hover:bg-paper-deep",
        /* The quiet tertiary: a ruled link, which is how the hero's secondary
           action and every card's "read more" already read. Having it here
           means those three places stop each hand-rolling a border-b. */
        link: "border-b border-ink/25 px-0 text-ink-soft hover:border-ink hover:text-ink",
      },
      size: {
        default: "min-h-12 px-8 py-3 text-body",
        sm: "min-h-10 px-5 py-2 text-micro",
        /* `link` carries no box, so it carries no box padding either. */
        none: "px-0 py-0",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
