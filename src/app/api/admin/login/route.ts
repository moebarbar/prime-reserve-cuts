import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { constantTimeEqual, createSessionToken, SESSION_MAX_AGE_S } from '@/lib/adminSession'

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS ?? ''

export async function POST(req: NextRequest) {
  // 5 attempts per IP per 15 minutes — the 400ms delay alone doesn't stop
  // parallel brute force.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return rateLimitResponse()
  }

  if (!ADMIN_PASS) {
    return NextResponse.json({ error: 'Admin access not configured.' }, { status: 503 })
  }

  let body: { username?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username : ''
  const password = typeof body.password === 'string' ? body.password : ''

  const valid = constantTimeEqual(username, ADMIN_USER) && constantTimeEqual(password, ADMIN_PASS)

  if (!valid) {
    // Small delay to slow brute force
    await new Promise(r => setTimeout(r, 400))
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createSessionToken(ADMIN_USER)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  })
  return res
}
