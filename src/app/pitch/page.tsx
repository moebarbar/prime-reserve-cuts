import type { Metadata } from 'next'
import PitchDeck from './PitchDeck'

export const metadata: Metadata = {
  title: 'Automatic Cow — Investor Brief',
  description: 'The luxury weekly steak ritual.',
  robots: { index: false, follow: false },
}

export default function PitchPage() {
  return <PitchDeck />
}
