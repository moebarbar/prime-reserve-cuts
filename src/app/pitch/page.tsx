import type { Metadata } from 'next'
import PitchDeck from './PitchDeck'

export const metadata: Metadata = {
  title: 'Automatic Cow — Investor Brief',
  description: 'Whole-animal luxury beef, delivered weekly to Houston\'s high-rise residents.',
  robots: { index: false, follow: false },
}

export default function PitchPage() {
  return <PitchDeck />
}
