import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { createCustomerToken, CUSTOMER_COOKIE, CUSTOMER_MAX_AGE_S } from '@/lib/customerSession'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(`account-login:${ip}`, 8, 15 * 60 * 1000)) return rateLimitResponse()

  let body: { identifier?: unknown; password?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

  const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!identifier || !password) {
    return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 })
  }

  const [customer] = await query<{ id: string; password_hash: string }>(
    `SELECT id, password_hash FROM customers WHERE lower(username) = lower($1) OR lower(email) = lower($1) LIMIT 1`,
    [identifier],
  ).catch(() => [])

  const ok = customer && (await verifyPassword(password, customer.password_hash))
  if (!ok) {
    await new Promise(r => setTimeout(r, 400)) // slow brute force
    return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 })
  }

  const token = await createCustomerToken(customer.id)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_MAX_AGE_S,
  })
  return res
}
