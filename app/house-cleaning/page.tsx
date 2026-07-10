import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "House Cleaning Orlando — Recurring, Deep & Move-Out Cleans",
  description:
    "Trusted house cleaning in Orlando and Kissimmee, FL. Weekly, bi-weekly, deep and move-in/move-out cleaning by a licensed, insured team using eco-friendly products. Get your free estimate by text or email.",
  alternates: { canonical: "/house-cleaning" },
};

export default function Page() {
  return <ServicePage service="house" />;
}
