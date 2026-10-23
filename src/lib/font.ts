import { Assistant } from "next/font/google";

/**
 * Assistant — a Hebrew-first family, and the closest good match to the original
 * site's Hebrew sans. Loaded via next/font so it self-hosts (no request to
 * fonts.googleapis.com) and gets a size-adjusted fallback to avoid layout shift.
 *
 * Shared by the root layout and the editor preview frame, which needs the same
 * CSS variable on its own root.
 */
export const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap",
});
