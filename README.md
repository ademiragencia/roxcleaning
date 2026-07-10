# Rox Cleaning — Marketing Website

Lead-generation site for Rox Cleaning, a professional cleaning company in Orlando, FL.
Built with Next.js (App Router) + Tailwind CSS, fully static (`output: "export"`), bilingual EN / PT-BR.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page: hero, trust bar, services grid, why Rox, how it works, vacation-rental highlight, testimonials, FAQ, contact form, final CTA |
| `/house-cleaning` | House cleaning service page |
| `/office-cleaning` | Office cleaning service page |
| `/store-cleaning` | Store / retail cleaning service page |
| `/vacation-rental-cleaning` | Airbnb / VRBO turnover service page |

Plus `sitemap.xml`, `robots.txt`, LocalBusiness JSON-LD (in `app/layout.tsx`) and Open Graph image (`public/og.png`).

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export to out/
```

Deploy to Vercel as-is (framework preset: Next.js). If this repo subfolder is deployed, set the Vercel "Root Directory" to `rox-cleaning`.

## Before launch — replace the placeholders

1. **Logos** — `public/rox_horizontal.svg`, `public/rox_icone_lotus.svg` and `app/icon.svg` are brand-matching stand-ins. Replace with the real logo files (keep the filenames).
2. **Formspree** — set the real form ID in `lib/site.ts` (`FORMSPREE_ENDPOINT`, currently `YOUR_FORM_ID`).
3. **Domain** — set the production domain in `lib/site.ts` (`SITE_URL`), used by metadata, sitemap and JSON-LD.
4. **Testimonials** — the three reviews in `dictionaries/en.json` / `dictionaries/pt.json` are illustrative placeholders; swap in real client reviews.
5. **OG image** — `public/og.png` was generated from the placeholder logo; regenerate once the real brand files are in.

## Editing copy / i18n

All copy for both languages lives in `dictionaries/en.json` and `dictionaries/pt.json` (same structure, keep keys in sync — TypeScript enforces it). The header toggle persists the choice in `localStorage` and updates `<html lang>`. English is the statically rendered default.

## Conversion features

- Every CTA opens WhatsApp (`+1 407 881-9431`) with a pre-filled, localized message — helper in `lib/site.ts` (`waLink`).
- Floating WhatsApp button with pulse animation on all pages (`components/WhatsAppFloat.tsx`).
- Click-to-call phone button in the header on mobile.
- Secondary lead path: Formspree contact form on the home page.
