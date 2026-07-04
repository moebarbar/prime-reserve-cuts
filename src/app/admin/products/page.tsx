'use client'

import { useState, useEffect } from 'react'

type Category = 'steak' | 'slow_cook' | 'daily'

interface Product {
  id: string
  name: string
  grade: string
  detail: string
  weight: string
  price: number
  price_per_week: number
  img: string
  available: boolean
  category: Category
}

const GRADES = ['Local', 'USDA Choice', 'Grass-Fed']
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'steak',     label: 'Steaks' },
  { value: 'slow_cook', label: 'Roasts / Slow Cuts' },
  { value: 'daily',     label: 'Ground Beef' },
]
const CATEGORY_LABEL: Record<Category, string> = {
  steak: 'Steaks',
  slow_cook: 'Roasts / Slow Cuts',
  daily: 'Ground Beef',
}
const empty: Omit<Product, 'id'> = { name: '', grade: 'Local Beef', detail: '', weight: '', price: 0, price_per_week: 0, img: '', available: true, category: 'steak' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing]   = useState<Product | null>(null)
  const [form, setForm]         = useState<Omit<Product, 'id'>>(empty)
  const [imgErr, setImgErr]     = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditing(null); setForm(empty); setImgErr(false); setModal('add')
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, grade: p.grade, detail: p.detail, weight: p.weight ?? '', price: p.price, price_per_week: p.price_per_week ?? 0, img: p.img, available: p.available, category: p.category ?? 'steak' })
    setImgErr(false)
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditing(null) }

  const submit = async () => {
    if (!form.name.trim()) return alert('Product name is required.')
    // Allow placeholder pricing only when the product is hidden from the public site
    if (form.available && form.price <= 0) return alert('Price per lb must be greater than 0 to publish.')

    // `price` is the per-lb price (the field the site uses). Keep the legacy
    // price_per_week column in sync so older queries never see a stale value.
    const payload = { ...form, price_per_week: form.price }

    try {
      if (modal === 'add') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create product')
        const created = await res.json()
        setProducts(ps => [...ps, created])
      } else if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update product')
        const updated = await res.json()
        setProducts(ps => ps.map(p => p.id === editing.id ? updated : p))
      }
      closeModal()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    }
  }

  const toggleAvail = async (p: Product) => {
    const updated = { ...p, available: !p.available }
    setProducts(ps => ps.map(x => x.id === p.id ? updated : x))
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      // Revert on failure
      setProducts(ps => ps.map(x => x.id === p.id ? p : x))
      alert('Failed to update product visibility.')
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? It will be removed from the website immediately.')) return
    const snapshot = products.find(p => p.id === id)
    setProducts(ps => ps.filter(p => p.id !== id))
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    } catch {
      if (snapshot) setProducts(ps => [...ps, snapshot])
      alert('Failed to delete product.')
    }
  }

  return (
    <>
      {/* HEADER */}
      <div className="sec-head" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="sec-title">Manage <em>Products</em></h2>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {products.filter(p => p.available).length} active · {products.filter(p => !p.available).length} hidden · changes reflect on the site instantly
          </div>
        </div>
        <button className="btn-gold" onClick={openAdd}>+ Add Product</button>
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⋯</div>
          <strong>Loading products…</strong>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◧</div>
          <strong>No products yet</strong>
          <p>Click &ldquo;Add Product&rdquo; to create your first cut. It will appear on the website immediately.</p>
        </div>
      ) : (
        <div className="prod-grid">
          {products.map(p => (
            <div key={p.id} className={`prod-card${!p.available ? ' prod-unavail' : ''}`}>
              <div className="prod-img">
                {p.img ? (
                  <img src={p.img} alt={p.name} onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--muted)', fontSize:11 }}>No image</div>
                )}
                {!p.available && <span className="prod-unavail-badge">Hidden</span>}
              </div>
              <div className="prod-body">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <div className="prod-grade" style={{ marginBottom: 0 }}>{p.grade}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--muted)', background: 'rgba(244,239,230,0.06)', padding: '2px 6px' }}>
                    {CATEGORY_LABEL[p.category ?? 'steak']}
                  </div>
                </div>
                <div className="prod-name">{p.name}</div>
                <div className="prod-detail">{p.detail}</div>
                {p.weight && <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>⚖ {p.weight}</div>}
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                  <div className="prod-price"><sup>$</sup>{Number(p.price).toFixed(2)}<sub>/lb</sub></div>
                </div>
              </div>
              <div className="prod-foot">
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <label className="toggle" title={p.available ? 'Hide from website' : 'Show on website'}>
                    <input type="checkbox" checked={p.available} onChange={() => toggleAvail(p)} />
                    <span className="tog-slider" />
                  </label>
                  <span className="prod-foot-label">{p.available ? 'Live on site' : 'Hidden'}</span>
                </div>
                <div className="act-row">
                  <button className="btn-icon" title="Edit" onClick={() => openEdit(p)}>✎</button>
                  <button className="btn-icon danger" title="Delete" onClick={() => deleteProduct(p.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{modal === 'add' ? <>Add <em>Product</em></> : <>Edit <em>Product</em></>}</span>
              <button className="btn-icon" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="f-img-preview">
                {form.img && !imgErr
                  ? <img src={form.img} alt="preview" onError={() => setImgErr(true)} />
                  : <span>Image preview</span>}
              </div>
              <div style={{ height: 16 }} />
              <div className="f-field">
                <label className="f-label">Image URL</label>
                <input className="f-input" placeholder="https://…" value={form.img}
                  onChange={e => { setForm(f => ({ ...f, img: e.target.value })); setImgErr(false) }} />
              </div>
              <div className="f-row">
                <div className="f-field">
                  <label className="f-label">Product Name *</label>
                  <input className="f-input" placeholder="e.g. Ribeye" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="f-field">
                  <label className="f-label">Category *</label>
                  <select className="f-select" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="f-field">
                <label className="f-label">Grade</label>
                <select className="f-select" value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="f-row">
                <div className="f-field">
                  <label className="f-label">Description / Cut Detail</label>
                  <input className="f-input" placeholder="e.g. 16oz bone-in · 21-day dry-aged" value={form.detail}
                    onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} />
                </div>
                <div className="f-field">
                  <label className="f-label">Weight</label>
                  <input className="f-input" placeholder="e.g. 16 oz (454g)" value={form.weight}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
              </div>
              <div className="f-field">
                <label className="f-label">Price per lb ($) * <span style={{ opacity: 0.5, fontSize: 9 }}>shown on the site · billed weekly × pounds</span></label>
                <input className="f-input" type="number" min={0} step="0.01" placeholder="14.99" value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="f-field">
                <label className="f-label">Visibility</label>
                <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:10 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={form.available}
                      onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                    <span className="tog-slider" />
                  </label>
                  <span style={{ fontSize:12, color:'var(--muted)' }}>{form.available ? 'Visible on site' : 'Hidden'}</span>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn-gold" onClick={submit}>{modal === 'add' ? '+ Add Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
