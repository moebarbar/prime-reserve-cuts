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

  const { status } = body

  const valid = ['new', 'contacted', 'converted', 'lost']
  if (!valid.includes(status as string)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const [lead] = await query(`
      UPDATE leads SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id])

    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lead)
  } catch (err) {
    console.error('PUT /api/leads/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    await query(`DELETE FROM leads WHERE id = $1`, [id])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/leads/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
