import { cookies } from 'next/headers'
import { verifyCustomerToken, CUSTOMER_COOKIE } from '@/lib/customerSession'

/** The signed-in customer's id inside a route handler, or null. */
export async function currentCustomerId(): Promise<string | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value ?? ''
  return token ? verifyCustomerToken(token) : null
}
