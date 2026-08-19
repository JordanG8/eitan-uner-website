"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Separator — copied MIT source, retuned.
 *
 * The page draws a lot of hairlines: under every section heading, above every
 * card title, between the contact rows, above the footer credit. They were
 * seven different `<div className="h-px bg-…" aria-hidden>` literals at four
 * different opacities (bg-hairline, paper/20, paper/12, ink/25). One component
 * with one `tone` prop is the whole reason to adopt this primitive — Radix's
 * `decorative` handling (role="none" instead of a bogus role="separator") is
 * a bonus, not the point.
 *
 * `--color-border` is bridged to `--color-hairline` in globals.css, so the
 * default here is already the site's paper hairline.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  tone = "paper",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  /** Which ground the rule is drawn on — not which colour it is. */
  tone?: "paper" | "dark";
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        tone === "dark" ? "bg-paper/20" : "bg-hairline",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
