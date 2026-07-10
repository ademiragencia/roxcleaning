import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  title: "House Cleaning Orlando FL | Rox Cleaning — Homes, Offices & Vacation Rentals",
  description:
    "Rox Cleaning offers professional house cleaning in Orlando, plus office, store and Airbnb/vacation rental cleaning across Orlando, Kissimmee and Central Florida. Licensed & insured. Free quote on WhatsApp.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePage />;
}
