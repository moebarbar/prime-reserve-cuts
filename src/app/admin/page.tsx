'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Lead {
  id: string; name: string; email: string; building: string
  unit: string; cut: string | null; status: string; created_at: string
}

interface Order {
  id: string; customer: string; email: string; building: string
  unit: string; cut: string; price: number; status: string; kind?: string
  next_delivery: string | null; created_at: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getNextSaturday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const diff = (6 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d
}

function FunnelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
      <div style={{ width: 80, fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0, textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: 'var(--border)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ width: 36, fontSize: 14, fontFamily: 'Cormorant, serif', fontWeight: 300, color: 'var(--cream)', textAlign: 'right', flexShrink: 0 }}>{value}</div>
      <div style={{ width: 38, fontSize: 9, color: 'var(--muted)', flexShrink: 0 }}>{pct.toFixed(0)}%</div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [leads, setLeads]   = useState<Lead[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(setLeads).catch(() => {})
    fetch('/api/orders').then(r => r.json()).then(setOrders).catch(() => {})
  }, [])

  const saturday = getNextSaturday()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((saturday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const activeOrders   = orders.filter(o => o.status === 'active')
  const pausedOrders   = orders.filter(o => o.status === 'paused')
  // Recurring revenue + member counts come from subscriptions only; one-time
  // orders are operational (they still get delivered) but aren't recurring.
  const activeSubs     = activeOrders.filter(o => (o.kind ?? 'subscription') === 'subscription')
  const oneTimeActive  = activeOrders.filter(o => o.kind === 'one_time')
  const mrr            = activeSubs.reduce((s, o) => s + o.price, 0)
  const arr            = mrr * 12  // monthly × 12
  const newLeads       = leads.filter(l => l.status === 'new').length
  const contactedLeads = leads.filter(l => l.status === 'contacted').length
  const convertedLeads = leads.filter(l => l.status === 'converted').length
  const lostLeads      = leads.filter(l => l.status === 'lost').length

  // Revenue by cut
  const cutRevenue: Record<string, { count: number; rev: number }> = {}
  activeSubs.forEach(o => {
    if (!cutRevenue[o.cut]) cutRevenue[o.cut] = { count: 0, rev: 0 }
    cutRevenue[o.cut].count++
    cutRevenue[o.cut].rev += o.price
  })
  const topCuts = Object.entries(cutRevenue).sort((a, b) => b[1].rev - a[1].rev)

  // Revenue by building (top 3)
  const bldRevenue: Record<string, number> = {}
  activeSubs.forEach(o => { bldRevenue[o.building] = (bldRevenue[o.building] || 0) + o.price })
  const topBuildings = Object.entries(bldRevenue).sort((a, b) => b[1] - a[1]).slice(0, 4)

  // Recent activity — combine leads + orders, sort by date
  const activity = [
    ...leads.slice(0, 6).map(l => ({ type: 'lead', name: l.name, sub: `${l.building} · Unit ${l.unit}`, date: l.created_at, status: l.status })),
    ...orders.slice(0, 6).map(o => ({ type: 'order', name: o.customer, sub: `${o.cut} · ${o.building}`, date: o.created_at, status: o.status })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)

  return (
    <>
      {/* TOP KPI STRIP */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Monthly Revenue</div>
          <div className="stat-value gold">${mrr.toLocaleString()}</div>
          <div className="stat-sub">
            <span className="up">↑</span> ${arr.toLocaleString()} ARR
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Active Members</div>
          <div className="stat-value">{activeSubs.length}</div>
          <div className="stat-sub">
            {pausedOrders.length} paused · {oneTimeActive.length} one-time
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Open Leads</div>
          <div className="stat-value">{newLeads + contactedLeads}</div>
          <div className="stat-sub">{leads.length} total · {convertedLeads} converted</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', borderColor: daysLeft <= 2 ? 'rgba(184,134,58,0.45)' : undefined }}
          onClick={() => router.push('/admin/deliveries')}>
          <div className="stat-eyebrow">Next Delivery</div>
          <div className="stat-value" style={{ fontSize: 32, color: daysLeft <= 2 ? 'var(--gold2)' : 'var(--cream)' }}>
            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
          </div>
          <div className="stat-sub">
            {saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {activeOrders.length} drops →
          </div>
        </div>
      </div>

      {/* TWO-COLUMN: FUNNEL + ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* CONVERSION FUNNEL */}
        <div className="table-wrap" style={{ marginBottom: 0, padding: '20px 22px' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.44em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Lead Pipeline</div>
            <div style={{ fontFamily: 'Cormorant, serif', fontSize: 20, fontWeight: 300, color: 'var(--cream)' }}>
              Conversion <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Funnel</em>
            </div>
          </div>
          <FunnelBar label="New"       value={newLeads}       total={leads.length} color="rgba(155,147,255,0.8)" />
          <FunnelBar label="Contacted" value={contactedLeads} total={leads.length} color="var(--gold)" />
          <FunnelBar label="Converted" value={convertedLeads} total={leads.length} color="#4db376" />
          <FunnelBar label="Lost"      value={lostLeads}      total={leads.length} color="#e05c4d" />
          <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(58,138,90,0.07)', border: '1px solid rgba(58,138,90,0.18)' }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 }}>Conversion Rate</div>
            <div style={{ fontFamily: 'Cormorant, serif', fontSize: 28, color: '#4db376', fontWeight: 300 }}>
              {leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : '0.0'}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
              {convertedLeads} converted of {leads.length} total leads
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="table-wrap" style={{ marginBottom: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.44em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Live Feed</div>
            <div style={{ fontFamily: 'Cormorant, serif', fontSize: 20, fontWeight: 300, color: 'var(--cream)' }}>
              Recent <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Activity</em>
            </div>
          </div>
          <div>
            {activity.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No activity yet</div>
            ) : activity.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '11px 18px',
                borderBottom: i < activity.length - 1 ? '1px solid rgba(244,239,230,0.04)' : 'none',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11,
                  background: a.type === 'lead' ? 'rgba(99,91,255,0.12)' : 'rgba(58,138,90,0.12)',
                  color: a.type === 'lead' ? '#9b93ff' : '#4db376',
                  border: `1px solid ${a.type === 'lead' ? 'rgba(99,91,255,0.25)' : 'rgba(58,138,90,0.25)'}`,
                }}>
                  {a.type === 'lead' ? '◎' : '◈'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--cream)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.sub}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>{fmtDate(a.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: CUT PERFORMANCE + TOP BUILDINGS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* CUT PERFORMANCE */}
        <div className="table-wrap" style={{ marginBottom: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Revenue by Cut</div>
            <button className="btn-ghost" style={{ fontSize: 8, padding: '5px 10px' }} onClick={() => router.push('/admin/products')}>
              Manage →
            </button>
          </div>
          <table className="adm" style={{ minWidth: 0 }}>
            <thead><tr><th>Cut</th><th>Members</th><th>Revenue/wk</th><th>Share</th></tr></thead>
            <tbody>
              {topCuts.length === 0 ? (
                <tr><td colSpan={4} className="td-dim" style={{ textAlign: 'center', padding: 20 }}>No data yet</td></tr>
              ) : topCuts.map(([cut, { count, rev }]) => (
                <tr key={cut}>
                  <td style={{ fontFamily: 'Cormorant, serif', fontSize: 16 }}>{cut}</td>
                  <td className="td-dim">{count}</td>
                  <td style={{ color: 'var(--gold2)', fontFamily: 'Cormorant, serif', fontSize: 16 }}>${rev}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: 'var(--border)' }}>
                        <div style={{ height: '100%', width: `${mrr > 0 ? (rev / mrr) * 100 : 0}%`, background: 'var(--gold)', opacity: 0.7 }} />
                      </div>
                      <span className="td-dim" style={{ fontSize: 10 }}>{mrr > 0 ? ((rev / mrr) * 100).toFixed(0) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOP BUILDINGS */}
        <div className="table-wrap" style={{ marginBottom: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--muted)' }}>Top Buildings</div>
            <button className="btn-ghost" style={{ fontSize: 8, padding: '5px 10px' }} onClick={() => router.push('/admin/buildings')}>
              All Buildings →
            </button>
          </div>
          <table className="adm" style={{ minWidth: 0 }}>
            <thead><tr><th>Building</th><th>Members</th><th>MRR</th></tr></thead>
            <tbody>
              {topBuildings.length === 0 ? (
                <tr><td colSpan={3} className="td-dim" style={{ textAlign: 'center', padding: 20 }}>No data yet</td></tr>
              ) : topBuildings.map(([bld, rev], i) => (
                <tr key={bld}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, color: i === 0 ? 'var(--gold)' : 'var(--muted)', fontWeight: 700 }}>
                        {i === 0 ? '★' : `#${i + 1}`}
                      </span>
                      <span style={{ fontSize: 11 }}>{bld}</span>
                    </div>
                  </td>
                  <td className="td-dim">{activeOrders.filter(o => o.building === bld).length}</td>
                  <td style={{ color: 'var(--gold2)', fontFamily: 'Cormorant, serif', fontSize: 16 }}>${rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SATURDAY DELIVERY PREVIEW */}
      <div style={{ background: 'rgba(184,134,58,0.05)', border: '1px solid rgba(184,134,58,0.18)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.44em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>
            {daysLeft === 0 ? '🚚 Delivering Today' : daysLeft === 1 ? '🚚 Delivering Tomorrow' : `🗓 Saturday Delivery · ${daysLeft} Days Away`}
          </div>
          <div style={{ fontFamily: 'Cormorant, serif', fontSize: 22, fontWeight: 300, color: 'var(--cream)' }}>
            {activeOrders.length} packages · {Object.keys(bldRevenue).length} buildings
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {saturday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button className="btn-gold" onClick={() => router.push('/admin/deliveries')}>
          View Manifest →
        </button>
      </div>
    </>
  )
}
