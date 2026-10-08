export class LLMHttpError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "LLMHttpError"
    this.status = status
  }
}

/** The caller's deadline or cancel fired: stop the whole chain, do not blame (cool) the model. */
export class LLMAbortError extends Error {
  constructor(message = "LLM call cancelled") {
    super(message)
    this.name = "LLMAbortError"
  }
}

const TIMEOUT_RE = /timed?\s?out|timeout|etimedout/i

/**
 * Any provider/SDK/fetch error -> LLMHttpError with a status the router can act on.
 * Timeouts (Groq SDK "Request timed out.", fetch `TimeoutError`) become 408 so the model cools off and the chain moves on.
 * When `signal` (the caller's deadline) has fired, an LLMAbortError is returned instead.
 */
export function toLLMError(e: unknown, signal?: AbortSignal): LLMHttpError | LLMAbortError {
  if (e instanceof LLMAbortError) return e
  if (signal?.aborted) return new LLMAbortError()
  if (e instanceof LLMHttpError && e.status !== undefined) return e
  const msg = e instanceof Error ? e.message : String(e)
  const name = e instanceof Error ? e.name : ""
  let status: number | undefined
  if (e && typeof e === "object") {
    const o = e as { status?: unknown; statusCode?: unknown }
    if (typeof o.status === "number") status = o.status
    else if (typeof o.statusCode === "number") status = o.statusCode
  }
  if (status === undefined) {
    if (name === "TimeoutError" || name === "AbortError" || name === "APIConnectionTimeoutError" || TIMEOUT_RE.test(msg)) status = 408
    else if (/^413\b|request too large/i.test(msg)) status = 413
    else if (/\b429\b|rate limit/i.test(msg)) status = 429
    else if (/fetch failed|econnreset|enotfound|socket hang up|connection error/i.test(msg)) status = 503
  }
  return new LLMHttpError(msg, status)
}
