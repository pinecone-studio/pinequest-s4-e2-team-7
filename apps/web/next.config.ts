import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const nextConfig: NextConfig = {
  // Shared workspace packages ship TS source and must be transpiled by Next.
  transpilePackages: ['@pinequest/types', '@pinequest/core'],
}

// Lets `next dev` see Cloudflare bindings; no-op outside local dev.
void initOpenNextCloudflareForDev()

export default nextConfig
