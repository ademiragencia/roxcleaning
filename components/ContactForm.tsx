"use client";

import { useLanguage } from "@/lib/language";
import { FORMSPREE_ENDPOINT } from "@/lib/site";

export function ContactForm() {
  const { t } = useLanguage();
  const c = t.contact;

  const inputClass =
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm text-graphite placeholder:text-graphite/40 outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20";

  return (
    // Formspree static form — replace YOUR_FORM_ID in lib/site.ts with the real form ID.
    <form action={FORMSPREE_ENDPOINT} method="POST" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
            {c.name}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={c.namePlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium">
            {c.phone}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder={c.phonePlaceholder}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-service" className="mb-1.5 block text-sm font-medium">
          {c.service}
        </label>
        <select id="contact-service" name="service" className={inputClass} defaultValue="house">
          <option value="house">{c.serviceOptions.house}</option>
          <option value="office">{c.serviceOptions.office}</option>
          <option value="store">{c.serviceOptions.store}</option>
          <option value="str">{c.serviceOptions.str}</option>
          <option value="other">{c.serviceOptions.other}</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
          {c.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          placeholder={c.messagePlaceholder}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-teal px-6 py-3.5 font-semibold text-white shadow-md shadow-teal/25 transition-colors hover:bg-teal-dark sm:w-auto"
      >
        {c.submit}
      </button>
      <p className="text-xs text-graphite/55">{c.note}</p>
    </form>
  );
}
