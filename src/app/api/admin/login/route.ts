import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS ?? ''

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aBytes = enc.encode(a)
  const bBytes = enc.encode(b)
  if (aBytes.length !== bBytes.length) return false
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i]
  return diff === 0
}

export async function POST(req: NextRequest) {
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

  const token = btoa(`${ADMIN_USER}:${ADMIN_PASS}`)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return res
}
