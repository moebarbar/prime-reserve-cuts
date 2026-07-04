'use client'

import { useState, useEffect } from 'react'
import styles from './page2.module.css'
import { BUILDINGS } from '@/data/buildings'
import { PRODUCTS, CATEGORY_META, type Category, type Product } from '@/data/products'
import PurchaseTypeToggle, { type PurchaseType } from '@/components/PurchaseTypeToggle'

interface FormData {
  unit: string
  firstName: string
  lastName: string
  email: string
  phone: string
  username: string
  password: string
}

export type Cut = Product
export type { Category }

export interface CutSelection {
  cut: Cut
  qty: number
}

interface Page2Props {
  buildingKey: string
  purchaseType: PurchaseType
  onPurchaseTypeChange: (v: PurchaseType) => void
  initialSelections?: CutSelection[]
  initialForm?: FormData
  onBack: () => void
  onContinue: (form: FormData, selections: CutSelection[]) => void
}

const CATEGORIES = CATEGORY_META

export default function Page2({ buildingKey, purchaseType, onPurchaseTypeChange, initialSelections, initialForm, onBack, onContinue }: Page2Props) {
  const building = BUILDINGS.find(b => b.key === buildingKey)
  const isSub = purchaseType === 'subscription'
  // DB-driven: the admin manages the `products` table and the funnel renders it.
  // We seed state with the canonical catalog so the first paint is correct, then
  // replace it with live DB rows (falling back to the seed if the API is empty).
  const [allProducts, setAllProducts] = useState<Cut[]>(PRODUCTS)
  const [activeCat, setActiveCat]     = useState<Category | null>(null)
  // Seeded from the parent so "Back to Details" from Step 3 doesn't wipe the order.
  const [selections, setSelections]   = useState<CutSelection[]>(initialSelections ?? [])
  const [form, setForm]               = useState<FormData>(initialForm ?? { unit: '', firstName: '', lastName: '', email: '', phone: '', username: '', password: '' })

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((rows: Array<{ id: string; name: string; detail: string; img: string; price: number | string; available: boolean; category: Category }>) => {
        if (!Array.isArray(rows) || rows.length === 0) return // keep the static fallback
        const live = rows.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          pricePerLb: Number(r.price) || 0,
          detail: r.detail,
          img: r.img,
          available: r.available,
        }))
        setAllProducts(live)
        // Re-point existing selections (seed ids or a previous visit) at the
        // live rows — matching by name — so cards stay selected and prices are
        // current; drop anything no longer available.
        setSelections(prev => prev
          .map(s => {
            const match = live.find(p => p.name === s.cut.name)
            return match && match.available ? { ...s, cut: match } : null
          })
          .filter((s): s is CutSelection => s !== null))
      })
      .catch(() => { /* keep the static fallback */ })
  }, [])

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
    if (qty < 1 || qty > 20) return // checkout API rejects qty > 20
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
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username.trim())) {
      alert('Choose a username: 3–30 letters, numbers, or underscores.')
      return
    }
    if (form.password.length < 8) {
      alert('Choose a password of at least 8 characters.')
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
          <h1 className={styles.title}>Your details<br />&amp; <em>cut.</em></h1>
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

          {/* Account — so you can manage your deliveries after checkout */}
          <div className={styles.acctHead}>Your account</div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label>Username</label>
              <input type="text" placeholder="james_h" autoComplete="username"
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input type="password" placeholder="••••••••" autoComplete="new-password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>

          <div className={styles.note}>
            🔒 Create a login to manage, skip, or cancel deliveries anytime. Already a member?{' '}
            <a href="/account/login" style={{ color: 'var(--gold)' }}>Sign in</a>.
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
                  const thumb = (
                    <>
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
                    </>
                  )
                  // Unselected: the whole card is one button (no nested controls).
                  if (!sel) {
                    return (
                      <button
                        key={cut.id}
                        type="button"
                        className={styles.cc}
                        onClick={() => toggleCut(cut)}
                        aria-pressed={false}
                        aria-label={`Add ${cut.name}, ${money(cut.pricePerLb)} per pound, to your order`}
                      >
                        {thumb}
                        <div className={styles.ccRight}>
                          <div>
                            <span className={styles.ccPrice}>{money(cut.pricePerLb)}</span>
                            <div className={styles.ccMo}>/lb</div>
                          </div>
                          <div className={styles.ccRadio} />
                        </div>
                      </button>
                    )
                  }
                  // Selected: card is a div so the qty +/- buttons are valid HTML;
                  // thumb+body becomes a separate deselect button.
                  return (
                    <div key={cut.id} className={`${styles.cc} ${styles.ccSel}`}>
                      <button
                        type="button"
                        className={styles.ccSelectArea}
                        onClick={() => toggleCut(cut)}
                        aria-pressed={true}
                        aria-label={`Remove ${cut.name} from your order`}
                      >
                        {thumb}
                      </button>
                      <div className={styles.ccRight}>
                        <div>
                          <span className={styles.ccPrice}>{money(cut.pricePerLb)}</span>
                          <div className={styles.ccMo}>/lb</div>
                        </div>
                        <div className={styles.qtyCtrl}>
                          <button className={styles.qtyBtn} onClick={() => setQty(cut, sel.qty - 1)}
                            aria-label={`Decrease ${cut.name} pounds`}>−</button>
                          <span className={styles.qtyVal}>{sel.qty} lb</span>
                          <button className={styles.qtyBtn} onClick={() => setQty(cut, sel.qty + 1)}
                            aria-label={`Increase ${cut.name} pounds`}>+</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* How do you want it? Subscribe weekly or buy once. */}
          <div style={{ margin: '8px 0 14px' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              How would you like it?
            </div>
            <PurchaseTypeToggle value={purchaseType} onChange={onPurchaseTypeChange} />
          </div>

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
              <span style={{ color: 'var(--cream)' }}>{isSub ? 'Every Saturday' : 'This Saturday · one-time'}</span>
            </div>
            <div className={styles.omTotal}>
              <span className={styles.omTotalLbl}>{isSub ? 'Weekly Total' : 'Order Total'}</span>
              <span className={styles.omTotalVal}>{money(weeklyTotal)}</span>
            </div>
          </div>

          <button className={styles.btnPay} onClick={handleContinue}>
            {isSub ? 'Proceed to Payment →' : 'Proceed to Checkout →'}
          </button>
        </div>

      </div>
    </div>
  )
}
