import "server-only"

import { designSpecToGenerationIntent } from "@/features/design-intelligence/designSpecAdapter"
import {
  buildDesignSpecSectionPayload,
  buildSectionJsxSystemPrompt,
  buildStrictRetrySystemPrompt,
  summarizeDesignSpecForSystem,
  type SectionKind,
} from "@/features/jsx-engine/prompts"
import { compileGeneratedJsx } from "@/features/jsx-engine/jsxCompiler"
import { assessGeneratedJsxQuality } from "@/features/jsx-engine/jsxQualityGate"
import { sanitizeGeneratedJsx } from "@/features/jsx-engine/jsxSanitizer"
import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import type { DesignSpec } from "@/types/design"

export type GenerateJsxInput = {
  sectionType: SectionKind
  sectionData: unknown
  /** Structured output from Design Intelligence — raw user prompts are not sent to Groq. */
  designSpec: DesignSpec
  portfolioStylePreset?: PortfolioStylePreset
}

export type GenerateJsxResult = {
  sanitizedSource: string
  compiledExecutable: string
  attempts: number
}

/**
 * Groq → sanitize → quality gate → Sucrase compile, up to 3 attempts (quality / compile aware).
 */
export async function generatePortfolioSectionJsx(input: GenerateJsxInput): Promise<GenerateJsxResult> {
  const intent = designSpecToGenerationIntent(input.designSpec)
  const user = buildDesignSpecSectionPayload({
    sectionType: input.sectionType,
    sectionData: input.sectionData,
    designSpec: input.designSpec,
  })

  const specAppendix = summarizeDesignSpecForSystem(input.designSpec)

  let qualityHint = ""
  let compileFailed = false

  for (let attempt = 1; attempt <= 3; attempt++) {
    const useStrictShell = attempt === 3
    const systemBase = useStrictShell
      ? buildStrictRetrySystemPrompt(input.sectionType, intent, input.portfolioStylePreset)
      : buildSectionJsxSystemPrompt(input.sectionType, intent, input.portfolioStylePreset)

    const hints: string[] = [specAppendix]
    if (qualityHint) hints.push(`Quality check failed on the prior attempt: ${qualityHint}`)
    if (compileFailed) hints.push("Compilation failed — reduce JSX complexity and ensure valid syntax.")

    const system = `${systemBase}\n\n${hints.join("\n\n")}`

    // Retired (dead code awaiting deletion): the AI no longer writes JSX, so this never reaches a model.
    void system
    void user
    const raw = ""

    const sanitized = sanitizeGeneratedJsx(raw)
    if (!sanitized.ok) {
      compileFailed = false
      continue
    }

    const compiled = compileGeneratedJsx(sanitized.source)
    if (!compiled.ok) {
      compileFailed = true
      qualityHint = ""
      continue
    }

    compileFailed = false
    const quality = assessGeneratedJsxQuality(sanitized.source, input.sectionType)
    if (!quality.ok) {
      qualityHint = quality.reason
      continue
    }

    return {
      sanitizedSource: sanitized.source,
      compiledExecutable: compiled.executable,
      attempts: attempt,
    }
  }

  throw new Error("jsx_generation_failed")
}
