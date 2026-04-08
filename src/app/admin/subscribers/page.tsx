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

const CUT_PRICES: Record<string, number> = { Ribeye: 89, 'Filet Mignon': 119, 'A5 Wagyu': 189, Tomahawk: 229 }

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SubscribersPage() {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'active' | 'paused' | 'all'>('active')
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const activeOrders    = orders.filter(o => o.status === 'active')
  const pausedOrders    = orders.filter(o => o.status === 'paused')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')
  const mrr             = activeOrders.reduce((s, o) => s + o.price, 0)
  const arr             = mrr * 12
  const churnRate       = orders.length > 0 ? Math.round((cancelledOrders.length / orders.length) * 100) : 0

  const displayed = orders.filter(o => {
    if (tab === 'active' && o.status !== 'active') return false
    if (tab === 'paused' && o.status !== 'paused') return false
    const q = search.toLowerCase()
    return !q || o.customer.toLowerCase().includes(q) || o.building.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)
  })

  const updateStatus = async (id: string, status: OrderStatus) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  // revenue by cut
  const cutBreakdown = Object.entries(CUT_PRICES).map(([cut, price]) => {
    const subs = activeOrders.filter(o => o.cut === cut)
    return { cut, count: subs.length, rev: subs.length * price }
  })

  // revenue by building
  const buildingMap: Record<string, number> = {}
  activeOrders.forEach(o => { buildingMap[o.building] = (buildingMap[o.building] || 0) + o.price })
  const buildingBreakdown = Object.entries(buildingMap).sort((a, b) => b[1] - a[1])

  return (
    <>
      {/* KPI STATS */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Monthly Recurring Revenue</div>
          <div className="stat-value gold">${mrr.toLocaleString()}</div>
          <div className="stat-sub"><span className="up">↑ 12%</span> vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Annual Run Rate</div>
          <div className="stat-value">${arr.toLocaleString()}</div>
          <div className="stat-sub">Projected ARR</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Active Subscribers</div>
          <div className="stat-value">{activeOrders.length}</div>
          <div className="stat-sub">{pausedOrders.length} paused</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Churn Rate</div>
          <div className="stat-value" style={{ color: churnRate > 10 ? '#e05c4d' : 'var(--cream)' }}>{churnRate}%</div>
          <div className="stat-sub">{cancelledOrders.length} cancelled</div>
        </div>
      </div>

      {/* BREAKDOWN CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="table-wrap" style={{ marginBottom: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Revenue by Cut</div>
          <table className="adm" style={{ minWidth: 0 }}>
            <thead><tr><th>Cut</th><th>Subscribers</th><th>Revenue / mo</th></tr></thead>
            <tbody>
              {cutBreakdown.map(({ cut, count, rev }) => (
                <tr key={cut}>
                  <td>{cut}</td>
                  <td className="td-dim">{count}</td>
                  <td style={{ color: 'var(--gold2)', fontFamily: 'Cormorant, serif', fontSize: 16 }}>${rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrap" style={{ marginBottom: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Revenue by Building</div>
          <table className="adm" style={{ minWidth: 0 }}>
            <thead><tr><th>Building</th><th>Revenue / mo</th></tr></thead>
            <tbody>
              {buildingBreakdown.length === 0 ? (
                <tr><td colSpan={2} className="td-dim" style={{ textAlign: 'center', padding: 20 }}>No data</td></tr>
              ) : buildingBreakdown.map(([bld, rev]) => (
                <tr key={bld}>
                  <td style={{ whiteSpace: 'normal', lineHeight: 1.4, fontSize: 11 }}>{bld}</td>
                  <td style={{ color: 'var(--gold2)', fontFamily: 'Cormorant, serif', fontSize: 16 }}>${rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUBSCRIBER LIST */}
      <div className="sec-head">
        <h2 className="sec-title">Subscriber <em>List</em></h2>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)' }}>
          {(['active', 'paused', 'all'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? 'rgba(184,134,58,0.12)' : 'var(--panel)',
                border: 'none',
                borderRight: t !== 'all' ? '1px solid var(--border)' : 'none',
                color: tab === t ? 'var(--gold)' : 'var(--muted)',
                fontFamily: 'Jost, sans-serif',
                fontSize: 10, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', padding: '9px 16px', cursor: 'pointer',
              }}
            >
              {t === 'active' ? `Active (${activeOrders.length})` : t === 'paused' ? `Paused (${pausedOrders.length})` : 'All'}
            </button>
          ))}
        </div>
        <input
          className="filter-search"
          placeholder="Search subscribers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap scrollable">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⋯</div>
            <strong>Loading subscribers…</strong>
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◉</div>
            <strong>No subscribers</strong>
            <p>Try switching tabs or clearing search.</p>
          </div>
        ) : (
          <table className="adm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Building</th>
                <th>Cut</th>
                <th>$/mo</th>
                <th>Since</th>
                <th>Next Delivery</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(o => (
                <>
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="td-mono">{o.id.slice(0, 8)}</td>
                    <td>
                      <div style={{ fontWeight: 400 }}>{o.customer}</div>
                      <div className="td-dim">{o.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 11 }}>{o.building}</div>
                      <div className="td-dim">Unit {o.unit}</div>
                    </td>
                    <td>{o.cut}</td>
                    <td style={{ fontFamily: 'Cormorant, serif', fontSize: 17, color: 'var(--gold2)' }}>${o.price}</td>
                    <td className="td-dim">{fmtDate(o.start_date)}</td>
                    <td className="td-dim">{fmtDate(o.next_delivery)}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="act-row">
                        {o.status === 'paused' && (
                          <button className="btn-icon" title="Resume" onClick={() => updateStatus(o.id, 'active')}>▶</button>
                        )}
                        {o.status === 'active' && (
                          <button className="btn-icon" title="Pause" onClick={() => updateStatus(o.id, 'paused')}>⏸</button>
                        )}
                        <button className="btn-icon" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                          {expanded === o.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-x`} className="detail-row">
                      <td colSpan={9}>
                        <div className="detail-box">
                          <div className="detail-item"><label>Email</label><span>{o.email}</span></div>
                          <div className="detail-item"><label>Building</label><span>{o.building}</span></div>
                          <div className="detail-item"><label>Unit</label><span>{o.unit}</span></div>
                          <div className="detail-item"><label>Cut</label><span>{o.cut}</span></div>
                          <div className="detail-item"><label>Price</label><span>${o.price}/mo</span></div>
                          <div className="detail-item"><label>Member Since</label><span>{fmtDate(o.start_date)}</span></div>
                          <div className="detail-item"><label>Next Delivery</label><span>{fmtDate(o.next_delivery)}</span></div>
                          <div className="detail-item"><label>Lifetime Value</label><span style={{ color: 'var(--gold)' }}>
                            {o.start_date
                              ? `$${Math.round(o.price * ((Date.now() - new Date(o.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)))}`
                              : '—'}
                          </span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          {o.status === 'paused' && (
                            <button className="btn-gold" style={{ fontSize: 9, padding: '8px 14px' }} onClick={() => updateStatus(o.id, 'active')}>
                              ▶ Resume Subscription
                            </button>
                          )}
                          {o.status === 'active' && (
                            <button className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px' }} onClick={() => updateStatus(o.id, 'paused')}>
                              ⏸ Pause Subscription
                            </button>
                          )}
                          {o.status !== 'cancelled' && (
                            <button className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px', borderColor: 'rgba(192,57,43,0.4)', color: '#e05c4d' }}
                              onClick={() => { if (confirm('Cancel this subscription?')) updateStatus(o.id, 'cancelled') }}>
                              ✕ Cancel
                            </button>
                          )}
                          <a href={`mailto:${o.email}`} className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px', textDecoration: 'none' }}>
                            ✉ Email
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
    </>
  )
}
