import { createHash } from "node:crypto"

type Entry = { value: string; expiresAt: number }

/** Bounded LRU (Map keeps insertion order; a hit is re-inserted to mark it recent). Per server instance. */
const MAX_ENTRIES = 100
const DEFAULT_TTL_MS = 15 * 60 * 1000
const store = new Map<string, Entry>()

export function cacheKey(parts: string[]): string {
  return createHash("sha256").update(parts.join("\u001f")).digest("hex")
}

export function cacheGet(key: string): string | null {
  const e = store.get(key)
  if (!e) return null
  store.delete(key)
  if (Date.now() > e.expiresAt) return null
  store.set(key, e)
  return e.value
}

export function cacheSet(key: string, value: string, ttlMs: number = DEFAULT_TTL_MS) {
  store.delete(key)
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value
    if (oldest === undefined) break
    store.delete(oldest)
  }
}

/** For tests / hot reload */
export function cacheClear() {
  store.clear()
}
