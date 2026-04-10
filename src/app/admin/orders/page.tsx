'use client'

import { useState, useEffect } from 'react'

type OrderStatus = 'active' | 'paused' | 'cancelled' | 'pending'

interface Order {
  id: string
  customer: string
  email: string
  building: string
  unit: string
  cut: string
  price: number
  status: OrderStatus
  start_date: string | null
  next_delivery: string | null
  created_at: string
}

const STATUS_OPTS: OrderStatus[] = ['active', 'pending', 'paused', 'cancelled']

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function OrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchQ = !q || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.building.toLowerCase().includes(q)
    const matchS = statusF === 'all' || o.status === statusF
    return matchQ && matchS
  })

  const updateStatus = async (id: string, status: OrderStatus) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const updateDelivery = async (id: string, next_delivery: string) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, next_delivery } : o))
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ next_delivery }),
    })
  }

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Customer', 'Email', 'Building', 'Unit', 'Cut', 'Price', 'Status', 'Start Date', 'Next Delivery'],
      ...filtered.map(o => [
        o.id, o.customer, o.email, o.building, o.unit, o.cut, `$${o.price}`,
        o.status, fmtDate(o.start_date), fmtDate(o.next_delivery)
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeOrders = orders.filter(o => o.status === 'active')
  const mrr = activeOrders.reduce((s, o) => s + o.price, 0)

  return (
    <>
      {/* STATS */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Monthly Revenue</div>
          <div className="stat-value gold">${mrr.toLocaleString()}</div>
          <div className="stat-sub">From {activeOrders.length} active orders</div>
        </div>
        {STATUS_OPTS.map(s => (
          <div
            key={s}
            className={`stat-card${statusF === s ? ' gold-card' : ''}`}
            style={{ cursor: 'pointer', padding: '14px 16px' }}
            onClick={() => setStatusF(statusF === s ? 'all' : s)}
          >
            <div className="stat-eyebrow">{s}</div>
            <div className="stat-value" style={{ fontSize: 30 }}>{orders.filter(o => o.status === s).length}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <input
          className="filter-search"
          placeholder="Search by customer, building or order ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {(search || statusF !== 'all') && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setStatusF('all') }}>Clear</button>
        )}
        <button className="btn-ghost" onClick={exportCSV} style={{ marginLeft: 'auto' }}>
          ⬇ Export CSV
        </button>
      </div>

      {/* TABLE */}
      <div className="table-wrap scrollable">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⋯</div>
            <strong>Loading orders…</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">▤</div>
            <strong>No orders found</strong>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="adm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Building</th>
                <th>Cut</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>Next Delivery</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <>
                  <tr
                    key={o.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  >
                    <td className="td-mono">{o.id.slice(0, 8)}</td>
                    <td>
                      <div style={{ fontWeight: 400 }}>{o.customer}</div>
                      <div className="td-dim">{o.email}</div>
                    </td>
                    <td>
                      <div>{o.building}</div>
                      <div className="td-dim">Unit {o.unit}</div>
                    </td>
                    <td>{o.cut}</td>
                    <td style={{ fontFamily: 'Cormorant, serif', fontSize: 17, color: 'var(--gold2)' }}>${o.price}</td>
                    <td className="td-dim">{fmtDate(o.start_date)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="date"
                        className="date-inline"
                        value={o.next_delivery ? o.next_delivery.slice(0, 10) : ''}
                        onChange={e => updateDelivery(o.id, e.target.value)}
                        title="Edit next delivery date"
                      />
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className={`badge badge-${o.status} inline-sel`}
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value as OrderStatus)}
                      >
                        {STATUS_OPTS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="act-row">
                        <button className="btn-icon" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                          {expanded === o.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-detail`} className="detail-row">
                      <td colSpan={9}>
                        <div className="detail-box">
                          <div className="detail-item"><label>Customer</label><span>{o.customer}</span></div>
                          <div className="detail-item"><label>Email</label><span>{o.email}</span></div>
                          <div className="detail-item"><label>Building</label><span>{o.building}</span></div>
                          <div className="detail-item"><label>Unit</label><span>{o.unit}</span></div>
                          <div className="detail-item"><label>Cut</label><span>{o.cut}</span></div>
                          <div className="detail-item"><label>Monthly Price</label><span>${o.price}</span></div>
                          <div className="detail-item"><label>Start Date</label><span>{fmtDate(o.start_date)}</span></div>
                          <div className="detail-item"><label>Next Delivery</label><span>{fmtDate(o.next_delivery)}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          {o.status !== 'active' && (
                            <button className="btn-gold" style={{ fontSize: 9, padding: '8px 14px' }}
                              onClick={() => updateStatus(o.id, 'active')}>
                              ✓ Activate
                            </button>
                          )}
                          {o.status === 'active' && (
                            <button className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px' }}
                              onClick={() => updateStatus(o.id, 'paused')}>
                              ⏸ Pause
                            </button>
                          )}
                          {o.status !== 'cancelled' && (
                            <button className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px', borderColor: 'rgba(192,57,43,0.4)', color: '#e05c4d' }}
                              onClick={() => { if (confirm('Cancel this subscription?')) updateStatus(o.id, 'cancelled') }}>
                              ✕ Cancel
                            </button>
                          )}
                          <a href={`mailto:${o.email}`} className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px', textDecoration: 'none' }}>
                            ✉ Email Customer
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
        Showing {filtered.length} of {orders.length} orders
        {statusF === 'active' && ` · $${filtered.reduce((s,o) => s+o.price, 0)}/mo revenue`}
      </div>
    </>
  )
}
