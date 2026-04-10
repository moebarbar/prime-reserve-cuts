import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

export async function GET() {
  try {
    const leads = await query(`SELECT * FROM leads ORDER BY created_at DESC`)
    return NextResponse.json(leads)
  } catch (err) {
    console.error('GET /api/leads error:', err)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // 3 lead submissions per IP per 5 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`leads:${ip}`, 3, 5 * 60 * 1000)) {
    return rateLimitResponse()
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, phone, building, unit, cut } = body

  if (!name || !email || !building || !unit) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // String length limits (guard against oversized payloads reaching the DB)
  if (
    typeof name     !== 'string' || name.length     > 200 ||
    typeof email    !== 'string' || email.length    > 254 ||
    typeof building !== 'string' || building.length > 200 ||
    typeof unit     !== 'string' || unit.length     > 50  ||
    (phone && (typeof phone !== 'string' || (phone as string).length > 30)) ||
    (cut   && (typeof cut   !== 'string' || (cut   as string).length > 500))
  ) {
    return NextResponse.json({ error: 'Invalid field values' }, { status: 400 })
  }

  try {
    const [lead] = await query(`
      INSERT INTO leads (name, email, phone, building, unit, cut)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, email, phone ?? null, building, unit, cut ?? null])

    return NextResponse.json(lead, { status: 201 })
  } catch (err) {
    console.error('POST /api/leads error:', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}
