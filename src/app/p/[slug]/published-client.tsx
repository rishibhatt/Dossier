"use client"

import { useEffect } from "react"

import { PortfolioComposer } from "@/components/portfolio/composer/PortfolioComposer"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export type PublishedPayload = {
  document: PortfolioDocument
  designConfig: DesignConfig
}

export function PublishedPortfolioClient({ payload }: { payload: PublishedPayload }) {
  useEffect(() => {
    usePortfolioStore.getState().hydratePortfolio(payload.document, payload.designConfig, {
      portfolioStylePreset: usePortfolioStore.getState().portfolioStylePreset,
      portfolioDesignNotes: usePortfolioStore.getState().portfolioDesignNotes,
      generationVariation: usePortfolioStore.getState().generationVariation,
    })
  }, [payload])

  return (
    <main className="min-h-screen bg-background">
      <PortfolioComposer standalone />
    </main>
  )
}
