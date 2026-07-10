import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Office Cleaning Orlando FL — Commercial Cleaning Services",
  description:
    "Reliable office cleaning in Orlando, FL. After-hours commercial cleaning for offices, practices and coworking spaces — consistent crew, licensed & insured, no long-term contracts. Free quote on WhatsApp.",
  alternates: { canonical: "/office-cleaning" },
};

export default function Page() {
  return <ServicePage service="office" />;
}
