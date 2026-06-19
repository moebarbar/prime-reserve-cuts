import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { PRICE_BY_NAME } from '@/data/products'

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

interface Selection { name: string; qty: number }

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`checkout:${ip}`, 5, 10 * 60 * 1000)) {
    return rateLimitResponse()
  }

  let body: { name?: unknown; email?: unknown; selections?: unknown; building?: unknown; unit?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, selections, building, unit } = body

  if (!name || !email || !building || !unit || !Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
  // catalog (per-pound) and the customer's qty is the number of pounds/week.
  const line_items: {
    price_data: {
      currency: string
      product_data: { name: string }
      unit_amount: number
      recurring: { interval: 'week' }
    }
    quantity: number
  }[] = []
  for (const sel of selections as Selection[]) {
    const pricePerLb = PRICE_BY_NAME[sel.name]
    if (pricePerLb == null) {
      return NextResponse.json({ error: `Unknown product "${sel.name}"` }, { status: 400 })
    }
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `${sel.name} (per lb)` },
        unit_amount: Math.round(pricePerLb * 100),
        recurring: { interval: 'week' },
      },
      quantity: sel.qty,
    })
  }

  // Compact cut label for metadata / DB
  const cutLabel = (selections as Selection[]).map(s => `${s.name} ×${s.qty}lb`).join(', ')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email as string,
      line_items,
      metadata: { name: name as string, building: building as string, unit: unit as string, cut: cutLabel },
      subscription_data: {
        metadata: { name: name as string, building: building as string, unit: unit as string, cut: cutLabel },
      },
      success_url: `${BASE_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
