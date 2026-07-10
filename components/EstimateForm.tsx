"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";
import {
  WEB3FORMS_ENDPOINT,
  WEB3FORMS_ACCESS_KEY,
  PHONE_DISPLAY,
  PHONE_E164,
  EMAIL,
  smsLink,
  emailLink,
} from "@/lib/site";
import { PhoneIcon, MessageIcon, MailIcon } from "@/components/icons";

type Status = "idle" | "sending" | "success" | "error";

export function EstimateForm() {
  const { t } = useLanguage();
  const e = t.estimate;
  const [status, setStatus] = useState<Status>("idle");

  const inputClass =
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm text-graphite placeholder:text-graphite/40 outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20";
  const labelClass = "mb-1.5 block text-sm font-medium";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const formData = new FormData(event.currentTarget);
    const payload = JSON.stringify(Object.fromEntries(formData.entries()));
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: payload,
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-blush bg-blush-soft/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-magenta">{e.successTitle}</h3>
        <p className="mx-auto mt-3 max-w-md text-graphite/75">{e.successBody}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Web3Forms static-form backend — submissions go to the Rox inbox. */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
        <input type="hidden" name="subject" value="New estimate request — Rox Cleaning website" />
        <input type="hidden" name="from_name" value="Rox Cleaning Website" />
        {/* Honeypot spam trap */}
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="est-name" className={labelClass}>{e.name}</label>
            <input id="est-name" name="name" type="text" required autoComplete="name" placeholder={e.namePlaceholder} className={inputClass} />
          </div>
          <div>
            <label htmlFor="est-email" className={labelClass}>{e.email}</label>
            <input id="est-email" name="email" type="email" required autoComplete="email" placeholder={e.emailPlaceholder} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="est-phone" className={labelClass}>{e.phone}</label>
            <input id="est-phone" name="phone" type="tel" required autoComplete="tel" placeholder={e.phonePlaceholder} className={inputClass} />
          </div>
          <div>
            <label htmlFor="est-location" className={labelClass}>{e.location}</label>
            <input id="est-location" name="location" type="text" required placeholder={e.locationPlaceholder} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="est-bedrooms" className={labelClass}>{e.bedrooms}</label>
            <select id="est-bedrooms" name="bedrooms" required defaultValue="" className={inputClass}>
              <option value="" disabled>{e.select}</option>
              {["1", "2", "3", "4", "5", "6+"].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="est-bathrooms" className={labelClass}>{e.bathrooms}</label>
            <select id="est-bathrooms" name="bathrooms" required defaultValue="" className={inputClass}>
              <option value="" disabled>{e.select}</option>
              {["1", "2", "3", "4", "5", "6+"].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="est-type" className={labelClass}>{e.cleaningType}</label>
          <select id="est-type" name="cleaning_type" required defaultValue="" className={inputClass}>
            <option value="" disabled>{e.select}</option>
            <option value="Regular cleaning">{e.cleaningTypeOptions.regular}</option>
            <option value="Deep cleaning">{e.cleaningTypeOptions.deep}</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="est-frequency" className={labelClass}>{e.frequency}</label>
            <select id="est-frequency" name="frequency" required defaultValue="" className={inputClass}>
              <option value="" disabled>{e.select}</option>
              <option value="Weekly">{e.frequencyOptions.weekly}</option>
              <option value="Twice a month">{e.frequencyOptions.twice}</option>
              <option value="Once a month">{e.frequencyOptions.once}</option>
              <option value="Other frequency">{e.frequencyOptions.other}</option>
            </select>
          </div>
          <div>
            <label htmlFor="est-kids" className={labelClass}>{e.kids}</label>
            <select id="est-kids" name="kids" defaultValue="No" className={inputClass}>
              <option value="No">{e.no}</option>
              <option value="Yes">{e.yes}</option>
            </select>
          </div>
          <div>
            <label htmlFor="est-pets" className={labelClass}>{e.pets}</label>
            <select id="est-pets" name="pets" defaultValue="No" className={inputClass}>
              <option value="No">{e.no}</option>
              <option value="Yes">{e.yes}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="est-message" className={labelClass}>{e.message}</label>
          <textarea id="est-message" name="message" rows={3} placeholder={e.messagePlaceholder} className={inputClass} />
        </div>

        {status === "error" && (
          <div className="rounded-xl border border-magenta/40 bg-magenta/5 px-4 py-3 text-sm text-magenta">
            <p className="font-semibold">{e.errorTitle}</p>
            <p className="mt-0.5 text-magenta/90">{e.errorBody}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-magenta px-6 py-3.5 font-semibold text-white shadow-md shadow-magenta/25 transition-colors hover:bg-magenta-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "sending" ? e.sending : e.submit}
        </button>
        <p className="text-xs text-graphite/55">{e.note}</p>
      </form>

      {/* Direct contact — SMS / Call / Email (US clients prefer text & email) */}
      <div className="rounded-2xl border border-blush bg-blush-soft/40 p-5">
        <p className="text-sm font-medium text-graphite/80">{e.orReach}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={smsLink(t.smsMessage)} className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark">
            <MessageIcon className="h-4 w-4" /> {t.nav.text} · {PHONE_DISPLAY}
          </a>
          <a href={`tel:${PHONE_E164}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-teal px-4 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white">
            <PhoneIcon className="h-4 w-4" /> {t.nav.call}
          </a>
          <a href={emailLink(t.emailSubject)} className="inline-flex items-center justify-center gap-2 rounded-full border border-teal px-4 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-white">
            <MailIcon className="h-4 w-4" /> {EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
