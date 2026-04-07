'use client'

import { usePathname, useRouter } from 'next/navigation'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

const NAV = [
  { href: '/admin',             icon: '◈',  label: 'Overview' },
  { href: '/admin/leads',       icon: '◎',  label: 'Leads' },
  { href: '/admin/orders',      icon: '▤',  label: 'Orders' },
  { href: '/admin/subscribers', icon: '◉',  label: 'Subscribers' },
  { href: '/admin/products',    icon: '◧',  label: 'Products' },
]

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const go = (href: string) => {
    router.push(href)
    onClose()
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="admin-logo">
          <div className="admin-logo-name">🐄 Automatic <span>Cow</span></div>
          <div className="admin-logo-tag">Admin Console</div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          <div className="admin-nav-section">Main</div>
          {NAV.map(item => (
            <button
              key={item.href}
              className={`admin-nav-link${isActive(item.href) ? ' active' : ''}`}
              onClick={() => go(item.href)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-nav-foot">
          <button className="admin-nav-link" onClick={() => go('/')} style={{ padding: '8px 0', borderLeft: 'none' }}>
            <span className="admin-nav-icon">←</span>
            Back to Site
          </button>
        </div>
      </aside>
    </>
  )
}
