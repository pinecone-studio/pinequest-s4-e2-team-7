import type { NextConfig } from 'next'

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://screener-api.ariunzul.workers.dev'

const nextConfig: NextConfig = {
  transpilePackages: ['@pinequest/types', '@pinequest/core'],
  // Linting runs separately as the commit gate (`turbo lint`); next build's own
  // ESLint pass uses a different config that lacks the react-hooks plugin and
  // errors on inline rule-disable comments, so skip it during the build.
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
