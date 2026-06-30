---
name: server-manual-deploy
description: Mobile hits the deployed worker; server changes need manual deploy (no CI)
metadata:
  type: project
---

The mobile app targets the **deployed** Cloudflare Worker `screener-api`
(`https://screener-api.ariunzul.workers.dev`) by default — set via
`apps/mobile/.env` `EXPO_PUBLIC_API_URL`, with the same URL hardcoded as the
fallback in `apps/mobile/lib/api.ts`.

There is **no auto-deploy CI** (`.github/workflows` has only `intern-metrics.yml`).
So after ANY change to `apps/server`, production stays stale until someone runs:

```bash
pnpm --filter server run deploy   # NOT `pnpm --filter server deploy` (collides with pnpm builtin)
```

A stale prod worker is a real source of runtime bugs that don't show in the repo:
e.g. the multi-photo `image_<quadrant>` analyze protocol (added in commit 2685701)
returned `missing_image` on mobile until prod was redeployed, because the old
deploy only read a single `image` field. The repo code was correct the whole time.

Secrets (`GEMINI_API_KEY`, `INFERENCE_URL`) are set via `wrangler secret put` and
persist across deploys; they don't appear in the `wrangler deploy` bindings list.
Without `GEMINI_API_KEY`, the дүгнэлт/advice still renders via `fallbackAdvice`
but the age-aware `guidance` block is absent.
