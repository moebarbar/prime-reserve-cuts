import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS ?? ''

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_URL ?? ''

// Routes that require admin Basic Auth
function isAdminRoute(pathname: string) {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/products')
  )
}

// Add CORS headers — only allow requests from our own domain
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

  // Handle CORS preflight for all API routes
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const res = new NextResponse(null, { status: 204 })
    return withCors(res, origin)
  }

  // Protect admin pages and admin API routes with HTTP Basic Auth
  if (isAdminRoute(pathname)) {
    if (!ADMIN_PASS) {
      // No password set — block access entirely rather than allow anyone in
      return new NextResponse('Admin access not configured.', { status: 503 })
    }

    const auth = req.headers.get('authorization') ?? ''
    let authorised = false

    if (auth.startsWith('Basic ')) {
      try {
        const decoded = atob(auth.slice(6))
        const colon = decoded.indexOf(':')
        const user = decoded.slice(0, colon)
        const pass = decoded.slice(colon + 1)
        authorised = user === ADMIN_USER && pass === ADMIN_PASS
      } catch {
        // malformed base64 — stay unauthorised
      }
    }

    if (!authorised) {
      return new NextResponse('Unauthorised', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Automatic Cow Admin"' },
      })
    }
  }

  // Add CORS headers to all API responses
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
