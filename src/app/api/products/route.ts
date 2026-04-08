import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const products = await query(`
    SELECT * FROM products ORDER BY created_at ASC
  `)
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, grade, detail, price, img, available } = body

  if (!name || !grade || !detail || !price || !img) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [product] = await query(`
    INSERT INTO products (name, grade, detail, price, img, available)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [name, grade, detail, Number(price), img, available !== false])

  return NextResponse.json(product, { status: 201 })
}
