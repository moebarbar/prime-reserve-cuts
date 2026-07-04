'use client'

export type PurchaseType = 'subscription' | 'one_time'

const OPTIONS: { val: PurchaseType; label: string; sub: string }[] = [
  { val: 'subscription', label: 'Weekly subscription', sub: 'Delivered every Saturday' },
  { val: 'one_time', label: 'One-time order', sub: 'Just this once' },
]

/** Clean segmented control: subscribe weekly vs buy once. Shared by Step 2 + Step 3.
 *  `disableSubscription` greys out the weekly option (used when the cart holds a
 *  Special cut, which is one-time only). */
export default function PurchaseTypeToggle({
  value,
  onChange,
  disableSubscription = false,
}: {
  value: PurchaseType
  onChange: (v: PurchaseType) => void
  disableSubscription?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {OPTIONS.map(({ val, label, sub }) => {
        const sel = value === val
        const disabled = disableSubscription && val === 'subscription'
        return (
          <button
            key={val}
            type="button"
            onClick={() => { if (!disabled) onChange(val) }}
            aria-pressed={sel}
            disabled={disabled}
            style={{
              flex: 1,
              textAlign: 'left',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.4 : 1,
              padding: '12px 14px',
              borderRadius: 10,
              border: `1px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
              background: sel ? 'rgba(184,134,58,0.12)' : 'transparent',
              color: 'var(--cream)',
              transition: 'border-color .15s, background .15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%', flex: '0 0 auto',
                border: `1px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sel && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)' }} />}
              </span>
              {label}
            </span>
            <span style={{ display: 'block', fontSize: 10.5, color: 'var(--muted)', marginTop: 4, paddingLeft: 21 }}>
              {sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
