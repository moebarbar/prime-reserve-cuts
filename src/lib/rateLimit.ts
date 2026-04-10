interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * key    — unique identifier (e.g. IP + route)
 * limit  — max requests per window
 * windowMs — window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

export function rateLimitResponse() {
  return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
  })
}
