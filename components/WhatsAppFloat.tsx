"use client";

import { useLanguage } from "@/lib/language";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export function WhatsAppFloat() {
  const { t } = useLanguage();

  return (
    <a
      href={waLink(t.waMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.float.label}
      className="wa-pulse fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 hover:bg-whatsapp-dark"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
