import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_URL = 'https://automaticcow.com'
const SITE_NAME = 'Automatic Cow'
const TITLE = 'Automatic Cow — Weekly USDA Prime Steak Delivery in Houston'
const DESC = 'Houston\'s private USDA Prime steak membership for luxury residents. Ribeye, Tenderloin, NY Strip — vacuum-sealed, dry-ice cold, delivered to your unit every Saturday.'

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
    'steak delivery Houston',
    'USDA Prime steak',
    'weekly steak subscription',
    'ribeye delivery',
    'tenderloin delivery',
    'NY Strip delivery',
    'Houston luxury residents',
    'private beef membership',
    'steak subscription Texas',
    'concierge steak delivery',
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
      name: 'Weekly USDA Prime Steak Subscription',
      description: 'Choose Ribeye, Tenderloin, or NY Strip — delivered every Saturday to luxury Houston residences.',
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '20',
        highPrice: '25',
        offerCount: '3',
        availability: 'https://schema.org/InStock',
      },
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
