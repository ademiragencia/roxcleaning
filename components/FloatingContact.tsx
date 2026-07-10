"use client";

import { useLanguage } from "@/lib/language";
import { smsLink } from "@/lib/site";
import { MessageIcon } from "@/components/icons";

// Floating click-to-text button — US clients prefer SMS, so one tap opens
// their messaging app pre-filled. Shown on every page.
export function FloatingContact() {
  const { t } = useLanguage();

  return (
    <a
      href={smsLink(t.smsMessage)}
      aria-label={t.float.label}
      className="cta-pulse fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-magenta px-5 py-3.5 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-magenta-dark"
    >
      <MessageIcon className="h-6 w-6" />
      <span className="hidden sm:inline">{t.nav.text}</span>
    </a>
  );
}
