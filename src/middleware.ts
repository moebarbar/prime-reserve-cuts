import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/adminSession'
import { verifyCustomerToken, CUSTOMER_COOKIE } from '@/lib/customerSession'

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS ?? ''

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_URL ?? ''

// Customer self-service area. Login/signup/logout stay public; the account
// APIs and dashboard pages require a valid customer session.
function isProtectedCustomerRoute(pathname: string) {
  if (pathname === '/account/login') return false
  if (
    pathname === '/api/account/login' ||
    pathname === '/api/account/signup' ||
    pathname === '/api/account/logout'
  ) return false
  return pathname.startsWith('/account') || pathname.startsWith('/api/account')
}

function isAdminRoute(pathname: string, method: string) {
  // Admin pages always protected
  if (pathname.startsWith('/admin')) return true
  // All write operations on data APIs are admin-only,
  // except the public *root* POST on inquiry endpoints (form submissions).
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (
      pathname.startsWith('/api/leads') ||
      pathname.startsWith('/api/orders') ||
      pathname.startsWith('/api/products') ||
      pathname.startsWith('/api/buildings')
    ) return true
    // Inquiries: only the [id] sub-routes are admin-only (status updates, delete).
    // The public form POST goes to the root path, which we leave open.
    if (
      pathname.startsWith('/api/partner-inquiries/') ||
      pathname.startsWith('/api/rancher-inquiries/')
    ) return true
  }
  // Leads and orders reads are admin-only (sensitive customer data).
  // HEAD is a read too — treat it exactly like GET.
  // Products GET is intentionally public — main site checkout uses it
  if (['GET', 'HEAD'].includes(method)) {
    if (
      pathname.startsWith('/api/leads') ||
      pathname.startsWith('/api/orders') ||
      pathname.startsWith('/api/partner-inquiries') ||
      pathname.startsWith('/api/rancher-inquiries')
    ) return true
  }
  return false
}

// Routes that don't require auth (login page + login/logout API only —
// anything else added under /api/admin/ later must NOT be silently public)
function isPublicAdminRoute(pathname: string) {
  return (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  )
}

function withCors(res: NextResponse, origin: string | null): NextResponse {
  const allowed = ALLOWED_ORIGIN || 'http://localhost:3000'
  // Only ever emit the configured origin — never reflect the caller's.
  res.headers.set('Access-Control-Allow-Origin', allowed)
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Max-Age', '86400')
  return res
}

export async function middleware(req: NextRequest) {
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

  // Customer self-service area (separate session from admin)
  if (isProtectedCustomerRoute(pathname)) {
    const token = req.cookies.get(CUSTOMER_COOKIE)?.value ?? ''
    const customerId = token ? await verifyCustomerToken(token) : null
    if (!customerId) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
      }
      const loginUrl = new URL('/account/login', req.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // CORS headers still applied below for API routes
    if (pathname.startsWith('/api/')) {
      const res = NextResponse.next()
      return withCors(res, origin)
    }
    return NextResponse.next()
  }

  // Protect admin pages and admin API routes
  if (isAdminRoute(pathname, req.method)) {
    if (!ADMIN_PASS) {
      // No password configured — redirect to login which will show the error
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const token = req.cookies.get('admin_token')?.value ?? ''
    const authenticated = token ? await verifySessionToken(token, ADMIN_USER) : false

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
    '/account/:path*',
    '/api/:path*',
  ],
}
