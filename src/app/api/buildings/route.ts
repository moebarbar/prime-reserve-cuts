import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET — public (main site uses this)
export async function GET() {
  try {
    const buildings = await query(`SELECT * FROM buildings ORDER BY created_at ASC`)
    return NextResponse.json(buildings)
  } catch (err) {
    console.error('GET /api/buildings error:', err)
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 })
  }
}

// POST — admin only (protected by middleware cookie check)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { key, name, name_html, nbhd, img, hero_img } = body

  if (!key || !name || !nbhd) {
    return NextResponse.json({ error: 'key, name, and nbhd are required' }, { status: 400 })
  }

  try {
    const [building] = await query(`
      INSERT INTO buildings (key, name, name_html, nbhd, img, hero_img)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [key, name, name_html ?? name, nbhd, img ?? '', hero_img ?? img ?? ''])
    return NextResponse.json(building, { status: 201 })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      return NextResponse.json({ error: 'A building with that key already exists' }, { status: 409 })
    }
    console.error('POST /api/buildings error:', err)
    return NextResponse.json({ error: 'Failed to create building' }, { status: 500 })
  }
}
