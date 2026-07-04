import { query } from '@/lib/db'

export interface OrderItem {
  name: string
  pricePerLb: number
  qty: number
}

/** "Bone-in Ribeye ×2lb, Filet ×1lb" — the human label the manifest/email use. */
export function itemsLabel(items: OrderItem[]): string {
  return items.map(i => `${i.name} ×${i.qty}lb`).join(', ')
}

export function itemsTotal(items: OrderItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.pricePerLb * i.qty, 0) * 100) / 100
}

/**
 * Validate + re-price a client-supplied selection against the live catalog.
 * Prices ALWAYS come from the DB (never trusted from the browser). Unknown or
 * unavailable products are dropped; quantities are clamped to whole 1..20 lb.
 * Returns null if nothing valid remains.
 */
export async function repriceSelections(
  raw: Array<{ name: unknown; qty: unknown }>,
): Promise<{ items: OrderItem[]; total: number; label: string } | null> {
  const out: OrderItem[] = []
  for (const sel of raw) {
    if (typeof sel?.name !== 'string' || !sel.name.trim()) continue
    const qty = Math.floor(Number(sel.qty))
    if (!Number.isFinite(qty) || qty < 1) continue
    const clampedQty = Math.min(qty, 20)
    const [product] = await query<{ price: number | string }>(
      `SELECT price FROM products WHERE name = $1 AND available = true LIMIT 1`,
      [sel.name],
    ).catch(() => [] as { price: number | string }[])
    const pricePerLb = product ? Number(product.price) : NaN
    if (!Number.isFinite(pricePerLb) || pricePerLb <= 0) continue
    // Merge duplicate names, capping the combined qty at 20.
    const existing = out.find(i => i.name === sel.name)
    if (existing) existing.qty = Math.min(existing.qty + clampedQty, 20)
    else out.push({ name: sel.name, pricePerLb, qty: clampedQty })
  }
  if (out.length === 0) return null
  return { items: out, total: itemsTotal(out), label: itemsLabel(out) }
}

/** Coerce a JSONB `items` column (may be string or array) into typed items. */
export function parseItems(raw: unknown): OrderItem[] {
  let arr: unknown = raw
  if (typeof raw === 'string') { try { arr = JSON.parse(raw) } catch { return [] } }
  if (!Array.isArray(arr)) return []
  return arr
    .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
    .map(i => ({ name: String(i.name ?? ''), pricePerLb: Number(i.pricePerLb) || 0, qty: Number(i.qty) || 0 }))
    .filter(i => i.name && i.qty > 0)
}
