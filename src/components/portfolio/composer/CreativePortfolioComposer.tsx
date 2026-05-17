"use client"

import { useLayoutEffect } from "react"

import { CreativeModeSurface } from "@/features/creative-mode/CreativeModeSurface"
import { useCreativeModeStore } from "@/store/useCreativeModeStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"

/**
 * Parallel renderer to classic {@link PortfolioComposer} — scene-based creative mode.
 */
export function CreativePortfolioComposer() {
  const document = usePortfolioStore((s) => s.document)
  const experienceConfig = useCreativeModeStore((s) => s.experienceConfig)
  const hydrateExperienceFromDocument = useCreativeModeStore((s) => s.hydrateExperienceFromDocument)
  const rendererMode = useCreativeModeStore((s) => s.rendererMode)

  useLayoutEffect(() => {
    if (rendererMode !== "creative" || !document) return
    if (!experienceConfig) {
      hydrateExperienceFromDocument(document)
    }
  }, [document, experienceConfig, hydrateExperienceFromDocument, rendererMode])

  if (!document) {
    return (
      <div className="flex min-h-[240px] items-center justify-center bg-[#070712] text-sm text-zinc-400">
        No portfolio document loaded.
      </div>
    )
  }

  if (!experienceConfig) {
    return (
      <div className="flex min-h-[240px] items-center justify-center bg-[#070712] text-sm text-zinc-400">
        Preparing creative experience…
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <CreativeModeSurface document={document} config={experienceConfig} />
    </div>
  )
}
