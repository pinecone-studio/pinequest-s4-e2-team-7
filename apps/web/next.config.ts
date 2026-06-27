import type { NextConfig } from 'next'

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://screener-api.ariunzul.workers.dev'

const nextConfig: NextConfig = {
  transpilePackages: ['@pinequest/types', '@pinequest/core'],
  // ESLint plugin resolution is broken in this workspace and aborts the production
  // build; the code still type-checks (tsc --noEmit passes). Skip lint at build time.
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        // Proxy API calls to the remote Worker — EXCEPT /api/inference/*, which is
        // handled by this app's own route handler (the web/home screening path).
        source: '/api/:path((?!inference).*)',
        destination: `${API_URL}/api/:path`,
      },
    ]
  },
}

export default nextConfig
