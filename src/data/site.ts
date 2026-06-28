// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for business identity / NAP / local-SEO signals.
// Footer, structured data, and contact links all read from here so the name,
// address, phone, email and social profiles stay consistent everywhere — which
// is exactly what local search ranking rewards (NAP consistency).
//
// ⚠️ FILL THESE IN to unlock local SEO:
//   • PHONE  — add a real, reachable number (shows in footer + LocalBusiness
//              schema; leave '' and it stays hidden rather than showing a fake)
//   • SOCIAL — paste your Google Business Profile, Instagram, etc. URLs into
//              `sameAs`. The GBP link is the highest-impact one.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: 'Automatic Cow',
  url: 'https://automaticcow.com',
  slogan: 'Good Food. From Now On.',
  description:
    'Houston weekly local beef delivery. Steaks, roasts, brisket and ground beef — priced by the pound, delivered to your door every Saturday. Cancel anytime.',

  // Contact (NAP) — keep identical to your Google Business Profile.
  email: 'beef@automaticcow.com',
  phone: '', // TODO: e.g. '+1 (713) 555-0100' — leave '' to hide until you have one

  // Service-area business: we deliver across Houston. No public storefront
  // address is required for a SAB in Google — service area + geo is enough.
  city: 'Houston',
  region: 'TX',
  regionName: 'Texas',
  country: 'US',
  geo: { lat: 29.7589, lng: -95.3677 }, // Houston (city center — SAB anchor)

  // Neighborhoods / areas served — reinforces local relevance.
  areasServed: [
    'Houston',
    'Upper Kirby',
    'River Oaks',
    'Montrose',
    'Downtown Houston',
    'Uptown / Galleria',
    'The Heights',
    'Midtown',
  ],

  // Delivery cadence (also surfaced in schema openingHours).
  deliveryDay: 'Saturday',

  // Public profiles. Add your Google Business Profile URL FIRST — biggest local
  // ranking + trust signal. Then Instagram, Facebook, etc.
  sameAs: [
    // 'https://www.google.com/maps/place/?q=place_id:YOUR_PLACE_ID',
    // 'https://www.instagram.com/automaticcow',
    // 'https://www.facebook.com/automaticcow',
  ] as string[],
} as const

// Convenience: only the contact channels that are actually set, for the footer.
export const hasPhone = SITE.phone.trim().length > 0
