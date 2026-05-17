import { createHash } from "node:crypto"

type Entry = { value: string; expiresAt: number }

const store = new Map<string, Entry>()

const DEFAULT_TTL_MS = 15 * 60 * 1000

export function cacheKey(parts: string[]): string {
  return createHash("sha256").update(parts.join("\u001f")).digest("hex")
}

export function cacheGet(key: string): string | null {
  const e = store.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) {
    store.delete(key)
    return null
  }
  return e.value
}

export function cacheSet(key: string, value: string, ttlMs: number = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

/** For tests / hot reload */
export function cacheClear() {
  store.clear()
}
