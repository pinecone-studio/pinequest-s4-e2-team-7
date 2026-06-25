import { defineConfig } from 'drizzle-kit'

// SQL migrations generated into ./drizzle, applied to D1 via:
//   npx wrangler d1 migrations apply screener-db   (add --remote for prod)
export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
})
