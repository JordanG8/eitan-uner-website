import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";

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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
        >
          דילוג לתוכן הראשי
        </a>

        <Header site={site} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer site={site} />
        <WhatsAppFab url={site.whatsappUrl} />

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
