import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { JsonLd } from "@/components/JsonLd";
import { serviceJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import en from "@/dictionaries/en.json";

export const metadata: Metadata = {
  title: "House Cleaning Orlando — Recurring, Deep & Move-Out Cleans",
  description:
    "Trusted house cleaning in Orlando and Kissimmee, FL. Weekly, bi-weekly, deep and move-in/move-out cleaning by a licensed, insured team using eco-friendly products. Get your free estimate by text or email.",
  alternates: { canonical: "/house-cleaning" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={serviceJsonLd("house")} />
      <JsonLd data={breadcrumbJsonLd("house")} />
      <JsonLd data={faqJsonLd(en.servicePages.house.faq)} />
      <ServicePage service="house" />
    </>
  );
}
