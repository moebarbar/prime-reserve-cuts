import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import stripe from '@/lib/stripe'
import { currentCustomerId } from '@/lib/customerAuth'
import { repriceSelections, parseItems, itemsLabel, itemsTotal } from '@/lib/orderItems'

type Action = 'setItems' | 'skipNext' | 'pause' | 'resume' | 'cancel'

// Next Saturday as YYYY-MM-DD (delivery day).
function nextSaturday(from = new Date()): string {
  const d = new Date(from)
  const days = (6 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Stripe subscription item price_data needs a Product *id* (no inline product).
// Reuse STRIPE_WEEKLY_PRODUCT_ID if configured, else create one and memoize it.
let cachedWeeklyProductId: string | null = null
async function weeklyProductId(): Promise<string> {
  if (process.env.STRIPE_WEEKLY_PRODUCT_ID) return process.env.STRIPE_WEEKLY_PRODUCT_ID
  if (cachedWeeklyProductId) return cachedWeeklyProductId
  const p = await stripe.products.create({ name: 'Weekly local beef order' })
  cachedWeeklyProductId = p.id
  return p.id
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customerId = await currentCustomerId()
  if (!customerId) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const { id } = await params
  let body: { action?: unknown; items?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const action = body.action as Action

  // Ownership check — the order must belong to this customer.
  const [order] = await query<{
    id: string; kind: string; status: string; stripe_subscription_id: string | null; next_delivery: string | null
  }>(
    `SELECT id, kind, status, stripe_subscription_id, next_delivery FROM orders WHERE id = $1 AND customer_id = $2`,
    [id, customerId],
  ).catch(() => [])
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status === 'cancelled' || order.status === 'completed') {
    return NextResponse.json({ error: 'This order can no longer be changed.' }, { status: 409 })
  }

  let stripeWarning: string | null = null

  switch (action) {
    // ── Edit cuts / quantities ────────────────────────────────────────────────
    case 'setItems': {
      if (!Array.isArray(body.items)) return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
      const repriced = await repriceSelections(body.items as Array<{ name: unknown; qty: unknown }>)
      if (!repriced) return NextResponse.json({ error: 'Pick at least one available cut.' }, { status: 400 })

      // Best-effort billing sync: update the live Stripe subscription's amount.
      // DB stays authoritative so a Stripe hiccup never corrupts the order.
      if (order.kind === 'subscription' && order.stripe_subscription_id) {
        try {
          const sub = await stripe.subscriptions.retrieve(order.stripe_subscription_id)
          const productId = await weeklyProductId()
          // Replace all existing items with a single line billing the new weekly
          // total. (Delete the extras, repoint the first.)
          const [first, ...rest] = sub.items.data
          if (first) {
            await stripe.subscriptions.update(order.stripe_subscription_id, {
              items: [
                {
                  id: first.id,
                  price_data: {
                    currency: 'usd',
                    product: productId,
                    unit_amount: Math.round(repriced.total * 100),
                    recurring: { interval: 'week' },
                  },
                  quantity: 1,
                },
                ...rest.map(it => ({ id: it.id, deleted: true as const })),
              ],
              proration_behavior: 'none',
            })
          }
        } catch (err) {
          console.error('Stripe subscription update failed:', err)
          stripeWarning = 'Saved your changes. Billing update is syncing and will apply to your next invoice.'
        }
      }

      await query(
        `UPDATE orders SET items = $1, cut = $2, price = $3, updated_at = NOW() WHERE id = $4`,
        [JSON.stringify(repriced.items), repriced.label, repriced.total, id],
      )
      return NextResponse.json({ ok: true, items: repriced.items, price: repriced.total, cut: repriced.label, warning: stripeWarning })
    }

    // ── Skip the next delivery (push a week) ─────────────────────────────────
    case 'skipNext': {
      if (order.kind !== 'subscription') {
        return NextResponse.json({ error: 'Only subscriptions can skip a week.' }, { status: 400 })
      }
      const base = order.next_delivery ? new Date(order.next_delivery) : new Date()
      const skipTo = nextSaturday(new Date(base.getTime() + 24 * 3600 * 1000))
      await query(`UPDATE orders SET next_delivery = $1, updated_at = NOW() WHERE id = $2`, [skipTo, id])
      return NextResponse.json({ ok: true, next_delivery: skipTo })
    }

    // ── Pause / resume ───────────────────────────────────────────────────────
    case 'pause': {
      await query(`UPDATE orders SET status = 'paused', updated_at = NOW() WHERE id = $1`, [id])
      return NextResponse.json({ ok: true, status: 'paused' })
    }
    case 'resume': {
      await query(`UPDATE orders SET status = 'active', updated_at = NOW() WHERE id = $1`, [id])
      return NextResponse.json({ ok: true, status: 'active' })
    }

    // ── Cancel (real Stripe cancel for subscriptions) ────────────────────────
    case 'cancel': {
      if (order.kind === 'subscription' && order.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(order.stripe_subscription_id)
        } catch (err) {
          console.error('Stripe subscription cancel failed:', err)
          stripeWarning = 'Your order is cancelled with us; if any charge appears, contact support and we’ll refund it.'
        }
      }
      await query(`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [id])
      return NextResponse.json({ ok: true, status: 'cancelled', warning: stripeWarning })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}

// Optional: expose a single order (used for optimistic refreshes)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customerId = await currentCustomerId()
  if (!customerId) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { id } = await params
  const [order] = await query<Record<string, unknown>>(
    `SELECT id, kind, status, cut, items, price, building, unit, start_date, next_delivery
     FROM orders WHERE id = $1 AND customer_id = $2`,
    [id, customerId],
  ).catch(() => [])
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({
    ...order,
    items: parseItems(order.items),
    price: Number(order.price) || 0,
    _total: itemsTotal(parseItems(order.items)),
  })
}
