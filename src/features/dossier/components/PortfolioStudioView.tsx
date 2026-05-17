"use client"

import { useEffect } from "react"

import { NLEditor } from "@/components/NLEditor"
import { StudioTopNav } from "@/components/studio/StudioTopNav"
import { StudioWorkspaceColumns } from "@/components/studio/StudioWorkspaceColumns"
import { buildFallbackDesignConfig } from "@/lib/design/fallbackDesignConfig"
import { inferUserType } from "@/lib/design/inferType"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"
import { loadEditorDraft, saveEditorDraft } from "@/lib/portfolio/editorPersistence"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore } from "@/store/useStudioShellStore"

function applyStudioStepLayout(step: number) {
  const shell = useStudioShellStore.getState()
  if (step === 0) {
    shell.setLeftCollapsed(true)
    shell.setRightCollapsed(true)
  } else if (step === 1) {
    shell.setLeftCollapsed(true)
    shell.setRightCollapsed(false)
  } else if (step === 2) {
    shell.setLeftCollapsed(false)
    shell.setRightCollapsed(true)
    shell.setActiveSidebarSection("hero")
  } else if (step === 3) {
    shell.setRightCollapsed(false)
    shell.setLeftCollapsed(true)
    shell.setActiveSidebarSection("site-seo")
  }
}

export function PortfolioStudioView() {
  const portfolioData = useDossierStore((s) => s.portfolioData)

  useEffect(() => {
    applyStudioStepLayout(useStudioShellStore.getState().currentStep)
    let prevStep = useStudioShellStore.getState().currentStep
    const unsub = useStudioShellStore.subscribe((s) => {
      if (s.currentStep === prevStep) return
      prevStep = s.currentStep
      applyStudioStepLayout(s.currentStep)
    })
    return unsub
  }, [])

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
      useStudioShellStore.getState().setCurrentStep(1)
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
      usePortfolioStore.getState().setDesignConfig(
        buildFallbackDesignConfig(inferUserType(ps.document), ps.document)
      )
    }
  }, [portfolioData])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const unsub = usePortfolioStore.subscribe(() => {
      const st = usePortfolioStore.getState()
      const { document: doc, designConfig: cfg, hiddenSectionIds, sectionSurfaceOverrides } = st
      if (!doc || !cfg) return
      if (t) clearTimeout(t)
      t = setTimeout(() => {
        saveEditorDraft({
          document: doc,
          designConfig: cfg,
          hiddenSectionIds,
          sectionSurfaceOverrides,
          savedAt: new Date().toISOString(),
        })
      }, 500)
    })
    return () => {
      unsub()
      if (t) clearTimeout(t)
    }
  }, [])

  return (
    <>
      <NLEditor />
      <div className="flex h-[min(100dvh,100vh)] max-h-[100dvh] flex-col overflow-hidden bg-[#F7F5F0] text-foreground">
        <StudioTopNav />
        <StudioWorkspaceColumns />
      </div>
    </>
  )
}
