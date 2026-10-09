"use client"

import { toast } from "sonner"

import { openUpgrade } from "@/features/billing/useUpgrade"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { describeApiError } from "@/lib/api/clientErrors"
import type { PlanId } from "@/lib/billing/plans"
import { ROUTES } from "@/lib/constants/routes"
import { saveEditorDraft } from "@/lib/portfolio/editorPersistence"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { saveLastSession } from "@/lib/portfolio/lastSession"
import { openPortfolioPreviewInNewTab } from "@/lib/portfolio/openPortfolioPreview"
import { selectPublishView, usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

type Nav = { push: (href: string) => void }

type ApiBody = {
  error?: string
  message?: string
  url?: string
  updated?: boolean
  designConfig?: DesignConfig
  portfolioData?: PortfolioDocument
  templateId?: string
  kind?: string
  plan?: PlanId
}

const OFFLINE = { description: "Check your connection and try again." }

function planFrom(body: ApiBody | null): PlanId | undefined {
  const p = body?.plan
  return p === "free" || p === "starter" || p === "pro" ? p : undefined
}

async function postJson(url: string, payload: unknown): Promise<{ res: Response; body: ApiBody | null }> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
  const body = (await res.json().catch(() => null)) as ApiBody | null
  return { res, body }
}

/** What the server needs to draw the page exactly as the canvas does: content, design, hidden sections and tints. */
function pagePayload() {
  const s = usePortfolioStore.getState()
  if (!s.document || !s.designConfig) return null
  return { portfolioData: s.document, designConfig: s.designConfig, ...selectPublishView(s) }
}

/** Writes the current work to this device. Called before anything that leaves the page, such as sign in. */
export function persistNow(): boolean {
  const { document, designConfig, hiddenSectionIds, sectionSurfaceOverrides, parsedResume } = usePortfolioStore.getState()
  if (!document || !designConfig) return false
  saveEditorDraft({ document, designConfig, hiddenSectionIds, sectionSurfaceOverrides, savedAt: new Date().toISOString() })
  saveLastSession({ document, designConfig, parsedResume, hiddenSectionIds })
  return true
}

function signInAction(nav: Nav) {
  return {
    label: "Sign up free",
    onClick: () => {
      persistNow()
      nav.push(`${ROUTES.signup}?next=${encodeURIComponent(ROUTES.build)}`)
    },
  }
}

const upgradeAction = (nav: Nav) => ({
  label: "See plans",
  onClick: () => {
    persistNow()
    nav.push(ROUTES.billing)
  },
})

export function openPreview() {
  const p = pagePayload()
  if (!p) return
  // TODO(renderer): the preview session type accepts only document + designConfig today; the extra fields ride along
  // and are used once the preview page reads hiddenSectionIds and sectionSurfaceOverrides.
  const ok = openPortfolioPreviewInNewTab({ document: p.portfolioData, designConfig: p.designConfig, ...{ hiddenSectionIds: p.hiddenSectionIds, sectionSurfaceOverrides: p.sectionSurfaceOverrides } })
  if (!ok) toast.error("Preview blocked", { description: "Allow pop-ups and site storage for Dossier, then try again." })
}

/** Silent: the canvas shows the result. */
export function undo() {
  useStudioStatus.getState().undo()
}

export function redo() {
  useStudioStatus.getState().redo()
}

export function saveDraft() {
  if (persistNow()) {
    useStudioUiStore.getState().markSaved()
    toast.success("Saved on this device")
  }
}

export async function copyText(text: string, label = "Link copied") {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(label)
  } catch {
    toast.error("Copy did not work", { description: text })
  }
}

export async function publish(nav: Nav) {
  const ui = useStudioUiStore.getState()
  const payload = pagePayload()
  if (!payload || ui.busy.publish) return
  ui.setBusy("publish", true)
  try {
    const { res, body } = await postJson("/api/publish-portfolio", payload)
    if (res.status === 401) {
      toast.error("Sign in to publish", { description: "Your work is saved on this device.", action: signInAction(nav) })
      return
    }
    if (body?.error === "portfolio_limit") {
      openUpgrade("portfolio_limit", { plan: planFrom(body), beforeLeave: persistNow })
      return
    }
    if (!res.ok || !body?.url) {
      toast.error(describeApiError(res.status, body, "Publishing did not work. Try again."))
      return
    }
    ui.setPublishedPath(body.url)
    useStudioStatus.getState().markPublished()
    // The dialog is the confirmation; no toast on top of it.
    useStudioStatus.getState().setPublishDialogOpen(true)
  } catch {
    toast.error("Could not reach Dossier", OFFLINE)
  } finally {
    useStudioUiStore.getState().setBusy("publish", false)
  }
}

export async function exportZip(nav: Nav) {
  const ui = useStudioUiStore.getState()
  const payload = pagePayload()
  if (!payload || ui.busy.export) return
  ui.setBusy("export", true)
  const id = toast.loading("Building your ZIP")
  try {
    const res = await fetch("/api/export-portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, variationSeed: usePortfolioStore.getState().generationVariation }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiBody | null
      if (res.status === 402) {
        toast.dismiss(id)
        openUpgrade("zip_export", { plan: planFrom(body), beforeLeave: persistNow })
        return
      }
      toast.error(describeApiError(res.status, body, "The ZIP did not build. Try again."), { id, action: res.status === 401 ? signInAction(nav) : undefined })
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url
    a.download = `${payload.portfolioData.meta.title.replace(/[^\w\d]+/g, "-").slice(0, 48) || "portfolio"}-site.zip`
    a.click()
    URL.revokeObjectURL(url)
    // The browser shows the download; just clear the working note.
    toast.dismiss(id)
  } catch {
    toast.error("Could not reach Dossier", { id, ...OFFLINE })
  } finally {
    useStudioUiStore.getState().setBusy("export", false)
  }
}

type DesignResult = { ok: boolean }

/** Switch to a template (reordering sections to suit it), or reroll the current one. Undoable, and silent on success. */
export async function changeDesign(nav: Nav, opts: { templateId?: string; shuffle?: boolean; templateName?: string }): Promise<DesignResult> {
  const ui = useStudioUiStore.getState()
  const { document, designConfig, parsedResume, generationVariation, portfolioStylePreset, portfolioDesignNotes } = usePortfolioStore.getState()
  if (!document || !designConfig || ui.busy.design) return { ok: false }
  ui.setBusy("design", true)
  ui.setPendingTemplate(opts.templateId ?? null)

  const templateId = opts.templateId ?? designConfig.meta.templateId
  const seed = generationVariation + 1
  try {
    const { res, body } = await postJson("/api/regenerate-design", {
      portfolioData: document,
      parsedResume: parsedResume ?? undefined,
      portfolioStylePreset,
      designNotes: portfolioDesignNotes,
      variationSeed: seed,
      ...(templateId ? { templateId, applyTemplateOrder: Boolean(opts.templateId) } : {}),
    })
    if (res.status === 429 && body?.error === "quota_exceeded" && (body.kind ?? "regenerate") === "regenerate") {
      openUpgrade("shuffle_limit", {
        plan: planFrom(body),
        beforeLeave: persistNow,
        onCreditSpent: (item) => {
          if (item === "shuffle_pack" || item === "starter_unlock") void changeDesign(nav, opts)
        },
      })
      return { ok: false }
    }
    if (!res.ok || !body?.designConfig) {
      toast.error(describeApiError(res.status, body, "The look did not change. Try again."), { action: res.status === 429 ? upgradeAction(nav) : undefined })
      return { ok: false }
    }
    useStudioStatus.getState().pushHistory()
    usePortfolioStore.setState({
      designConfig: body.designConfig,
      generationVariation: seed,
      ...(body.portfolioData ? { document: ensurePortfolioMeta(body.portfolioData) } : {}),
    })
    return { ok: true }
  } catch {
    toast.error("Could not reach Dossier", OFFLINE)
    return { ok: false }
  } finally {
    const s = useStudioUiStore.getState()
    s.setBusy("design", false)
    s.setPendingTemplate(null)
  }
}

/** Plain-language design command, handled by the rules-based refine route. */
export async function refineDesign(nav: Nav, message: string): Promise<boolean> {
  const ui = useStudioUiStore.getState()
  const { document, designConfig } = usePortfolioStore.getState()
  const text = message.trim()
  if (!document || !designConfig || !text || ui.busy.ai) return false
  ui.setBusy("ai", true)
  try {
    const { res, body } = await postJson("/api/portfolio-refine-design", { message: text, designConfig, portfolioData: document })
    if (!res.ok || !body?.designConfig) {
      const msg = body?.error === "invalidMessage" ? "Say the change in a few words." : describeApiError(res.status, body, "That change did not apply. Try other words.")
      toast.error(msg, { action: res.status === 429 ? upgradeAction(nav) : undefined })
      return false
    }
    useStudioStatus.getState().pushHistory()
    usePortfolioStore.getState().setDesignConfig(body.designConfig)
    return true
  } catch {
    toast.error("Could not reach Dossier", OFFLINE)
    return false
  } finally {
    useStudioUiStore.getState().setBusy("ai", false)
  }
}
