import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status } = body

  const valid = ['new', 'contacted', 'converted', 'lost']
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const [lead] = await query(`
    UPDATE leads SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [status, id])

  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await query(`DELETE FROM leads WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
