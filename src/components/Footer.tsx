import Link from 'next/link'
import styles from './footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* TRUST BADGES */}
        <div className={styles.badges}>
          {[
            { icon: '🏛️', label: 'USDA Prime', sub: 'Certified Grade' },
            { icon: '✅', label: 'USDA Inspected', sub: 'Est. Approved' },
            { icon: '🌡️', label: 'Cold Chain', sub: 'Maintained' },
            { icon: '🧪', label: 'Food Safety', sub: 'HACCP Compliant' },
            { icon: '🚫', label: 'No Hormones', sub: 'Added' },
            { icon: '🌿', label: 'Sustainably', sub: 'Sourced' },
          ].map(b => (
            <div key={b.label} className={styles.badge}>
              <span className={styles.badgeIcon}>{b.icon}</span>
              <div className={styles.badgeText}>
                <span className={styles.badgeLabel}>{b.label}</span>
                <span className={styles.badgeSub}>{b.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        {/* BOTTOM ROW */}
        <div className={styles.bottom}>
          <div className={styles.brand}>
            <img
              src="/logo.png"
              alt="Prime Reserve"
              height={24}
              style={{ height: 24, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.5 }}
            />
            <span className={styles.brandName}>Prime Reserve</span>
          </div>

          <nav className={styles.links}>
            <Link href="/our-story">Our Story</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <a href="mailto:hello@primereserve.co">Contact</a>
          </nav>

          <div className={styles.copy}>
            © {new Date().getFullYear()} Prime Reserve · Houston, TX
          </div>
        </div>

      </div>
    </footer>
  )
}
