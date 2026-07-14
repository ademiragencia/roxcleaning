# Rox Cleaning — Marketing Website

Lead-generation site for Rox Cleaning, a professional cleaning company in Orlando, FL.
Built with Next.js (App Router) + Tailwind CSS, bilingual EN / PT-BR.

> **Note:** the marketing pages are still fully static, but the repo also hosts a standalone
> **Instagram downloader** at `/instagram` that needs serverless Route Handlers, so `output: "export"`
> has been removed. Vercel builds this as a normal Next.js app (static pages stay static; only the
> `/api/*` handlers run on demand). See [Instagram downloader](#instagram-downloader) below.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page: hero, trust bar, services grid, why Rox, how it works, vacation-rental highlight, testimonials, FAQ, free-estimate form, final CTA |
| `/house-cleaning` | House cleaning service page |
| `/office-cleaning` | Office cleaning service page |
| `/store-cleaning` | Store / retail cleaning service page |
| `/vacation-rental-cleaning` | Airbnb / VRBO turnover service page |

Plus `sitemap.xml`, `robots.txt`, LocalBusiness JSON-LD (in `app/(site)/layout.tsx`) and Open Graph image (`public/og.png`).

The cleaning site lives in the `app/(site)` route group with its own root layout; the Instagram
downloader lives in the independent `app/(ig)` route group so the two sites share no header/footer or chrome.

## Instagram downloader

A standalone, self-contained tool (Portuguese, sssinstagram-style) for downloading public Instagram
media. It is fully independent from the cleaning site.

| Route | Purpose |
| --- | --- |
| `/instagram` | Downloader landing page: paste a post/reel/IGTV link → get direct download buttons |
| `/api/instagram` | Serverless resolver — turns a public IG URL into direct media URLs (`lib/instagram.ts`) |
| `/api/download` | Serverless proxy that streams a single IG-CDN file back as an attachment (SSRF-guarded to IG hosts only) |

How resolution works (no login, public content only): the resolver derives the media id from the
shortcode and queries Instagram's public mobile-web media API, falling back to scraping the public
`/embed/captioned/` page. Instagram rate-limits and blocks datacenter IPs and changes these surfaces
often, so some links may fail on any given deploy — the UI degrades gracefully with a clear message.
Private accounts are never accessible.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Next.js production build (static pages + serverless /api handlers)
```

Deploy to Vercel as-is (framework preset: Next.js). If this repo subfolder is deployed, set the Vercel "Root Directory" to `rox-cleaning`.

## Contact details (already set in `lib/site.ts`)

- **Phone / SMS:** +1 (407) 881-9431 — US clients prefer text & calls, so the site uses `sms:` and `tel:` links (no WhatsApp).
- **Email:** roxcleaningusa@gmail.com
- **Estimate form:** submits to **Web3Forms** (access key already set in `WEB3FORMS_ACCESS_KEY`) — leads arrive by email in the Rox inbox.

## Before launch — replace the placeholders

1. **Logos** — `public/rox_horizontal.svg`, `public/rox_icone_lotus.svg` and `app/icon.svg` are brand-matching stand-ins. Replace with the real logo files (keep the filenames).
2. **Domain** — set the production domain in `lib/site.ts` (`SITE_URL`), used by metadata, sitemap and JSON-LD.
3. **Testimonials** — the three reviews in `dictionaries/en.json` / `dictionaries/pt.json` are illustrative placeholders; swap in real client reviews.
4. **OG image** — `public/og.png` was generated from the placeholder logo; regenerate once the real brand files are in.

## Editing copy / i18n

All copy for both languages lives in `dictionaries/en.json` and `dictionaries/pt.json` (same structure, keep keys in sync — TypeScript enforces it). The header toggle persists the choice in `localStorage` and updates `<html lang>`. English is the statically rendered default.

## Conversion features

- Primary lead path: the **free-estimate form** (`components/EstimateForm.tsx`) — location, bedrooms, bathrooms, regular/deep, kids, pets and frequency — submitting to Web3Forms. Every main CTA scrolls to it (`#estimate`).
- Click-to-text (`sms:`) helpers with a pre-filled, localized message — `smsLink()` in `lib/site.ts`.
- Floating **Text us** button with pulse animation on all pages (`components/FloatingContact.tsx`).
- Click-to-call and click-to-text buttons in the header on mobile; Call / Text / Email row in the footer and under the form.
