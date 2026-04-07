import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prime Reserve · Houston',
  description: 'A private steak membership exclusively for Houston luxury residents.',
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
