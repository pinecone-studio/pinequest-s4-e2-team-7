import type { UserRole } from '@pinequest/types'
import type { D1Database, R2Bucket } from '@cloudflare/workers-types'
import type { DB } from '@pinequest/db/d1'

export type JwtPayload = {
  sub: string
  role: UserRole
  schoolId?: string
}

export type AppEnv = {
  Bindings: {
    DB: D1Database
    /** Private R2 bucket for captured screening photos (served via auth-scoped route). */
    IMAGES: R2Bucket
    JWT_SECRET?: string
    CORS_ORIGIN?: string
    INFERENCE_URL?: string
    MODEL_VERSION?: string
    SEED_ENABLED?: string
    GEMINI_API_KEY?: string
    GEMINI_MODEL?: string
  }
  Variables: {
    jwtPayload: JwtPayload
    db: DB
  }
}
