import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, grade, detail, price, img, available } = body

  const [product] = await query(`
    UPDATE products
    SET name = $1, grade = $2, detail = $3, price = $4, img = $5, available = $6, updated_at = NOW()
    WHERE id = $7
    RETURNING *
  `, [name, grade, detail, Number(price), img, available !== false, id])

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await query(`DELETE FROM products WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
