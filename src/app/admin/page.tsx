'use client'

import { useRouter } from 'next/navigation'
import { MOCK_LEADS, MOCK_ORDERS } from '@/data/adminData'

const activeOrders    = MOCK_ORDERS.filter(o => o.status === 'active')
const mrr             = activeOrders.reduce((s, o) => s + o.price, 0)
const newLeads        = MOCK_LEADS.filter(l => l.status === 'new').length
const pendingOrders   = MOCK_ORDERS.filter(o => o.status === 'pending').length
const recentLeads     = [...MOCK_LEADS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
const recentOrders    = MOCK_ORDERS.slice(0, 6)

function Badge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default function AdminDashboard() {
  const router = useRouter()

  return (
    <>
      {/* STATS */}
      <div className="stat-grid">
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Monthly Revenue</div>
          <div className="stat-value gold">${mrr.toLocaleString()}</div>
          <div className="stat-sub"><span className="up">↑ 12%</span> vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Active Subscribers</div>
          <div className="stat-value">{activeOrders.length}</div>
          <div className="stat-sub">{MOCK_ORDERS.filter(o => o.status === 'paused').length} paused</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">New Leads</div>
          <div className="stat-value">{newLeads}</div>
          <div className="stat-sub">{MOCK_LEADS.length} total leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Pending Orders</div>
          <div className="stat-value">{pendingOrders}</div>
          <div className="stat-sub">Awaiting activation</div>
        </div>
      </div>

      {/* RECENT LEADS */}
      <div className="sec-head">
        <h2 className="sec-title">Recent <em>Leads</em></h2>
        <button className="btn-ghost" onClick={() => router.push('/admin/leads')}>View All →</button>
      </div>
      <div className="table-wrap scrollable" style={{ marginBottom: 28 }}>
        <table className="adm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Building</th>
              <th>Interested In</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map(l => (
              <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => router.push('/admin/leads')}>
                <td>
                  <div style={{ fontWeight: 400 }}>{l.name}</div>
                  <div className="td-dim">{l.email}</div>
                </td>
                <td>
                  <div>{l.building}</div>
                  <div className="td-dim">Unit {l.unit}</div>
                </td>
                <td className="td-dim">{l.cut ?? '—'}</td>
                <td className="td-dim">{l.date}</td>
                <td><Badge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RECENT ORDERS */}
      <div className="sec-head">
        <h2 className="sec-title">Recent <em>Orders</em></h2>
        <button className="btn-ghost" onClick={() => router.push('/admin/orders')}>View All →</button>
      </div>
      <div className="table-wrap scrollable">
        <table className="adm">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Building</th>
              <th>Cut</th>
              <th>Price</th>
              <th>Next Delivery</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => router.push('/admin/orders')}>
                <td className="td-mono">{o.id}</td>
                <td>
                  <div style={{ fontWeight: 400 }}>{o.customer}</div>
                  <div className="td-dim">{o.email}</div>
                </td>
                <td>
                  <div>{o.building}</div>
                  <div className="td-dim">Unit {o.unit}</div>
                </td>
                <td>{o.cut}</td>
                <td style={{ color: 'var(--gold2)', fontFamily: 'Cormorant, serif', fontSize: 16 }}>${o.price}</td>
                <td className="td-dim">{o.nextDelivery}</td>
                <td><Badge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CUT BREAKDOWN */}
      <div className="sec-head" style={{ marginTop: 28 }}>
        <h2 className="sec-title">Revenue by <em>Cut</em></h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {(['Ribeye','Filet Mignon','A5 Wagyu','Tomahawk'] as const).map(cut => {
          const cutOrders = activeOrders.filter(o => o.cut === cut)
          const rev = cutOrders.reduce((s, o) => s + o.price, 0)
          return (
            <div key={cut} className="stat-card" style={{ padding: '16px 18px' }}>
              <div className="stat-eyebrow">{cut}</div>
              <div className="stat-value" style={{ fontSize: 28 }}>${rev}</div>
              <div className="stat-sub">{cutOrders.length} subscriber{cutOrders.length !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
