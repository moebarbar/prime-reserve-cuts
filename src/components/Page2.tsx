'use client'

import { useState } from 'react'
import styles from './page2.module.css'
import { BUILDINGS } from '@/data/buildings'
import { PRODUCTS, CATEGORY_META, type Category, type Product } from '@/data/products'

interface FormData {
  unit: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type Cut = Product
export type { Category }

export interface CutSelection {
  cut: Cut
  qty: number
}

interface Page2Props {
  buildingKey: string
  onBack: () => void
  onContinue: (form: FormData, selections: CutSelection[]) => void
}

const CATEGORIES = CATEGORY_META

export default function Page2({ buildingKey, onBack, onContinue }: Page2Props) {
  const building = BUILDINGS.find(b => b.key === buildingKey)
  const allProducts: Cut[] = PRODUCTS
  const [activeCat, setActiveCat]     = useState<Category | null>(null)
  const [selections, setSelections]   = useState<CutSelection[]>([])
  const [form, setForm]               = useState<FormData>({ unit: '', firstName: '', lastName: '', email: '', phone: '' })

  const productsForActive = activeCat
    ? allProducts.filter(p => p.category === activeCat && p.available)
    : []

  const countsByCat = allProducts.reduce((acc, p) => {
    if (p.available) acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {} as Record<Category, number>)

  const getSelection = (cut: Cut) => selections.find(s => s.cut.id === cut.id)

  const toggleCut = (cut: Cut) => {
    setSelections(prev => {
      const exists = prev.find(s => s.cut.id === cut.id)
      if (exists) return prev.filter(s => s.cut.id !== cut.id)
      return [...prev, { cut, qty: 1 }]
    })
  }

  const setQty = (cut: Cut, qty: number) => {
    if (qty < 1) return
    setSelections(prev => prev.map(s => s.cut.id === cut.id ? { ...s, qty } : s))
  }

  const weeklyTotal = selections.reduce((sum, s) => sum + s.cut.pricePerLb * s.qty, 0)
  const money = (n: number) => `$${n.toFixed(2)}`

  const handleContinue = () => {
    if (selections.length === 0) {
      const el = document.getElementById('cut-list')
      if (el) {
        el.style.outline = '1.5px solid var(--gold)'
        el.style.outlineOffset = '4px'
        setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = '' }, 1600)
      }
      return
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert('Please enter your first and last name.')
      return
    }
    if (!form.unit.trim()) {
      alert('Please enter your unit number.')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim() || !emailRe.test(form.email)) {
      alert('Please enter a valid email address.')
      return
    }

    onContinue(form, selections)
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        {/* LEFT — FORM */}
        <div className={`${styles.left} anim-3`}>
          <button className="btn-back" onClick={onBack}>
            <span className="b-arr">←</span> Back to Buildings
          </button>

          <div className={styles.label}>Step 2 of 3</div>
          <h2 className={styles.title}>Your details<br />&amp; <em>cut.</em></h2>
          <p className={styles.sub}>
            Confirm your address, pick your cuts and set how many pounds you want each
            week. Local beef, weekly delivery, <strong>cancel anytime</strong>.
          </p>

          {/* Building pill */}
          <div className={styles.bldPill}>
            <div className={styles.bpDot} />
            <span className={styles.bpTxt}>{building?.name} · {building?.nbhd}</span>
            <button className={styles.bpChg} onClick={onBack}>Change</button>
          </div>

          {/* Fields */}
          <div className={styles.field}>
            <label>Unit / Apartment Number</label>
            <input
              type="text" placeholder="e.g. 1204" autoComplete="off"
              value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>First Name</label>
              <input type="text" placeholder="James"
                value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Last Name</label>
              <input type="text" placeholder="Hartley"
                value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="james@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input type="tel" placeholder="+1 (713) 000-0000"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div className={styles.note}>
            🔒 Used only for residency verification and delivery. Never shared.
          </div>
        </div>

        {/* RIGHT — CUTS */}
        <div className={`${styles.right} anim-4`}>
          <div className={styles.label}>Step 2 of 3</div>

          {!activeCat ? (
            <>
              <h2 className={styles.cutsTitle}>Choose your<br /><em>category.</em></h2>

              <div id="cut-list" className={styles.catGrid}>
                {CATEGORIES.map(cat => {
                  const count = countsByCat[cat.key] ?? 0
                  const empty = count === 0
                  return (
                    <button
                      key={cat.key}
                      className={`${styles.catCard} ${empty ? styles.catCardEmpty : ''}`}
                      onClick={() => { if (!empty) setActiveCat(cat.key) }}
                      disabled={empty}
                      type="button"
                    >
                      <div className={styles.catThumb}>
                        <img src={cat.img} alt={cat.title} loading="lazy" />
                      </div>
                      <div className={styles.catBody}>
                        <div className={styles.catTitle}>{cat.title}</div>
                        <div className={styles.catTagline}>{cat.tagline}</div>
                        <div className={styles.catMeta}>
                          {empty
                            ? <span className={styles.catSoon}>Coming soon</span>
                            : <span>{count} {count === 1 ? 'cut' : 'cuts'} available →</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <button className={styles.catBackBtn} onClick={() => setActiveCat(null)} type="button">
                <span className="b-arr">←</span> All Categories
              </button>
              <h2 className={styles.cutsTitle}>
                {CATEGORIES.find(c => c.key === activeCat)?.title}<br /><em>cuts.</em>
              </h2>

              <div id="cut-list" className={styles.cutList}>
                {productsForActive.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    Nothing in this category yet — check back soon.
                  </div>
                ) : productsForActive.map(cut => {
                  const sel = getSelection(cut)
                  const isSelected = !!sel
                  return (
                    <div
                      key={cut.id}
                      className={`${styles.cc} ${isSelected ? styles.ccSel : ''}`}
                      onClick={() => toggleCut(cut)}
                    >
                      <div className={styles.ccThumb}>
                        <img src={cut.img} alt={cut.name} loading="lazy"
                          style={cut.name === 'Ribeye' ? { transform: 'scaleX(-1)' } : undefined}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
                      </div>
                      <div className={styles.ccBody}>
                        <div className={styles.ccGrade}>Local Beef</div>
                        <div className={styles.ccName}>{cut.name}</div>
                        <div className={styles.ccDetail}>{cut.detail}</div>
                      </div>
                      <div className={styles.ccRight}>
                        <div>
                          <span className={styles.ccPrice}>{money(cut.pricePerLb)}</span>
                          <div className={styles.ccMo}>/lb</div>
                        </div>
                        {isSelected ? (
                          <div className={styles.qtyCtrl} onClick={e => e.stopPropagation()}>
                            <button className={styles.qtyBtn} onClick={() => setQty(cut, sel.qty - 1)}>−</button>
                            <span className={styles.qtyVal}>{sel.qty} lb</span>
                            <button className={styles.qtyBtn} onClick={() => setQty(cut, sel.qty + 1)}>+</button>
                          </div>
                        ) : (
                          <div className={styles.ccRadio} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Order mini summary */}
          <div className={styles.omini}>
            {selections.length === 0 ? (
              <div className={styles.omRow}><span>No cuts selected</span><span>—</span></div>
            ) : (
              selections.map(s => (
                <div key={s.cut.id} className={styles.omRow}>
                  <span>{s.cut.name} × {s.qty} lb</span>
                  <span>{money(s.cut.pricePerLb * s.qty)}</span>
                </div>
              ))
            )}
            <div className={styles.omRow}>
              <span>Delivery to <span style={{ color: 'var(--cream)' }}>{building?.name}</span></span>
              <span style={{ color: '#3a8a5a', fontWeight: 500 }}>Free</span>
            </div>
            <div className={styles.omRow}>
              <span>Schedule</span>
              <span style={{ color: 'var(--cream)' }}>Every Saturday</span>
            </div>
            <div className={styles.omTotal}>
              <span className={styles.omTotalLbl}>Weekly Total</span>
              <span className={styles.omTotalVal}>{money(weeklyTotal)}</span>
            </div>
          </div>

          <button className={styles.btnPay} onClick={handleContinue}>
            Proceed to Payment →
          </button>
        </div>

      </div>
    </div>
  )
}
