import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#0d0b08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Prime Reserve · Houston',
  description: 'A private USDA Prime & A5 Wagyu steak membership exclusively for Houston luxury residents. Monthly delivery straight to your unit.',
  keywords: ['steak delivery Houston', 'USDA Prime', 'A5 Wagyu', 'luxury steak', 'Houston members'],
  openGraph: {
    title: 'Prime Reserve · Houston',
    description: 'USDA Prime & A5 Wagyu delivered monthly to your luxury residence.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Prime Reserve · Houston',
    description: 'USDA Prime & A5 Wagyu delivered monthly to your luxury residence.',
  },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
