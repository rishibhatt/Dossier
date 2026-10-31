"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { currentSession } from "@/features/studio/siteSession"
import { StudioShell } from "@/features/studio/StudioShell"
import { publish } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { buildFallbackDesignConfig } from "@/lib/design/fallbackDesignConfig"
import { inferUserType } from "@/lib/design/inferType"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"
import { loadEditorDraft, saveEditorDraft } from "@/lib/portfolio/editorPersistence"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { saveLastSession, takeAfterAuthIntent } from "@/lib/portfolio/lastSession"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

/** How long after the first edit an unpublished page gets its one "ready to share?" prompt. */
const PUBLISH_NUDGE_MS = 90_000

/** True if `key` was already set this browser session; sets it otherwise. */
function sessionStorageFlag(key: string): boolean {
  try {
    if (window.sessionStorage.getItem(key)) return true
    window.sessionStorage.setItem(key, "1")
  } catch {
    /* blocked storage: show it anyway */
  }
  return false
}

/** Hydrates the editor stores from the parse result, autosaves while you work, then shows the studio. */
export function PortfolioStudioView({ onStartOver }: { onStartOver: () => void }) {
  const portfolioData = useDossierStore((s) => s.portfolioData)
  const router = useRouter()

  // Back from signing up after pressing Publish: finish what they asked for.
  useEffect(() => {
    if (takeAfterAuthIntent() === "publish") void publish(router)
  }, [router])

  // Never published: once the person has been shaping the page for a while, point at Publish once per visit.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsub = useStudioStatus.subscribe((s) => {
      if (timer || !s.unpublished || useStudioUiStore.getState().publishedSlug) return
      timer = setTimeout(() => {
        if (useStudioUiStore.getState().publishedSlug || sessionStorageFlag("dossier:publish-nudge")) return
        toast("Looking good. Ready to share it?", {
          description: "Publish to get a link you can send. You can keep editing and publish again; the link stays the same.",
          duration: 12000,
          action: { label: "Publish", onClick: () => void publish(router) },
        })
      }, PUBLISH_NUDGE_MS)
    })
    return () => {
      unsub()
      if (timer) clearTimeout(timer)
    }
  }, [router])

  // Leaving with edits that are not on the live page yet: the browser asks first. Work on this device is saved anyway.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      const live = useStudioUiStore.getState().publishedSlug
      if (live && useStudioStatus.getState().unpublished) e.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
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
      const { document: doc, designConfig: cfg, hiddenSectionIds, sectionSurfaceOverrides } = usePortfolioStore.getState()
      if (!doc || !cfg) return
      // Only real edits count: store updates such as toggling edit mode do not dirty the page.
      const now = [doc, cfg, hiddenSectionIds, sectionSurfaceOverrides]
      if (now.every((v, i) => v === seen[i])) return
      seen = now
      useStudioStatus.getState().markChanged()
      if (t) clearTimeout(t)
      t = setTimeout(() => {
        saveEditorDraft({ document: doc, designConfig: cfg, hiddenSectionIds, sectionSurfaceOverrides, savedAt: new Date().toISOString() })
        const session = currentSession()
        if (session) saveLastSession(session)
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
