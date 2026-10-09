import type { z } from "zod"

/** The AI only reads resumes. Design is a deterministic rules engine and never calls a model. */
export type LLMTask = "resume"

export type LLMProviderId = "groq" | "openrouter"

export type Mode = "fast" | "balanced" | "quality"

export type ModelRef = {
  provider: LLMProviderId
  model: string
  /** Per-attempt timeout for this model (slow reasoning models get more). Always capped by the remaining budget. */
  timeoutMs?: number
}

export type TokenUsage = { prompt: number; completion: number }

/** What a provider adapter receives. */
export type ProviderCall = {
  model: string
  system: string
  user: string
  temperature?: number
  jsonMode?: boolean
  timeoutMs: number
  maxTokens?: number
  signal?: AbortSignal
}

export type ProviderResult = { content: string; usage?: TokenUsage }

export type RunLLMOptions<T = unknown> = {
  systemPrompt: string
  mode?: Mode
  temperature?: number
  /** When true (default), providers request JSON object mode. */
  jsonMode?: boolean
  /** Parsed JSON is validated; a failure moves on to the next model. */
  zodSchema?: z.ZodType<T>
  /** Usability check on the parsed value. false = next model, and the answer is never cached. */
  accept?: (parsed: T) => boolean
  skipCache?: boolean
  cacheTtlMs?: number
  /** Default per-attempt timeout (a model's own timeoutMs wins). */
  timeoutMs?: number
  /** Total wall-clock budget for the whole chain. Each attempt gets min(timeout, remaining). Default 30 s. */
  budgetMs?: number
  /** Cancels the in-flight call and the rest of the chain. */
  signal?: AbortSignal
  /** Completion token cap. */
  maxTokens?: number
  /** Most models to try (default: the whole chain; the budget usually ends it first). */
  maxModels?: number
}

export type RunLLMResult<T = string> = {
  content: string
  provider: LLMProviderId
  model: string
  latency: number
  parsed?: T
  fromCache?: boolean
  usage?: TokenUsage
  /** Models tried before (and including) the one that answered. */
  tried: number
}
