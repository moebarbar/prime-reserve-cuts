import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { query } from '@/lib/db'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { hashPassword, verifyPassword } from '@/lib/password'
import { itemsLabel, itemsTotal, type OrderItem } from '@/lib/orderItems'

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

interface Selection { name: string; qty: number; grade?: 'Local' | 'USDA Choice' }

// The upcoming Saturday (delivery day) as YYYY-MM-DD.
function nextSaturday(): string {
  const d = new Date()
  const days = (6 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Find-or-create the customer account from the checkout credentials.
 * Returns the customer id, or an error message to surface to the buyer.
 * Retries with the same email+password reuse the existing account (so a failed
 * checkout can be retried, and returning customers can add orders).
 */
async function resolveCustomer(input: {
  email: string; username: string; password: string; name: string; building: string; unit: string
}): Promise<{ id: string } | { error: string }> {
  const [byEmail] = await query<{ id: string; password_hash: string }>(
    `SELECT id, password_hash FROM customers WHERE lower(email) = lower($1) LIMIT 1`, [input.email],
  ).catch(() => [])
  if (byEmail) {
    const ok = await verifyPassword(input.password, byEmail.password_hash)
    if (!ok) return { error: 'An account with this email already exists. Use its password to continue, or sign in.' }
    // Keep contact details fresh for this delivery.
    await query(`UPDATE customers SET name = $1, building = $2, unit = $3, updated_at = NOW() WHERE id = $4`,
      [input.name, input.building, input.unit, byEmail.id]).catch(() => {})
    return { id: byEmail.id }
  }

  // New account — validate the requested username.
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(input.username)) {
    return { error: 'Username must be 3–30 characters: letters, numbers, or underscores.' }
  }
  if (input.password.length < 8 || input.password.length > 200) {
    return { error: 'Password must be at least 8 characters.' }
  }
  const [byUser] = await query<{ id: string }>(
    `SELECT id FROM customers WHERE lower(username) = lower($1) LIMIT 1`, [input.username],
  ).catch(() => [])
  if (byUser) return { error: 'That username is taken — try another.' }

  const password_hash = await hashPassword(input.password)
  const [created] = await query<{ id: string }>(
    `INSERT INTO customers (email, username, password_hash, name, building, unit)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [input.email, input.username, password_hash, input.name, input.building, input.unit],
  ).catch(() => [])
  if (!created) return { error: 'Could not create your account. Please try again.' }
  return { id: created.id }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`checkout:${ip}`, 5, 10 * 60 * 1000)) {
    return rateLimitResponse()
  }

  let body: {
    name?: unknown; email?: unknown; selections?: unknown; building?: unknown; unit?: unknown
    purchaseType?: unknown; username?: unknown; password?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, selections, building, unit } = body
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  // 'one_time' = pay once; anything else defaults to the weekly subscription.
  const kind: 'subscription' | 'one_time' = body.purchaseType === 'one_time' ? 'one_time' : 'subscription'
  const isSubscription = kind === 'subscription'

  if (!name || !email || !building || !unit || !Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!password) {
    return NextResponse.json({ error: 'Choose a password to manage your deliveries.' }, { status: 400 })
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
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

  // Build Stripe line_items + structured items from selections. Prices come from
  // the canonical catalog (per-pound, server-side trust boundary); qty = pounds.
  const line_items: {
    price_data: { currency: string; product_data: { name: string }; unit_amount: number; recurring?: { interval: 'week' } }
    quantity: number
  }[] = []
  const items: OrderItem[] = []
  let hasSpecial = false
  for (const sel of selections as Selection[]) {
    const [product] = await query<{ price: number | string; price_choice: number | string | null; category: string }>(
      `SELECT price, price_choice, category FROM products WHERE name = $1 AND available = true LIMIT 1`,
      [sel.name],
    ).catch(() => [] as { price: number | string; price_choice: number | string | null; category: string }[])
    if (!product) {
      return NextResponse.json({ error: `Unavailable product "${sel.name}"` }, { status: 400 })
    }
    const local = Number(product.price)
    const choice = product.price_choice != null ? Number(product.price_choice) : NaN
    // USDA Choice only when the product offers it (automatic products).
    const grade = sel.grade === 'USDA Choice' && Number.isFinite(choice) && choice > 0 ? 'USDA Choice' : 'Local'
    const pricePerLb = grade === 'USDA Choice' ? choice : local
    if (!Number.isFinite(pricePerLb) || pricePerLb <= 0) {
      return NextResponse.json({ error: `Unavailable product "${sel.name}"` }, { status: 400 })
    }
    if (product.category === 'special') hasSpecial = true
    items.push({ name: sel.name, grade, pricePerLb, qty: sel.qty })
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `${sel.name}${grade === 'USDA Choice' ? ' (USDA Choice)' : ''} (per lb)` },
        unit_amount: Math.round(pricePerLb * 100),
        ...(isSubscription ? { recurring: { interval: 'week' as const } } : {}),
      },
      quantity: sel.qty,
    })
  }

  // Special cuts are one-time only — never let one ride on a weekly subscription.
  if (hasSpecial && isSubscription) {
    return NextResponse.json({ error: 'Special cuts are one-time only. Switch to a one-time order to include them.' }, { status: 400 })
  }

  const cutLabel = itemsLabel(items)
  const weeklyTotal = itemsTotal(items)

  // Create/reuse the account BEFORE payment so the buyer can manage the order.
  const account = await resolveCustomer({
    email: email as string, username, password, name: name as string, building: building as string, unit: unit as string,
  })
  if ('error' in account) {
    return NextResponse.json({ error: account.error }, { status: 409 })
  }

  const metadata = {
    name: name as string, building: building as string, unit: unit as string,
    cut: cutLabel, kind, customer_id: account.id,
  }

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

    // Pre-create the order as 'pending' with structured items so the dashboard
    // works the moment payment confirms; the webhook flips it to 'active'.
    await query(
      `INSERT INTO orders (customer, email, building, unit, cut, items, price, kind, status, start_date, next_delivery, customer_id, stripe_session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $9, $10, $11)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [name, email, building, unit, cutLabel, JSON.stringify(items), weeklyTotal, kind, nextSaturday(), account.id, session.id],
    ).catch(err => console.error('pending order insert failed:', err))

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
