import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ChromeGate } from "@/components/ChromeGate";

/**
 * Assistant — a Hebrew-first family, and the closest good match to the original
 * site's Hebrew sans. Loaded via next/font so it self-hosts (no request to
 * fonts.googleapis.com) and gets a size-adjusted fallback to avoid layout shift.
 */
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eitanuner.co.il";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.siteName} — ${site.tagline}`,
    template: `%s | ${site.siteName}`,
  },
  description:
    "איתן אונר — צלם ופוטודוקותרפיסט. סדנאות פוטודוקותרפיה, פוטותרפיה, וידאותרפיה, " +
    "צילום חברתי, הרצאות ותיעוד. ריפוי והשראה דרך העדשה.",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: site.siteName,
    title: `${site.siteName} — ${site.tagline}`,
    description:
      "צלם ופוטודוקותרפיסט. סדנאות, הרצאות ותיעוד — ריפוי והשראה דרך העדשה.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/*
          The skip link broke two of the three stated laws at once, and it
          broke them in the one place nobody looks: it is invisible until a
          keyboard user presses Tab on a cold page.

          `text-white` against "never pure white", on `bg-brand-500` against
          "turquoise as an accent, never a slab" — and brand-500 appeared as a
          background *nowhere else on the site*, so the first thing the only
          reader who ever sees this element sees is the one surface that is
          not the design. It is now the same ink slab and paper text as every
          other filled control.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          דילוג לתוכן הראשי
        </a>

        <ChromeGate>
          <Header site={site} />
        </ChromeGate>

        {/*
          tabIndex={-1} is what makes the skip link above actually work.

          Chrome and Firefox implement sequential-focus navigation starting
          from the fragment target even when that target is not focusable, so
          the link appeared to work here. Safari has historically not done
          that: the URL changes, the page scrolls, and the next Tab returns to
          the top of the document — which strands the reader the link exists
          to help. Making the target programmatically focusable is the
          portable behaviour, and -1 keeps <main> out of the tab order itself.
        */}
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>

        <ChromeGate>
          <Footer site={site} />
          <WhatsAppFab url={site.whatsappUrl} />
        </ChromeGate>

        <script
          type="application/ld+json"
          // Local-business markup: the original had none, so Eitan never surfaced
          // properly for local searches like "צלם עמק יזרעאל".
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: site.siteName,
              description: site.tagline,
              url: SITE_URL,
              telephone: site.phone,
              email: site.email,
              address: {
                "@type": "PostalAddress",
                addressLocality: "תל יוסף",
                addressCountry: "IL",
              },
              areaServed: "IL",
              knowsLanguage: ["he"],
              founder: { "@type": "Person", name: "איתן אונר" },
            }),
          }}
        />
      </body>
    </html>
  );
}
