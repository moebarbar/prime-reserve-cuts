import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS ?? ''

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_URL ?? ''

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aBytes = enc.encode(a)
  const bBytes = enc.encode(b)
  if (aBytes.length !== bBytes.length) return false
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i]
  return diff === 0
}

function isAdminRoute(pathname: string, method: string) {
  // Admin pages always protected
  if (pathname.startsWith('/admin')) return true
  // All write operations on data APIs are admin-only
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (
      pathname.startsWith('/api/leads') ||
      pathname.startsWith('/api/orders') ||
      pathname.startsWith('/api/products') ||
      pathname.startsWith('/api/buildings')
    ) return true
  }
  // All reads on leads/orders/products are admin-only (sensitive data)
  if (['GET'].includes(method)) {
    if (
      pathname.startsWith('/api/leads') ||
      pathname.startsWith('/api/orders') ||
      pathname.startsWith('/api/products')
    ) return true
  }
  return false
}

// Routes that don't require auth (login page + login API)
function isPublicAdminRoute(pathname: string) {
  return (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/')
  )
}

function isValidToken(token: string): boolean {
  if (!ADMIN_PASS) return false
  const expected = btoa(`${ADMIN_USER}:${ADMIN_PASS}`)
  return constantTimeEqual(token, expected)
}

function withCors(res: NextResponse, origin: string | null): NextResponse {
  const allowed = ALLOWED_ORIGIN || 'http://localhost:3000'
  if (origin && (origin === allowed || !ALLOWED_ORIGIN)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
  } else {
    res.headers.set('Access-Control-Allow-Origin', allowed)
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Max-Age', '86400')
  return res
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const origin = req.headers.get('origin')

  // CORS preflight
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const res = new NextResponse(null, { status: 204 })
    return withCors(res, origin)
  }

  // Skip auth for public admin routes (login page + login/logout API)
  if (isPublicAdminRoute(pathname)) {
    return NextResponse.next()
  }

  // Protect admin pages and admin API routes
  if (isAdminRoute(pathname, req.method)) {
    if (!ADMIN_PASS) {
      // No password configured — redirect to login which will show the error
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const token = req.cookies.get('admin_token')?.value ?? ''
    const authenticated = isValidToken(token)

    if (!authenticated) {
      // API routes return 401; page routes redirect to login
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      }
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Add CORS headers to API responses
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next()
    return withCors(res, origin)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
