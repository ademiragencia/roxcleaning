import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { JsonLd } from "@/components/JsonLd";
import { serviceJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import en from "@/dictionaries/en.json";

export const metadata: Metadata = {
  title: "Store & Retail Cleaning Orlando FL — Boutiques, Salons & Showrooms",
  description:
    "Professional retail and store cleaning in Orlando and Kissimmee, FL. Spotless sales floors, glass and fitting rooms — before opening or after closing. Licensed & insured. Free estimate by text or email.",
  alternates: { canonical: "/store-cleaning" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={serviceJsonLd("store")} />
      <JsonLd data={breadcrumbJsonLd("store")} />
      <JsonLd data={faqJsonLd(en.servicePages.store.faq)} />
      <ServicePage service="store" />
    </>
  );
}
