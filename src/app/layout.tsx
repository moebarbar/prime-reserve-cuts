import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#0d0b08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: '🐄 Automatic Cow · Houston',
  description: 'A private USDA Prime steak membership exclusively for Houston luxury residents. Weekly delivery straight to your unit.',
  keywords: ['steak delivery Houston', 'USDA Prime', 'luxury steak', 'Houston members', 'weekly steak delivery'],
  openGraph: {
    title: '🐄 Automatic Cow · Houston',
    description: 'USDA Prime steaks delivered weekly to your luxury residence.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&dpr=1',
        width: 1200,
        height: 630,
        alt: 'Tomahawk steak on a flaming grill — Automatic Cow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🐄 Automatic Cow · Houston',
    description: 'USDA Prime steaks delivered weekly to your luxury residence.',
    images: ['https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&dpr=1'],
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
