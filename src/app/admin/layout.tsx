'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { usePathname } from 'next/navigation'
import './admin.css'

const PAGE_TITLES: Record<string, string> = {
  '/admin':              'Dashboard',
  '/admin/leads':        'Leads',
  '/admin/orders':       'Orders',
  '/admin/subscribers':  'Subscribers',
  '/admin/products':     'Products',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const rawTitle = PAGE_TITLES[pathname] ?? 'Admin'
  const [first, ...rest] = rawTitle.split(' ')

  return (
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="admin-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle sidebar"
            >☰</button>
            <h1 className="admin-topbar-title">
              {first} {rest.length > 0 && <em>{rest.join(' ')}</em>}
            </h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-live-dot">Live</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span>Houston, TX</span>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}
