import "server-only"

import { LLMAbortError, LLMHttpError, toLLMError } from "@/lib/llm/errors"
import { safeJsonParse } from "@/lib/llm/jsonUtils"
import { dispatchProvider } from "@/lib/llm/providers"
import { resolveModelChain } from "@/lib/llm/registry"
import type { LLMTask, Mode, ModelRef, RunLLMOptions, RunLLMResult } from "@/lib/llm/types"
import { cacheGet, cacheKey, cacheSet } from "@/lib/utils/cache"
import { llmLogger } from "@/lib/utils/logger"

const DEFAULT_BUDGET_MS = 30_000
const DEFAULT_TIMEOUT_MS = 8_000
/** Below this an attempt cannot finish a ~1.5k-token answer, so it is not started. */
const MIN_SLICE_MS = 2_500

/* Model health: a model that is gone, rate limited or slow is skipped for a while so later uploads do not wait on it. */
const cooldownUntil = new Map<string, number>()
const refKey = (r: ModelRef) => `${r.provider}:${r.model}`
const DEAD_MODEL = /model_not_found|decommission|does not exist|no endpoints found|not a valid model|unknown model|invalid model/i

function cooldownFor(err: unknown): number {
  if (!(err instanceof LLMHttpError)) return 0
  const s = err.status
  if (s === 404 || ((s === 400 || s === 422) && DEAD_MODEL.test(err.message))) return 30 * 60_000
  if (s === 401 || s === 403 || (s === 503 && /not configured/i.test(err.message))) return 10 * 60_000
  if (s === 429) return 45_000
  if (s === 408 || (typeof s === "number" && s >= 500)) return 30_000
  return 0
}

const isCooling = (r: ModelRef) => (cooldownUntil.get(refKey(r)) ?? 0) > Date.now()

/** The chain minus anything cooling off. If everything is cooling, try the whole chain anyway. */
function liveChain(task: LLMTask, mode: Mode): ModelRef[] {
  const chain = resolveModelChain(task, mode)
  const live = chain.filter((r) => !isCooling(r))
  return live.length ? live : chain
}

const debug = () => process.env.LLM_DEBUG === "1"
const short = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 200)

/** JSON parse + schema + caller's usability check. Returns undefined when the answer is not usable. */
function validate<T>(content: string, opts: RunLLMOptions<T>): { parsed?: T } | undefined {
  if (opts.jsonMode === false && !opts.zodSchema) return {}
  let json: unknown
  try {
    json = safeJsonParse(content)
  } catch {
    return undefined
  }
  if (!opts.zodSchema) return { parsed: json as T }
  const r = opts.zodSchema.safeParse(json)
  if (!r.success) return undefined
  if (opts.accept && !opts.accept(r.data)) return undefined
  return { parsed: r.data }
}

/**
 * Single entry point for LLM calls: cache, then the model chain inside one wall-clock budget.
 * - Each attempt gets min(model timeout, a fair share of what is left, what is left). No same-model retries.
 * - Timeouts, rate limits, outages and dead models cool the model down and move on.
 * - Bad JSON, schema failures and answers `accept` rejects move on too, and are never cached.
 * - `signal` (or the budget running out) aborts the in-flight request and ends the chain.
 */
export async function runLLMTask<T = string>(task: LLMTask, userPrompt: string, opts: RunLLMOptions<T>): Promise<RunLLMResult<T>> {
  const mode: Mode = opts.mode ?? "balanced"
  const chain = liveChain(task, mode)
  if (!chain.length) throw new LLMHttpError("No AI provider is configured. Set GROQ_API_KEY and/or OPENROUTER_API_KEY.", 503)

  const key = cacheKey([task, opts.systemPrompt, userPrompt, opts.jsonMode === false ? "text" : "json", String(opts.maxTokens ?? "")])
  if (!opts.skipCache) {
    const hit = cacheGet(key)
    const ok = hit !== null ? validate(hit, opts) : undefined
    if (hit !== null && ok) {
      llmLogger.info("llm_cache_hit", { task })
      return { content: hit, provider: chain[0]!.provider, model: "(cache)", latency: 0, parsed: ok.parsed, fromCache: true, tried: 0 }
    }
  }

  const budget = new AbortController()
  const startedAt = Date.now()
  const deadline = startedAt + (opts.budgetMs ?? DEFAULT_BUDGET_MS)
  const budgetTimer = setTimeout(() => budget.abort(), Math.max(0, deadline - startedAt))
  const signal = opts.signal ? AbortSignal.any([opts.signal, budget.signal]) : budget.signal

  const maxModels = Math.min(chain.length, opts.maxModels ?? chain.length)
  let lastErr: unknown = null
  let tried = 0
  try {
    for (let i = 0; i < maxModels; i++) {
      if (signal.aborted) break
      const ref = chain[i]!
      const remaining = deadline - Date.now()
      if (remaining < MIN_SLICE_MS) break
      const fairShare = Math.max(4_000, (remaining / (maxModels - i)) * 1.5)
      const timeoutMs = Math.min(ref.timeoutMs ?? opts.timeoutMs ?? DEFAULT_TIMEOUT_MS, fairShare, remaining)

      tried++
      const t0 = Date.now()
      try {
        const out = await dispatchProvider(ref.provider, {
          model: ref.model,
          system: opts.systemPrompt,
          user: userPrompt,
          temperature: opts.temperature,
          jsonMode: opts.jsonMode !== false,
          timeoutMs,
          maxTokens: opts.maxTokens,
          signal,
        })
        const latency = Date.now() - t0
        if (debug()) llmLogger.info("llm_tokens", { task, model: refKey(ref), prompt: out.usage?.prompt, completion: out.usage?.completion, latency })
        const ok = validate(out.content, opts)
        if (!ok) {
          lastErr = new Error(`Unusable answer from ${refKey(ref)}`)
          llmLogger.warn("llm_unusable", { task, model: refKey(ref), latency })
          continue
        }
        if (!opts.skipCache) cacheSet(key, out.content, opts.cacheTtlMs)
        llmLogger.info("llm_complete", { task, model: refKey(ref), latency, tried })
        return { content: out.content, provider: ref.provider, model: ref.model, latency, parsed: ok.parsed, usage: out.usage, tried }
      } catch (e) {
        const err = toLLMError(e, signal)
        lastErr = err
        if (err instanceof LLMAbortError) break
        const cool = cooldownFor(err)
        if (cool > 0) cooldownUntil.set(refKey(ref), Date.now() + cool)
        llmLogger.warn("llm_model_failed", { task, model: refKey(ref), status: err.status, error: short(err), cooldownMs: cool, timeoutMs })
      }
    }
  } finally {
    clearTimeout(budgetTimer)
  }

  if (signal.aborted && !(lastErr instanceof LLMHttpError)) lastErr = new LLMAbortError(opts.signal?.aborted ? "LLM call cancelled" : "LLM budget exhausted")
  llmLogger.error("llm_chain_failed", { task, tried, ms: Date.now() - startedAt, error: short(lastErr) })
  throw lastErr instanceof Error ? lastErr : new Error("LLM request failed")
}
