"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import {
  SERVICE_ROUTES,
  SERVICE_KEYS,
  PHONE_DISPLAY,
  PHONE_E164,
  EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  smsLink,
  emailLink,
} from "@/lib/site";
import {
  PhoneIcon,
  MessageIcon,
  MailIcon,
  InstagramIcon,
  ClockIcon,
  MapPinIcon,
} from "@/components/icons";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-blush/60 bg-blush-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rox_horizontal.png"
            alt="Rox Cleaning logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-graphite/70">
            {t.footer.tagline}
          </p>
        </div>

        <nav aria-label={t.footer.servicesTitle}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
            {t.footer.servicesTitle}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICE_KEYS.map((key) => (
              <li key={key}>
                <Link
                  href={SERVICE_ROUTES[key]}
                  className="text-graphite/75 transition-colors hover:text-magenta"
                >
                  {t.serviceCards[key].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
            {t.footer.areaTitle}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-graphite/75">
            {t.footer.areas.map((area) => (
              <li key={area} className="flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-magenta" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-teal">
            {t.footer.contactTitle}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-graphite/75">
            <li>
              <a
                href={`tel:${PHONE_E164}`}
                className="flex items-center gap-2 transition-colors hover:text-magenta"
              >
                <PhoneIcon className="h-4 w-4 shrink-0 text-magenta" />
                <span>
                  <span className="sr-only">{t.footer.callLabel}: </span>
                  {PHONE_DISPLAY}
                </span>
              </a>
            </li>
            <li>
              <a
                href={smsLink(t.smsMessage)}
                className="flex items-center gap-2 transition-colors hover:text-magenta"
              >
                <MessageIcon className="h-4 w-4 shrink-0 text-magenta" />
                {t.footer.textLabel} · {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={emailLink(t.emailSubject)}
                className="flex items-center gap-2 break-all transition-colors hover:text-magenta"
              >
                <MailIcon className="h-4 w-4 shrink-0 text-magenta" />
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-magenta"
              >
                <InstagramIcon className="h-4 w-4 shrink-0 text-magenta" />
                {INSTAGRAM_HANDLE}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 shrink-0 text-magenta" />
              <span>
                <span className="sr-only">{t.footer.hoursLabel}: </span>
                {t.footer.hours}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-blush/60 py-5 text-center text-xs text-graphite/60">
        © {year} Rox Cleaning · Orlando, FL · {t.footer.rights}
      </div>
    </footer>
  );
}
