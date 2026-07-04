'use client'

import { useState } from 'react'
import styles from './page3.module.css'
import { Building } from '@/data/buildings'
import { CutSelection } from './Page2'
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

interface Page3Props {
  building: Building
  selections: CutSelection[]
  form: FormData
  purchaseType: PurchaseType
  onPurchaseTypeChange: (v: PurchaseType) => void
  onBack: () => void
}

export default function Page3({ building, selections, form, purchaseType, onPurchaseTypeChange, onBack }: Page3Props) {
  const [paid, setPaid] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const isSub = purchaseType === 'subscription'
  const weeklyTotal = selections.reduce((sum, s) => sum + s.cut.pricePerLb * s.qty, 0)
  const money = (n: number) => `$${n.toFixed(2)}`
  const firstCut = selections[0]?.cut

  const handlePay = async () => {
    setProcessing(true)
    setPayError(null)

    // 1. Capture lead in DB (best-effort, don't block checkout)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone || null,
          building: building.name,
          unit: form.unit,
          cut: selections.map(s => `${s.cut.name} ×${s.qty}`).join(', '),
        }),
      })
    } catch { /* best-effort */ }

    // 2. Create Stripe Checkout session and redirect
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         `${form.firstName} ${form.lastName}`.trim(),
          email:        form.email,
          selections:   selections.map(s => ({ name: s.cut.name, qty: s.qty })),
          building:     building.name,
          unit:         form.unit,
          purchaseType,
          username:     form.username,
          password:     form.password,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      if (res.ok && data.demo) {
        // Stripe not configured yet (dev/demo) — show the demo confirmation
        setPaid(true)
        setProcessing(false)
        return
      }
      // Real error (validation, rate limit, Stripe failure) — never fake success
      setPayError(typeof data.error === 'string' && data.error
        ? data.error
        : 'Something went wrong creating your checkout. Please try again.')
    } catch {
      setPayError('Network error — please check your connection and try again.')
    }
    setProcessing(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        {/* LEFT — order summary */}
        <div className={`${styles.left} anim-3`}>
          <button className="btn-back" onClick={onBack}>
            <span className="b-arr">←</span> Back to Details
          </button>

          <div className={styles.label}>Step 3 of 3</div>
          <h1 className={styles.title}>Review &amp;<br /><em>check out.</em></h1>

          {/* Purchase type — subscribe weekly or buy once (shared with Step 2) */}
          <div style={{ margin: '0 0 18px' }}>
            <PurchaseTypeToggle value={purchaseType} onChange={onPurchaseTypeChange} />
          </div>

          {/* Order card */}
          <div className={styles.ocard}>
            <div className={styles.ocTop}>
              <div className={styles.ocImg}>
                <img src={firstCut.img} alt={firstCut.name} loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }} />
              </div>
              <div className={styles.ocInfo}>
                <div className={styles.ocBld}>{building.name}</div>
                <div className={styles.ocCut}>
                  {selections.map(s => `${s.cut.name} ×${s.qty}lb`).join(', ')}
                </div>
                <div className={styles.ocDetail}>
                  {isSub ? 'Local beef · weekly delivery · cancel anytime' : 'Local beef · one-time delivery'}
                </div>
              </div>
              <div className={styles.ocPrice}>
                <span className={styles.ocVal}>{money(weeklyTotal)}</span>
                <div className={styles.ocMo}>{isSub ? 'per week' : 'one-time'}</div>
              </div>
            </div>
            <div className={styles.ocRows}>
              {selections.map(s => (
                <div key={s.cut.name} className={styles.orow}>
                  <span>{s.cut.name} × {s.qty} lb <span style={{ color: 'var(--muted)', fontSize: 10 }}>({money(s.cut.pricePerLb)}/lb)</span></span>
                  <span>{money(s.cut.pricePerLb * s.qty)}</span>
                </div>
              ))}
              <div className={styles.orow}><span>Unit</span><span>{form.unit || '—'}</span></div>
              <div className={styles.orow}><span>Building</span><span>{building.name}</span></div>
              <div className={styles.orow}><span>Delivery</span><span style={{ color: '#3a8a5a' }}>Complimentary</span></div>
              <div className={styles.orow}><span>Billing</span><span>{isSub ? 'Weekly · every Saturday' : 'One-time · this Saturday'}</span></div>
            </div>
          </div>

          <div className={styles.delNote}>
            <span style={{ fontSize: 20 }}>🚪</span>
            <div>
              <strong>{isSub ? 'Delivered to your unit, Every Saturday.' : 'Delivered to your unit this Saturday.'}</strong>
              Vacuum-sealed with dry ice, coordinated with your concierge. No signature required.
            </div>
          </div>
          <div className={styles.secNote}>
            {isSub
              ? 'Secured by Stripe. Cancel any time from your member dashboard.'
              : 'Secured by Stripe. One-time charge — no recurring billing.'}
          </div>
        </div>

        {/* RIGHT — Stripe panel */}
        <div className={`${styles.right} anim-4`}>
          {!paid ? (
            <div className={styles.stripePanel}>
              <div className={styles.spHead}>
                <div className={styles.spLogo}>
                  {/* Stripe SVG wordmark */}
                  <svg viewBox="0 0 60 25" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.07zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.97 2.2c0 2.86-2.1 4.06-5.02 4.06-1.41 0-2.91-.34-4.13-1.2v-3.71c1.23.86 2.72 1.41 4.13 1.41.84 0 1.44-.17 1.44-.86 0-1.7-5.51-.43-5.51-5.45 0-2.75 2.1-4.06 4.94-4.06 1.23 0 2.79.2 3.28.43v3.71c-.52-.26-2.17-.76-3.28-.76-.76 0-1.28.2-1.28.82 0 1.68 5.43.36 5.43 5.41z" fill="#635BFF"/>
                  </svg>
                </div>
                <div className={styles.spAmt}>
                  {isSub
                    ? <>Subscribe · <span>{money(weeklyTotal)}</span>/week</>
                    : <>Pay once · <span>{money(weeklyTotal)}</span></>}
                </div>
              </div>

              <div className={styles.spBody}>
                <label className={styles.spLbl}>Email</label>
                <input className={styles.spInp} type="email" defaultValue={form.email} placeholder="your@email.com" />

                <label className={styles.spLbl}>Name on card</label>
                <input className={styles.spInp} type="text" defaultValue={`${form.firstName} ${form.lastName}`.trim()} placeholder="James Hartley" />

                <label className={styles.spLbl}>Card information</label>
                <div className={styles.spCard}>
                  <span className={styles.spCardPh}>1234 1234 1234 1234</span>
                  <div className={styles.spCardIcons}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="mc" height="18" loading="lazy" />
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/visa.svg" alt="visa" height="18" loading="lazy" />
                  </div>
                </div>
                <div className={styles.spRow}>
                  <input className={styles.spInp} type="text" placeholder="MM / YY" style={{ marginBottom: 0 }} />
                  <input className={styles.spInp} type="text" placeholder="CVC" style={{ marginBottom: 0 }} />
                </div>
                <div style={{ height: 13 }} />

                <div className={styles.spTerms}>
                  {isSub
                    ? 'By subscribing you agree to automatic weekly billing. Cancel any time.'
                    : 'A single charge for this order. No recurring billing.'}
                </div>

                {payError && (
                  <div role="alert" style={{
                    margin: '0 0 12px', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid rgba(200,80,60,0.45)', background: 'rgba(200,80,60,0.1)',
                    color: '#e0977f', fontSize: 12, lineHeight: 1.5,
                  }}>
                    {payError}
                  </div>
                )}

                <button className={styles.spBtn} onClick={handlePay} disabled={processing}>
                  {processing ? '⏳ Processing…' : isSub ? '🔒  Complete Subscription' : '🔒  Place Order'}
                </button>
              </div>

              <div className={styles.spFoot}>
                Powered by
                <svg viewBox="0 0 60 25" height="13" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 4px' }}>
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.07zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.97 2.2c0 2.86-2.1 4.06-5.02 4.06-1.41 0-2.91-.34-4.13-1.2v-3.71c1.23.86 2.72 1.41 4.13 1.41.84 0 1.44-.17 1.44-.86 0-1.7-5.51-.43-5.51-5.45 0-2.75 2.1-4.06 4.94-4.06 1.23 0 2.79.2 3.28.43v3.71c-.52-.26-2.17-.76-3.28-.76-.76 0-1.28.2-1.28.82 0 1.68 5.43.36 5.43 5.41z" fill="#8898aa"/>
                </svg>
                · Terms · Privacy
              </div>
            </div>
          ) : (
            <div className={styles.payOk}>
              <div className={styles.payOkIcon}>✅</div>
              <div className={styles.payOkTitle}>{isSub ? 'You’re in.' : 'Order confirmed.'}</div>
              <div className={styles.payOkBody}>
                {isSub ? 'Membership confirmed. First delivery ' : 'Your order is confirmed. Delivery '}
                <strong>this Saturday</strong>, straight to unit {form.unit} at {building.name}.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
