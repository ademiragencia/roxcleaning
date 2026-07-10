export const SITE_URL = "https://roxcleaning.com"; // TODO: replace with the final production domain
export const SITE_NAME = "Rox Cleaning";

export const PHONE_DISPLAY = "+1 (407) 881-9431";
export const PHONE_E164 = "+14078819431";
export const WA_NUMBER = "14078819431";

export const INSTAGRAM_HANDLE = "@roxcleaning";
export const INSTAGRAM_URL = "https://www.instagram.com/roxcleaning";

// TODO: replace YOUR_FORM_ID with the real Formspree form ID
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

export function waLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const SERVICE_ROUTES = {
  house: "/house-cleaning",
  office: "/office-cleaning",
  store: "/store-cleaning",
  str: "/vacation-rental-cleaning",
} as const;

export type ServiceKey = keyof typeof SERVICE_ROUTES;

export const SERVICE_KEYS = Object.keys(SERVICE_ROUTES) as ServiceKey[];
