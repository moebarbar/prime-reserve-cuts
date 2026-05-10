'use client'

import { Fragment, useState, useEffect } from 'react'

type Status = 'new' | 'contacted' | 'partnered' | 'declined'

interface PartnerInquiry {
  id: string
  property_name: string
  manager_name: string
  email: string
  phone: string | null
  units: string | null
  message: string | null
  status: Status
  created_at: string
}

const STATUS_OPTS: Status[] = ['new', 'contacted', 'partnered', 'declined']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PartnerInquiriesPage() {
  const [items, setItems]     = useState<PartnerInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusF, setStatusF] = useState<'all' | Status>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/partner-inquiries')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = items.filter(i => statusF === 'all' || i.status === statusF)

  const updateStatus = async (id: string, status: Status) => {
    const prev = items.find(i => i.id === id)?.status
    setItems(xs => xs.map(x => x.id === id ? { ...x, status } : x))
    try {
      const res = await fetch(`/api/partner-inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      if (prev) setItems(xs => xs.map(x => x.id === id ? { ...x, status: prev } : x))
      setError('Failed to update status.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    const snapshot = items.find(i => i.id === id)
    setItems(xs => xs.filter(x => x.id !== id))
    try {
      const res = await fetch(`/api/partner-inquiries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    } catch {
      if (snapshot) setItems(xs => [snapshot, ...xs])
      setError('Failed to delete.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const counts = STATUS_OPTS.reduce((acc, s) => {
    acc[s] = items.filter(i => i.status === s).length
    return acc
  }, {} as Record<Status, number>)

  return (
    <>
      {error && (
        <div style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#e05c4d', padding: '10px 16px', marginBottom: 14, fontSize: 12 }}>
          {error}
        </div>
      )}

      <div className="sec-head" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="sec-title">Property Manager <em>Inquiries</em></h2>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            Submissions from the /partners page · {items.length} total
          </div>
        </div>
      </div>

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

      <div className="table-wrap scrollable">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⋯</div>
            <strong>Loading inquiries…</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <strong>No partner inquiries yet</strong>
            <p>Submissions from the /partners page will appear here.</p>
          </div>
        ) : (
          <table className="adm">
            <thead>
              <tr>
                <th>Property</th>
                <th>Manager</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Units</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <Fragment key={i.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === i.id ? null : i.id)}>
                    <td><strong>{i.property_name}</strong></td>
                    <td>{i.manager_name}</td>
                    <td className="td-dim">{i.email}</td>
                    <td className="td-dim">{i.phone ?? '—'}</td>
                    <td className="td-dim">{i.units ?? '—'}</td>
                    <td className="td-dim">{fmtDate(i.created_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className={`badge badge-${i.status} inline-sel`}
                        value={i.status}
                        onChange={e => updateStatus(i.id, e.target.value as Status)}
                      >
                        {STATUS_OPTS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="act-row">
                        <button className="btn-icon" title="Expand"
                          onClick={() => setExpanded(expanded === i.id ? null : i.id)}>
                          {expanded === i.id ? '▲' : '▼'}
                        </button>
                        <button className="btn-icon danger" title="Delete" onClick={() => deleteItem(i.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                  {expanded === i.id && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        <div className="detail-box">
                          <div className="detail-item"><label>Property</label><span>{i.property_name}</span></div>
                          <div className="detail-item"><label>Manager</label><span>{i.manager_name}</span></div>
                          <div className="detail-item"><label>Email</label><span>{i.email}</span></div>
                          <div className="detail-item"><label>Phone</label><span>{i.phone ?? '—'}</span></div>
                          <div className="detail-item"><label>Units</label><span>{i.units ?? '—'}</span></div>
                          <div className="detail-item"><label>Submitted</label><span>{fmtDate(i.created_at)}</span></div>
                        </div>
                        {i.message && (
                          <div style={{ marginTop: 12, padding: 12, background: 'rgba(244,239,230,0.04)', borderLeft: '2px solid var(--gold)', whiteSpace: 'pre-wrap', fontSize: 13 }}>
                            <strong style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Message</strong>
                            <div style={{ marginTop: 6, color: 'var(--cream)' }}>{i.message}</div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <a href={`mailto:${i.email}`} className="btn-ghost" style={{ fontSize: 9, padding: '7px 13px', textDecoration: 'none' }}>
                            ✉ Email
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
    </>
  )
}
