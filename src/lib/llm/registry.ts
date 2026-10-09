import type { LLMProviderId, LLMTask, Mode, ModelRef } from "@/lib/llm/types"

/**
 * Model routing for the one AI job (reading a resume). The router walks the chain in order, skips models that
 * are cooling off, and moves on after a timeout, rate limit, outage, dead model or unusable answer.
 *
 * Verified live against the project keys on 2026-10-08:
 *   Groq        openai/gpt-oss-120b, qwen/qwen3.8-27b, openai/gpt-oss-20b   valid JSON in under 1 s
 *   OpenRouter  google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free   valid JSON, 429 when upstream is busy
 *               nvidia/nemotron-3-super-120b-a12b:free                       valid JSON in about 2 s (reasoning model)
 *
 * Swap models without a deploy (comma-separated `provider:model`):
 *   LLM_MODELS=groq:openai/gpt-oss-120b,openrouter:google/gemma-4-31b-it:free   all tasks
 *   LLM_MODELS_RESUME=...                                                       the resume task only
 */
const GPT_OSS_120B: ModelRef = { provider: "groq", model: "openai/gpt-oss-120b", timeoutMs: 7_000 }
const GPT_OSS_20B: ModelRef = { provider: "groq", model: "openai/gpt-oss-20b", timeoutMs: 6_000 }
const QWEN_27B: ModelRef = { provider: "groq", model: "qwen/qwen3.8-27b", timeoutMs: 6_000 }
const GEMMA_31B: ModelRef = { provider: "openrouter", model: "google/gemma-4-31b-it:free", timeoutMs: 9_000 }
const GEMMA_26B: ModelRef = { provider: "openrouter", model: "google/gemma-4-26b-a4b-it:free", timeoutMs: 9_000 }
const NEMOTRON_120B: ModelRef = { provider: "openrouter", model: "nvidia/nemotron-3-super-120b-a12b:free", timeoutMs: 15_000 }

/** Groq first (fast, keys rotate), OpenRouter after. On OpenRouter the Gemmas answer or 429 fast; Nemotron is slow, so last. */
const CHAINS: Record<Mode, readonly ModelRef[]> = {
  balanced: [GPT_OSS_120B, QWEN_27B, GPT_OSS_20B, GEMMA_31B, GEMMA_26B, NEMOTRON_120B],
  /** Smallest/fastest first. */
  fast: [GPT_OSS_20B, QWEN_27B, GPT_OSS_120B, GEMMA_26B, GEMMA_31B, NEMOTRON_120B],
  /** Strongest readers first, even if slower. */
  quality: [GPT_OSS_120B, NEMOTRON_120B, QWEN_27B, GEMMA_31B, GPT_OSS_20B, GEMMA_26B],
}

function providerConfigured(provider: LLMProviderId): boolean {
  if (provider === "groq") return Boolean(process.env.GROQ_API_KEY || process.env.GROQ_API_KEYS)
  return Boolean(process.env.OPENROUTER_API_KEY)
}

function parseChain(raw: string | undefined): ModelRef[] {
  if (!raw) return []
  const out: ModelRef[] = []
  for (const part of raw.split(",")) {
    const entry = part.trim()
    const i = entry.indexOf(":")
    if (i < 1) continue
    const provider = entry.slice(0, i) as LLMProviderId
    const model = entry.slice(i + 1).trim()
    if ((provider === "groq" || provider === "openrouter") && model) out.push({ provider, model })
  }
  return out
}

/** The ordered list of models to try. Providers without an API key are left out. */
export function resolveModelChain(task: LLMTask, mode: Mode = "balanced"): ModelRef[] {
  const override = parseChain(process.env[`LLM_MODELS_${task.toUpperCase()}`])
  const global = parseChain(process.env.LLM_MODELS)
  const chosen = override.length ? override : global.length ? global : [...CHAINS[mode]]
  return chosen.filter((ref) => providerConfigured(ref.provider))
}
