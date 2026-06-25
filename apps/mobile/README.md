# Screener — Mobile (capture surface)

Offline-first capture + result. Talks to the **deployed** API, so you do **not** need
anyone's laptop running the server.

## 1. Setup (once)

```bash
cp .env.example .env        # .env is gitignored — each teammate does this
```

Default `.env` already points at the shared deployed API:

```
EXPO_PUBLIC_API_URL=https://screener-api.food-delivery.workers.dev
```

## 2. Run

From `apps/mobile`:

```bash
npx expo start          # then press i (iOS sim) / a (Android) / scan QR on a device
```

(If you have pnpm: `pnpm --filter mobile dev`.)

## 3. Test logins

Both seeded users use password **`admin123`**:

| Role     | Email                  | Use            |
| -------- | ---------------------- | -------------- |
| Screener | `screener@screener.mn` | capture flow   |
| Admin    | `admin@screener.mn`    | (web board)    |

Seeded demo data you can capture against:
- School `Сүхбаатар дүүрэг 23-р сургууль` (`school-demo`)
- Class `3А` (`class-demo`), season `2026-spring`
- Content version `2026.1` (`content-v1`)

## 4. API endpoints the app uses

Base = `EXPO_PUBLIC_API_URL`. All responses are `{ success, data, message? }`.
Auth routes return a **7-day** JWT; send it as `Authorization: Bearer <token>`.

| Method | Path                        | Purpose                                            |
| ------ | --------------------------- | -------------------------------------------------- |
| POST   | `/api/auth/login`           | `{ email, password }` → `{ token, user }`          |
| POST   | `/api/auth/register`        | `{ name, email, password, phone? }` → new screener |
| GET    | `/api/auth/me`              | current user (auth)                                |
| POST   | `/api/screenings/analyze`   | multipart `image` + meta → triage result           |
| GET    | `/api/screenings`           | screening history                                  |
| POST   | `/api/screenings`           | outbox sync — push offline-captured events up      |

## ⚠️ Working against a moving server

The deployed API is **actively being developed**. It's the stable target for the app,
but request/response shapes can change when the server owner runs `wrangler deploy`.
If a call suddenly breaks, check with them before debugging the app — the contract may
have shifted. They deploy only at stable checkpoints and announce breaking changes.
