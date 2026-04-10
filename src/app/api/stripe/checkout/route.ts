import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

const PRICE_IDS: Record<string, string> = {
  'Ribeye':       process.env.STRIPE_PRICE_RIBEYE   ?? '',
  'Filet Mignon': process.env.STRIPE_PRICE_FILET    ?? '',
  'NY Strip':     process.env.STRIPE_PRICE_NYSTRIP  ?? '',
  'A5 Wagyu':     process.env.STRIPE_PRICE_WAGYU    ?? '',
  'Tomahawk':     process.env.STRIPE_PRICE_TOMAHAWK ?? '',
}

// Use the configured base URL — never trust the client Origin header for redirects
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  // 5 checkout attempts per IP per 10 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`checkout:${ip}`, 5, 10 * 60 * 1000)) {
    return rateLimitResponse()
  }

  let body: { name?: unknown; email?: unknown; cut?: unknown; building?: unknown; unit?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, cut, building, unit } = body

  if (!name || !email || !cut || !building || !unit) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const priceId = PRICE_IDS[cut as string]
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for "${cut}"` }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email as string,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { name: name as string, building: building as string, unit: unit as string, cut: cut as string },
      subscription_data: {
        metadata: { name: name as string, building: building as string, unit: unit as string, cut: cut as string },
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
