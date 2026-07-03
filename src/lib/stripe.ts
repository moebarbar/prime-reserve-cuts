import Stripe from 'stripe'

// `||` not `??` — an empty env var must also fall back, or the constructor
// throws at import time and breaks `next build`
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'missing_key', {
  apiVersion: '2025-03-31.basil',
})

export default stripe
