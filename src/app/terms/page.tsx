import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from '../legal.module.css'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Automatic Cow weekly USDA Prime beef membership in Houston.',
  alternates: { canonical: 'https://automaticcow.com/terms' },
}

export default function TermsPage() {
  return (
    <>
      <Nav step={1} hideSteps />
      <main className={styles.page}>
        <div className={styles.inner}>
          <Link href="/" className={styles.backBtn}>← Back to Home</Link>
          <h1 className={styles.title}>Terms of <em>Service</em></h1>
          <p className={styles.updated}>Last updated: April 2026</p>

          <section className={styles.section}>
            <h2>1. Membership & Eligibility</h2>
            <p>Automatic Cow memberships are available exclusively to verified residents of partner apartment communities in Houston, Texas. By subscribing, you confirm that you are a current resident of a listed property and are at least 18 years of age.</p>
          </section>

          <section className={styles.section}>
            <h2>2. Weekly Subscription</h2>
            <p>Your subscription is billed weekly every Saturday. Your selected cut will be delivered to your building concierge on the same day. Pricing is fixed for the duration of your subscription cycle and may be updated with 14 days' notice.</p>
          </section>

          <section className={styles.section}>
            <h2>3. Cancellation</h2>
            <p>You may cancel your subscription at any time from your member dashboard. Cancellations made before Thursday midnight take effect the following Saturday. Cancellations made after Thursday midnight apply to the week after that.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Delivery</h2>
            <p>Deliveries are coordinated with your building's concierge or front desk. Automatic Cow is not responsible for missed deliveries due to building access issues, incorrect unit information, or concierge unavailability. All products are vacuum-sealed and packed with dry ice to remain food-safe for a minimum of 4 hours after delivery.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Product Quality</h2>
            <p>All cuts are USDA Prime grade, sourced from licensed, inspected U.S. suppliers. If you receive a product that does not meet quality standards, contact us within 24 hours of delivery for a full replacement or credit.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Payments</h2>
            <p>Payments are processed securely via Stripe. Automatic Cow does not store your card information. By subscribing, you authorize recurring weekly charges to your payment method until you cancel.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes are posted constitutes acceptance of the new terms.</p>
          </section>

          <section className={styles.section}>
            <h2>8. Contact</h2>
            <p>Questions? Email us at <a href="mailto:beef@automaticcow.com">beef@automaticcow.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
