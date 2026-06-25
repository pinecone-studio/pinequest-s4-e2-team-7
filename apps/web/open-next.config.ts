import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Minimal config: SSR/SSG only, no R2 incremental cache (the board reads live
// from the sync API, so we don't rely on Next ISR caching).
export default defineCloudflareConfig()
