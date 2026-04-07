'use client'

import { useState, useEffect } from 'react'
import { INITIAL_PRODUCTS, AdminProduct } from '@/data/adminData'

const GRADES = ['USDA Prime', 'A5 Wagyu', 'Heritage', 'USDA Choice', 'Grass-Fed']
const STORAGE_KEY = 'ac_admin_products'

function genId() { return 'p' + Date.now() }

const empty: Omit<AdminProduct, 'id'> = { name: '', grade: 'USDA Prime', detail: '', price: 0, img: '', available: true }

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [modal, setModal]       = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing]   = useState<AdminProduct | null>(null)
  const [form, setForm]         = useState<Omit<AdminProduct, 'id'>>(empty)
  const [imgErr, setImgErr]     = useState(false)

  // Load from localStorage (fall back to initial data)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      setProducts(saved ? JSON.parse(saved) : INITIAL_PRODUCTS)
    } catch { setProducts(INITIAL_PRODUCTS) }
  }, [])

  const save = (next: AdminProduct[]) => {
    setProducts(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const openAdd = () => {
    setEditing(null)
    setForm(empty)
    setImgErr(false)
    setModal('add')
  }

  const openEdit = (p: AdminProduct) => {
    setEditing(p)
    setForm({ name: p.name, grade: p.grade, detail: p.detail, price: p.price, img: p.img, available: p.available })
    setImgErr(false)
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditing(null) }

  const submit = () => {
    if (!form.name.trim()) return alert('Product name is required.')
    if (form.price <= 0)   return alert('Price must be greater than 0.')
    if (modal === 'add') {
      save([...products, { ...form, id: genId() }])
    } else if (editing) {
      save(products.map(p => p.id === editing.id ? { ...form, id: editing.id } : p))
    }
    closeModal()
  }

  const toggleAvail = (id: string) =>
    save(products.map(p => p.id === id ? { ...p, available: !p.available } : p))

  const deleteProduct = (id: string) => {
    if (!confirm('Delete this product?')) return
    save(products.filter(p => p.id !== id))
  }

  const mrr = products.filter(p => p.available).reduce((s, p) => s + p.price, 0)

  return (
    <>
      {/* HEADER */}
      <div className="sec-head" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="sec-title">Manage <em>Products</em></h2>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {products.filter(p => p.available).length} active · {products.filter(p => !p.available).length} hidden
          </div>
        </div>
        <button className="btn-gold" onClick={openAdd}>+ Add Product</button>
      </div>

      {/* STATS ROW */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card gold-card">
          <div className="stat-eyebrow">Potential MRR</div>
          <div className="stat-value gold">${mrr}</div>
          <div className="stat-sub">All active plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Total Products</div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-eyebrow">Avg Price</div>
          <div className="stat-value">{products.length ? `$${Math.round(products.reduce((s,p) => s+p.price,0)/products.length)}` : '—'}</div>
          <div className="stat-sub">Per month</div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◧</div>
          <strong>No products yet</strong>
          <p>Click "Add Product" to create your first cut.</p>
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
                <div className="prod-grade">{p.grade}</div>
                <div className="prod-name">{p.name}</div>
                <div className="prod-detail">{p.detail}</div>
                <div className="prod-price"><sup>$</sup>{p.price}<sub>/mo</sub></div>
              </div>
              <div className="prod-foot">
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <label className="toggle" title={p.available ? 'Hide product' : 'Show product'}>
                    <input type="checkbox" checked={p.available} onChange={() => toggleAvail(p.id)} />
                    <span className="tog-slider" />
                  </label>
                  <span className="prod-foot-label">{p.available ? 'Visible' : 'Hidden'}</span>
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
              {/* Image preview */}
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
                  <label className="f-label">Grade</label>
                  <select className="f-select" value={form.grade}
                    onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="f-field">
                <label className="f-label">Description / Cut Detail</label>
                <input className="f-input" placeholder="e.g. 16oz bone-in · 21-day dry-aged" value={form.detail}
                  onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} />
              </div>

              <div className="f-row">
                <div className="f-field">
                  <label className="f-label">Monthly Price ($) *</label>
                  <input className="f-input" type="number" min={1} placeholder="89" value={form.price || ''}
                    onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
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
