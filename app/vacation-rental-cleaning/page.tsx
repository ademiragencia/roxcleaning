import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Airbnb Cleaning Service Orlando — Vacation Rental Cleaning Kissimmee",
  description:
    "Same-day Airbnb & VRBO turnover cleaning in Orlando, Kissimmee and the Disney corridor. Vacation rental cleaning with restocking, hotel-style staging and a photo report after every clean. Free estimate by text or email.",
  alternates: { canonical: "/vacation-rental-cleaning" },
};

export default function Page() {
  return <ServicePage service="str" />;
}
