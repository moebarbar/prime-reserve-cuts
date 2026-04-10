import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import resend from '@/lib/resend'
import { query } from '@/lib/db'
import { render } from '@react-email/render'
import SubscriptionConfirmed from '@/emails/subscription-confirmed'

export const runtime = 'nodejs'

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
    try {
      const session  = event.data.object
      const meta     = session.metadata ?? {}
      const email    = session.customer_email ?? ''
      const name     = meta.name     ?? 'Member'
      const building = meta.building ?? ''
      const unit     = meta.unit     ?? ''
      const cut      = meta.cut      ?? ''
      const sessionId = session.id

      // Idempotency guard — skip if this session was already processed
      const existing = await query(
        `SELECT id FROM orders WHERE stripe_session_id = $1`,
        [sessionId]
      ).catch(() => [] as { id: string }[])

      if (existing.length > 0) {
        console.log(`✓ Webhook already processed for session ${sessionId}, skipping`)
        return NextResponse.json({ received: true })
      }

      // Fetch real price from products table
      const [product] = await query<{ price: number }>(
        `SELECT price FROM products WHERE name = $1 LIMIT 1`,
        [cut.split(',')[0].replace(/\s*×\d+\s*$/, '').trim()]
      ).catch(() => [] as { price: number }[])
      const price = product?.price ?? 0

      // Save order
      await query(`
        INSERT INTO orders
          (customer, email, building, unit, cut, price, status, start_date, next_delivery, stripe_session_id)
        VALUES ($1, $2, $3, $4, $5, $6, 'active',
          date_trunc('week', NOW() + interval '7 days'),
          date_trunc('week', NOW() + interval '7 days') + interval '5 days',
          $7
        )
      `, [name, email, building, unit, cut, price, sessionId])

      // Mark lead converted
      await query(`
        UPDATE leads SET status = 'converted', updated_at = NOW()
        WHERE email = $1 AND status != 'converted'
      `, [email])

      // Send confirmation email
      const nextDelivery = new Date()
      const daysUntilSat = (6 - nextDelivery.getDay() + 7) % 7 || 7
      nextDelivery.setDate(nextDelivery.getDate() + daysUntilSat)
      const nextDeliveryStr = nextDelivery.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })

      const html = await render(
        SubscriptionConfirmed({
          customerName: name.split(' ')[0],
          buildingName: building,
          unit,
          cutName: cut,
          cutDetail: '',
          price,
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
    } catch (err) {
      console.error('checkout.session.completed handler error:', err)
      // Still return 200 so Stripe doesn't retry — log for manual review
    }
  }

  // ── customer.subscription.deleted ──────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    try {
      const sub = event.data.object
      let email = ''

      if (typeof sub.customer === 'string') {
        const customer = await stripe.customers.retrieve(sub.customer)
        // retrieve returns Customer or DeletedCustomer; only Customer has email
        if (!customer.deleted) {
          email = (customer as { email?: string | null }).email ?? ''
        }
      } else if (sub.customer && !('deleted' in sub.customer)) {
        email = (sub.customer as { email?: string | null }).email ?? ''
      }

      if (email) {
        await query(`
          UPDATE orders SET status = 'cancelled', updated_at = NOW()
          WHERE email = $1 AND status != 'cancelled'
        `, [email])
        console.log(`✓ Subscription cancelled for ${email}`)
      }
    } catch (err) {
      console.error('customer.subscription.deleted handler error:', err)
    }
  }

  // ── invoice.payment_failed ──────────────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    try {
      const invoice = event.data.object
      const email   = invoice.customer_email ?? ''

      if (email) {
        await query(`
          UPDATE orders SET status = 'paused', updated_at = NOW()
          WHERE email = $1 AND status = 'active'
        `, [email])
        console.log(`✓ Order paused due to failed payment for ${email}`)
      }
    } catch (err) {
      console.error('invoice.payment_failed handler error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
