import { Resend } from 'resend'

// `||` not `??` — an empty env var must also fall back, or the constructor
// throws at import time and breaks `next build`
const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key')

export default resend
