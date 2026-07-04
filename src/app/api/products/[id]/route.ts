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

  const { name, grade, detail, weight, price, price_choice, price_per_week, img, available, category } = body

  const cat = typeof category === 'string' && ['automatic', 'special'].includes(category)
    ? category
    : 'automatic'
  const choice = cat === 'automatic' && price_choice != null && Number(price_choice) > 0
    ? Number(price_choice) : null

  try {
    const [product] = await query(`
      UPDATE products
      SET name           = $1,
          grade          = $2,
          detail         = $3,
          weight         = $4,
          price          = $5,
          price_choice   = $6,
          price_per_week = $7,
          img            = $8,
          available      = $9,
          category       = $10,
          updated_at     = NOW()
      WHERE id = $11
      RETURNING *
    `, [name, grade, detail, weight ?? '', Number(price) || 0, choice, Number(price_per_week) || 0, img ?? '', available !== false, cat, id])

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (err) {
    console.error('PUT /api/products/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await query(`DELETE FROM products WHERE id = $1`, [id])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/products/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
