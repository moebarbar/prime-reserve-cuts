'use client'

import { useState, useEffect } from 'react'

interface Building {
  key: string
  name: string
  name_html: string
  nbhd: string
  img: string
  hero_img: string
  active: boolean
}

interface Order {
  building: string
  price: number
  status: string
}

const empty: Omit<Building, 'key'> = { name: '', name_html: '', nbhd: '', img: '', hero_img: '', active: true }

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing]     = useState<Building | null>(null)
  const [form, setForm]           = useState<Omit<Building, 'key'>>(empty)
  const [keyInput, setKeyInput]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/buildings').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()).catch(() => []),
    ]).then(([b, o]) => {
      setBuildings(b)
      setOrders(o)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditing(null); setForm(empty); setKeyInput(''); setError(null); setModal('add')
  }

  const openEdit = (b: Building) => {
    setEditing(b)
    setForm({ name: b.name, name_html: b.name_html, nbhd: b.nbhd, img: b.img, hero_img: b.hero_img, active: b.active })
    setKeyInput(b.key)
    setError(null)
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditing(null) }

  const submit = async () => {
    if (!form.name.trim() || !form.nbhd.trim()) {
      setError('Name and neighborhood are required.'); return
    }
    if (modal === 'add' && !keyInput.trim()) {
      setError('Key is required.'); return
    }

    setSaving(true); setError(null)
    try {
      if (modal === 'add') {
        const res = await fetch('/api/buildings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, key: keyInput.trim().toLowerCase().replace(/\s+/g, '-'), name_html: form.name_html || form.name }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to create building') }
        const created = await res.json()
        setBuildings(bs => [...bs, created])
      } else if (editing) {
        const res = await fetch(`/api/buildings/${editing.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, name_html: form.name_html || form.name }),
        })
        if (!res.ok) throw new Error('Failed to update building')
        const updated = await res.json()
        setBuildings(bs => bs.map(b => b.key === editing.key ? updated : b))
      }
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const deleteBuilding = async (key: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const snapshot = buildings.find(b => b.key === key)
    setBuildings(bs => bs.filter(b => b.key !== key))
    try {
      const res = await fetch(`/api/buildings/${key}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    } catch {
      if (snapshot) setBuildings(bs => [...bs, snapshot])
      setError('Failed to delete building.')
    }
  }

  const toggleActive = async (b: Building) => {
    const updated = { ...b, active: !b.active }
    setBuildings(bs => bs.map(x => x.key === b.key ? updated : x))
    await fetch(`/api/buildings/${b.key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: updated.active }),
    })
  }

  const getBuildingStats = (name: string) => {
    const bOrders = orders.filter(o => o.building === name)
    const active = bOrders.filter(o => o.status === 'active')
    return {
      active: active.length,
      mrr: active.reduce((s, o) => s + o.price, 0),
    }
  }

  const totalMrr = buildings.reduce((s, b) => s + getBuildingStats(b.name).mrr, 0)

  return (
    <>
      {/* HEADER */}
      <div className="sec-head" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="sec-title">Manage <em>Buildings</em></h2>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {buildings.filter(b => b.active).length} active · {buildings.filter(b => !b.active).length} hidden
          </div>
        </div>
        <button className="btn-gold" onClick={openAdd}>+ Add Building</button>
      </div>

      {/* STATS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Network MRR</div>
          <div className="stat-value gold">${totalMrr.toLocaleString()}</div>
          <div className="stat-sub">Across {buildings.length} buildings</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Total Buildings</div>
          <div className="stat-value">{buildings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Active Subscribers</div>
          <div className="stat-value">{buildings.reduce((s, b) => s + getBuildingStats(b.name).active, 0)}</div>
          <div className="stat-sub">Across all properties</div>
        </div>
      </div>

      {/* BUILDING TABLE */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⋯</div>
          <strong>Loading buildings…</strong>
        </div>
      ) : buildings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <strong>No buildings yet</strong>
          <p>Click "Add Building" to add your first property.</p>
        </div>
      ) : (
        <div className="table-wrap scrollable">
          <table className="adm">
            <thead>
              <tr>
                <th>Image</th>
                <th>Building</th>
                <th>Neighborhood</th>
                <th>Key</th>
                <th>Subscribers</th>
                <th>MRR</th>
                <th>Visible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {buildings.map(b => {
                const stats = getBuildingStats(b.name)
                return (
                  <tr key={b.key}>
                    <td>
                      <div style={{ width: 52, height: 36, background: '#1c1208', overflow: 'hidden', flexShrink: 0 }}>
                        {b.img && (
                          <img src={b.img} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.7)' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 400 }}>{b.name}</div>
                    </td>
                    <td className="td-dim">{b.nbhd}</td>
                    <td className="td-mono">{b.key}</td>
                    <td>{stats.active}</td>
                    <td style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 17, color: 'var(--gold2)' }}>${stats.mrr}</td>
                    <td>
                      <label className="toggle" title={b.active ? 'Hide' : 'Show'}>
                        <input type="checkbox" checked={b.active} onChange={() => toggleActive(b)} />
                        <span className="tog-slider" />
                      </label>
                    </td>
                    <td>
                      <div className="act-row">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(b)}>✎</button>
                        <button className="btn-icon danger" title="Delete" onClick={() => deleteBuilding(b.key, b.name)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-head">
              <span className="modal-title">{modal === 'add' ? <>Add <em>Building</em></> : <>Edit <em>Building</em></>}</span>
              <button className="btn-icon" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {error && (
                <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: '#e05c4d', fontSize: 11, padding: '9px 13px', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* Image preview */}
              <div className="f-img-preview">
                {form.img ? <img src={form.img} alt="preview" onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} /> : <span>Image preview</span>}
              </div>
              <div style={{ height: 16 }} />

              <div className="f-row">
                <div className="f-field">
                  <label className="f-label">Building Name *</label>
                  <input className="f-input" placeholder="e.g. Aspire Post Oak" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="f-field">
                  <label className="f-label">Unique Key {modal === 'add' && '*'}</label>
                  <input className="f-input" placeholder="e.g. aspire-post-oak" value={keyInput}
                    disabled={modal === 'edit'}
                    onChange={e => setKeyInput(e.target.value)}
                    style={{ opacity: modal === 'edit' ? 0.5 : 1 }} />
                </div>
              </div>

              <div className="f-field">
                <label className="f-label">Neighborhood *</label>
                <input className="f-input" placeholder="e.g. Uptown · The Galleria" value={form.nbhd}
                  onChange={e => setForm(f => ({ ...f, nbhd: e.target.value }))} />
              </div>

              <div className="f-field">
                <label className="f-label">Card Image URL</label>
                <input className="f-input" placeholder="https://…" value={form.img}
                  onChange={e => setForm(f => ({ ...f, img: e.target.value }))} />
              </div>

              <div className="f-field">
                <label className="f-label">Hero Image URL <span style={{ opacity: 0.5, fontSize: 9 }}>(large banner — defaults to card image)</span></label>
                <input className="f-input" placeholder="https://… (optional)" value={form.hero_img}
                  onChange={e => setForm(f => ({ ...f, hero_img: e.target.value }))} />
              </div>

              <div className="f-field">
                <label className="f-label">Custom Display Name HTML <span style={{ opacity: 0.5, fontSize: 9 }}>(optional — for line breaks)</span></label>
                <input className="f-input" placeholder='e.g. Aspire<br /><em>Post Oak</em>' value={form.name_html}
                  onChange={e => setForm(f => ({ ...f, name_html: e.target.value }))} />
              </div>

              <div className="f-field">
                <label className="f-label">Visibility</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    <span className="tog-slider" />
                  </label>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{form.active ? 'Visible on site' : 'Hidden'}</span>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn-gold" onClick={submit} disabled={saving}>
                {saving ? 'Saving…' : modal === 'add' ? '+ Add Building' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
