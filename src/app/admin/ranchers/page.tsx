'use client'

import { Fragment, useState, useEffect } from 'react'

type Status = 'new' | 'contacted' | 'partnered' | 'declined'

interface RancherInquiry {
  id: string
  ranch_name: string
  owner_name: string
  email: string
  phone: string | null
  location: string | null
  herd_size: string | null
  grade: string | null
  breeds: string | null
  weekly_capacity: string | null
  story: string | null
  status: Status
  created_at: string
}

const STATUS_OPTS: Status[] = ['new', 'contacted', 'partnered', 'declined']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function RancherInquiriesPage() {
  const [items, setItems]     = useState<RancherInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusF, setStatusF] = useState<'all' | Status>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/rancher-inquiries')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = items.filter(i => statusF === 'all' || i.status === statusF)

  const updateStatus = async (id: string, status: Status) => {
    const prev = items.find(i => i.id === id)?.status
    setItems(xs => xs.map(x => x.id === id ? { ...x, status } : x))
    try {
      const res = await fetch(`/api/rancher-inquiries/${id}`, {
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
    if (!confirm('Delete this application?')) return
    const snapshot = items.find(i => i.id === id)
    setItems(xs => xs.filter(x => x.id !== id))
    try {
      const res = await fetch(`/api/rancher-inquiries/${id}`, { method: 'DELETE' })
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
          <h2 className="sec-title">Rancher <em>Applications</em></h2>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            Submissions from the /ranchers page · {items.length} total
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
            <strong>Loading applications…</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <strong>No rancher applications yet</strong>
            <p>Submissions from the /ranchers page will appear here.</p>
          </div>
        ) : (
          <table className="adm">
            <thead>
              <tr>
                <th>Ranch</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Location</th>
                <th>Grade</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <Fragment key={i.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === i.id ? null : i.id)}>
                    <td><strong>{i.ranch_name}</strong></td>
                    <td>{i.owner_name}</td>
                    <td className="td-dim">{i.email}</td>
                    <td className="td-dim">{i.location ?? '—'}</td>
                    <td className="td-dim">{i.grade ?? '—'}</td>
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
                          <div className="detail-item"><label>Ranch</label><span>{i.ranch_name}</span></div>
                          <div className="detail-item"><label>Owner</label><span>{i.owner_name}</span></div>
                          <div className="detail-item"><label>Email</label><span>{i.email}</span></div>
                          <div className="detail-item"><label>Phone</label><span>{i.phone ?? '—'}</span></div>
                          <div className="detail-item"><label>Location</label><span>{i.location ?? '—'}</span></div>
                          <div className="detail-item"><label>Herd Size</label><span>{i.herd_size ?? '—'}</span></div>
                          <div className="detail-item"><label>Grade</label><span>{i.grade ?? '—'}</span></div>
                          <div className="detail-item"><label>Breeds</label><span>{i.breeds ?? '—'}</span></div>
                          <div className="detail-item"><label>Weekly Capacity</label><span>{i.weekly_capacity ?? '—'}</span></div>
                          <div className="detail-item"><label>Submitted</label><span>{fmtDate(i.created_at)}</span></div>
                        </div>
                        {i.story && (
                          <div style={{ marginTop: 12, padding: 12, background: 'rgba(244,239,230,0.04)', borderLeft: '2px solid var(--gold)', whiteSpace: 'pre-wrap', fontSize: 13 }}>
                            <strong style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Their Story</strong>
                            <div style={{ marginTop: 6, color: 'var(--cream)' }}>{i.story}</div>
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
