import "server-only"

import type { z } from "zod"

import { LLMHttpError } from "@/lib/llm/errors"
import { safeJsonParse } from "@/lib/llm/jsonUtils"
import { dispatchProvider } from "@/lib/llm/providers"
import { resolveModelForTask } from "@/lib/llm/registry"
import type { LLMProviderId, LLMTask, Mode, RunLLMOptions, RunLLMResult } from "@/lib/llm/types"
import { cacheGet, cacheKey, cacheSet } from "@/lib/utils/cache"
import { llmLogger } from "@/lib/utils/logger"
import { isNonRetryablePayloadOrQuota, isRetryableNetworkOrRateLimit, withRetry } from "@/lib/utils/retry"

async function invokeProvider(
  provider: LLMProviderId,
  model: string,
  system: string,
  user: string,
  temperature: number | undefined,
  jsonMode: boolean,
  timeoutMs: number | undefined,
  maxAttempts: number | undefined
): Promise<{ content: string; latency: number }> {
  const t0 = Date.now()
  const content = await withRetry(
    async () =>
      dispatchProvider(provider, {
        model,
        system,
        user,
        temperature,
        jsonMode,
        timeoutMs,
      }),
    {
      maxAttempts: maxAttempts ?? 3,
      baseDelayMs: 150,
      shouldRetry: (err, attempt) => {
        if (attempt >= 2) return false
        if (isNonRetryablePayloadOrQuota(err)) return false
        if (err instanceof LLMHttpError && err.status === 413) return false
        if (isRetryableNetworkOrRateLimit(err)) return true
        if (err instanceof LLMHttpError && (err.status === 429 || err.status === 503)) return true
        return false
      },
    }
  )
  return { content, latency: Date.now() - t0 }
}

async function completeWithValidation<T>(
  task: LLMTask,
  ref: { provider: LLMProviderId; model: string },
  userPrompt: string,
  systemPrompt: string,
  temperature: number | undefined,
  jsonMode: boolean,
  zodSchema: z.ZodType<T> | undefined,
  maxJsonAttempts: number,
  timeoutMs: number | undefined,
  maxAttempts: number | undefined
): Promise<RunLLMResult<T>> {
  let lastErr: unknown
  for (let attempt = 0; attempt < maxJsonAttempts; attempt++) {
    try {
      const { content, latency } = await invokeProvider(
        ref.provider,
        ref.model,
        systemPrompt,
        userPrompt,
        temperature,
        jsonMode,
        timeoutMs,
        maxAttempts
      )

      if (!zodSchema) {
        llmLogger.info("llm_complete", { task, model: ref.model, provider: ref.provider, latency, validated: false })
        return { content, provider: ref.provider, model: ref.model, latency }
      }

      let parsedJson: unknown
      try {
        parsedJson = jsonMode !== false ? safeJsonParse(content) : content
      } catch (e) {
        lastErr = e
        llmLogger.warn("llm_invalid_json", { task, model: ref.model, attempt })
        continue
      }

      const parsed = zodSchema.safeParse(parsedJson)
      if (!parsed.success) {
        lastErr = parsed.error
        llmLogger.warn("llm_schema_fail", { task, model: ref.model, attempt, issues: parsed.error.issues?.length })
        continue
      }

      llmLogger.info("llm_complete", { task, model: ref.model, provider: ref.provider, latency, validated: true })
      return { content, provider: ref.provider, model: ref.model, latency, parsed: parsed.data }
    } catch (e) {
      lastErr = e
      if (isNonRetryablePayloadOrQuota(e) || (e instanceof LLMHttpError && e.status === 413)) {
        throw e
      }
      if (isRetryableNetworkOrRateLimit(e) || (e instanceof LLMHttpError && e.status === 429)) {
        llmLogger.warn("llm_provider_retry_cycle", { task, model: ref.model, attempt })
        continue
      }
      throw e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("LLM validation failed")
}

/**
 * Single entry point for all LLM calls — registry, cache, retries, fallback, validation.
 */
export async function runLLMTask<T = string>(task: LLMTask, userPrompt: string, options: RunLLMOptions<T>): Promise<RunLLMResult<T>> {
  const mode: Mode = options.mode ?? "balanced"
  const jsonMode = options.jsonMode !== false
  const temperature = options.temperature
  const systemPrompt = options.systemPrompt
  const zodSchema = options.zodSchema as z.ZodType<T> | undefined

  const key = cacheKey([task, mode, systemPrompt, userPrompt, jsonMode ? "json" : "text", zodSchema ? "validated" : "raw"])
  if (!options.skipCache) {
    const hit = cacheGet(key)
    if (hit) {
      try {
        if (zodSchema && jsonMode !== false) {
          const parsedJson = safeJsonParse(hit)
          const parsed = zodSchema.safeParse(parsedJson)
          if (parsed.success) {
            const ref = resolveModelForTask(task, mode, "primary")
            llmLogger.info("llm_cache_hit", { task, mode })
            return {
              content: hit,
              provider: ref.provider,
              model: "(cache)",
              latency: 0,
              parsed: parsed.data,
              fromCache: true,
            }
          }
        } else if (!zodSchema) {
          const ref = resolveModelForTask(task, mode, "primary")
          llmLogger.info("llm_cache_hit", { task, mode })
          return { content: hit, provider: ref.provider, model: "(cache)", latency: 0, fromCache: true }
        }
      } catch {
        /* stale cache */
      }
    }
  }

  const primary = resolveModelForTask(task, mode, "primary")
  const fallback = resolveModelForTask(task, mode, "fallback")

  const maxJsonAttempts = options.maxJsonAttempts ?? 3
  const timeoutMs = options.timeoutMs
  const maxAttempts = options.maxAttempts
  const useFallback = options.useFallback !== false

  try {
    const out = await completeWithValidation(
      task,
      primary,
      userPrompt,
      systemPrompt,
      temperature,
      jsonMode,
      zodSchema,
      maxJsonAttempts,
      timeoutMs,
      maxAttempts
    )
    if (!options.skipCache) cacheSet(key, out.content, options.cacheTtlMs)
    return out
  } catch (primaryErr) {
    llmLogger.warn("llm_primary_failed", {
      task,
      error: primaryErr instanceof Error ? primaryErr.message : String(primaryErr),
    })
    if (!useFallback) {
      throw primaryErr
    }
    try {
      const out = await completeWithValidation(
        task,
        fallback,
        userPrompt,
        systemPrompt,
        temperature,
        jsonMode,
        zodSchema,
        maxJsonAttempts,
        timeoutMs,
        maxAttempts
      )
      if (!options.skipCache) cacheSet(key, out.content, options.cacheTtlMs)
      return out
    } catch (fallbackErr) {
      llmLogger.error("llm_fallback_failed", {
        task,
        primary: primaryErr instanceof Error ? primaryErr.message : primaryErr,
        fallback: fallbackErr instanceof Error ? fallbackErr.message : fallbackErr,
      })
      throw fallbackErr
    }
  }
}
