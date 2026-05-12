import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Our Story — How Automatic Cow Was Born',
  description: 'The story behind Houston\'s private USDA Prime beef membership — whole-animal access for residents who expect the best, delivered without effort.',
  alternates: { canonical: 'https://automaticcow.com/our-story' },
  openGraph: {
    title: 'Our Story — How Automatic Cow Was Born',
    description: 'Houston\'s private USDA Prime beef membership for luxury residents. Built for the whole week, delivered every Saturday.',
    url: 'https://automaticcow.com/our-story',
    type: 'article',
  },
}

export default function OurStoryPage() {
  return (
    <>
      <Nav step={1} hideSteps />

      {/* SECTION 1 — Opening */}
      <section className={styles.opening}>
        <div className={styles.openingInner}>
          <Link href="/" className={styles.backBtn}>← Back to Home</Link>
          <h1 className={styles.openingHeadline}>
            We didn&apos;t start<br />with a restaurant.<br />
            <em>We started with<br />a Saturday.</em>
          </h1>
          <p className={styles.openingBody}>
            Someone asked us once why the best steak in Houston always required a reservation,
            a drive, a table, and a bill that made you think twice. We didn&apos;t have a good answer.
            So instead of answering, we built something.
          </p>
          <p className={styles.openingBody} style={{ marginTop: '24px' }}>
            The name says it all: <strong style={{ color: 'var(--cream)', fontWeight: 400 }}>Automatic.</strong> You
            set it up once — your building, your cut, your unit — and it just runs. Every Saturday, without a
            reminder, without a reorder, without a second thought. The cow does its job. You do yours.
          </p>
          <p className={styles.openingBody} style={{ marginTop: '24px' }}>
            Automatic Cow is the result of a simple belief: the finest cut of meat you&apos;ve ever had
            should arrive at your door — not the other way around.
          </p>
        </div>
      </section>

      {/* SECTION 2 — How It Works */}
      <section className={styles.how}>
        <div className={styles.howInner}>
          <h2 className={styles.howHeading}>
            Three steps.<br /><em>Zero excuses.</em>
          </h2>

          <div className={styles.steps}>
            {[
              {
                num: '01',
                title: 'Pick Your Place',
                desc: 'Scan the QR code in your building lobby. Your property is already set up — no searching, no setup.',
              },
              {
                num: '02',
                title: 'Choose Your Category',
                desc: 'Steak. Slow Cook. Daily essentials. Three categories of USDA Prime beef — pick what fits your week.',
              },
              {
                num: '03',
                title: 'Every Saturday, Done.',
                desc: 'Your order arrives vacuum-sealed, chilled, and ready. Every Saturday. No reminders. No reordering. It just happens.',
              },
            ].map(step => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNumBg}>{step.num}</div>
                <div className={styles.stepContent}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Closing */}
      <section className={styles.closing}>
        <div className={styles.closingInner}>
          <blockquote className={styles.closingQuote}>
            &ldquo;The best meal of the week<br />
            shouldn&apos;t be the hardest one to get.&rdquo;
          </blockquote>
          <Link href="/" className={styles.btnCta}>
            Choose Your Building →
          </Link>
          <Link href="/" className={styles.backBtn}>← Back to Home</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
