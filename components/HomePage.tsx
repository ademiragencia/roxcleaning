"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import {
  SERVICE_ROUTES,
  SERVICE_KEYS,
  type ServiceKey,
  smsLink,
  PHONE_DISPLAY,
} from "@/lib/site";
import { FaqAccordion } from "@/components/Faq";
import { EstimateForm } from "@/components/EstimateForm";
import {
  ShieldCheckIcon,
  StarIcon,
  CalendarIcon,
  HeartHandsIcon,
  HomeIcon,
  BuildingIcon,
  StoreIcon,
  KeyIcon,
  SparklesIcon,
  UsersIcon,
  LeafIcon,
  MessageIcon,
  ClockIcon,
  BoxIcon,
  CameraIcon,
} from "@/components/icons";

/* ---------------------------------- Hero --------------------------------- */

function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush-soft via-blush-soft/60 to-white">
      {/* Decorative lotus icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rox_icone_lotus.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 opacity-10 sm:h-96 sm:w-96"
      />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <p className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal shadow-sm">
            {t.hero.badge}
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-graphite/75">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#estimate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-7 py-3.5 font-semibold text-white shadow-lg shadow-magenta/30 transition-colors hover:bg-magenta-dark"
            >
              <SparklesIcon className="h-5 w-5" />
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-full border-2 border-teal px-7 py-3.5 font-semibold text-teal transition-colors hover:bg-teal hover:text-white"
            >
              {t.hero.ctaSecondary}
            </a>
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
  );
}

/* -------------------------------- Trust bar ------------------------------- */

const TRUST_ICONS = [ShieldCheckIcon, StarIcon, CalendarIcon, HeartHandsIcon];

function TrustBar() {
  const { t } = useLanguage();
  return (
    <section aria-label="Trust" className="border-y border-blush/60 bg-white">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
        {t.trust.map((item, i) => {
          const Icon = TRUST_ICONS[i];
          return (
            <li key={item.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush-soft text-magenta">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-0.5 text-xs text-graphite/65">{item.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------ Services grid ----------------------------- */

const SERVICE_ICONS: Record<ServiceKey, typeof HomeIcon> = {
  house: HomeIcon,
  office: BuildingIcon,
  store: StoreIcon,
  str: KeyIcon,
};

function ServicesGrid() {
  const { t } = useLanguage();
  return (
    <section id="services" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t.servicesSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-graphite/70">
          {t.servicesSection.subtitle}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_KEYS.map((key) => {
            const Icon = SERVICE_ICONS[key];
            return (
              <Link
                key={key}
                href={SERVICE_ROUTES[key]}
                className="group flex flex-col rounded-2xl border border-blush bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-magenta/40 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-soft text-magenta transition-colors group-hover:bg-magenta group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{t.serviceCards[key].name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite/70">
                  {t.serviceCards[key].short}
                </p>
                <span className="mt-4 text-sm font-semibold text-magenta">
                  {t.servicesSection.learnMore} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Why Rox -------------------------------- */

const WHY_ICONS = [SparklesIcon, UsersIcon, LeafIcon];

function WhyRox() {
  const { t } = useLanguage();
  return (
    <section id="about" className="scroll-mt-20 bg-blush-soft/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.why.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-graphite/70">{t.why.subtitle}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.why.items.map((item, i) => {
            const Icon = WHY_ICONS[i];
            return (
              <div key={item.title} className="rounded-2xl bg-white p-8 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/70">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- How it works ------------------------------ */

function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.how.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-graphite/70">{t.how.subtitle}</p>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {t.how.steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-blush p-8">
              <span
                aria-hidden="true"
                className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-magenta text-lg font-bold text-white shadow-md shadow-magenta/30"
              >
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite/70">{step.desc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <a
            href="#estimate"
            className="inline-flex items-center gap-2 rounded-full bg-magenta px-7 py-3.5 font-semibold text-white shadow-lg shadow-magenta/30 transition-colors hover:bg-magenta-dark"
          >
            <SparklesIcon className="h-5 w-5" />
            {t.how.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------- Vacation rental highlight (teal) -------------------- */

const STR_BULLET_ICONS = [ClockIcon, BoxIcon, CameraIcon];

function VacationRentalHighlight() {
  const { t } = useLanguage();
  return (
    <section className="bg-teal text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide">
            {t.strHighlight.kicker}
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t.strHighlight.title}
          </h2>
          <p className="mt-4 leading-relaxed text-white/85">{t.strHighlight.desc}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#estimate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-magenta px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-magenta-dark"
            >
              <SparklesIcon className="h-5 w-5" />
              {t.strHighlight.cta}
            </a>
            <Link
              href={SERVICE_ROUTES.str}
              className="inline-flex items-center justify-center px-4 py-2 font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
            >
              {t.strHighlight.link}
            </Link>
          </div>
        </div>
        <ul className="space-y-4">
          {t.strHighlight.bullets.map((bullet, i) => {
            const Icon = STR_BULLET_ICONS[i];
            return (
              <li
                key={bullet}
                className="flex items-start gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="pt-1.5 text-sm font-medium leading-relaxed">{bullet}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------- Testimonials ------------------------------ */

function Testimonials() {
  const { t } = useLanguage();
  return (
    <section id="reviews" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t.testimonials.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-graphite/70">
          {t.testimonials.subtitle}
        </p>
        {/* PLACEHOLDER REVIEWS: names and quotes below are illustrative.
            Replace with real client reviews (and update both dictionaries) before launch. */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.testimonials.items.map((review) => (
            <figure
              key={review.name}
              className="flex flex-col rounded-2xl border border-blush bg-blush-soft/40 p-7 shadow-sm"
            >
              <div className="flex gap-1" role="img" aria-label={t.testimonials.ariaStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-graphite/80">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-5">
                <p className="text-sm font-bold">{review.name}</p>
                <p className="text-xs text-graphite/60">{review.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

function FaqSection() {
  const { t } = useLanguage();
  return (
    <section id="faq" className="scroll-mt-20 bg-blush-soft/50">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.faq.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-graphite/70">{t.faq.subtitle}</p>
        <div className="mt-10">
          <FaqAccordion items={t.faq.items} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Estimate form ------------------------------ */

function EstimateSection() {
  const { t } = useLanguage();
  return (
    <section id="estimate" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {t.estimate.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-graphite/70">{t.estimate.subtitle}</p>
        <div className="mt-10 rounded-2xl border border-blush bg-white p-6 shadow-sm sm:p-8">
          <EstimateForm />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA banner ---------------------------- */

function FinalCta() {
  const { t } = useLanguage();
  return (
    <section className="bg-gradient-to-r from-magenta to-magenta-dark text-white">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.finalCta.title}</h2>
        <p className="mt-3 text-white/85">{t.finalCta.subtitle}</p>
        <a
          href="#estimate"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-magenta shadow-lg transition-transform hover:scale-105"
        >
          <MessageIcon className="h-5 w-5 text-magenta" />
          {t.finalCta.button}
        </a>
      </div>
    </section>
  );
}

/* --------------------------------- Assemble -------------------------------- */

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <WhyRox />
      <HowItWorks />
      <VacationRentalHighlight />
      <Testimonials />
      <FaqSection />
      <EstimateSection />
      <FinalCta />
    </>
  );
}
