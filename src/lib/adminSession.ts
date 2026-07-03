/**
 * Admin session tokens: `${expiryMs}.${hmacSha256(secret, user + ':' + expiryMs)}`.
 *
 * Signed + expiring, so the cookie never contains (or reveals) the admin
 * password, a captured cookie dies at expiry, and rotating SESSION_SECRET
 * (or ADMIN_PASS as fallback) revokes all sessions at once.
 *
 * Uses Web Crypto only — runs in both the Node route handlers and the edge
 * middleware.
 */

const encoder = new TextEncoder()

export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7 // 7 days

// Dedicated secret preferred; fall back to ADMIN_PASS so existing deploys
// keep working (HMAC is one-way, so the cookie still can't leak the password).
function sessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASS || ''
}

export function constantTimeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  if (aBytes.length !== bBytes.length) return false
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i]
  return diff === 0
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSessionToken(user: string): Promise<string> {
  const expiry = Date.now() + SESSION_MAX_AGE_S * 1000
  return `${expiry}.${await hmacHex(`${user}:${expiry}`)}`
}

export async function verifySessionToken(token: string, user: string): Promise<boolean> {
  if (!sessionSecret()) return false
  const dot = token.indexOf('.')
  if (dot === -1) return false
  const expiry = Number(token.slice(0, dot))
  const mac = token.slice(dot + 1)
  if (!Number.isFinite(expiry) || !mac || Date.now() > expiry) return false
  return constantTimeEqual(mac, await hmacHex(`${user}:${expiry}`))
}
