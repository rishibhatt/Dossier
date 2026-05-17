"use client"

import { useCallback } from "react"

import { messages } from "@/config/messages"
import { buildFallbackDesignConfig } from "@/lib/design/fallbackDesignConfig"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import { inferUserType } from "@/lib/design/inferType"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument, StructuredResume } from "@/types/dossier"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"

type ParsePdfSuccess = {
  rawText: string
  structuredData: StructuredResume
  portfolioData: PortfolioDocument
  parsedResume?: ParsedResume
  designConfig?: DesignConfig
}

type ApiErrorBody = {
  error?: string
  message?: string
}

function resolveClientErrorMessage(code: string | undefined): string {
  const errs = messages.dossier.errors
  if (code && code in errs) {
    return errs[code as keyof typeof errs]
  }
  return errs.generic
}

export function usePortfolioParse() {
  const setFile = useDossierStore((s) => s.setFile)
  const setLoading = useDossierStore((s) => s.setLoading)
  const setError = useDossierStore((s) => s.setError)
  const setFromParseResult = useDossierStore((s) => s.setFromParseResult)

  const submit = useCallback(
    async (file: File, generationContext: PortfolioGenerationContext = DEFAULT_GENERATION_CONTEXT) => {
      setFile(file)
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("portfolioStyle", generationContext.portfolioStylePreset)
      formData.append("designNotes", generationContext.designNotes)
      formData.append("variationSeed", String(generationContext.variationSeed))

      try {
        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        })

        const body = (await response.json()) as ParsePdfSuccess & ApiErrorBody

        if (!response.ok) {
          setError(resolveClientErrorMessage(body.error))
          setLoading(false)
          return
        }

        const portfolioData = ensurePortfolioMeta(body.portfolioData, body.structuredData)
        const designConfig =
          body.designConfig ?? buildFallbackDesignConfig(inferUserType(portfolioData), portfolioData)

        setFromParseResult({
          rawText: body.rawText,
          structuredData: body.structuredData,
          portfolioData,
        })
        usePortfolioStore.getState().hydratePortfolio(
          portfolioData,
          designConfig,
          {
            portfolioStylePreset: generationContext.portfolioStylePreset,
            portfolioDesignNotes: generationContext.designNotes,
            generationVariation: generationContext.variationSeed,
          },
          body.parsedResume ?? null
        )
        setLoading(false)
      } catch {
        setError(messages.dossier.errors.generic)
        setLoading(false)
      }
    },
    [setError, setFile, setFromParseResult, setLoading]
  )

  return { submit }
}
