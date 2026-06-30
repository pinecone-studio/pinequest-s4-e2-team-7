import type { R2Bucket } from '@cloudflare/workers-types'

// Captured screening images live in R2 (private). The DB stores only the object
// key in ScreeningImage.ref; bytes are served via the auth-scoped image route.

/** Stable object key for one image of a screening. */
export const imageKey = (screeningId: string, order: number): string =>
  `screenings/${screeningId}/${order}.jpg`

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const putAll = async (
  bucket: R2Bucket,
  screeningId: string,
  bodies: (ArrayBuffer | Uint8Array)[],
): Promise<string[]> => {
  const keys: string[] = []
  for (let i = 0; i < bodies.length; i++) {
    const key = imageKey(screeningId, i)
    await bucket.put(key, bodies[i], { httpMetadata: { contentType: 'image/jpeg' } })
    keys.push(key)
  }
  return keys
}

/** Upload base64-encoded JPEGs (web path) to R2; returns the object keys. */
export const putBase64Images = (bucket: R2Bucket, screeningId: string, b64s: string[]): Promise<string[]> =>
  putAll(bucket, screeningId, b64s.map(base64ToBytes))

/** Upload raw image buffers (mobile multipart path) to R2; returns the object keys. */
export const putBufferImages = (bucket: R2Bucket, screeningId: string, buffers: ArrayBuffer[]): Promise<string[]> =>
  putAll(bucket, screeningId, buffers)
