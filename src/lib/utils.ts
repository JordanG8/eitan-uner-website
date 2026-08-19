import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The class merger every shadcn primitive imports.
 *
 * It matters here for one specific reason: this project restyles every
 * primitive it copies in, and merging is what makes a call-site class
 * actually win over the variant's default rather than landing in the same
 * class attribute and losing to source order. Without it, passing
 * `rounded-none` to a `rounded-md` variant is a coin flip.
 *
 * ---------------------------------------------------------------------------
 * Why this is `extendTailwindMerge` and not a bare `twMerge`.
 *
 * Bare `twMerge` shipped two buttons to production whose label rendered at
 * 1:1 contrast — ink text on an ink fill, invisible. The cause is not a
 * styling mistake anywhere in `button.tsx`; it is this file.
 *
 * tailwind-merge resolves conflicts by mapping a class to a group and letting
 * the last class in a group win. It knows `text-lg` is a font size and
 * `text-red-500` is a colour because it ships Tailwind's default scales. It
 * knows nothing about a theme's *custom* keys. So with this project's tokens
 * it sees `text-body` (a size) and `text-paper` (a colour), cannot tell them
 * apart, files both under "text", and deletes whichever comes first.
 *
 * In `buttonVariants` the colour lives on the variant and the size lives on
 * the size — and cva emits variant before size. Measured across all 24
 * variant x size pairs, twelve lost their colour class outright: every
 * variant combined with `default` or `sm`, the two sizes that carry a
 * `text-*` size token. `icon` and `none` escaped only because they carry no
 * `text-*` at all, and half the survivors looked correct purely because the
 * inherited colour happened to match the deleted one.
 *
 * Nothing catches this. Not tsc, not the linter, not the build — the class
 * simply is not in the emitted attribute. Registering the custom font-size
 * keys is what makes the two groups distinguishable, and it repairs every
 * combination at once.
 *
 * Any new `--text-*` token added to globals.css MUST be added here too, or it
 * silently starts eating colours again.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["micro", "body", "lede", "rise", "title", "section", "display"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
