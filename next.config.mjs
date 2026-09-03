/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Next's persistent filesystem cache gets corrupted ("Cannot find module './NNN.js'")
    // when routes are added/removed while the dev server is watching. Memory cache avoids
    // that class of bug entirely; only trades a bit of rebuild speed, dev only.
    if (dev) config.cache = { type: 'memory' }
    return config
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig;
