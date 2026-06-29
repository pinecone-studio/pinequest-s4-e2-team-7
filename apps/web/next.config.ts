import type { NextConfig } from 'next'

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://screener-api.ariunzul.workers.dev'

const nextConfig: NextConfig = {
  transpilePackages: ['@pinequest/types', '@pinequest/core'],
  // Lint is its own gate (turbo). next build's bundled ESLint can't resolve the
  // Next/react-hooks plugin rules in this monorepo, so skip it at build time —
  // typecheck still runs. Without this, `pnpm --filter web deploy` fails.
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Workspace packages (@pinequest/*) use NodeNext-style explicit `.js`
    // import specifiers that resolve to `.ts` sources. Teach webpack the mapping.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return config
  },
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
