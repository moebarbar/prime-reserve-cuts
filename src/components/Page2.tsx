'use client'

import { useState, useEffect } from 'react'
import styles from './page2.module.css'
import { BUILDINGS } from '@/data/buildings'

interface FormData {
  unit: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type Category = 'steak' | 'slow_cook' | 'daily'

export interface Cut {
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

export interface CutSelection {
  cut: Cut
  qty: number
}

interface Page2Props {
  buildingKey: string
  onBack: () => void
  onContinue: (form: FormData, selections: CutSelection[]) => void
}

const CATEGORIES: { key: Category; title: string; tagline: string; img: string }[] = [
  {
    key: 'steak',
    title: 'Steak',
    tagline: 'Center-cut · USDA Prime · the weekend ritual',
    img: '/ribeye-raw.jpg',
  },
  {
    key: 'slow_cook',
    title: 'Slow Cook',
    tagline: 'Brisket, short ribs, roasts · low-and-slow soulful cuts',
    img: '/source-ranch.jpg',
  },
  {
    key: 'daily',
    title: 'Daily',
    tagline: 'Ground beef & patties · the everyday workhorse',
    img: '/tenderloin-raw.jpg',
  },
]

export default function Page2({ buildingKey, onBack, onContinue }: Page2Props) {
  const building = BUILDINGS.find(b => b.key === buildingKey)
  const [allProducts, setAllProducts] = useState<Cut[]>([])
  const [activeCat, setActiveCat]     = useState<Category | null>(null)
  const [selections, setSelections]   = useState<CutSelection[]>([])
  const [form, setForm]               = useState<FormData>({ unit: '', firstName: '', lastName: '', email: '', phone: '' })

  useEffect(() => {
    const STEAK_TYPES = {
      tenderloin: { name: 'Tenderloin', img: '/tenderloin-raw.jpg', detail: 'Center-cut filet · butter-tender', price_per_week: 25, weight: '8 oz' },
      ribeye:     { name: 'Ribeye',     img: '/ribeye-raw.jpg',     detail: 'Bone-in · heavy marbling',         price_per_week: 25, weight: '16 oz' },
      'ny-strip': { name: 'NY Strip',   img: '/ny-strip-raw.jpg',   detail: '21-day dry-aged · firm texture',   price_per_week: 20, weight: '14 oz' },
    } as const
    const matchSteakType = (name: string): keyof typeof STEAK_TYPES | null => {
      const n = name.toLowerCase().trim()
      if (n.includes('tenderloin') || n.includes('filet')) return 'tenderloin'
      if (n.includes('ribeye')) return 'ribeye'
      if (n.includes('ny strip') || n.includes('new york strip') || n === 'strip') return 'ny-strip'
      return null
    }
    const STEAK_ORDER = ['tenderloin', 'ribeye', 'ny-strip'] as const

    fetch('/api/products')
      .then(r => r.json())
      .then((data: Cut[]) => {
        const list = data.map(p => {
          // Override the three legacy steaks with the local raw photos / pricing
          if ((p.category === 'steak' || !p.category) && matchSteakType(p.name)) {
            const t = matchSteakType(p.name)!
            return { ...p, category: 'steak' as Category, name: STEAK_TYPES[t].name, img: STEAK_TYPES[t].img, detail: STEAK_TYPES[t].detail, price_per_week: STEAK_TYPES[t].price_per_week, weight: STEAK_TYPES[t].weight }
          }
          return { ...p, category: (p.category ?? 'steak') as Category }
        })
        // Sort the steak section the same way the homepage does
        list.sort((a, b) => {
          if (a.category === 'steak' && b.category === 'steak') {
            const aT = matchSteakType(a.name)
            const bT = matchSteakType(b.name)
            if (aT && bT) return STEAK_ORDER.indexOf(aT) - STEAK_ORDER.indexOf(bT)
          }
          return 0
        })
        setAllProducts(list)
      })
      .catch(() => setAllProducts([]))
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
    if (qty < 1) return
    setSelections(prev => prev.map(s => s.cut.id === cut.id ? { ...s, qty } : s))
  }

  const weeklyTotal = selections.reduce((sum, s) => sum + s.cut.price_per_week * s.qty, 0)

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
            Confirm your address and choose your weekly cut. We coordinate delivery
            through your concierge — <strong>no hassle</strong>.
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
                        <div className={styles.ccGrade}>{cut.grade}</div>
                        <div className={styles.ccName}>{cut.name}</div>
                        <div className={styles.ccDetail}>{cut.detail}</div>
                        {cut.weight && <div className={styles.ccWeight}>⚖ {cut.weight}</div>}
                      </div>
                      <div className={styles.ccRight}>
                        <div>
                          <span className={styles.ccPrice}>${cut.price_per_week}</span>
                          <div className={styles.ccMo}>/week each</div>
                        </div>
                        {isSelected ? (
                          <div className={styles.qtyCtrl} onClick={e => e.stopPropagation()}>
                            <button className={styles.qtyBtn} onClick={() => setQty(cut, sel.qty - 1)}>−</button>
                            <span className={styles.qtyVal}>{sel.qty}</span>
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
                  <span>{s.cut.name} × {s.qty}</span>
                  <span>${s.cut.price_per_week * s.qty}</span>
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
              <span className={styles.omTotalVal}>${weeklyTotal}</span>
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
