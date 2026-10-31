"use client"

import { useStudioStatus } from "@/features/studio/studioStatus"
import { inferUserType } from "@/lib/design/inferType"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"
import type { LastSession, SessionSite } from "@/lib/portfolio/lastSession"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

/** The work as it is now, for this device's session store (see lastSession.ts). Null before a portfolio exists. */
export function currentSession(): Omit<LastSession, "savedAt"> | null {
  const { document, designConfig, parsedResume, hiddenSectionIds, sectionSurfaceOverrides } = usePortfolioStore.getState()
  if (!document || !designConfig) return null
  const ui = useStudioUiStore.getState()
  const site: SessionSite | null = ui.publishedSlug && ui.publishedPath ? { slug: ui.publishedSlug, path: ui.publishedPath, indexable: ui.publishedIndexable } : null
  return { document, designConfig, parsedResume, hiddenSectionIds, sectionSurfaceOverrides, site, unpublished: site ? useStudioStatus.getState().unpublished : undefined }
}

/** Loads work into the editor and opens the studio. `site` links it to the live page it updates. */
function openInStudio(
  doc: PortfolioDocument,
  cfg: DesignConfig,
  view: { hiddenSectionIds?: readonly string[] | Record<string, boolean>; sectionSurfaceOverrides?: Record<string, { bg?: string }> },
  site: SessionSite | null,
  unpublished: boolean,
  parsedResume?: LastSession["parsedResume"]
) {
  usePortfolioStore.getState().hydratePortfolio(doc, cfg, undefined, parsedResume ?? portfolioDocumentToParsedResume(doc, inferUserType(doc)), view)
  useStudioUiStore.getState().setPublished(site)
  useStudioStatus.setState({ unpublished: Boolean(site) && unpublished, history: [], future: [] })
  useDossierStore.getState().updatePortfolio(doc)
}

/** Reopens the work saved on this device, still linked to its live page if it was published. */
export function restoreSession(last: LastSession) {
  openInStudio(
    last.document,
    last.designConfig,
    { hiddenSectionIds: last.hiddenSectionIds, sectionSurfaceOverrides: last.sectionSurfaceOverrides },
    last.site ?? null,
    last.unpublished ?? false,
    last.parsedResume
  )
}

type SitePayload = {
  document?: PortfolioDocument
  designConfig?: DesignConfig
  hiddenSectionIds?: string[]
  sectionSurfaceOverrides?: Record<string, { bg?: string }>
}

export type OpenSiteResult = { ok: true } | { ok: false; status: number; message: string }

/** Opens a live site for editing (dashboard "Edit site"), from the server, so it works on any device. */
export async function openSite(slug: string): Promise<OpenSiteResult> {
  try {
    const res = await fetch(`/api/portfolios/${encodeURIComponent(slug)}`, { cache: "no-store" })
    const body = (await res.json().catch(() => null)) as { site?: { slug: string; path: string; payload: SitePayload; indexable: boolean }; message?: string } | null
    const payload = body?.site?.payload
    if (!res.ok || !body?.site || !payload?.document || !payload.designConfig) {
      return { ok: false, status: res.status, message: body?.message ?? "Your site did not load. Try again." }
    }
    openInStudio(payload.document, payload.designConfig, payload, { slug, path: body.site.path, indexable: body.site.indexable }, false)
    return { ok: true }
  } catch {
    return { ok: false, status: 0, message: "Could not reach Dossier. Check your connection and try again." }
  }
}
