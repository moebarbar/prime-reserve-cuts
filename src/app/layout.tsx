import type { Metadata, Viewport } from 'next'
import { Cormorant, Jost } from 'next/font/google'
import './globals.css'

// Self-hosted + preloaded via next/font — replaces the render-blocking
// Google Fonts @import. Exposed as CSS vars the rest of the app references.
const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})
import { PRODUCTS, CATEGORY_META, productsByCategory } from '@/data/products'
import { SITE } from '@/data/site'

const SITE_URL = 'https://automaticcow.com'
const SITE_NAME = 'Automatic Cow'
const TITLE = 'Automatic Cow — Weekly Local Beef Delivery in Houston'
const DESC = 'Houston\'s weekly local beef membership. Steaks (Bone-in Ribeye, NY Strip, Filet, Sirloin, Round, Flank), Roasts & Brisket, and fresh Ground Beef — priced by the pound and delivered to your door every Saturday. Cancel anytime.'

export const viewport: Viewport = {
  themeColor: '#0d0b08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · Automatic Cow',
  },
  description: DESC,
  keywords: [
    // Core service (local intent)
    'beef delivery Houston',
    'local beef Houston',
    'meat delivery Houston',
    'steak delivery Houston',
    'weekly meat subscription Houston',
    'butcher delivery Houston',
    'grass-fed beef Houston',
    'farmers market beef Houston',
    // Steak cuts we actually sell
    'ribeye delivery Houston',
    'New York strip Houston',
    'sirloin delivery Houston',
    'filet Houston delivery',
    'flank steak Houston',
    'skirt steak Houston',
    // Roasts / slow cuts
    'brisket delivery Houston',
    'beef roast delivery Houston',
    'pot roast Houston',
    // Ground beef
    'ground beef delivery Houston',
    'fresh ground beef Houston',
    'bulk ground beef Houston',
    // Audience / context
    'beef delivery near me',
    'Houston meat subscription',
    'local meat delivery Texas',
    'beef by the pound Houston',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/ribeye-raw.jpg`,
        width: 1200,
        height: 630,
        alt: 'Local beef ribeye — Automatic Cow weekly Houston delivery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/ribeye-raw.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  category: 'food delivery',
}

// Structured data is generated from the same canonical catalog the funnel uses
// (src/data/products.ts) so prices in Google's rich results always match the
// per-pound prices on the page. Each Product carries an exact-price Offer.
const prices = PRODUCTS.map(p => p.pricePerLb)
const LOW_PRICE = Math.min(...prices).toFixed(2)
const HIGH_PRICE = Math.max(...prices).toFixed(2)

const catProductOffers = (catKey: 'steak' | 'slow_cook' | 'daily') =>
  productsByCategory(catKey).map(p => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      name: p.name,
      category: CATEGORY_META.find(c => c.key === catKey)?.title,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: p.pricePerLb.toFixed(2),
        eligibleQuantity: { '@type': 'QuantitativeValue', unitText: 'LB', value: '1' },
        availability: 'https://schema.org/InStock',
      },
    },
  }))

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
      email: SITE.email,
      ...(SITE.phone ? { telephone: SITE.phone } : {}),
      sameAs: SITE.sameAs,
    },
    {
      '@type': ['LocalBusiness', 'FoodEstablishment'],
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/ribeye-raw.jpg`,
      logo: `${SITE_URL}/logo.png`,
      description: DESC,
      email: SITE.email,
      ...(SITE.phone ? { telephone: SITE.phone } : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.city,
        addressRegion: SITE.region,
        addressCountry: SITE.country,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: SITE.geo.lat,
        longitude: SITE.geo.lng,
      },
      areaServed: SITE.areasServed.map(name => ({ '@type': 'City', name })),
      // Order online any day; we deliver every Saturday.
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
      ],
      ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
      priceRange: '$$',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESC,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Product',
      name: 'Weekly Local Beef Subscription',
      description: 'A weekly local beef membership for Houston residents. Steaks, roasts, brisket, and ground beef — priced by the pound, delivered every Saturday. Cancel anytime.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      category: 'Beef Subscription',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: LOW_PRICE,
        highPrice: HIGH_PRICE,
        offerCount: String(PRODUCTS.length),
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      serviceType: 'Weekly local beef subscription with home delivery',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'City', name: 'Houston' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Automatic Cow Categories',
        itemListElement: CATEGORY_META.map(cat => ({
          '@type': 'OfferCatalog',
          name: cat.title,
          itemListElement: catProductOffers(cat.key),
        })),
      },
    },
    // NOTE: FAQPage is intentionally NOT global. Google's policy requires the
    // Q&A to be visibly on the page; the homepage funnel doesn't render them.
    // The /steak-delivery-houston route emits its own FAQPage backed by
    // visible content — that's the correct home for it.
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </head>
      <body>
        {/* Inlined into the SSR HTML (not afterInteractive) so non-JS crawlers
            and AI bots see the Organization/LocalBusiness/Product markup. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
