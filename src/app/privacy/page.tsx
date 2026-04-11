import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from '../legal.module.css'

export const metadata = { title: 'Privacy Policy · Automatic Cow' }

export default function PrivacyPage() {
  return (
    <>
      <Nav step={1} hideSteps />
      <main className={styles.page}>
        <div className={styles.inner}>
          <Link href="/" className={styles.backBtn}>← Back to Home</Link>
          <h1 className={styles.title}>Privacy <em>Policy</em></h1>
          <p className={styles.updated}>Last updated: April 2026</p>

          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide when you sign up: your name, email address, phone number, building name, and unit number. We also collect payment information processed securely through Stripe — we never store your full card details.</p>
          </section>

          <section className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <p>Your information is used exclusively to deliver your subscription, coordinate with your building concierge, process your weekly payment, and communicate service updates. We do not sell or rent your personal data to any third parties.</p>
          </section>

          <section className={styles.section}>
            <h2>3. Delivery Coordination</h2>
            <p>We share your name and unit number with your building's concierge or front desk solely for the purpose of completing your delivery. No other personal information is shared.</p>
          </section>

          <section className={styles.section}>
            <h2>4. Data Storage</h2>
            <p>Your data is stored on secure, encrypted servers. We use industry-standard security measures to protect your personal information against unauthorized access, disclosure, or destruction.</p>
          </section>

          <section className={styles.section}>
            <h2>5. Cookies</h2>
            <p>We use minimal cookies to maintain your session and remember your building selection. We do not use third-party advertising cookies.</p>
          </section>

          <section className={styles.section}>
            <h2>6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. Account deletion requests are processed within 7 business days.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:beef@automaticcow.com">beef@automaticcow.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
