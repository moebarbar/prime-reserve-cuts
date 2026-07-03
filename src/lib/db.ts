import { Pool, types } from 'pg'

// pg returns NUMERIC (OID 1700) as a string by default; our price columns are
// NUMERIC and the admin pages sum them, so parse to a JS number driver-wide.
types.setTypeParser(1700, parseFloat)

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

// Reuse the pool across hot-reloads in development
const pool = globalThis._pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool
}

export default pool

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await pool.query(sql, params)
  return rows as T[]
}
