'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './account.module.css'

type Grade = 'Local' | 'USDA Choice'
interface Item { name: string; grade: Grade; pricePerLb: number; qty: number }
interface Order {
  id: string
  kind: 'subscription' | 'one_time'
  status: string
  cut: string
  items: Item[]
  price: number
  building: string
  unit: string
  next_delivery: string | null
  start_date: string | null
}
interface Customer { username: string; name: string; email: string; building: string; unit: string }
// One selectable option per (product, grade) — subscriptions only add automatic cuts.
interface AddOption { key: string; name: string; grade: Grade; pricePerLb: number }

type Notice = { kind: 'ok' | 'warn' | 'err'; text: string }

const money = (n: number) => `$${n.toFixed(2)}`
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '—'
const lineTotal = (items: Item[]) => items.reduce((s, i) => s + i.pricePerLb * i.qty, 0)

const STATUS_BADGE: Record<string, string> = {
  active: styles.bActive, paused: styles.bPaused, pending: styles.bPending,
  cancelled: styles.bCancelled, completed: styles.bCompleted,
}
const MANAGEABLE = new Set(['active', 'paused', 'pending'])

export default function AccountDashboard() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [addOptions, setAddOptions] = useState<AddOption[]>([])
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notices, setNotices] = useState<Record<string, Notice>>({})
  const [addSel, setAddSel] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/account/me')
      if (res.status === 401) { router.push('/account/login'); return }
      const data = await res.json()
      setCustomer(data.customer)
      setOrders(data.orders)
    } catch { setLoadError(true) }
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then((rows: Array<{ name: string; price: number | string; price_choice: number | string | null; available: boolean; category: string }>) => {
      if (!Array.isArray(rows)) return
      // Subscriptions hold only automatic cuts — offer each in Local + USDA Choice.
      const opts: AddOption[] = []
      rows.filter(r => r.available && r.category === 'automatic').forEach(r => {
        opts.push({ key: `${r.name}||Local`, name: r.name, grade: 'Local', pricePerLb: Number(r.price) || 0 })
        if (r.price_choice != null) opts.push({ key: `${r.name}||USDA Choice`, name: r.name, grade: 'USDA Choice', pricePerLb: Number(r.price_choice) || 0 })
      })
      setAddOptions(opts)
    }).catch(() => {})
  }, [])

  const itemKey = (i: { name: string; grade: Grade }) => `${i.name}||${i.grade}`

  const markDirty = (id: string) => setDirty(prev => new Set(prev).add(id))
  const clearDirty = (id: string) => setDirty(prev => { const n = new Set(prev); n.delete(id); return n })
  const setNotice = (id: string, n: Notice | null) =>
    setNotices(prev => { const c = { ...prev }; if (n) c[id] = n; else delete c[id]; return c })

  const patchItems = (id: string, updater: (items: Item[]) => Item[]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, items: updater(o.items) } : o))
    markDirty(id); setNotice(id, null)
  }
  const setQty = (id: string, key: string, qty: number) => {
    if (qty < 1 || qty > 20) return
    patchItems(id, items => items.map(i => itemKey(i) === key ? { ...i, qty } : i))
  }
  const removeItem = (id: string, key: string) =>
    patchItems(id, items => items.filter(i => itemKey(i) !== key))
  const addItem = (id: string) => {
    const key = addSel[id]
    if (!key) return
    const opt = addOptions.find(o => o.key === key)
    if (!opt) return
    patchItems(id, items => items.some(i => itemKey(i) === key)
      ? items
      : [...items, { name: opt.name, grade: opt.grade, pricePerLb: opt.pricePerLb, qty: 1 }])
    setAddSel(prev => ({ ...prev, [id]: '' }))
  }

  const act = async (id: string, action: string, extra?: object) => {
    setBusyId(id); setNotice(id, null)
    try {
      const res = await fetch(`/api/account/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNotice(id, { kind: 'err', text: typeof data.error === 'string' ? data.error : 'Something went wrong.' })
        setBusyId(null); return false
      }
      if (data.warning) setNotice(id, { kind: 'warn', text: data.warning })
      setBusyId(null); return data
    } catch {
      setNotice(id, { kind: 'err', text: 'Network error — please try again.' })
      setBusyId(null); return false
    }
  }

  const save = async (o: Order) => {
    const data = await act(o.id, 'setItems', { items: o.items.map(i => ({ name: i.name, grade: i.grade, qty: i.qty })) })
    if (data) {
      setOrders(prev => prev.map(x => x.id === o.id ? { ...x, items: data.items ?? x.items, price: data.price ?? x.price, cut: data.cut ?? x.cut } : x))
      clearDirty(o.id)
      if (!data.warning) {
        setNotice(o.id, {
          kind: 'ok',
          text: data.billingSynced
            ? 'Updated — your next weekly invoice reflects the change.'
            : 'Your delivery has been updated.',
        })
      }
    }
  }
  const skip = async (o: Order) => {
    const data = await act(o.id, 'skipNext')
    if (data) { setOrders(prev => prev.map(x => x.id === o.id ? { ...x, next_delivery: data.next_delivery ?? x.next_delivery } : x)); setNotice(o.id, { kind: 'ok', text: `Next delivery skipped to ${fmtDate(data.next_delivery)}.` }) }
  }
  const setStatus = async (o: Order, action: 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel' && !confirm('Cancel this order? This cannot be undone.')) return
    const data = await act(o.id, action)
    if (data) setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: data.status ?? x.status } : x))
  }

  const logout = async () => {
    await fetch('/api/account/logout', { method: 'POST' }).catch(() => {})
    router.push('/account/login'); router.refresh()
  }

  if (loading) return <main className={styles.page}><div className={styles.wrap}><div className={styles.sub}>Loading your account…</div></div></main>
  if (loadError) return <main className={styles.page}><div className={styles.wrap}><div className={styles.sub}>Could not load your account. Please refresh.</div></div></main>

  const manageable = orders.filter(o => MANAGEABLE.has(o.status))
  const history = orders.filter(o => !MANAGEABLE.has(o.status))
  const firstName = (customer?.name || customer?.username || 'there').split(' ')[0]

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a href="/" className={styles.brand}><span className={styles.brandName}>Automatic <span>Cow</span></span></a>
        <button className={styles.signout} onClick={logout}>Sign out</button>
      </header>

      <div className={styles.wrap}>
        <div className={styles.eyebrow}>Your Kitchen</div>
        <h1 className={styles.hello}>Welcome back,<br /><em>{firstName}.</em></h1>
        <p className={styles.sub}>Manage your cuts, quantities, and delivery schedule — change anything anytime.</p>

        {manageable.length === 0 && history.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🥩</div>
            <div className={styles.emptyTitle}>No deliveries yet</div>
            <div className={styles.emptyBody}>Start your weekly local beef delivery in under a minute.</div>
            <a href="/" className={styles.cta}>Start an order</a>
          </div>
        )}

        {manageable.map(o => {
          const total = lineTotal(o.items)
          const isSub = o.kind === 'subscription'
          // One-time orders are already paid — read-only (subscriptions are editable).
          const editable = isSub && (o.status === 'active' || o.status === 'paused')
          const notAdded = addOptions.filter(op => !o.items.some(i => itemKey(i) === op.key))
          const notice = notices[o.id]
          const busy = busyId === o.id
          return (
            <section key={o.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.kind}>{isSub ? <>Weekly <em>subscription</em></> : <>One-time <em>order</em></>}</div>
                  <div className={styles.meta}>
                    {o.status === 'pending'
                      ? <>Awaiting payment confirmation</>
                      : <>{isSub ? 'Next delivery' : 'Delivery'} <strong>{fmtDate(o.next_delivery)}</strong> · {o.building}, Unit {o.unit}</>}
                  </div>
                </div>
                <span className={`${styles.badge} ${STATUS_BADGE[o.status] ?? ''}`}>{o.status}</span>
              </div>

              <div className={styles.items}>
                {o.items.length === 0 && <div className={styles.meta}>No cuts in this delivery yet — add one below.</div>}
                {o.items.map(i => (
                  <div key={itemKey(i)} className={styles.item}>
                    <div>
                      <span className={styles.itemName}>{i.name}</span>
                      {i.grade === 'USDA Choice' && <span className={styles.itemGrade}>USDA Choice</span>}
                      <span className={styles.itemPer}>{money(i.pricePerLb)}/lb</span>
                    </div>
                    {editable ? (
                      <div className={styles.qty}>
                        <button className={styles.qbtn} onClick={() => setQty(o.id, itemKey(i), i.qty - 1)} disabled={i.qty <= 1} aria-label={`Decrease ${i.name}`}>−</button>
                        <span className={styles.qval}>{i.qty} lb</span>
                        <button className={styles.qbtn} onClick={() => setQty(o.id, itemKey(i), i.qty + 1)} disabled={i.qty >= 20} aria-label={`Increase ${i.name}`}>+</button>
                        <button className={styles.remove} onClick={() => removeItem(o.id, itemKey(i))} aria-label={`Remove ${i.name}`}>×</button>
                      </div>
                    ) : (
                      <div className={styles.qval}>{i.qty} lb</div>
                    )}
                    <div className={styles.lineTotal}>{money(i.pricePerLb * i.qty)}</div>
                  </div>
                ))}
              </div>

              {editable && notAdded.length > 0 && (
                <div className={styles.addRow}>
                  <select className={styles.addSelect} value={addSel[o.id] ?? ''} onChange={e => setAddSel(prev => ({ ...prev, [o.id]: e.target.value }))}>
                    <option value="">+ Add a cut…</option>
                    {notAdded.map(op => (
                      <option key={op.key} value={op.key}>
                        {op.name}{op.grade === 'USDA Choice' ? ' · USDA Choice' : ''} — {money(op.pricePerLb)}/lb
                      </option>
                    ))}
                  </select>
                  <button className={styles.addBtn} onClick={() => addItem(o.id)} disabled={!addSel[o.id]}>Add</button>
                </div>
              )}

              <div className={styles.totalRow}>
                <span className={styles.totalLbl}>{isSub ? 'Weekly total' : 'Order total'}</span>
                <span className={styles.totalVal}>{money(total)} <span>{isSub ? '/week' : 'one-time'}</span></span>
              </div>

              {notice && (
                <div className={`${styles.notice} ${notice.kind === 'ok' ? styles.noticeOk : notice.kind === 'warn' ? styles.noticeWarn : styles.noticeErr}`}>
                  {notice.text}
                </div>
              )}

              {!isSub && o.status !== 'pending' && (
                <div className={`${styles.notice} ${styles.noticeWarn}`} style={{ marginTop: 16 }}>
                  This is a one-time order and is already paid. Need to change or cancel it? Email us and we’ll sort it out.
                </div>
              )}

              {editable && (
                <div className={styles.actions}>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => save(o)} disabled={busy || !dirty.has(o.id) || o.items.length === 0}>
                    {busy ? 'Saving…' : dirty.has(o.id) ? 'Save changes' : 'Saved'}
                  </button>
                  {isSub && <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => skip(o)} disabled={busy}>Skip next week</button>}
                  {isSub && o.status === 'active' && <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStatus(o, 'pause')} disabled={busy}>Pause</button>}
                  {isSub && o.status === 'paused' && <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStatus(o, 'resume')} disabled={busy}>Resume</button>}
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setStatus(o, 'cancel')} disabled={busy}>Cancel</button>
                </div>
              )}
            </section>
          )
        })}

        {history.length > 0 && (
          <>
            <div className={styles.histHead}>History</div>
            {history.map(o => (
              <section key={o.id} className={styles.card} style={{ opacity: 0.72 }}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.kind}>{o.kind === 'subscription' ? 'Weekly subscription' : 'One-time order'}</div>
                    <div className={styles.meta}>{o.cut || '—'} · {money(o.price)}</div>
                  </div>
                  <span className={`${styles.badge} ${STATUS_BADGE[o.status] ?? ''}`}>{o.status}</span>
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  )
}
