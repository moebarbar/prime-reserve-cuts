import type { Metadata } from 'next'

// The customer area is private — keep it out of search indexes.
export const metadata: Metadata = {
  title: 'My Account · Automatic Cow',
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
