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

  // Fail closed: with an empty secret the HMAC check would be computable by
  // anyone, letting attackers forge orders/cancellations.
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — rejecting webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

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
      // Strip newlines/CR to prevent email header injection
      const name     = (meta.name ?? 'Member').replace(/[\r\n]/g, ' ').trim()
      const building = meta.building ?? ''
      const unit     = meta.unit     ?? ''
      const cut      = meta.cut      ?? ''
      const kind     = meta.kind === 'one_time' ? 'one_time' : 'subscription'
      const oneTime  = kind === 'one_time'
      const sessionId = session.id
      const customerId = typeof meta.customer_id === 'string' ? meta.customer_id : null
      // subscription mode → the Stripe subscription id (string); payment mode → null
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

      // The actual amount Stripe charged, in dollars. For a subscription this is
      // the first weekly invoice (= the weekly total); for a one-time order it's
      // the single charge. Either way it already reflects per-pound × pounds.
      const price = typeof session.amount_total === 'number'
        ? session.amount_total / 100
        : 0

      // Upcoming Saturday — the same date the confirmation email promises.
      // (Previously the SQL stored next ISO week's Saturday, a week late.)
      const nextDelivery = new Date()
      const daysUntilSat = (6 - nextDelivery.getDay() + 7) % 7 || 7
      nextDelivery.setDate(nextDelivery.getDate() + daysUntilSat)
      const deliveryDate = nextDelivery.toISOString().slice(0, 10)

      // The checkout API pre-creates the order as 'pending'. Activate it here.
      // If it's already active/completed this is a duplicate delivery → skip
      // (idempotent). If no row exists (legacy path), insert one.
      const [existing] = await query<{ id: string; status: string }>(
        `SELECT id, status FROM orders WHERE stripe_session_id = $1`,
        [sessionId],
      ).catch(() => [] as { id: string; status: string }[])

      if (existing && existing.status !== 'pending') {
        console.log(`✓ Webhook already processed for session ${sessionId}, skipping`)
        return NextResponse.json({ received: true })
      }

      if (existing) {
        await query(
          `UPDATE orders SET status = 'active', price = COALESCE(NULLIF($1, 0), price),
             next_delivery = $2, start_date = $2, stripe_subscription_id = $3, updated_at = NOW()
           WHERE id = $4`,
          [price, deliveryDate, subscriptionId, existing.id],
        )
      } else {
        await query(
          `INSERT INTO orders
            (customer, email, building, unit, cut, price, kind, status, start_date, next_delivery, customer_id, stripe_subscription_id, stripe_session_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $8, $9, $10, $11)`,
          [name, email, building, unit, cut, price, kind, deliveryDate, customerId, subscriptionId, sessionId],
        )
      }

      // Mark lead converted
      await query(`
        UPDATE leads SET status = 'converted', updated_at = NOW()
        WHERE email = $1 AND status != 'converted'
      `, [email])

      // Send confirmation email (same Saturday as stored above)
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
          oneTime,
        })
      )

      await resend.emails.send({
        from:    'Automatic Cow <hello@automaticcow.com>',
        to:      email,
        subject: oneTime
          ? `Order confirmed, ${name.split(' ')[0]}. Delivery ${nextDeliveryStr}.`
          : `You're in, ${name.split(' ')[0]}. First delivery ${nextDeliveryStr}.`,
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
        // Only touch subscriptions — a customer's pending one-time order must
        // survive them cancelling their weekly membership.
        await query(`
          UPDATE orders SET status = 'cancelled', updated_at = NOW()
          WHERE email = $1 AND kind = 'subscription' AND status != 'cancelled'
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
        // Failed invoices are a subscription concept — never pause a paid
        // one-time order for the same email.
        await query(`
          UPDATE orders SET status = 'paused', updated_at = NOW()
          WHERE email = $1 AND kind = 'subscription' AND status = 'active'
        `, [email])
        console.log(`✓ Order paused due to failed payment for ${email}`)
      }
    } catch (err) {
      console.error('invoice.payment_failed handler error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
