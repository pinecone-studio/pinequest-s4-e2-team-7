# Screener

Phone-camera dental **screening-and-triage** tool for non-dentists in Mongolia.
**Not a diagnosis** — it routes children to care faster; a dentist confirms.

## Monorepo layout

> Folder name = pnpm package name for the apps on this branch
> (`web`, `mobile`, `server`). The shared packages are scoped `@pinequest/*`.

```
apps/
  web/      Next.js admin/review board (OpenNext → Cloudflare)  → pkg web     :3000
  mobile/   Expo React Native screener                          → pkg mobile  (Metro :8081)
  server/   Hono sync API on Cloudflare Workers (D1)            → pkg server  (wrangler :8787)
  model/    Python FastAPI + YOLOv8 inference                   → (no pkg; stateless)  :8765
packages/
  types/    shared domain types                                 → @pinequest/types
  core/     pure logic: childKey hash, triage scoring, role guards, zod schemas → @pinequest/core
  db/       Drizzle schema + D1 client (SQLite dev / D1 prod)   → @pinequest/db
  sync/     offline outbox + ILocalStore adapters               → @pinequest/sync
  config/   shared tsconfig / eslint / prettier                 → @pinequest/config
```

## Ports & env (reference)

| Surface | Folder | Package | URL / Port | Env file | Key vars |
|---|---|---|---|---|---|
| API server | `apps/server` | `server` | http://localhost:8787 (`wrangler dev`) | `apps/server/.dev.vars` | `JWT_SECRET`, `CORS_ORIGIN`, `INFERENCE_URL`, `SEED_ENABLED` |
| Admin board | `apps/web` | `web` | http://localhost:3000 | `apps/web/.env` | `NEXT_PUBLIC_API_URL`, `INFERENCE_URL` |
| Mobile (Expo) | `apps/mobile` | `mobile` | Metro :8081 | `apps/mobile/.env` | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_MODEL_URL` |
| Model inference | `apps/model` | — (Python) | http://127.0.0.1:8765 | shell env / root `.env` | `INFERENCE_PORT`, `INFERENCE_CONF` |
| Database | `packages/db` | `@pinequest/db` | Cloudflare D1 (local SQLite via wrangler) | — (D1 binding in `wrangler.toml`) | — |

> Non-secret Worker config (D1 binding, `CORS_ORIGIN` default) lives in
> `apps/server/wrangler.toml`. Secrets go in `.dev.vars` locally and
> `wrangler secret put <NAME>` in production — never committed.

## Prerequisites

- **Node.js 20+**
- **pnpm** via Corepack: `corepack enable pnpm` (or prefix any command with `corepack pnpm …`)
- **Python 3.10+** — only needed to run `apps/model`
- For the mobile app: **Xcode** (iOS simulator) and/or **Android Studio**, or the **Expo Go** app on a physical device

## Install (once)

```bash
corepack enable pnpm      # makes `pnpm` available
pnpm install              # installs all workspaces
```

## 1 · API server + D1 database → http://localhost:8787

The server is a Hono app on Cloudflare Workers; its data store is **Cloudflare
D1**. `wrangler dev` runs a local SQLite copy of D1 — no `DATABASE_URL` needed.

```bash
cp apps/server/.dev.vars.example apps/server/.dev.vars   # local secrets (JWT_SECRET, SEED_ENABLED=true, …)

# Apply migrations to the local D1 (re-run after adding a migration):
pnpm --filter server exec wrangler d1 migrations apply screener-db --local

pnpm --filter server dev                                 # wrangler dev → :8787
```

Seed the admin + demo data (requires `SEED_ENABLED=true` in `.dev.vars`):

```bash
curl -X POST localhost:8787/api/dev/seed                 # admin@screener.mn / admin123
```

Health check: `curl localhost:8787/health` → `{"ok":true}`.

> **Migrations** are generated from the Drizzle schema with
> `pnpm --filter @pinequest/db db:generate` and committed to
> `packages/db/drizzle`. Apply to production D1 with
> `wrangler d1 migrations apply screener-db --remote`.

## 2 · Admin board → http://localhost:3000

```bash
# apps/web/.env → NEXT_PUBLIC_API_URL=http://localhost:8787
pnpm --filter web dev:web-only        # next dev -p 3000 (board only)
```

`pnpm --filter web dev` additionally boots the Python model for the web scan
demo (see step 4). Open http://localhost:3000 → landing → **Эхлэх (Begin)**.
Log in with the seeded admin. Requires the API server (step 1) running.

## 3 · Mobile screener (Expo)

```bash
# Point the app at your API. localhost works on the iOS simulator;
# on a physical device use your machine's LAN IP instead.
echo 'EXPO_PUBLIC_API_URL=http://localhost:8787' > apps/mobile/.env
# For on-device ONNX inference, also set EXPO_PUBLIC_MODEL_URL to the model
# server's /model.onnx (use your LAN IP on a physical device).

pnpm --filter mobile dev    # expo start (then press i / a / w)
#   i = iOS simulator, a = Android emulator, w = web
#   or: cd apps/mobile && npx expo run:ios   (builds a dev client)
```

Physical device: replace `localhost` with your computer's IP and keep the phone
on the same Wi‑Fi. Stale-bundle error? Restart with `npx expo start -c`.

## 4 · Model inference service (Python)

YOLO weights live in `apps/model/` (gitignored — fetched on first run). For the
**web scan** demo, the inference server starts **automatically** with the web app:

```bash
pnpm --filter web dev       # Next.js (:3000) + Python model (:8765) together
```

First run may take a minute while `best.pt` downloads. Health: http://127.0.0.1:8765/health

One-time Python setup (if not done yet):

```bash
cd apps/model
pip install -r requirements.txt
python3 download_model.py
```

The **API screening path** (`POST /api/screenings/analyze`) proxies to
`INFERENCE_URL` from `apps/server/.dev.vars`. Run the model standalone with
`pnpm dev:model`.

## Run several at once (Turborepo)

```bash
pnpm dev                      # all JS apps; the web bundle also starts YOLO inference
pnpm --filter server --filter web dev   # just API + board
```

## Recommended startup order

1. **API + DB**: `apps/server` — apply migrations, `wrangler dev` (:8787), seed once
2. **Admin board** (:3000) and/or **Mobile** (Expo)
3. **Model** starts automatically with `pnpm --filter web dev`

## Seeded login

`admin@screener.mn` / `admin123`

## Deploy

```bash
pnpm --filter server deploy   # wrangler deploy (Worker + D1)
pnpm --filter web deploy      # opennextjs-cloudflare build && deploy
```

Before first deploy: create the D1 db (`wrangler d1 create screener-db`, paste
the id into `apps/server/wrangler.toml`), apply migrations with `--remote`, and
set production secrets via `wrangler secret put JWT_SECRET` (etc.).

## Check (the commit gate)

```bash
pnpm typecheck   # tsc --noEmit across all workspaces
pnpm lint        # eslint .
pnpm test        # vitest (packages/core, apps/web)
```

Per-package, e.g. server only: `pnpm --filter server typecheck`

## Quick smoke test (API)

```bash
curl localhost:8787/health
TOKEN=$(curl -s -X POST localhost:8787/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@screener.mn","password":"admin123"}' | jq -r .data.token)
curl localhost:8787/api/schools -H "authorization: Bearer $TOKEN"
```

## Troubleshooting

- **`No projects matched the filters`** — use the package name shown above
  (`web`, `mobile`, `server`, `@pinequest/db`, …).
- **`EADDRINUSE :::3000` / `:8787`** — a previous dev server is still running.
  Find it with `lsof -ti :3000` (or `:8787`) and `kill <pid>`.
- **Board can't reach API** — confirm `wrangler dev` is on :8787 and
  `apps/web/.env` has `NEXT_PUBLIC_API_URL=http://localhost:8787`.
- **Seed returns 404** — set `SEED_ENABLED=true` in `apps/server/.dev.vars`.
- **Expo: `Unable to resolve module …`** — stale Metro cache; restart with
  `npx expo start -c`.
- **`pnpm` not found** — run `corepack enable pnpm`, or prefix commands with `corepack pnpm …`.
