"use client"

import { useEffect } from "react"

import { HUMAN_EVENTS, isTestVisit, looksAutomated } from "@/lib/analytics"
import { PortfolioView } from "@/components/portfolio/page/PortfolioView"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export type PublishedPayload = {
  document: PortfolioDocument
  designConfig: DesignConfig
  /** Sections the owner hid in the studio (never rendered publicly). */
  hiddenSectionIds?: string[]
  sectionSurfaceOverrides?: Record<string, { bg?: string }>
}

/** Server-rendered published portfolio (no store hydration, so the first paint is the real page). */
export function PublishedPortfolioClient({ payload, showBadge = true, slug }: { payload: PublishedPayload; showBadge?: boolean; slug?: string }) {
  useEffect(() => {
    if (!slug || looksAutomated() || isTestVisit()) return
    // One visit per browser per site per day, counted only once a person scrolls, taps or types.
    const key = `dossier_view_${slug}`
    const today = new Date().toISOString().slice(0, 10)
    try {
      if (localStorage.getItem(key) === today) return
    } catch {
      /* private mode: count anyway */
    }
    const count = () => {
      for (const e of HUMAN_EVENTS) window.removeEventListener(e, count)
      try {
        localStorage.setItem(key, today)
      } catch {
        /* storage blocked */
      }
      void fetch("/api/views", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true })
    }
    for (const e of HUMAN_EVENTS) window.addEventListener(e, count, { once: true, passive: true })
    return () => {
      for (const e of HUMAN_EVENTS) window.removeEventListener(e, count)
    }
  }, [slug])

  return (
    <main className="min-h-screen">
      <PortfolioView
        document={payload.document}
        config={payload.designConfig}
        hidden={payload.hiddenSectionIds ?? []}
        surfaces={payload.sectionSurfaceOverrides}
        credit={{ show: showBadge, slug }}
      />
    </main>
  )
}
