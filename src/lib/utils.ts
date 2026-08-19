import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The class merger every shadcn primitive imports.
 *
 * It matters here for one specific reason: this project restyles every
 * primitive it copies in, and `twMerge` is what makes a call-site class
 * actually win over the variant's default rather than landing in the same
 * class attribute and losing to source order. Without it, passing
 * `rounded-none` to a `rounded-md` variant is a coin flip.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
