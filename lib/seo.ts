import en from "@/dictionaries/en.json";
import {
  SITE_URL,
  SITE_NAME,
  PHONE_E164,
  EMAIL,
  INSTAGRAM_URL,
  SERVICE_ROUTES,
  type ServiceKey,
} from "@/lib/site";

// Central geo + area data reused across schema. Orlando city center.
export const GEO = { latitude: 28.5383, longitude: -81.3792 };

export const AREAS_SERVED = [
  "Orlando",
  "Kissimmee",
  "Lake Nona",
  "Winter Garden",
  "Dr. Phillips",
  "Celebration",
  "Davenport",
  "Champions Gate",
  "Windermere",
  "St. Cloud",
];

const BUSINESS_ID = `${SITE_URL}/#business`;

function areaServedNodes() {
  return AREAS_SERVED.map((name) => ({ "@type": "City", name }));
}

// Full LocalBusiness (CleaningService) entity — the anchor for local SEO.
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CleaningService",
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/og.png`,
    logo: `${SITE_URL}/rox_horizontal.png`,
    telephone: PHONE_E164,
    email: EMAIL,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Zelle, Venmo",
    sameAs: [INSTAGRAM_URL],
    knowsLanguage: ["en", "pt"],
    slogan: "A Spotless Space, Without Lifting a Finger",
    description:
      "Professional house, office, store and vacation rental (Airbnb/VRBO) cleaning in Orlando, Kissimmee and Central Florida. Licensed and insured, eco-friendly products, flexible scheduling.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Orlando",
      addressRegion: "FL",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", ...GEO },
    areaServed: areaServedNodes(),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE_E164,
      email: EMAIL,
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: ["English", "Portuguese"],
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
}

// WebSite entity (helps Google understand the site / sitelinks).
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "en-US",
    publisher: { "@id": BUSINESS_ID },
  };
}

// FAQPage — can earn expandable FAQ rich results in Google.
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

// Per-service Service schema tied to the business, with local area served.
export function serviceJsonLd(service: ServiceKey) {
  const card = en.serviceCards[service];
  const page = en.servicePages[service];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: card.name,
    name: `${card.name} in Orlando, FL`,
    description: page.subtitle,
    url: `${SITE_URL}${SERVICE_ROUTES[service]}`,
    provider: { "@id": BUSINESS_ID, "@type": "CleaningService", name: SITE_NAME, telephone: PHONE_E164 },
    areaServed: areaServedNodes(),
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: PHONE_E164,
      serviceUrl: `${SITE_URL}${SERVICE_ROUTES[service]}`,
    },
  };
}

// Breadcrumb for a service page.
export function breadcrumbJsonLd(service: ServiceKey) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: en.serviceCards[service].name,
        item: `${SITE_URL}${SERVICE_ROUTES[service]}`,
      },
    ],
  };
}
