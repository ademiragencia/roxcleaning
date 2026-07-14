import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import en from "@/dictionaries/en.json";

export const metadata: Metadata = {
  title: "House Cleaning Orlando FL | Rox Cleaning — Homes, Offices & Vacation Rentals",
  description:
    "Rox Cleaning offers professional house cleaning in Orlando, plus office, store and Airbnb/vacation rental cleaning across Orlando, Kissimmee and Central Florida. Licensed & insured. Free estimate by text or email.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqJsonLd(en.faq.items)} />
      <HomePage />
    </>
  );
}
