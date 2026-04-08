import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import resend from '@/lib/resend'
import { query } from '@/lib/db'
import { render } from '@react-email/render'
import SubscriptionConfirmed from '@/emails/subscription-confirmed'

export const runtime = 'nodejs'

// Disable Next.js body parsing — Stripe needs the raw body to verify the signature
export async function POST(req: NextRequest) {
  const sig    = req.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  const body   = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── checkout.session.completed ──────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object
    const meta     = session.metadata ?? {}
    const email    = session.customer_email ?? ''
    const name     = meta.name   ?? 'Member'
    const building = meta.building ?? ''
    const unit     = meta.unit   ?? ''
    const cut      = meta.cut    ?? ''

    // 1. Save order to database
    await query(`
      INSERT INTO orders (customer, email, building, unit, cut, price, status, start_date, next_delivery)
      VALUES ($1, $2, $3, $4, $5,
        (SELECT price FROM products WHERE name = $5 LIMIT 1),
        'active',
        date_trunc('month', NOW() + interval '1 month'),
        date_trunc('month', NOW() + interval '1 month')
      )
      ON CONFLICT DO NOTHING
    `, [name, email, building, unit, cut])

    // 2. Update lead status to 'converted' if they came through the form
    await query(`
      UPDATE leads SET status = 'converted', updated_at = NOW()
      WHERE email = $1 AND status != 'converted'
    `, [email])

    // 3. Send confirmation email via Resend
    const nextDelivery = new Date()
    nextDelivery.setMonth(nextDelivery.getMonth() + 1)
    nextDelivery.setDate(1)
    const nextDeliveryStr = nextDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const html = await render(
      SubscriptionConfirmed({
        customerName: name.split(' ')[0],
        buildingName: building,
        unit,
        cutName: cut,
        cutDetail: '',
        price: 0, // will be fetched from DB in real usage; placeholder
        nextDelivery: nextDeliveryStr,
      })
    )

    await resend.emails.send({
      from:    'Automatic Cow <hello@automaticcow.com>',
      to:      email,
      subject: `You're in, ${name.split(' ')[0]}. First delivery ${nextDeliveryStr}.`,
      html,
    })

    console.log(`✓ Order created + email sent to ${email}`)
  }

  // ── customer.subscription.deleted ──────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub   = event.data.object
    const email = typeof sub.customer === 'string'
      ? (await stripe.customers.retrieve(sub.customer) as { email?: string }).email ?? ''
      : ''

    if (email) {
      await query(`
        UPDATE orders SET status = 'cancelled', updated_at = NOW()
        WHERE email = $1 AND status != 'cancelled'
      `, [email])
      console.log(`✓ Subscription cancelled for ${email}`)
    }
  }

  // ── invoice.payment_failed ──────────────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const email   = invoice.customer_email ?? ''

    if (email) {
      await query(`
        UPDATE orders SET status = 'paused', updated_at = NOW()
        WHERE email = $1 AND status = 'active'
      `, [email])
      console.log(`✓ Order paused due to failed payment for ${email}`)
    }
  }

  return NextResponse.json({ received: true })
}
