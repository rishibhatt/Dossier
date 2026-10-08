"use client"

import { useEffect } from "react"

import { StudioShell } from "@/features/studio/StudioShell"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { buildFallbackDesignConfig } from "@/lib/design/fallbackDesignConfig"
import { inferUserType } from "@/lib/design/inferType"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"
import { loadEditorDraft, saveEditorDraft } from "@/lib/portfolio/editorPersistence"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { saveLastSession } from "@/lib/portfolio/lastSession"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

/** Hydrates the editor stores from the parse result, autosaves while you work, then shows the studio. */
export function PortfolioStudioView({ onStartOver }: { onStartOver: () => void }) {
  const portfolioData = useDossierStore((s) => s.portfolioData)

  useEffect(() => {
    if (!portfolioData) return
    const ps = usePortfolioStore.getState()
    if (!ps.document) {
      usePortfolioStore.getState().hydratePortfolio(
        portfolioData,
        buildFallbackDesignConfig(inferUserType(portfolioData), portfolioData),
        {
          portfolioStylePreset: ps.portfolioStylePreset,
          portfolioDesignNotes: ps.portfolioDesignNotes,
          generationVariation: ps.generationVariation,
        },
        portfolioDocumentToParsedResume(portfolioData, inferUserType(portfolioData))
      )
      const d = usePortfolioStore.getState().document
      const c = usePortfolioStore.getState().designConfig
      if (d && c) {
        const draft = loadEditorDraft(d)
        if (draft) {
          usePortfolioStore.setState({
            document: ensurePortfolioMeta(draft.document),
            designConfig: draft.designConfig,
            hiddenSectionIds: draft.hiddenSectionIds ?? {},
            sectionSurfaceOverrides: draft.sectionSurfaceOverrides ?? {},
          })
        }
      }
      return
    }
    if (!ps.designConfig) {
      usePortfolioStore.getState().setDesignConfig(buildFallbackDesignConfig(inferUserType(ps.document), ps.document))
    }
  }, [portfolioData])

  // Autosave 500 ms after the last change, to this device only.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const first = usePortfolioStore.getState()
    let seen = [first.document, first.designConfig, first.hiddenSectionIds, first.sectionSurfaceOverrides]
    const unsub = usePortfolioStore.subscribe(() => {
      const { document: doc, designConfig: cfg, hiddenSectionIds, sectionSurfaceOverrides, parsedResume } = usePortfolioStore.getState()
      if (!doc || !cfg) return
      // Only real edits count: store updates such as toggling edit mode do not dirty the page.
      const now = [doc, cfg, hiddenSectionIds, sectionSurfaceOverrides]
      if (now.every((v, i) => v === seen[i])) return
      seen = now
      useStudioStatus.getState().markChanged()
      if (t) clearTimeout(t)
      t = setTimeout(() => {
        saveEditorDraft({ document: doc, designConfig: cfg, hiddenSectionIds, sectionSurfaceOverrides, savedAt: new Date().toISOString() })
        saveLastSession({ document: doc, designConfig: cfg, parsedResume, hiddenSectionIds })
        useStudioUiStore.getState().markSaved()
        useStudioStatus.getState().markSaved()
      }, 500)
    })
    return () => {
      unsub()
      if (t) clearTimeout(t)
    }
  }, [])

  return <StudioShell onStartOver={onStartOver} />
}
