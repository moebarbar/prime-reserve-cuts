// TODO: On successful payment, POST { username, password, buildingKey, cutName, unit, email }
// to /api/create-member — this endpoint will create the Supabase user + subscription record.
// Dashboard route will be /dashboard — build in next sprint.

import Link from 'next/link'
import Nav from '@/components/Nav'
import styles from './page.module.css'

export default function OurStoryPage() {
  return (
    <>
      <Nav step={1} hideSteps />

      {/* SECTION 1 — Opening */}
      <section className={styles.opening}>
        <div className={styles.openingInner}>
          <h1 className={styles.openingHeadline}>
            We didn&apos;t start<br />with a restaurant.<br />
            <em>We started with<br />a Saturday.</em>
          </h1>
          <p className={styles.openingBody}>
            Someone asked us once why the best steak in Houston always required a reservation,
            a drive, a table, and a bill that made you think twice. We didn&apos;t have a good answer.
            So instead of answering, we built something. Prime Reserve is the result of a simple
            belief: the finest cut of meat you&apos;ve ever had should arrive at your door —
            not the other way around.
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
                title: 'Choose Your Cut',
                desc: 'NY Strip. Tenderloin. Ribeye. Three cuts, sourced from the best ranches. Pick the one that\'s yours.',
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
        </div>
      </section>
    </>
  )
}
