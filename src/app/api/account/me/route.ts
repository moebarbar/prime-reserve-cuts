import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { currentCustomerId } from '@/lib/customerAuth'
import { parseItems } from '@/lib/orderItems'

export async function GET() {
  const customerId = await currentCustomerId()
  if (!customerId) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const [customer] = await query<{
    id: string; email: string; username: string; name: string; building: string; unit: string; phone: string | null
  }>(
    `SELECT id, email, username, name, building, unit, phone FROM customers WHERE id = $1`,
    [customerId],
  ).catch(() => [])
  if (!customer) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

  // Retire one-time orders whose delivery date has passed (same rule as /api/orders).
  await query(
    `UPDATE orders SET status = 'completed', updated_at = NOW()
     WHERE customer_id = $1 AND kind = 'one_time' AND status = 'active' AND next_delivery < CURRENT_DATE`,
    [customerId],
  ).catch(() => {})

  const rows = await query<Record<string, unknown>>(
    `SELECT id, kind, status, cut, items, price, building, unit, start_date, next_delivery, created_at
     FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId],
  ).catch(() => [])

  const orders = rows.map(o => ({
    id: o.id,
    kind: o.kind,
    status: o.status,
    cut: o.cut,
    items: parseItems(o.items),
    price: Number(o.price) || 0,
    building: o.building,
    unit: o.unit,
    start_date: o.start_date,
    next_delivery: o.next_delivery,
    created_at: o.created_at,
  }))

  return NextResponse.json({
    customer: {
      username: customer.username,
      name: customer.name,
      email: customer.email,
      building: customer.building,
      unit: customer.unit,
      phone: customer.phone,
    },
    orders,
  })
}
