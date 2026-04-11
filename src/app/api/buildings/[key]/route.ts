import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, name_html, nbhd, img, hero_img, active } = body

  try {
    const [building] = await query(`
      UPDATE buildings
      SET name      = COALESCE($1, name),
          name_html = COALESCE($2, name_html),
          nbhd      = COALESCE($3, nbhd),
          img       = COALESCE($4, img),
          hero_img  = COALESCE($5, hero_img),
          active    = COALESCE($6, active)
      WHERE key = $7
      RETURNING *
    `, [name ?? null, name_html ?? null, nbhd ?? null, img ?? null, hero_img ?? null, active ?? null, key])

    if (!building) return NextResponse.json({ error: 'Building not found' }, { status: 404 })
    return NextResponse.json(building)
  } catch (err) {
    console.error('PUT /api/buildings error:', err)
    return NextResponse.json({ error: 'Failed to update building' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  try {
    await query(`DELETE FROM buildings WHERE key = $1`, [key])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/buildings error:', err)
    return NextResponse.json({ error: 'Failed to delete building' }, { status: 500 })
  }
}
