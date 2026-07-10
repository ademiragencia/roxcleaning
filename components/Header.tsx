"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage, type Lang } from "@/lib/language";
import { waLink, PHONE_E164, SERVICE_ROUTES } from "@/lib/site";
import { PhoneIcon } from "@/components/icons";

const NAV_ANCHORS = [
  { key: "services", href: "/#services" },
  { key: "about", href: "/#about" },
  { key: "reviews", href: "/#reviews" },
  { key: "faq", href: "/#faq" },
] as const;

function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const options: { value: Lang; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "pt", label: "PT" },
  ];
  return (
    <div
      role="group"
      aria-label={t.nav.langLabel}
      className="flex items-center rounded-full border border-blush bg-blush-soft p-0.5 text-xs font-semibold"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLang(opt.value)}
          aria-pressed={lang === opt.value}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === opt.value
              ? "bg-magenta text-white shadow-sm"
              : "text-graphite/70 hover:text-magenta"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-blush/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Rox Cleaning — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rox_horizontal.svg"
            alt="Rox Cleaning logo"
            width={145}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV_ANCHORS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-graphite/80 transition-colors hover:text-magenta"
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          {/* Click-to-call, shown on mobile only */}
          <a
            href={`tel:${PHONE_E164}`}
            aria-label={t.nav.call}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white transition-colors hover:bg-teal-dark md:hidden"
          >
            <PhoneIcon className="h-4 w-4" />
          </a>
          <a
            href={waLink(t.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-magenta px-4 py-2 text-sm font-semibold text-white shadow-md shadow-magenta/25 transition-colors hover:bg-magenta-dark sm:inline-block"
          >
            {t.nav.quote}
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? t.nav.closeMenu : t.nav.menu}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-blush md:hidden"
          >
            <span
              className={`block h-0.5 w-4 rounded bg-graphite transition-transform ${open ? "translate-y-1 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-4 rounded bg-graphite transition-transform ${open ? "-translate-y-1 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-blush/60 bg-white px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ANCHORS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-medium text-graphite/90 hover:bg-blush-soft hover:text-magenta"
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={SERVICE_ROUTES.str}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 font-medium text-teal hover:bg-blush-soft"
              >
                Airbnb / VRBO
              </Link>
            </li>
          </ul>
          <a
            href={waLink(t.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-full bg-magenta px-4 py-3 text-center font-semibold text-white shadow-md shadow-magenta/25"
          >
            {t.nav.quote}
          </a>
        </nav>
      )}
    </header>
  );
}
