import type { Metadata } from "next";
import "./globals.css";
import { getSite } from "@/lib/cms";
import { assistant } from "@/lib/font";
import { siteSettings } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ChromeGate } from "@/components/ChromeGate";
import { ThemeStyle } from "@/components/ThemeStyle";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eitanuner.co.il";

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getSite();
  const full = `${contact.siteName} — ${contact.tagline}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: full, template: `%s | ${contact.siteName}` },
    description: contact.seoDescription,
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: contact.siteName,
      title: full,
      description: contact.seoDescription,
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const doc = await getSite();
  const site = siteSettings(doc);

  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} h-full antialiased`}>
      <head>
        <ThemeStyle doc={doc} />
      </head>
      <body className="flex min-h-full flex-col bg-surface">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
        >
          דילוג לתוכן הראשי
        </a>

        <ChromeGate>
          <Header site={site} header={doc.header} />
        </ChromeGate>

        <main id="main" className="flex-1">
          {children}
        </main>

        <ChromeGate>
          <Footer site={site} footer={doc.footer} header={doc.header} />
          {doc.contact.showWhatsappButton && (
            <aside aria-label="יצירת קשר מהירה">
              <WhatsAppFab url={site.whatsappUrl} color={doc.contact.whatsappButtonColor} />
            </aside>
          )}
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
                addressLocality: site.location.split(",")[0],
                addressCountry: "IL",
              },
              areaServed: "IL",
              knowsLanguage: ["he"],
              founder: { "@type": "Person", name: "איתן אונר" },
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
