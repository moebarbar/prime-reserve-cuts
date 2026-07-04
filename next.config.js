/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',        value: 'nosniff' },
          { key: 'X-Frame-Options',                value: 'DENY' },
          { key: 'Referrer-Policy',                value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',             value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security',      value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy',     value: 'same-origin' },
          { key: 'X-DNS-Prefetch-Control',         value: 'off' },
          // Baseline CSP — a strict script-src needs nonce work with Next's
          // inline scripts, but these directives are drop-in safe
          { key: 'Content-Security-Policy',        value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
