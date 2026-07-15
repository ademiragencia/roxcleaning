import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { JsonLd } from "@/components/JsonLd";
import { serviceJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import en from "@/dictionaries/en.json";

export const metadata: Metadata = {
  title: "Office Cleaning Orlando FL — Commercial Cleaning Services",
  description:
    "Reliable office cleaning in Orlando, FL. After-hours commercial cleaning for offices, practices and coworking spaces — consistent crew, licensed & insured, no long-term contracts. Free estimate by text or email.",
  alternates: { canonical: "/office-cleaning" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={serviceJsonLd("office")} />
      <JsonLd data={breadcrumbJsonLd("office")} />
      <JsonLd data={faqJsonLd(en.servicePages.office.faq)} />
      <ServicePage service="office" />
    </>
  );
}
