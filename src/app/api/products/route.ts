import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Public GET — main site uses this to show products
export async function GET() {
  try {
    const products = await query(`SELECT * FROM products ORDER BY created_at ASC`)
    return NextResponse.json(products)
  } catch (err) {
    console.error('GET /api/products error:', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// Admin POST — protected by middleware
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, grade, detail, weight, price, price_per_week, img, available } = body

  if (!name || !grade || !detail) {
    return NextResponse.json({ error: 'name, grade, and detail are required' }, { status: 400 })
  }

  try {
    const [product] = await query(`
      INSERT INTO products (name, grade, detail, weight, price, price_per_week, img, available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, grade, detail, weight ?? '', Number(price) || 0, Number(price_per_week) || 0, img ?? '', available !== false])

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error('POST /api/products error:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
