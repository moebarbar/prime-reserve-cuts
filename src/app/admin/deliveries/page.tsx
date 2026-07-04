'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: string
  customer: string
  email: string
  building: string
  unit: string
  cut: string
  price: number
  status: string
  kind?: 'subscription' | 'one_time'
  next_delivery: string | null
}

function getNextSaturday(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = (6 - day + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtSat(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const CUT_ICONS: Record<string, string> = {
  'Ribeye':       '🥩',
  'NY Strip':     '🔪',
  'Filet Mignon': '✦',
  'Tenderloin':   '✦',
  'A5 Wagyu':     '⭐',
  'Tomahawk':     '🪓',
}

export default function DeliveriesPage() {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [checked, setChecked]   = useState<Record<string, boolean>>({})
  const [filter, setFilter]     = useState('all')
  const saturday = getNextSaturday()
  const daysLeft = Math.ceil((saturday.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then((data: Order[]) => {
        // Subscriptions: every active order delivers each Saturday.
        // One-time orders: only until their single delivery date passes
        // (the API marks them 'completed' after that).
        const sat = getNextSaturday()
        setOrders(data.filter(o =>
          o.status === 'active' &&
          (o.kind !== 'one_time' || !o.next_delivery || new Date(o.next_delivery) <= sat)
        ))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggle = (id: string) => setChecked(c => ({ ...c, [id]: !c[id] }))
  const checkAll = (ids: string[]) => {
    const allDone = ids.every(id => checked[id])
    setChecked(c => {
      const next = { ...c }
      ids.forEach(id => { next[id] = !allDone })
      return next
    })
  }

  // Group by building
  const byBuilding: Record<string, Order[]> = {}
  orders.forEach(o => {
    if (!byBuilding[o.building]) byBuilding[o.building] = []
    byBuilding[o.building].push(o)
  })
  // Sort units within each building numerically
  Object.values(byBuilding).forEach(list =>
    list.sort((a, b) => {
      const an = parseInt(a.unit) || 0
      const bn = parseInt(b.unit) || 0
      return an - bn
    })
  )

  // Cut summary
  const cutSummary: Record<string, number> = {}
  orders.forEach(o => { cutSummary[o.cut] = (cutSummary[o.cut] || 0) + 1 })

  const delivered = Object.values(checked).filter(Boolean).length
  const total = orders.length

  const displayedBuildings = filter === 'all'
    ? Object.entries(byBuilding)
    : Object.entries(byBuilding).filter(([b]) => b === filter)

  return (
    <>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="stat-eyebrow" style={{ marginBottom: 6 }}>Delivery Manifest</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 28, fontWeight: 300, color: 'var(--cream)', lineHeight: 1 }}>
            {fmtSat(saturday)}
          </h2>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
            {daysLeft === 1 ? 'Tomorrow' : daysLeft === 0 ? 'Today!' : `In ${daysLeft} days`}
            {' · '}{total} deliveries across {Object.keys(byBuilding).length} buildings
          </div>
        </div>
        <button className="btn-ghost" onClick={() => window.print()} style={{ gap: 7 }}>
          ⎙ Print Manifest
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Total Deliveries</div>
          <div className="stat-value gold">{total}</div>
          <div className="stat-sub">{Object.keys(byBuilding).length} buildings</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Checked Off</div>
          <div className="stat-value" style={{ color: delivered === total && total > 0 ? '#4db376' : 'var(--cream)' }}>
            {delivered}
          </div>
          <div className="stat-sub">{total - delivered} remaining</div>
        </div>
        {Object.entries(cutSummary).map(([cut, count]) => (
          <div key={cut} className="stat-card" style={{ padding: '14px 18px' }}>
            <div className="stat-eyebrow">{cut}</div>
            <div className="stat-value" style={{ fontSize: 30 }}>{count}</div>
            <div className="stat-sub">{CUT_ICONS[cut] ?? '◆'} units</div>
          </div>
        ))}
      </div>

      {/* PROGRESS BAR */}
      {total > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <span>Delivery Progress</span>
            <span>{Math.round((delivered / total) * 100)}%</span>
          </div>
          <div style={{ height: 3, background: 'var(--border)', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${(delivered / total) * 100}%`,
              background: 'var(--gold)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* BUILDING FILTER */}
      <div className="filter-bar">
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Buildings</option>
          {Object.keys(byBuilding).map(b => (
            <option key={b} value={b}>{b} ({byBuilding[b].length})</option>
          ))}
        </select>
        {delivered > 0 && (
          <button className="btn-ghost" onClick={() => setChecked({})}>
            Reset Checkoffs
          </button>
        )}
      </div>

      {/* MANIFEST */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⋯</div>
          <strong>Loading manifest…</strong>
        </div>
      ) : total === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <strong>No active orders</strong>
          <p>All deliveries have been cancelled or paused.</p>
        </div>
      ) : (
        displayedBuildings.map(([building, bOrders]) => {
          const bIds = bOrders.map(o => o.id)
          const bDone = bIds.filter(id => checked[id]).length
          const allBDone = bDone === bIds.length
          return (
            <div key={building} className="delivery-building" style={{ marginBottom: 20 }}>
              <div className="delivery-bld-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: allBDone ? '#4db376' : 'var(--gold)', boxShadow: allBDone ? '0 0 8px rgba(77,179,118,0.5)' : '0 0 8px rgba(184,134,58,0.4)', flexShrink: 0 }} />
                  <div>
                    <div className="delivery-bld-name">{building}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{bOrders.length} unit{bOrders.length !== 1 ? 's' : ''} · {bDone} checked off</div>
                  </div>
                </div>
                <button
                  className={allBDone ? 'btn-gold' : 'btn-ghost'}
                  style={{ fontSize: 9, padding: '7px 14px' }}
                  onClick={() => checkAll(bIds)}
                >
                  {allBDone ? '✓ All Done' : 'Check All'}
                </button>
              </div>

              <div className="table-wrap scrollable" style={{ marginBottom: 0 }}>
                <table className="adm">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>Done</th>
                      <th>Unit</th>
                      <th>Resident</th>
                      <th>Cut</th>
                      <th>Notes</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bOrders.map(o => (
                      <tr
                        key={o.id}
                        style={{
                          opacity: checked[o.id] ? 0.45 : 1,
                          transition: 'opacity 0.2s',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggle(o.id)}
                      >
                        <td onClick={e => e.stopPropagation()}>
                          <label className="delivery-check" onClick={() => toggle(o.id)}>
                            <input type="checkbox" checked={!!checked[o.id]} onChange={() => toggle(o.id)} />
                            <span className="delivery-check-box" />
                          </label>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, fontWeight: 300, color: 'var(--cream)' }}>
                            {o.unit}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 400 }}>
                            {o.customer}
                            {o.kind === 'one_time' && (
                              <span style={{ marginLeft: 7, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold2)', border: '1px solid rgba(184,134,58,0.4)', borderRadius: 4, padding: '1px 5px' }}>
                                One-time
                              </span>
                            )}
                          </div>
                          <div className="td-dim">{o.email}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: 15 }}>{CUT_ICONS[o.cut] ?? '◆'}</span>
                            <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 16, color: 'var(--cream)' }}>{o.cut}</span>
                          </div>
                        </td>
                        <td className="td-dim" style={{ fontSize: 11 }}>Vacuum-sealed · chilled</td>
                        <td onClick={e => e.stopPropagation()}>
                          <a href={`mailto:${o.email}`} className="btn-icon" title="Email" style={{ textDecoration: 'none' }}>✉</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          .admin-sidebar, .admin-topbar, .admin-hamburger,
          .filter-bar, .btn-ghost, .btn-gold, .btn-icon { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-content { padding: 0 !important; }
          body { background: white !important; color: black !important; }
          .delivery-building { break-inside: avoid; }
          .stat-grid { display: none; }
        }
      `}</style>
    </>
  )
}
