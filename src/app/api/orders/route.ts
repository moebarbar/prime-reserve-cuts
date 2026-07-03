import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // One-time orders are a single delivery: once the date passes, mark them
    // completed so they leave the manifest and stop counting as active.
    // (Subscriptions are untouched — their next_delivery rolls forward.)
    await query(`
      UPDATE orders SET status = 'completed', updated_at = NOW()
      WHERE kind = 'one_time' AND status = 'active' AND next_delivery < CURRENT_DATE
    `)
    const orders = await query(`SELECT * FROM orders ORDER BY created_at DESC`)
    return NextResponse.json(orders)
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { customer, email, building, unit, cut, price, start_date, next_delivery } = body

  if (!customer || !email || !building || !unit || !cut || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const [order] = await query(`
      INSERT INTO orders (customer, email, building, unit, cut, price, start_date, next_delivery)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [customer, email, building, unit, cut, Number(price), start_date ?? null, next_delivery ?? null])

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
