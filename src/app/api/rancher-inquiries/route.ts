import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import resend from '@/lib/resend'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

const NOTIFY_TO = process.env.INQUIRY_NOTIFY_TO ?? 'beef@automaticcow.com'
const NOTIFY_FROM = process.env.RESEND_FROM ?? 'Automatic Cow <noreply@automaticcow.com>'

// Public POST — submitted from /ranchers page
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`rancher:${ip}`, 5, 10 * 60 * 1000)) return rateLimitResponse()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const ranch_name      = String(body.ranch_name ?? '').trim()
  const owner_name      = String(body.owner_name ?? '').trim()
  const email           = String(body.email ?? '').trim()
  const phone           = String(body.phone ?? '').trim() || null
  const location        = String(body.location ?? '').trim() || null
  const herd_size       = String(body.herd_size ?? '').trim() || null
  const grade           = String(body.grade ?? '').trim() || null
  const breeds          = String(body.breeds ?? '').trim() || null
  const weekly_capacity = String(body.weekly_capacity ?? '').trim() || null
  const story           = String(body.story ?? '').trim() || null

  if (!ranch_name || !owner_name || !email) {
    return NextResponse.json({ error: 'ranch_name, owner_name and email are required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    const [inquiry] = await query(`
      INSERT INTO rancher_inquiries
        (ranch_name, owner_name, email, phone, location, herd_size, grade, breeds, weekly_capacity, story)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at
    `, [ranch_name, owner_name, email, phone, location, herd_size, grade, breeds, weekly_capacity, story])

    resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      replyTo: email,
      subject: `New Rancher Application — ${String(ranch_name).replace(/[\r\n]/g, ' ')}`,
      html: `
        <h2>New Rancher Application</h2>
        <p><strong>Ranch:</strong> ${escapeHtml(ranch_name)}</p>
        <p><strong>Owner:</strong> ${escapeHtml(owner_name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone ?? '—')}</p>
        <p><strong>Location:</strong> ${escapeHtml(location ?? '—')}</p>
        <p><strong>Herd size:</strong> ${escapeHtml(herd_size ?? '—')}</p>
        <p><strong>Grade:</strong> ${escapeHtml(grade ?? '—')}</p>
        <p><strong>Breeds:</strong> ${escapeHtml(breeds ?? '—')}</p>
        <p><strong>Weekly capacity:</strong> ${escapeHtml(weekly_capacity ?? '—')}</p>
        <p><strong>Story:</strong></p>
        <p style="white-space:pre-wrap;">${escapeHtml(story ?? '—')}</p>
        <hr />
        <p style="color:#888;font-size:12px;">Manage this application in the admin console.</p>
      `,
    }).catch(err => console.error('Resend rancher notify failed:', err))

    return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/rancher-inquiries error:', err)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}

// Admin GET
export async function GET() {
  try {
    const inquiries = await query(`SELECT * FROM rancher_inquiries ORDER BY created_at DESC`)
    return NextResponse.json(inquiries)
  } catch (err) {
    console.error('GET /api/rancher-inquiries error:', err)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
