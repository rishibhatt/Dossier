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

type ParsePdfStreamChunk =
  | { type: "progress"; stage: string }
  | { type: "heartbeat" }
  | { type: "result"; data: ParsePdfSuccess }
  | ({ type: "error" } & ApiErrorBody)

function resolveClientErrorMessage(code: string | undefined): string {
  const errs = messages.dossier.errors
  if (code && code in errs) {
    return errs[code as keyof typeof errs]
  }
  return errs.generic
}

async function readParsePdfResponse(response: Response): Promise<ParsePdfSuccess & ApiErrorBody> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!response.body || !contentType.includes("application/x-ndjson")) {
    return (await response.json()) as ParsePdfSuccess & ApiErrorBody
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffered = ""

  while (true) {
    const { done, value } = await reader.read()
    if (value) {
      buffered += decoder.decode(value, { stream: !done })
      let newlineIndex = buffered.indexOf("\n")
      while (newlineIndex >= 0) {
        const line = buffered.slice(0, newlineIndex).trim()
        buffered = buffered.slice(newlineIndex + 1)

        if (line) {
          const chunk = JSON.parse(line) as ParsePdfStreamChunk
          if (chunk.type === "result") return chunk.data
          if (chunk.type === "error") return { error: chunk.error, message: chunk.message } as ParsePdfSuccess & ApiErrorBody
        }

        newlineIndex = buffered.indexOf("\n")
      }
    }

    if (done) break
  }

  const trailing = buffered.trim()
  if (trailing) {
    const chunk = JSON.parse(trailing) as ParsePdfStreamChunk
    if (chunk.type === "result") return chunk.data
    if (chunk.type === "error") return { error: chunk.error, message: chunk.message } as ParsePdfSuccess & ApiErrorBody
  }

  return { error: "pipelineFailed", message: "The PDF parser finished without returning a result." } as ParsePdfSuccess &
    ApiErrorBody
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

        const body = await readParsePdfResponse(response)

        if (!response.ok || body.error) {
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
