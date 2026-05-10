import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import resend from '@/lib/resend'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

const NOTIFY_TO = process.env.INQUIRY_NOTIFY_TO ?? 'beef@automaticcow.com'
const NOTIFY_FROM = process.env.RESEND_FROM ?? 'Automatic Cow <noreply@automaticcow.com>'

// Public POST — submitted from /partners page
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`partner:${ip}`, 5, 10 * 60 * 1000)) return rateLimitResponse()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const property_name = String(body.property_name ?? '').trim()
  const manager_name  = String(body.manager_name ?? '').trim()
  const email         = String(body.email ?? '').trim()
  const phone         = String(body.phone ?? '').trim() || null
  const units         = String(body.units ?? '').trim() || null
  const message       = String(body.message ?? '').trim() || null

  if (!property_name || !manager_name || !email) {
    return NextResponse.json({ error: 'property_name, manager_name and email are required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    const [inquiry] = await query(`
      INSERT INTO partner_inquiries (property_name, manager_name, email, phone, units, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, [property_name, manager_name, email, phone, units, message])

    // Fire-and-forget email notification (don't block the response on email)
    resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      replyTo: email,
      subject: `New Partner Inquiry — ${property_name}`,
      html: `
        <h2>New Partner Inquiry</h2>
        <p><strong>Property:</strong> ${escapeHtml(property_name)}</p>
        <p><strong>Manager:</strong> ${escapeHtml(manager_name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone ?? '—')}</p>
        <p><strong>Units:</strong> ${escapeHtml(units ?? '—')}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;">${escapeHtml(message ?? '—')}</p>
        <hr />
        <p style="color:#888;font-size:12px;">Manage this inquiry in the admin console.</p>
      `,
    }).catch(err => console.error('Resend partner notify failed:', err))

    return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/partner-inquiries error:', err)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}

// Admin GET — list all inquiries (protected by middleware)
export async function GET() {
  try {
    const inquiries = await query(`SELECT * FROM partner_inquiries ORDER BY created_at DESC`)
    return NextResponse.json(inquiries)
  } catch (err) {
    console.error('GET /api/partner-inquiries error:', err)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
