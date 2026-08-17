"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides the site header/footer/WhatsApp button on the editing surfaces, so the
 * editor's own chrome isn't competing with the site's.
 *
 * The children are still rendered on the server and passed through — this only
 * decides whether to mount them.
 */
const BARE_ROUTES = ["/editor", "/studio"];

export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (BARE_ROUTES.some((r) => pathname?.startsWith(r))) return null;
  return <>{children}</>;
}
