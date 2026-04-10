import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { status, next_delivery } = body

  const valid = ['active', 'paused', 'cancelled', 'pending']
  if (status && !valid.includes(status as string)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const [order] = await query(`
      UPDATE orders
      SET
        status        = COALESCE($1, status),
        next_delivery = COALESCE($2::date, next_delivery),
        updated_at    = NOW()
      WHERE id = $3
      RETURNING *
    `, [status ?? null, next_delivery ?? null, id])

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (err) {
    console.error('PUT /api/orders/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
