/**
 * Customer session tokens: `${customerId}.${expiryMs}.${hmac(customerId:expiryMs)}`.
 *
 * Signed + expiring like the admin session, but a separate cookie (`ac_session`)
 * and the payload carries the customer id. Web Crypto only, so it verifies in
 * both the edge middleware and the Node route handlers.
 */

const encoder = new TextEncoder()
export const CUSTOMER_COOKIE = 'ac_session'
export const CUSTOMER_MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days

function sessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASS || ''
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

function constantTimeEqual(a: string, b: string): boolean {
  const aB = encoder.encode(a)
  const bB = encoder.encode(b)
  if (aB.length !== bB.length) return false
  let diff = 0
  for (let i = 0; i < aB.length; i++) diff |= aB[i] ^ bB[i]
  return diff === 0
}

export async function createCustomerToken(customerId: string): Promise<string> {
  const expiry = Date.now() + CUSTOMER_MAX_AGE_S * 1000
  return `${customerId}.${expiry}.${await hmacHex(`${customerId}:${expiry}`)}`
}

/** Returns the customer id if the token is valid & unexpired, else null. */
export async function verifyCustomerToken(token: string): Promise<string | null> {
  if (!sessionSecret() || !token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [customerId, expiryStr, mac] = parts
  const expiry = Number(expiryStr)
  if (!customerId || !Number.isFinite(expiry) || Date.now() > expiry) return null
  const expected = await hmacHex(`${customerId}:${expiry}`)
  return constantTimeEqual(mac, expected) ? customerId : null
}
