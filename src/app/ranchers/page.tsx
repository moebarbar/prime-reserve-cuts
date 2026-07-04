import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import RancherInquiryForm from './RancherInquiryForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'For Ranchers — More Than a Buyer. A Long-Term Partner.',
  description: 'Sell your beef directly to Houston tables. We partner with small-batch local ranches across Texas, Oklahoma, and the Midwest and pay what your cattle are worth.',
  keywords: [
    'sell beef direct to consumer',
    'cattle rancher partnership Texas',
    'local ranch sourcing',
    'small-batch beef wholesale',
    'beef DTC distribution Houston',
    'ranch to table Houston',
  ],
  alternates: { canonical: 'https://automaticcow.com/ranchers' },
  openGraph: {
    title: 'For Ranchers — More Than a Buyer. A Long-Term Partner.',
    description: 'Direct distribution from your ranch to Houston\'s luxury tables. Apply to partner with Automatic Cow.',
    url: 'https://automaticcow.com/ranchers',
    type: 'website',
  },
}

const DIFFERENTIATORS = [
  {
    icon: '◈',
    title: 'Predictable Weekly Revenue',
    body: 'Our members commit to recurring weekly orders. That means a steady, predictable demand signal — not the boom-and-bust of spot markets.',
  },
  {
    icon: '✦',
    title: 'Your Name. Your Story.',
    body: 'When residents ask where their steak came from, we tell them. Your ranch, your breed, your practices — attribution your wholesaler will never give you.',
  },
  {
    icon: '◎',
    title: 'We Handle Everything Downstream',
    body: 'Logistics, customer service, billing, marketing — we own the consumer relationship so you can stay focused on the cattle.',
  },
]

const LOOKING_FOR = [
  'Small-batch ranches raising USDA Choice or higher',
  'Grass-finished, regenerative, or heritage-breed operations',
  'Texas, Oklahoma, or Louisiana preferred (proximity matters for cold chain)',
  'Capacity for 50+ subprimals per week, scaling',
  'A clear processing partner already in place',
]

export default function RanchersPage() {
  return (
    <>
      <Nav step={1} hideSteps />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>For Ranchers &amp; Cattle Producers</div>
          <h1 className={styles.heroTitle}>
            More than a buyer.<br />
            <em>A long-term partner<br />for your ranch.</em>
          </h1>
          <p className={styles.heroBody}>
            We bring your beef directly to Houston&apos;s most demanding tables — luxury high-rises,
            penthouses, weekly ritual diners. Not a wholesale invoice. A relationship, with your name on every box.
          </p>
          <a href="#apply" className={styles.heroCta}>Apply to Partner →</a>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className={styles.benefits}>
        <div className={styles.benefitsInner}>
          <h2 className={styles.sectionHeading}>
            Why ranchers<br /><em>choose us over wholesale.</em>
          </h2>
          <div className={styles.benefitsGrid}>
            {DIFFERENTIATORS.map(b => (
              <div key={b.title} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{b.icon}</div>
                <div className={styles.benefitTitle}>{b.title}</div>
                <div className={styles.benefitBody}>{b.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE / DIVIDER */}
      <section className={styles.quote}>
        <div className={styles.quoteInner}>
          <blockquote className={styles.quoteText}>
            &ldquo;The best beef comes from people, not factories.<br />
            <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>So we built a market that pays for that.</span>&rdquo;
          </blockquote>
        </div>
      </section>

      {/* WHO WE'RE LOOKING FOR */}
      <section className={styles.how}>
        <div className={styles.howInner}>
          <h2 className={styles.sectionHeading}>
            Who we&apos;re<br /><em>looking for.</em>
          </h2>
          <ul className={styles.criteriaList}>
            {LOOKING_FOR.map((line, i) => (
              <li key={i}>
                <span className={styles.criteriaNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.criteriaText}>{line}</span>
              </li>
            ))}
          </ul>
          <p className={styles.criteriaNote}>
            Don&apos;t fit every line? Apply anyway. We&apos;re always open to ranches doing something exceptional.
          </p>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className={styles.formSec} id="apply">
        <div className={styles.formInner}>
          <div className={styles.formLeft}>
            <div className={styles.eyebrow}>Apply to Partner</div>
            <h2 className={styles.formHeading}>
              Tell us<br /><em>about your ranch.</em>
            </h2>
            <p className={styles.formBody}>
              Share what makes your operation different. We read every application personally — no bots,
              no auto-replies. If we&apos;re a fit, we&apos;ll be in touch within a few business days to set up a call.
            </p>
            <ul className={styles.formList}>
              <li>Personal review by a founder</li>
              <li>Direct call if we&apos;re a fit</li>
              <li>Transparent terms, no exclusivity required</li>
              <li>Pilot run before any commitment</li>
            </ul>
          </div>
          <RancherInquiryForm />
        </div>
      </section>

      <Footer />
    </>
  )
}
