import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const leads = await query(`
    SELECT * FROM leads ORDER BY created_at DESC
  `)
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, building, unit, cut } = body

  if (!name || !email || !building || !unit) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [lead] = await query(`
    INSERT INTO leads (name, email, phone, building, unit, cut)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [name, email, phone ?? null, building, unit, cut ?? null])

  return NextResponse.json(lead, { status: 201 })
}
