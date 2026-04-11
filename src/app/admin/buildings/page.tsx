'use client'

import { useState, useEffect } from 'react'
import { BUILDINGS } from '@/data/buildings'

interface Order {
  id: string
  building: string
  cut: string
  price: number
  status: string
}

interface BuildingStat {
  key: string
  name: string
  nbhd: string
  img: string
  active: number
  paused: number
  cancelled: number
  mrr: number
  topCut: string
  cuts: Record<string, number>
}

export default function BuildingsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then((data: Order[]) => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats: BuildingStat[] = BUILDINGS.map(b => {
    const bOrders = orders.filter(o => o.building === b.name)
    const active = bOrders.filter(o => o.status === 'active')
    const paused = bOrders.filter(o => o.status === 'paused').length
    const cancelled = bOrders.filter(o => o.status === 'cancelled').length
    const mrr = active.reduce((s, o) => s + o.price, 0)

    const cuts: Record<string, number> = {}
    active.forEach(o => { cuts[o.cut] = (cuts[o.cut] || 0) + 1 })
    const topCut = Object.entries(cuts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    return { key: b.key, name: b.name, nbhd: b.nbhd, img: b.img, active: active.length, paused, cancelled, mrr, topCut, cuts }
  }).sort((a, b) => b.mrr - a.mrr)

  const totalMrr    = stats.reduce((s, b) => s + b.mrr, 0)
  const totalActive = stats.reduce((s, b) => s + b.active, 0)
  const topBuilding = stats[0]

  return (
    <>
      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div className="stat-eyebrow" style={{ marginBottom: 6 }}>Property Network</div>
        <h2 style={{ fontFamily: 'Cormorant, serif', fontSize: 28, fontWeight: 300, color: 'var(--cream)' }}>
          Houston <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Buildings</em>
        </h2>
      </div>

      {/* OVERVIEW STATS */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Network MRR</div>
          <div className="stat-value gold">${totalMrr.toLocaleString()}</div>
          <div className="stat-sub">Across {stats.length} buildings</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Active Members</div>
          <div className="stat-value">{totalActive}</div>
          <div className="stat-sub">Across all properties</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Top Property</div>
          <div className="stat-value" style={{ fontSize: 18, paddingTop: 8, lineHeight: 1.3 }}>
            {loading ? '…' : topBuilding?.name ?? '—'}
          </div>
          <div className="stat-sub">${loading ? '—' : topBuilding?.mrr ?? 0}/mo</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Avg / Building</div>
          <div className="stat-value">${stats.length ? Math.round(totalMrr / stats.length) : 0}</div>
          <div className="stat-sub">Per month</div>
        </div>
      </div>

      {/* BUILDING CARDS */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⋯</div>
          <strong>Loading building data…</strong>
        </div>
      ) : (
        <div className="bld-admin-grid">
          {stats.map((b, i) => {
            const pct = totalMrr > 0 ? (b.mrr / totalMrr) * 100 : 0
            return (
              <div key={b.key} className="bld-admin-card">
                {/* RANK */}
                <div className="bld-admin-rank">
                  {i === 0 ? '★' : `#${i + 1}`}
                </div>

                {/* IMAGE */}
                <div className="bld-admin-img">
                  <img src={b.img} alt={b.name} onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
                  <div className="bld-admin-img-overlay" />
                  <div className="bld-admin-nbhd">{b.nbhd}</div>
                </div>

                {/* BODY */}
                <div className="bld-admin-body">
                  <div className="bld-admin-name">{b.name}</div>

                  {/* MRR BAR */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                      <span>Monthly Revenue</span>
                      <span style={{ color: 'var(--gold2)', fontFamily: 'Cormorant, serif', fontSize: 16 }}>${b.mrr}</span>
                    </div>
                    <div style={{ height: 2, background: 'var(--border)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{pct.toFixed(1)}% of network</div>
                  </div>

                  {/* MEMBER STATS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Active', value: b.active, color: '#4db376' },
                      { label: 'Paused', value: b.paused, color: 'var(--muted)' },
                      { label: 'Cancelled', value: b.cancelled, color: '#e05c4d' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ textAlign: 'center', padding: '8px 0', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                        <div style={{ fontFamily: 'Cormorant, serif', fontSize: 22, fontWeight: 300, color, lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 3 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CUT BREAKDOWN */}
                  {Object.keys(b.cuts).length > 0 && (
                    <div>
                      <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Cuts This Building</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {Object.entries(b.cuts).sort((a, b) => b[1] - a[1]).map(([cut, count]) => (
                          <span key={cut} style={{
                            fontSize: 9, padding: '3px 8px',
                            background: cut === b.topCut ? 'rgba(184,134,58,0.15)' : 'rgba(244,239,230,0.05)',
                            border: `1px solid ${cut === b.topCut ? 'rgba(184,134,58,0.35)' : 'var(--border)'}`,
                            color: cut === b.topCut ? 'var(--gold2)' : 'var(--muted)',
                            letterSpacing: '0.1em',
                          }}>
                            {cut} × {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {b.active === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 8 }}>No active subscribers yet</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
