"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui NavigationMenu — copied MIT source, retuned.
 *
 * Adopted for the whole desktop bar, not just the overflow menu, so that the
 * inline links and the collapsed ones share one keyboard model: roving
 * tabindex across the row, Escape to close, pointer-leave to dismiss, and
 * `aria-expanded` / `aria-controls` wired correctly. The hand-rolled dropdown
 * it replaces listened for Escape and outside clicks and nothing else — no
 * arrow keys, no focus return, no relationship announced to a screen reader.
 *
 * Changed from the registry default:
 *  - the `viewport` apparatus is removed entirely. It exists to animate a
 *    shared panel that morphs between triggers; there is exactly one trigger
 *    here, and it cost a wrapper div, a CSS variable dance and a second
 *    positioning context for nothing.
 *  - every `data-[motion=…]:slide-in-from-right-52` class is gone. Those come
 *    from tailwindcss-animate, which is not installed; they were dead classes
 *    that Tailwind silently dropped, so the "animation" was already nothing.
 *    A plain opacity/translate transition replaces them.
 *  - `bg-accent` hover fills, `rounded-md`, `shadow` and the `ring-[3px]`
 *    focus ring are dropped. The bar marks its active item with a 2px rule
 *    under the label, which is what the rest of the page does.
 *  - `Root` already renders a `<nav>`, so the header passes `aria-label`
 *    straight through to it rather than wrapping it in a second one.
 *  - `dir` is required rather than optional. Radix defaults to "ltr", which
 *    reverses what the arrow keys mean in a Hebrew bar.
 */
function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      dir="rtl"
      delayDuration={120}
      className={cn("relative flex max-w-full flex-1 items-center", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex list-none flex-nowrap items-center gap-4",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative shrink-0", className)}
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      /* Radix wires aria-expanded and aria-controls and deliberately omits
         aria-haspopup, because a navigation menu's panel is a list of links
         and not a role=menu. That is defensible in the abstract and it leaves
         a real gap here: the trigger announces "collapsed" without ever
         announcing that there is something to expand, so a screen-reader
         reader meets a button called עוד — literally "more" — with no
         indication of more what. "true" rather than "menu": the panel holds
         links, and claiming menu semantics would promise arrow-key behaviour
         that this panel does not implement. */
      aria-haspopup="true"
      className={cn(
        "group inline-flex w-max items-center gap-1.5 border-b-2 border-transparent",
        "py-2 text-micro whitespace-nowrap transition-colors outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {/* Inlined rather than lucide's ChevronDownIcon: it is six characters of
          path data against a 1.3MB dependency's tree-shaking, and the rest of
          this codebase already draws its own 4 icons the same way. */}
      <svg
        viewBox="0 0 20 20"
        className="size-3 transition-transform group-data-[state=open]:rotate-180"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5 7l5 6 5-6z" />
      </svg>
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        /* start-0, not end-0. In RTL `start` is the right edge, so this pins
           the panel's right edge to the trigger's right edge and lets it hang
           inward. `end-0` pins the left edge and throws the panel outward
           toward the viewport edge — which is what the registry ships, because
           the registry is LTR and there `end` is the outward side. */
        "nav-menu-content absolute top-full start-0 z-50 mt-2 w-max min-w-56",
        "border border-hairline bg-paper py-1",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn("transition-colors outline-none", className)}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
};
