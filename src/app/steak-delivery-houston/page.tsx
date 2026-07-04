import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { SITE } from '@/data/site'
import { PRODUCTS } from '@/data/products'
import styles from '../blog/blog.module.css'

const URL = `${SITE.url}/steak-delivery-houston`
// Curated steak lineup across both collections (this page is steak-focused SEO).
const STEAK_NAMES = ['Ribeye', 'New York Strip', 'Sirloin', 'Filet', 'Flank / Skirt', 'Round Steak / Cutlets']
const steaks = STEAK_NAMES
  .map(n => PRODUCTS.find(p => p.name === n))
  .filter((p): p is (typeof PRODUCTS)[number] => !!p && p.available)

export const metadata: Metadata = {
  title: 'Steak Delivery in Houston — Local Beef, Priced by the Pound',
  description:
    'Fresh steak delivered weekly in Houston. Bone-in ribeye, New York strip, filet, sirloin, flank and skirt — local beef priced by the pound, delivered to your door every Saturday. Cancel anytime.',
  keywords: [
    'steak delivery Houston',
    'ribeye delivery Houston',
    'New York strip Houston',
    'filet delivery Houston',
    'local steak Houston',
    'steak near me Houston',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Steak Delivery in Houston — Local Beef, Priced by the Pound',
    description:
      'Fresh local steak delivered weekly across Houston. Priced by the pound, delivered every Saturday.',
    url: URL,
    type: 'website',
    images: [{ url: `${SITE.url}/ribeye-raw.jpg` }],
  },
}

const FAQS = [
  {
    q: 'How does steak delivery in Houston work?',
    a: 'Pick your steaks and how many pounds of each you want, and we deliver fresh, vacuum-sealed local beef to your door every Saturday. You’re billed weekly by the pound and can pause or cancel anytime.',
  },
  {
    q: 'Which steaks can I get delivered?',
    a: 'Bone-in ribeye, New York strip, filet, sirloin, and flank / skirt steak — all local beef, priced by the pound.',
  },
  {
    q: 'Where in Houston do you deliver?',
    a: 'Across Houston, including Upper Kirby, River Oaks, Montrose, Downtown, Uptown / Galleria, the Heights, and Midtown. Delivery is every Saturday.',
  },
  {
    q: 'Is there a minimum or a contract?',
    a: 'No contract and no oversized boxes. You set the pounds each week and can cancel anytime.',
  },
]

export default function SteakDeliveryHouston() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Steak delivery in Houston',
        serviceType: 'Local steak delivery',
        provider: { '@id': `${SITE.url}/#organization` },
        areaServed: SITE.areasServed.map(name => ({ '@type': 'City', name })),
        description: 'Fresh local steak delivered weekly across Houston, priced by the pound.',
        offers: steaks.map(s => ({
          '@type': 'Offer',
          name: s.name,
          priceCurrency: 'USD',
          price: s.pricePerLb.toFixed(2),
          availability: 'https://schema.org/InStock',
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Steak Delivery Houston', item: URL },
        ],
      },
    ],
  }

  return (
    <>
      <Nav step={1} hideSteps />
      <main className={styles.page}>
        <div className={styles.container}>
          <Link href="/" className={styles.back}>← Back to Home</Link>
          <div className={styles.eyebrow}>Houston · Local Beef</div>
          <h1 className={styles.title}>Steak delivery in Houston</h1>
          <p className={styles.indexLead}>
            Fresh, local steak — bone-in ribeye, New York strip, filet, sirloin, flank and skirt —
            delivered to your door every Saturday. Priced by the pound, no oversized boxes, cancel anytime.
          </p>
          <img className={styles.heroImg} src="/ribeye-raw.jpg"
            alt="Local bone-in ribeye for weekly steak delivery in Houston" />

          <div className={styles.prose}>
            <h2>Steaks we deliver, priced by the pound</h2>
            <table>
              <thead>
                <tr><th>Cut</th><th>Best for</th><th>Price</th></tr>
              </thead>
              <tbody>
                {steaks.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.detail}</td>
                    <td>${s.pricePerLb.toFixed(2)}/lb</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Why order steak by the pound?</h2>
            <p>
              Most delivery services lock you into fixed boxes. We don&apos;t. You choose exactly
              which steaks and how many pounds you want each week, and the price calculates
              instantly. It&apos;s local beef from partner ranches, processed in USDA-inspected
              facilities, vacuum-sealed and delivered cold — without the grocery run.
            </p>

            <h2>How it works</h2>
            <ul>
              <li>Pick your delivery location in Houston.</li>
              <li>Choose your steaks and pounds-per-week.</li>
              <li>We deliver every Saturday. Cancel anytime.</li>
            </ul>

            <h2>Where we deliver</h2>
            <p>
              {SITE.areasServed.join(' · ')}. New to weekly beef? Start with our guide to{' '}
              <Link href="/blog/how-much-beef-per-week-family">how much beef a household needs per week</Link>,
              or learn <Link href="/blog/beef-cuts-explained">which cut suits which meal</Link>.
            </p>

            <h2>Steak delivery FAQ</h2>
            {FAQS.map(f => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>

          <div className={styles.cta}>
            <div className={styles.ctaTitle}>Get steak delivered this Saturday</div>
            <div className={styles.ctaText}>Pick your cuts, set your pounds, and we handle the rest.</div>
            <Link href="/" className={styles.ctaBtn}>Start your weekly order →</Link>
          </div>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
