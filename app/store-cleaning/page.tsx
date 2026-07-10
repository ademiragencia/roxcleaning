import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Store & Retail Cleaning Orlando FL — Boutiques, Salons & Showrooms",
  description:
    "Professional retail and store cleaning in Orlando and Kissimmee, FL. Spotless sales floors, glass and fitting rooms — before opening or after closing. Licensed & insured. Free quote on WhatsApp.",
  alternates: { canonical: "/store-cleaning" },
};

export default function Page() {
  return <ServicePage service="store" />;
}
