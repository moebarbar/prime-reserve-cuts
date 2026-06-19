import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { PRODUCTS, CATEGORY_META, productsByCategory } from '@/data/products'

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
    // Core service
    'beef delivery Houston',
    'steak delivery Houston',
    'USDA Prime beef Houston',
    'weekly meat subscription Houston',
    'butcher delivery Houston',
    'concierge beef delivery',
    // Steak category
    'ribeye delivery Houston',
    'NY Strip delivery Houston',
    'sirloin delivery Houston',
    'wagyu Houston delivery',
    'tomahawk steak Houston',
    'filet mignon delivery Houston',
    // Slow cook category
    'brisket delivery Houston',
    'chuck roast Houston',
    'osso buco Houston',
    'beef shank Houston',
    'whole brisket Texas',
    // Daily essentials
    'ground beef delivery Houston',
    'beef tallow Houston',
    'marrow bones Houston',
    'bone broth bones delivery',
    // Audience / context
    'Houston luxury residents',
    'high-rise food delivery Houston',
    'luxury meat subscription Texas',
    'private beef membership',
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
        alt: 'USDA Prime ribeye — Automatic Cow weekly delivery',
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

const catProductOffers = (catKey: 'steak' | 'slow_cook' | 'ground') =>
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
      sameAs: [],
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/ribeye-raw.jpg`,
      description: DESC,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Houston',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
      areaServed: {
        '@type': 'City',
        name: 'Houston',
      },
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
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Automatic Cow delivery work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pick your building, choose your cuts (Steaks, Roasts & Brisket, or Ground Beef), set how many pounds you want each week, and we deliver vacuum-sealed local beef to your door every Saturday. Cancel anytime.',
          },
        },
        {
          '@type': 'Question',
          name: 'What cuts of beef do you offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Steaks (Bone-in Ribeye $31.99/lb, New York Strip $27.99/lb, Filet $39.99/lb, Sirloin $19.99/lb, Round Steak / Cutlets $14.99/lb, Flank / Skirt $24.99/lb), Roasts $14.99/lb and Brisket $14.99/lb, and fresh Ground Beef $12.99/lb. Everything is priced by the pound.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which Houston buildings do you deliver to?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We currently serve Pearl 21Eleven, Aspire Post Oak, The Driscoll, Market Square Tower, Parkside at Discovery Green, and Elev8 Downtown, with more luxury high-rises joining each quarter.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is the meat sourced?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Local beef sourced directly from partner ranches, processed whole-animal under USDA-inspected facilities. No middlemen — which is how we keep prices in a local, farmers-market range.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I pause or cancel my subscription?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — pause, skip, or cancel any week through the member portal. No commitments.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </head>
      <body>
        {children}
        <Script id="schema-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
      </body>
    </html>
  )
}
