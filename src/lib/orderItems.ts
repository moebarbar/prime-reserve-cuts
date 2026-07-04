import { query } from '@/lib/db'
import type { Grade } from '@/data/products'

export interface OrderItem {
  name: string
  grade: Grade          // 'Local' | 'USDA Choice'
  pricePerLb: number
  qty: number
}

/** "Ribeye (USDA Choice) ×2lb, Ground Beef 80/20 ×1lb" — Local is implicit. */
export function itemsLabel(items: OrderItem[]): string {
  return items
    .map(i => `${i.name}${i.grade === 'USDA Choice' ? ' (USDA Choice)' : ''} ×${i.qty}lb`)
    .join(', ')
}

export function itemsTotal(items: OrderItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.pricePerLb * i.qty, 0) * 100) / 100
}

/**
 * Validate + re-price a client-supplied selection against the live catalog.
 * Prices ALWAYS come from the DB (never trusted from the browser): the Local
 * price, or `price_choice` when the customer picked USDA Choice. Unknown or
 * unavailable products are dropped; quantities clamp to whole 1..20 lb.
 * Returns the priced items, total, label, and whether any 'special' cut is
 * present (special cuts are one-time only). Null if nothing valid remains.
 */
export async function repriceSelections(
  raw: Array<{ name: unknown; grade?: unknown; qty: unknown }>,
): Promise<{ items: OrderItem[]; total: number; label: string; hasSpecial: boolean } | null> {
  const out: OrderItem[] = []
  let hasSpecial = false
  for (const sel of raw) {
    if (typeof sel?.name !== 'string' || !sel.name.trim()) continue
    const qty = Math.floor(Number(sel.qty))
    if (!Number.isFinite(qty) || qty < 1) continue
    const clampedQty = Math.min(qty, 20)
    const wantsChoice = sel.grade === 'USDA Choice'

    const [product] = await query<{ price: number | string; price_choice: number | string | null; category: string }>(
      `SELECT price, price_choice, category FROM products WHERE name = $1 AND available = true LIMIT 1`,
      [sel.name],
    ).catch(() => [] as { price: number | string; price_choice: number | string | null; category: string }[])
    if (!product) continue

    const local = Number(product.price)
    const choice = product.price_choice != null ? Number(product.price_choice) : NaN
    // USDA Choice only if the product actually offers it (automatic products).
    const grade: Grade = wantsChoice && Number.isFinite(choice) && choice > 0 ? 'USDA Choice' : 'Local'
    const pricePerLb = grade === 'USDA Choice' ? choice : local
    if (!Number.isFinite(pricePerLb) || pricePerLb <= 0) continue
    if (product.category === 'special') hasSpecial = true

    // Merge duplicate (name, grade) pairs, capping combined qty at 20.
    const existing = out.find(i => i.name === sel.name && i.grade === grade)
    if (existing) existing.qty = Math.min(existing.qty + clampedQty, 20)
    else out.push({ name: sel.name, grade, pricePerLb, qty: clampedQty })
  }
  if (out.length === 0) return null
  return { items: out, total: itemsTotal(out), label: itemsLabel(out), hasSpecial }
}

/** Coerce a JSONB `items` column (may be string or array) into typed items. */
export function parseItems(raw: unknown): OrderItem[] {
  let arr: unknown = raw
  if (typeof raw === 'string') { try { arr = JSON.parse(raw) } catch { return [] } }
  if (!Array.isArray(arr)) return []
  return arr
    .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
    .map(i => ({
      name: String(i.name ?? ''),
      grade: (i.grade === 'USDA Choice' ? 'USDA Choice' : 'Local') as Grade,
      pricePerLb: Number(i.pricePerLb) || 0,
      qty: Number(i.qty) || 0,
    }))
    .filter(i => i.name && i.qty > 0)
}
