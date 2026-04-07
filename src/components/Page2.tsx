'use client'

import { useState } from 'react'
import styles from './page2.module.css'
import { BUILDINGS } from '@/data/buildings'
import { CUTS, Cut } from '@/data/cuts'

interface FormData {
  unit: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Page2Props {
  buildingKey: string
  onBack: () => void
  onContinue: (form: FormData, cut: Cut) => void
}

export default function Page2({ buildingKey, onBack, onContinue }: Page2Props) {
  const building = BUILDINGS.find(b => b.key === buildingKey)
  const [selectedCut, setSelectedCut] = useState<Cut | null>(null)
  const [form, setForm] = useState<FormData>({ unit: '', firstName: '', lastName: '', email: '', phone: '' })

  const handleContinue = () => {
    if (!selectedCut) {
      const el = document.getElementById('cut-list')
      if (el) {
        el.style.outline = '1.5px solid var(--gold)'
        el.style.outlineOffset = '4px'
        setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = '' }, 1600)
      }
      return
    }
    onContinue(form, selectedCut)
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
            Confirm your address and choose your monthly cut. We coordinate delivery
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
          <h2 className={styles.cutsTitle}>Choose your<br /><em>cut.</em></h2>

          <div id="cut-list" className={styles.cutList}>
            {CUTS.map((cut, i) => (
              <div
                key={i}
                className={`${styles.cc} ${selectedCut?.name === cut.name ? styles.ccSel : ''}`}
                onClick={() => setSelectedCut(cut)}
              >
                <div className={styles.ccThumb}>
                  <img src={cut.img} alt={cut.name} loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
                </div>
                <div className={styles.ccBody}>
                  <div className={styles.ccGrade}>{cut.grade}</div>
                  <div className={styles.ccName}>{cut.name}</div>
                  <div className={styles.ccDetail}>{cut.detail}</div>
                </div>
                <div className={styles.ccRight}>
                  <div>
                    <span className={styles.ccPrice}>${cut.price}</span>
                    <div className={styles.ccMo}>/mo</div>
                  </div>
                  <div className={`${styles.ccRadio} ${selectedCut?.name === cut.name ? styles.ccRadioSel : ''}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Order mini summary */}
          <div className={styles.omini}>
            <div className={styles.omRow}>
              <span>{selectedCut ? `${selectedCut.name} (monthly)` : 'No cut selected'}</span>
              <span>{selectedCut ? `$${selectedCut.price}` : '—'}</span>
            </div>
            <div className={styles.omRow}>
              <span>Delivery to <span style={{ color: 'var(--cream)' }}>{building?.name}</span></span>
              <span style={{ color: '#3a8a5a', fontWeight: 500 }}>Free</span>
            </div>
            <div className={styles.omTotal}>
              <span className={styles.omTotalLbl}>Monthly Total</span>
              <span className={styles.omTotalVal}>{selectedCut ? `$${selectedCut.price}` : '$0'}</span>
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
