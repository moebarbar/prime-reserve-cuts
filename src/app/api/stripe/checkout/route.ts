import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'

// Map cut names to Stripe Price IDs (create these in your Stripe dashboard)
// Dashboard → Products → Add product → Add a price (recurring, monthly)
// Then paste the price_xxx IDs here
const PRICE_IDS: Record<string, string> = {
  'Ribeye':       process.env.STRIPE_PRICE_RIBEYE       ?? '',
  'Filet Mignon': process.env.STRIPE_PRICE_FILET        ?? '',
  'NY Strip':     process.env.STRIPE_PRICE_NYSTRIP      ?? '',
  'A5 Wagyu':     process.env.STRIPE_PRICE_WAGYU        ?? '',
  'Tomahawk':     process.env.STRIPE_PRICE_TOMAHAWK     ?? '',
}

export async function POST(req: NextRequest) {
  const { name, email, cut, building, unit } = await req.json()

  const priceId = PRICE_IDS[cut]
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for "${cut}"` }, { status: 400 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { name, building, unit, cut },
    subscription_data: {
      metadata: { name, building, unit, cut },
    },
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/?checkout=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
