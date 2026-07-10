"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { smsLink, PHONE_DISPLAY, type ServiceKey } from "@/lib/site";
import { FaqAccordion } from "@/components/Faq";
import { CheckIcon, SparklesIcon } from "@/components/icons";

export function ServicePage({ service }: { service: ServiceKey }) {
  const { t } = useLanguage();
  const page = t.servicePages[service];
  const shared = t.servicePages;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush-soft via-blush-soft/60 to-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/rox_icone_lotus.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-8 h-64 w-64 opacity-10 sm:h-80 sm:w-80"
        />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal shadow-sm">
              {page.kicker}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-graphite/75">{page.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#estimate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-7 py-3.5 font-semibold text-white shadow-lg shadow-magenta/30 transition-colors hover:bg-magenta-dark"
              >
                <SparklesIcon className="h-5 w-5" />
                {t.hero.ctaPrimary}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border-2 border-teal px-7 py-3.5 font-semibold text-teal transition-colors hover:bg-teal hover:text-white"
              >
                {shared.backHome}
              </Link>
            </div>
            <p className="mt-4 text-sm text-graphite/70">
              {t.hero.orText}{" "}
              <a
                href={smsLink(t.smsMessage)}
                className="font-semibold text-magenta underline decoration-magenta/40 underline-offset-4 hover:decoration-magenta"
              >
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{shared.includedTitle}</h2>
          <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {page.included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-graphite/85 sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-blush-soft/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{shared.whoForTitle}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {page.whoFor.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-blush bg-white p-6 text-sm font-medium leading-relaxed shadow-sm sm:text-base"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {shared.faqTitle}
          </h2>
          <div className="mt-10">
            <FaqAccordion items={page.faq} />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-magenta to-magenta-dark text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.ctaTitle}</h2>
          <Link
            href="/#estimate"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-magenta shadow-lg transition-transform hover:scale-105"
          >
            <SparklesIcon className="h-5 w-5 text-magenta" />
            {page.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
