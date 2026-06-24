import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils'
import type { ChildKey, ChildKeyInput } from '@pinequest/types'

/** Normalize the class label so the key is stable across casing/whitespace. */
function normalizeClassName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Deterministic, anonymous child identity:
 * `hash(school + class + roster slot + birth year)`, truncated to 64 bits.
 *
 * Same inputs always yield the same key, so a child re-resolves each season —
 * with no name in the key. Runs identically on mobile, web, and server, so it
 * MUST stay pure and dependency-stable (changing it orphans historical keys).
 */
export function childKey(input: ChildKeyInput): ChildKey {
  const canonical = [
    input.schoolId,
    normalizeClassName(input.className),
    input.rosterSlot,
    input.birthYear,
  ].join('|')
  return bytesToHex(sha256(utf8ToBytes(canonical))).slice(0, 16)
}
