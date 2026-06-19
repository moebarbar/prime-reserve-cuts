import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PartnerInquiryForm from './PartnerInquiryForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'For Property Managers — A Premium Amenity for Your Residents',
  description: 'Bring weekly USDA Prime beef delivery to your residents — steaks, brisket, ground beef, and more. A turnkey luxury amenity for Houston property managers, at zero cost to the building.',
  keywords: [
    'property manager amenity Houston',
    'luxury high-rise amenity',
    'resident retention amenity',
    'concierge beef delivery Houston',
    'building partnership food delivery',
  ],
  alternates: { canonical: 'https://automaticcow.com/partners' },
  openGraph: {
    title: 'For Property Managers — A Premium Amenity for Your Residents',
    description: 'Weekly USDA Prime beef delivery as a zero-cost luxury amenity for Houston high-rise buildings.',
    url: 'https://automaticcow.com/partners',
    type: 'website',
  },
}

const BENEFITS = [
  {
    icon: '◈',
    title: 'Zero Cost. Zero Effort.',
    body: 'No setup fees, no minimums, no logistics for your team. We coordinate directly with your concierge — every Saturday, like clockwork.',
  },
  {
    icon: '✦',
    title: 'A Tangible Resident Perk',
    body: 'Premium weekly steak delivery is the kind of amenity residents actually talk about — at lease renewals and on resident review sites.',
  },
  {
    icon: '◎',
    title: 'White-Glove Delivery',
    body: 'Vacuum-sealed, temperature-controlled, and dropped at your concierge. Our drivers know your building. Your front desk never has to.',
  },
]

const STEPS = [
  { num: '01', title: 'Sign the partnership',  body: 'A 5-minute agreement. No exclusivity. No commitment from your residents.' },
  { num: '02', title: 'We onboard residents',  body: 'You get a custom QR code for the lobby. We handle every conversation from there.' },
  { num: '03', title: 'Saturday deliveries begin', body: 'We coordinate directly with your concierge. Your team does nothing.' },
]

export default function PartnersPage() {
  return (
    <>
      <Nav step={1} hideSteps />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>For Property Managers</div>
          <h1 className={styles.heroTitle}>
            A premium amenity<br />
            <em>your residents will thank you for.</em>
          </h1>
          <p className={styles.heroBody}>
            USDA Prime steak. Delivered every Saturday. Directly to your concierge.
            We bring a turnkey luxury amenity to your building — at zero cost to you.
          </p>
          <a href="#inquiry" className={styles.heroCta}>Become a Partner Building →</a>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={styles.benefits}>
        <div className={styles.benefitsInner}>
          <h2 className={styles.sectionHeading}>
            Why luxury buildings<br /><em>partner with us.</em>
          </h2>
          <div className={styles.benefitsGrid}>
            {BENEFITS.map(b => (
              <div key={b.title} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{b.icon}</div>
                <div className={styles.benefitTitle}>{b.title}</div>
                <div className={styles.benefitBody}>{b.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how}>
        <div className={styles.howInner}>
          <h2 className={styles.sectionHeading}>
            Three steps.<br /><em>Then it just runs.</em>
          </h2>
          <div className={styles.stepsGrid}>
            {STEPS.map(s => (
              <div key={s.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepBody}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className={styles.proof}>
        <div className={styles.proofInner}>
          <div className={styles.proofLabel}>Already partnered with</div>
          <div className={styles.proofList}>
            Pearl 21Eleven
          </div>
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section className={styles.formSec} id="inquiry">
        <div className={styles.formInner}>
          <div className={styles.formLeft}>
            <div className={styles.eyebrow}>Get Started</div>
            <h2 className={styles.formHeading}>
              Bring it to<br /><em>your building.</em>
            </h2>
            <p className={styles.formBody}>
              Tell us about your property. We&apos;ll be in touch within one business day with everything
              you need to share with ownership — no calls, no pressure, just the details.
            </p>
            <ul className={styles.formList}>
              <li>One-page partnership agreement</li>
              <li>Custom lobby signage &amp; QR code</li>
              <li>Direct concierge coordination</li>
              <li>Quarterly resident-engagement report</li>
            </ul>
          </div>
          <PartnerInquiryForm />
        </div>
      </section>

      <Footer />
    </>
  )
}
