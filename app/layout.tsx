import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { JsonLd } from "@/components/JsonLd";
import { businessJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "House Cleaning Orlando FL | Rox Cleaning — Homes, Offices & Vacation Rentals",
    template: "%s | Rox Cleaning",
  },
  description:
    "Professional house cleaning in Orlando, FL. Rox Cleaning offers home, office, store and Airbnb/vacation rental cleaning in Orlando, Kissimmee and Central Florida. Licensed & insured — get a free estimate by text or email.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: "pt_BR",
    url: SITE_URL,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Rox Cleaning — professional cleaning services in Orlando, FL",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  // Local geo signals for search engines.
  other: {
    "geo.region": "US-FL",
    "geo.placename": "Orlando, Florida",
    "geo.position": "28.5383;-81.3792",
    ICBM: "28.5383, -81.3792",
  },
  // TODO: paste the Google Search Console verification token here once you
  // create the property (Settings → Ownership verification → HTML tag).
  // verification: { google: "PASTE_TOKEN_HERE" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd data={businessJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingContact />
        </LanguageProvider>
      </body>
    </html>
  );
}
