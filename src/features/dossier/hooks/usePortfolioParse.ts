"use client"

import { useCallback, useEffect, useRef } from "react"

import { messages } from "@/config/messages"
import { buildFallbackDesignConfig } from "@/lib/design/fallbackDesignConfig"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import { inferUserType } from "@/lib/design/inferType"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig } from "@/types/designEngine"
import type { BuildProgressEvent } from "@/types/buildStream"
import type { PortfolioDocument, StructuredResume } from "@/types/dossier"
import { useDossierStore } from "@/store/useDossierStore"
import { useParseProgressStore } from "@/store/useParseProgressStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"

type ParsePdfSuccess = {
  structuredData: StructuredResume
  source?: "ai" | "fallback"
  portfolioData: PortfolioDocument
  parsedResume?: ParsedResume
  designConfig?: DesignConfig
}

type ApiErrorBody = {
  error?: string
  message?: string
}

type ParsePdfStreamChunk =
  | BuildProgressEvent
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
    return (await response.json().catch(() => ({ error: "pipelineFailed" }))) as ParsePdfSuccess & ApiErrorBody
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffered = ""
  const failure = (chunk: ApiErrorBody) => ({ error: chunk.error, message: chunk.message }) as ParsePdfSuccess & ApiErrorBody

  /** Returns a final answer when the line is a result or an error, otherwise null. A bad line is skipped, not fatal. */
  const handleLine = (raw: string): (ParsePdfSuccess & ApiErrorBody) | null => {
    const line = raw.trim()
    if (!line) return null
    let chunk: ParsePdfStreamChunk
    try {
      chunk = JSON.parse(line) as ParsePdfStreamChunk
    } catch {
      return null
    }
    if (chunk.type === "progress") useParseProgressStore.getState().setStage(chunk.stage, chunk.elapsedMs, chunk.preview)
    if (chunk.type === "result") return chunk.data
    if (chunk.type === "error") return failure(chunk)
    return null
  }

  while (true) {
    const { done, value } = await reader.read()
    if (value) {
      buffered += decoder.decode(value, { stream: !done })
      let newlineIndex = buffered.indexOf("\n")
      while (newlineIndex >= 0) {
        const line = buffered.slice(0, newlineIndex)
        buffered = buffered.slice(newlineIndex + 1)
        const final = handleLine(line)
        if (final) return final
        newlineIndex = buffered.indexOf("\n")
      }
    }
    if (done) break
  }

  const final = handleLine(buffered)
  if (final) return final

  return { error: "pipelineFailed", message: "The PDF parser finished without returning a result." } as ParsePdfSuccess & ApiErrorBody
}

type SubmitArgs = {
  file: File
  generationContext: PortfolioGenerationContext
  options: { auto?: boolean }
}

export function usePortfolioParse() {
  const setFile = useDossierStore((s) => s.setFile)
  const setLoading = useDossierStore((s) => s.setLoading)
  const setError = useDossierStore((s) => s.setError)
  const setFromParseResult = useDossierStore((s) => s.setFromParseResult)
  const controller = useRef<AbortController | null>(null)
  const last = useRef<SubmitArgs | null>(null)

  // Leaving the page cancels the request so a late result cannot land on a screen that is gone.
  useEffect(() => () => controller.current?.abort(), [])

  /** Stops the request and returns to the look step. Not an error, so no message. */
  const cancel = useCallback(() => {
    controller.current?.abort()
    controller.current = null
    setLoading(false)
    setError(null)
    useParseProgressStore.getState().reset()
  }, [setError, setLoading])

  const submit = useCallback(
    async (
      file: File,
      generationContext: PortfolioGenerationContext = DEFAULT_GENERATION_CONTEXT,
      options: { auto?: boolean } = {}
    ) => {
      // One request at a time: a second tap replaces the first instead of racing it.
      controller.current?.abort()
      const mine = new AbortController()
      controller.current = mine
      last.current = { file, generationContext, options }

      setFile(file)
      setLoading(true)
      setError(null)
      useParseProgressStore.getState().start()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("portfolioStyle", generationContext.portfolioStylePreset)
      formData.append("designNotes", generationContext.designNotes)
      formData.append("variationSeed", String(generationContext.variationSeed))
      // "Let Dossier choose": the server picks the template from the resume instead of the style the person tapped.
      if (options.auto) formData.append("autoStyle", "1")

      const isCurrent = () => controller.current === mine

      const fail = (message: string) => {
        if (!isCurrent()) return
        setError(message)
        setLoading(false)
      }

      try {
        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
          signal: mine.signal,
        })

        const body = await readParsePdfResponse(response)
        if (!isCurrent()) return

        if (!response.ok || body.error || !body.portfolioData || !body.structuredData) {
          fail(resolveClientErrorMessage(body.error))
          return
        }

        const portfolioData = ensurePortfolioMeta(body.portfolioData, body.structuredData)
        const designConfig =
          body.designConfig ?? buildFallbackDesignConfig(inferUserType(portfolioData), portfolioData)

        setFromParseResult({
          structuredData: body.structuredData,
          portfolioData,
          source: body.source,
        })
        // The result is final: make sure the live build knows which reader produced it.
        if (body.source) useParseProgressStore.getState().setStage("response_done", undefined, { source: body.source })
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
        controller.current = null
        setLoading(false)
      } catch (err) {
        // Cancelled on purpose: cancel() already reset the screen.
        if (mine.signal.aborted || (err instanceof DOMException && err.name === "AbortError")) return
        fail(messages.dossier.errors.requestFailed)
      }
    },
    [setError, setFile, setFromParseResult, setLoading]
  )

  /** Runs the last request again with the same file and look. */
  const retry = useCallback(() => {
    const args = last.current
    if (args) void submit(args.file, args.generationContext, args.options)
  }, [submit])

  return { submit, cancel, retry }
}