import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://automaticcow.com'
const SITE_NAME = 'Automatic Cow'
const TITLE = 'Automatic Cow — Weekly USDA Prime Beef Delivery in Houston'
const DESC = 'Houston\'s private USDA Prime beef membership for luxury residents. Steak (Ribeye, NY Strip, Sirloin), Slow Cook (Brisket, Chuck Roast, Shank), and Daily Essentials (Ground Beef, Tallow, Marrow Bones) — delivered to your concierge every Saturday.'

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
      priceRange: '$$$',
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
      name: 'Weekly USDA Prime Beef Subscription',
      description: 'A weekly USDA Prime beef membership for Houston luxury residents. Whole-animal access across three categories: Steak, Slow Cook, and Daily Essentials.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      category: 'Beef Subscription',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '15',
        highPrice: '115',
        offerCount: '12',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      serviceType: 'Weekly USDA Prime beef subscription with concierge delivery',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'City', name: 'Houston' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Automatic Cow Categories',
        itemListElement: [
          {
            '@type': 'OfferCatalog',
            name: 'Steak',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Ribeye',     category: 'Steak · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'NY Strip',   category: 'Steak · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Sirloin',    category: 'Steak · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Filet Mignon', category: 'Steak · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'A5 Wagyu',   category: 'Steak · Wagyu' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Tomahawk',   category: 'Steak · Heritage' } },
            ],
          },
          {
            '@type': 'OfferCatalog',
            name: 'Slow Cook',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Brisket',           category: 'Slow Cook · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Chuck Roast',       category: 'Slow Cook · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Shank (Osso Buco)', category: 'Slow Cook · USDA Prime' } },
            ],
          },
          {
            '@type': 'OfferCatalog',
            name: 'Daily Essentials',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Ground Beef',        category: 'Daily Essentials · USDA Prime' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Beef Tallow / Suet', category: 'Daily Essentials · Rendered fat' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Marrow Bones',       category: 'Daily Essentials · Bones' } },
            ],
          },
        ],
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
            text: 'Pick your building, choose your cuts across three categories (Steak, Slow Cook, Daily Essentials), and we deliver vacuum-sealed USDA Prime beef to your building\'s concierge every Saturday.',
          },
        },
        {
          '@type': 'Question',
          name: 'What cuts of beef do you offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We sell across the whole animal: Steak (Ribeye, NY Strip, Sirloin, Filet Mignon, A5 Wagyu, Tomahawk), Slow Cook (Brisket, Chuck Roast, Shank), and Daily Essentials (Ground Beef, Beef Tallow, Marrow Bones).',
          },
        },
        {
          '@type': 'Question',
          name: 'Which Houston buildings do you deliver to?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We currently serve Aspire Post Oak, The Driscoll, Market Square Tower, Parkside at Discovery Green, Elev8 Downtown, and Hanover Autry Park, with more luxury high-rises joining each quarter.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is the meat sourced?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'USDA Prime beef sourced directly from partner ranches in Texas, Oklahoma, and the American Midwest. No middlemen. Full cold-chain traceability through USDA-certified processing.',
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
