import type { LLMTask, Mode, ModelRef } from "@/lib/llm/types"

/** Balanced (default) routing — free / open-weight friendly. */
export const MODEL_REGISTRY: Record<LLMTask, { primary: ModelRef; fallback: ModelRef }> = {
  extract: {
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "mistralai/mixtral-8x7b" },
  },
  intent: {
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "mistralai/mixtral-8x7b" },
  },
  enhance: {
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "mistralai/mixtral-8x7b" },
  },
  layout: {
    /** Mixtral 8x7B on Groq handles large JSON prompts reliably on the free tier vs 8B TPM limits. */
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "mistralai/mixtral-8x7b" },
  },
  design: {
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "meta-llama/llama-3.1-70b-instruct" },
  },
  code: {
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "deepseek/deepseek-coder" },
  },
  refine: {
    primary: { provider: "groq", model: "llama-3.3-70b-versatile" },
    fallback: { provider: "openrouter", model: "mistralai/mixtral-8x7b" },
  },
}

/** Mode-specific primary overrides (fallback unchanged unless noted). */
const MODE_PRIMARY: Record<Mode, Partial<Record<LLMTask, ModelRef>>> = {
  fast: {
    /** Avoid `llama-3.1-8b-instant` — free-tier TPM is often too low for large layout JSON. */
    extract: { provider: "groq", model: "llama-3.3-70b-versatile" },
    intent: { provider: "groq", model: "llama-3.3-70b-versatile" },
    layout: { provider: "groq", model: "llama-3.3-70b-versatile" },
    design: { provider: "groq", model: "llama-3.3-70b-versatile" },
    enhance: { provider: "groq", model: "llama-3.3-70b-versatile" },
    refine: { provider: "groq", model: "llama-3.3-70b-versatile" },
    code: { provider: "groq", model: "llama-3.3-70b-versatile" },
  },
  balanced: {},
  quality: {
    extract: { provider: "groq", model: "llama-3.3-70b-versatile" },
    intent: { provider: "groq", model: "llama-3.3-70b-versatile" },
    layout: { provider: "groq", model: "llama-3.3-70b-versatile" },
    design: { provider: "groq", model: "llama-3.3-70b-versatile" },
    enhance: { provider: "groq", model: "llama-3.3-70b-versatile" },
    refine: { provider: "groq", model: "llama-3.3-70b-versatile" },
    code: { provider: "groq", model: "llama-3.3-70b-versatile" },
  },
}

export function resolveModelForTask(task: LLMTask, mode: Mode = "balanced", tier: "primary" | "fallback"): ModelRef {
  const base = MODEL_REGISTRY[task][tier]
  if (tier === "primary") {
    const o = MODE_PRIMARY[mode]?.[task]
    if (o) return o
  }
  return base
}
