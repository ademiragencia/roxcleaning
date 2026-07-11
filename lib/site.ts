export const SITE_URL = "https://www.roxcleaningusa.com"; // production domain (primary; apex redirects here)
export const SITE_NAME = "Rox Cleaning";

export const PHONE_DISPLAY = "+1 (407) 881-9431";
export const PHONE_E164 = "+14078819431";

export const EMAIL = "roxcleaningusa@gmail.com";

export const INSTAGRAM_HANDLE = "@roxcleaning";
export const INSTAGRAM_URL = "https://www.instagram.com/roxcleaning";

// Web3Forms — free static-form backend. This access key routes submissions
// to the business inbox. Replace only if the Rox account changes.
export const WEB3FORMS_ACCESS_KEY = "874a57fa-de87-4f1a-9ad7-93cf884ea249";
export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Supabase (Rox CRM). Set these in the website's Vercel env for estimate-form
// submissions to also drop into the CRM Leads inbox. Left blank = feature off.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Best-effort insert of an estimate submission into the CRM `leads` table.
// Anonymous inserts are permitted by a strict insert-only RLS policy.
export async function saveLeadToCrm(fields: Record<string, string>): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  const lead = {
    name: fields.name || null,
    email: fields.email || null,
    phone: fields.phone || null,
    location: fields.location || null,
    bedrooms: fields.bedrooms || null,
    bathrooms: fields.bathrooms || null,
    cleaning_type: fields.cleaning_type || null,
    kids: fields.kids || null,
    pets: fields.pets || null,
    frequency: fields.frequency || null,
    message: fields.message || null,
    source: "website",
  };
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(lead),
    });
  } catch {
    // Best-effort only — the Web3Forms email remains the backup channel.
  }
}

// Click-to-text (SMS) — the preferred quick channel for US clients.
export function smsLink(message: string): string {
  return `sms:${PHONE_E164}?&body=${encodeURIComponent(message)}`;
}

// Click-to-email with a pre-filled subject.
export function emailLink(subject: string): string {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export const SERVICE_ROUTES = {
  house: "/house-cleaning",
  office: "/office-cleaning",
  store: "/store-cleaning",
  str: "/vacation-rental-cleaning",
} as const;

export type ServiceKey = keyof typeof SERVICE_ROUTES;

export const SERVICE_KEYS = Object.keys(SERVICE_ROUTES) as ServiceKey[];
