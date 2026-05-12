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
          ].map(b => (
            <div key={b.label} className={styles.badge}>
              <div className={styles.badgeIcon}>{b.icon}</div>
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
              src="/logo.png?v=3"
              alt="Automatic Cow"
              height={24}
              style={{ height: 24, width: 'auto', opacity: 0.5 }}
            />
            <div className={styles.brandText}>
              <span className={styles.brandName}>Automatic Cow</span>
              <span className={styles.brandSlogan}>Good Food. From Now On.</span>
            </div>
          </div>

          <nav className={styles.links}>
            <Link href="/our-story">Our Story</Link>
            <Link href="/partners">For Property Managers</Link>
            <Link href="/ranchers">For Ranchers</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <a href="mailto:beef@automaticcow.com">Contact</a>
          </nav>

          <div className={styles.copy}>
            © {new Date().getFullYear()} Automatic Cow · Houston, TX
          </div>
        </div>

        <div className={styles.credit}>
          Website designed, developed &amp; managed by{' '}
          <a
            href="https://moebarbar.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditLink}
          >
            Moe Barbar
          </a>
        </div>

      </div>
    </footer>
  )
}
