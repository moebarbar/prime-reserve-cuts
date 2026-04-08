import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const orders = await query(`
    SELECT * FROM orders ORDER BY created_at DESC
  `)
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customer, email, building, unit, cut, price, start_date, next_delivery } = body

  if (!customer || !email || !building || !unit || !cut || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [order] = await query(`
    INSERT INTO orders (customer, email, building, unit, cut, price, start_date, next_delivery)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [customer, email, building, unit, cut, Number(price), start_date ?? null, next_delivery ?? null])

  return NextResponse.json(order, { status: 201 })
}
