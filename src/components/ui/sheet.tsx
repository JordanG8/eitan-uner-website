"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Sheet — copied MIT source, retuned.
 *
 * Adopted for the mobile navigation, replacing a hand-rolled drawer. The win
 * is not visual, it is behavioural, and it is the kind of thing that only
 * shows up when you actually try to use the site: the old drawer locked the
 * body by writing `document.body.style.overflow` from an effect, trapped no
 * focus, and left the page behind it fully tabbable underneath. Radix's
 * Dialog gives focus trap, focus restore on close, Escape, `aria-modal`,
 * inert background and scroll lock — all of it, correctly, for free.
 *
 * Changed from the registry default:
 *  - the `animate-in` / `slide-in-from-*` classes are gone. They come from
 *    tailwindcss-animate, which this project does not install and should not
 *    have to for one drawer. Two keyframes in globals.css do the same job and
 *    respect the site's own duration token.
 *  - `side` is `start` / `end` / `top` / `bottom`, not `left` / `right`.
 *    A physical side name in an RTL codebase is a bug waiting to be written;
 *    the whole project is on logical properties and this is not an exception.
 *  - `bg-black/50` → `bg-void/60`, because #000 is not in this palette.
 *  - `shadow-lg`, `rounded-xs` and the focus ring are dropped, per the
 *    site's laws (no shadows, no radius, one focus outline).
 */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn("sheet-overlay fixed inset-0 z-50 bg-void/60", className)}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "end",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "bottom" | "start" | "end";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "sheet-panel fixed z-50 flex flex-col bg-paper",
          side === "end" &&
            "inset-y-0 end-0 h-full w-4/5 max-w-sm border-s border-hairline",
          side === "start" &&
            "inset-y-0 start-0 h-full w-4/5 max-w-sm border-e border-hairline",
          side === "top" && "inset-x-0 top-0 h-auto border-b border-hairline",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t border-hairline",
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-micro tracking-label text-ink-faint", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-micro text-ink-soft", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
