import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { query } from '@/lib/db'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

interface Selection { name: string; qty: number }

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`checkout:${ip}`, 5, 10 * 60 * 1000)) {
    return rateLimitResponse()
  }

  let body: { name?: unknown; email?: unknown; selections?: unknown; building?: unknown; unit?: unknown; purchaseType?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, selections, building, unit } = body
  // 'one_time' = pay once; anything else defaults to the weekly subscription.
  const kind: 'subscription' | 'one_time' = body.purchaseType === 'one_time' ? 'one_time' : 'subscription'
  const isSubscription = kind === 'subscription'

  if (!name || !email || !building || !unit || !Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  // Cap the array itself — each entry costs a DB lookup below
  if (selections.length > 20) {
    return NextResponse.json({ error: 'Too many selections' }, { status: 400 })
  }

  // String length limits
  if (
    typeof name     !== 'string' || name.length     > 200 ||
    typeof email    !== 'string' || email.length    > 254 ||
    typeof building !== 'string' || building.length > 200 ||
    typeof unit     !== 'string' || unit.length     > 50
  ) {
    return NextResponse.json({ error: 'Invalid field values' }, { status: 400 })
  }

  // Validate each selection: name must be a non-empty string, qty a positive integer ≤ 20
  for (const sel of selections as Selection[]) {
    if (typeof sel.name !== 'string' || !sel.name.trim() || sel.name.length > 100) {
      return NextResponse.json({ error: 'Invalid selection name' }, { status: 400 })
    }
    if (!Number.isInteger(sel.qty) || sel.qty < 1 || sel.qty > 20) {
      return NextResponse.json({ error: 'Invalid selection quantity' }, { status: 400 })
    }
  }

  // Build Stripe line_items from selections. Prices come from the canonical
  // catalog (per-pound) and the customer's qty is the number of pounds. For a
  // subscription each line recurs weekly; for a one-time order it doesn't.
  const line_items: {
    price_data: {
      currency: string
      product_data: { name: string }
      unit_amount: number
      recurring?: { interval: 'week' }
    }
    quantity: number
  }[] = []
  for (const sel of selections as Selection[]) {
    // Price comes from the products table (server-side trust boundary) — never
    // from the browser — so admin price edits flow straight into billing.
    const [product] = await query<{ price: number | string }>(
      `SELECT price FROM products WHERE name = $1 AND available = true LIMIT 1`,
      [sel.name],
    ).catch(() => [] as { price: number | string }[])
    const pricePerLb = product ? Number(product.price) : NaN
    if (!Number.isFinite(pricePerLb) || pricePerLb <= 0) {
      return NextResponse.json({ error: `Unavailable product "${sel.name}"` }, { status: 400 })
    }
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `${sel.name} (per lb)` },
        unit_amount: Math.round(pricePerLb * 100),
        ...(isSubscription ? { recurring: { interval: 'week' as const } } : {}),
      },
      quantity: sel.qty,
    })
  }

  // Compact cut label for metadata / DB
  const cutLabel = (selections as Selection[]).map(s => `${s.name} ×${s.qty}lb`).join(', ')
  const metadata = { name: name as string, building: building as string, unit: unit as string, cut: cutLabel, kind }

  // Stripe not configured (e.g. local dev without keys) — tell the client
  // explicitly so it can show its demo confirmation. Every other failure below
  // is a real error and must NOT look like a successful order.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ demo: true })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      customer_email: email as string,
      line_items,
      metadata,
      ...(isSubscription ? { subscription_data: { metadata } } : {}),
      success_url: `${BASE_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
