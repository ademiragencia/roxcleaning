import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { SITE_NAME, SITE_URL, PHONE_E164, EMAIL, INSTAGRAM_URL } from "@/lib/site";

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
};

// LocalBusiness structured data for search engines
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  logo: `${SITE_URL}/rox_horizontal.png`,
  telephone: PHONE_E164,
  email: EMAIL,
  priceRange: "$$",
  sameAs: [INSTAGRAM_URL],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: PHONE_E164,
    email: EMAIL,
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: ["English", "Portuguese"],
  },
  areaServed: [
    { "@type": "City", name: "Orlando", "@id": "https://en.wikipedia.org/wiki/Orlando,_Florida" },
    { "@type": "City", name: "Kissimmee", "@id": "https://en.wikipedia.org/wiki/Kissimmee,_Florida" },
    { "@type": "AdministrativeArea", name: "Central Florida" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Orlando",
    addressRegion: "FL",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "House Cleaning" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Office Cleaning" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Store & Retail Cleaning" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Vacation Rental Turnover Cleaning" } },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
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
