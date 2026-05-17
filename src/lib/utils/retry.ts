export type RetryOptions = {
  maxAttempts?: number
  /** Base delay in ms (exponential: base * 2^attempt). */
  baseDelayMs?: number
  /** Return true to retry this error. */
  shouldRetry: (err: unknown, attempt: number) => boolean
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions): Promise<T> {
  const max = opts.maxAttempts ?? 3
  const base = opts.baseDelayMs ?? 120
  let lastErr: unknown
  for (let attempt = 0; attempt < max; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      lastErr = err
      const retry = opts.shouldRetry(err, attempt)
      if (!retry || attempt === max - 1) throw err
      const delay = base * 2 ** attempt
      await sleep(Math.min(delay, 8000))
    }
  }
  throw lastErr
}

export function isRetryableNetworkOrRateLimit(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const e = err as { status?: number; code?: string; message?: string; cause?: unknown }
  const status = typeof e.status === "number" ? e.status : undefined
  if (status === 429 || status === 408 || status === 503 || status === 502) return true
  const msg = `${e.message ?? ""} ${e.code ?? ""}`.toLowerCase()
  if (msg.includes("rate limit") || msg.includes("timeout") || msg.includes("econnreset") || msg.includes("fetch failed"))
    return true
  return false
}

/** Payload / quota errors — retrying the same request usually does not help. */
export function isNonRetryablePayloadOrQuota(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const st = (err as { status?: unknown }).status
  if (typeof st === "number" && st === 413) return true
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  if (msg.startsWith("413")) return true
  if (msg.includes("request too large for model") || msg.includes("tokens per minute (tpm)")) return true
  return false
}
