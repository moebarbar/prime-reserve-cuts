'use client'

import { usePathname, useRouter } from 'next/navigation'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

function getNextSaturday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const diff = (6 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d
}

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/admin',             icon: '◈',  label: 'Overview' },
      { href: '/admin/leads',       icon: '◎',  label: 'Leads' },
      { href: '/admin/orders',      icon: '▤',  label: 'Orders' },
      { href: '/admin/subscribers', icon: '◉',  label: 'Subscribers' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/deliveries', icon: '🚚', label: 'Deliveries' },
      { href: '/admin/buildings',  icon: '🏢', label: 'Buildings' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', icon: '◧', label: 'Products' },
    ],
  },
  {
    label: 'Inquiries',
    items: [
      { href: '/admin/partners', icon: '🤝', label: 'Partner Inquiries' },
      { href: '/admin/ranchers', icon: '🐄', label: 'Rancher Applications' },
    ],
  },
]

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const saturday = getNextSaturday()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((saturday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const go = (href: string) => {
    router.push(href)
    onClose()
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="admin-logo">
          <div className="admin-logo-name">Automatic <span>Cow</span></div>
          <div className="admin-logo-tag">Admin Console · Houston TX</div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="admin-nav-section">{section.label}</div>
              {section.items.map(item => (
                <button
                  key={item.href}
                  className={`admin-nav-link${isActive(item.href) ? ' active' : ''}`}
                  onClick={() => go(item.href)}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.href === '/admin/deliveries' && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 7.5,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      background: daysLeft <= 2 ? 'rgba(184,134,58,0.25)' : 'rgba(244,239,230,0.07)',
                      color: daysLeft <= 2 ? 'var(--gold)' : 'var(--muted)',
                      padding: '2px 6px',
                      borderRadius: 2,
                      border: `1px solid ${daysLeft <= 2 ? 'rgba(184,134,58,0.35)' : 'var(--border)'}`,
                      flexShrink: 0,
                    }}>
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `Sat`}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-nav-foot">
          <button
            className="admin-nav-link"
            onClick={() => go('/')}
            style={{ padding: '8px 0', borderLeft: 'none', marginBottom: 4 }}
          >
            <span className="admin-nav-icon">←</span>
            Back to Site
          </button>
          <button
            className="admin-nav-link"
            onClick={logout}
            style={{ padding: '8px 0', borderLeft: 'none', marginBottom: 8, color: 'rgba(192,57,43,0.7)' }}
          >
            <span className="admin-nav-icon">⎋</span>
            Sign Out
          </button>
          <div style={{
            fontSize: 9, color: 'var(--muted)', paddingTop: 10,
            borderTop: '1px solid var(--border)',
            lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 2 }}>
              Next Delivery
            </div>
            <div style={{ color: daysLeft <= 2 ? 'var(--gold)' : 'var(--cream)', fontFamily: 'Cormorant, serif', fontSize: 15 }}>
              {saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' '}
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: 'var(--muted)' }}>
                {daysLeft === 0 ? '· Today' : daysLeft === 1 ? '· Tomorrow' : `· ${daysLeft} days`}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
