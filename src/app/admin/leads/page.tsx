'use client'

import { Fragment, useState, useEffect } from 'react'

type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  building: string
  unit: string
  cut: string | null
  status: LeadStatus
  created_at: string
}

const STATUS_OPTS: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']
const BUILDINGS = ['All Buildings', 'Aspire Post Oak', 'The Driscoll', 'Market Square Tower', 'Parkside at Discovery Green', 'Elev8 Downtown', 'Hanover Autry Park']

function Badge({ status }: { status: LeadStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('all')
  const [buildingF, setBuildingF] = useState('All Buildings')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchQ = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.unit.includes(q)
    const matchS = statusF === 'all' || l.status === statusF
    const matchB = buildingF === 'All Buildings' || l.building === buildingF
    return matchQ && matchS && matchB
  })

  const updateStatus = async (id: string, status: LeadStatus) => {
    const prev = leads.find(l => l.id === id)?.status
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      // Revert on failure
      if (prev) setLeads(ls => ls.map(l => l.id === id ? { ...l, status: prev } : l))
      setError('Failed to update status. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const deleteLead = async (id: string) => {
    const snapshot = leads.find(l => l.id === id)
    setLeads(ls => ls.filter(l => l.id !== id))
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    } catch {
      if (snapshot) setLeads(ls => [...ls, snapshot].sort((a, b) => b.created_at.localeCompare(a.created_at)))
      setError('Failed to delete lead. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const counts = STATUS_OPTS.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {} as Record<LeadStatus, number>)

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Building', 'Unit', 'Interested In', 'Status', 'Date'],
      ...filtered.map(l => [
        l.id, l.name, l.email, l.phone ?? '', l.building, l.unit, l.cut ?? '', l.status, fmtDate(l.created_at),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {error && (
        <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#e05c4d', padding: '10px 16px', marginBottom: 14, fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* MINI STATS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {STATUS_OPTS.map(s => (
          <div
            key={s}
            className={`stat-card${statusF === s ? ' gold-card' : ''}`}
            style={{ cursor: 'pointer', padding: '14px 16px' }}
            onClick={() => setStatusF(statusF === s ? 'all' : s)}
          >
            <div className="stat-eyebrow">{s}</div>
            <div className="stat-value" style={{ fontSize: 30 }}>{counts[s]}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <input
          className="filter-search"
          placeholder="Search by name, email or unit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="filter-select" value={buildingF} onChange={e => setBuildingF(e.target.value)}>
          {BUILDINGS.map(b => <option key={b}>{b}</option>)}
        </select>
        {(search || statusF !== 'all' || buildingF !== 'All Buildings') && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setStatusF('all'); setBuildingF('All Buildings') }}>
            Clear
          </button>
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
            <strong>Loading leads…</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <strong>No leads found</strong>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="adm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Building / Unit</th>
                <th>Phone</th>
                <th>Interested In</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <Fragment key={l.id}>
                  <tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                  >
                    <td className="td-mono">{l.id.slice(0, 8)}</td>
                    <td>
                      <div style={{ fontWeight: 400 }}>{l.name}</div>
                      <div className="td-dim">{l.email}</div>
                    </td>
                    <td>
                      <div>{l.building}</div>
                      <div className="td-dim">Unit {l.unit}</div>
                    </td>
                    <td className="td-dim">{l.phone ?? '—'}</td>
                    <td className="td-dim">{l.cut ?? '—'}</td>
                    <td className="td-dim">{fmtDate(l.created_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className={`badge badge-${l.status} inline-sel`}
                        value={l.status}
                        onChange={e => updateStatus(l.id, e.target.value as LeadStatus)}
                      >
                        {STATUS_OPTS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="act-row">
                        <button
                          className="btn-icon"
                          title="Expand"
                          onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                        >{expanded === l.id ? '▲' : '▼'}</button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => { if (confirm(`Delete lead ${l.name}?`)) deleteLead(l.id) }}
                        >✕</button>
                      </div>
                    </td>
                  </tr>
                  {expanded === l.id && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        <div className="detail-box">
                          <div className="detail-item"><label>Full Name</label><span>{l.name}</span></div>
                          <div className="detail-item"><label>Email</label><span>{l.email}</span></div>
                          <div className="detail-item"><label>Phone</label><span>{l.phone ?? '—'}</span></div>
                          <div className="detail-item"><label>Unit</label><span>{l.unit}</span></div>
                          <div className="detail-item"><label>Building</label><span>{l.building}</span></div>
                          <div className="detail-item"><label>Interested In</label><span>{l.cut ?? '—'}</span></div>
                          <div className="detail-item"><label>Date Submitted</label><span>{fmtDate(l.created_at)}</span></div>
                          <div className="detail-item"><label>Status</label><span><Badge status={l.status} /></span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          {l.status !== 'converted' && (
                            <button className="btn-gold" style={{ fontSize: 9, padding: '8px 14px' }}
                              onClick={() => updateStatus(l.id, 'converted')}>
                              ✓ Mark Converted
                            </button>
                          )}
                          {l.status !== 'contacted' && l.status !== 'converted' && (
                            <button className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px' }}
                              onClick={() => updateStatus(l.id, 'contacted')}>
                              Mark Contacted
                            </button>
                          )}
                          <a href={`mailto:${l.email}`} className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px', textDecoration: 'none' }}>
                            ✉ Email Lead
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
        Showing {filtered.length} of {leads.length} leads
      </div>
    </>
  )
}
