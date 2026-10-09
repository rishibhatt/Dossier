"use client"

import { nanoid } from "nanoid"
import { toast } from "sonner"

import { restoreSnapshot, takeSnapshot, useStudioStatus } from "@/features/studio/studioStatus"
import { ALL_SECTION_TYPES, sectionLabel } from "@/features/studio/sectionCatalog"
import { resolveVariant, VARIANT_IDS } from "@/components/portfolio/sections/registry"
import { templateVariant } from "@/lib/portfolio/pairSections"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { PortfolioSection, PortfolioSectionType } from "@/types/dossier"

type DataOf<T extends PortfolioSectionType> = Extract<PortfolioSection, { type: T }>["data"]

const pool = (type: PortfolioSectionType): readonly string[] => VARIANT_IDS[type] ?? []

/** The variant a new section of this type gets in the current template. */
export function firstVariant(type: PortfolioSectionType): string {
  const cfg = usePortfolioStore.getState().designConfig
  return resolveVariant(type, undefined, cfg ? templateVariant(cfg, type) : undefined)
}

/** Live edit of one section's data, by id. No history entry: text edits autosave and stay. */
export function patchSection<T extends PortfolioSectionType>(id: string, type: T, patch: Partial<DataOf<T>>) {
  const s = usePortfolioStore.getState().document?.sections.find((x) => x.id === id)
  if (s?.type === type) usePortfolioStore.getState().updateSectionById(id, patch as Record<string, unknown>)
}

/**
 * Types the gallery offers: every kind but the intro, and contact only while the page has none.
 * Kinds already on the page can be added again (a second projects list, say).
 * TODO(renderer): swap for `listAddableSections(document)` from src/lib/portfolio once it lands, so both agree.
 */
export function addableTypes(present: readonly PortfolioSectionType[]): PortfolioSectionType[] {
  const have = new Set(present)
  return ALL_SECTION_TYPES.filter((t) => t !== "hero" && !(t === "contact" && have.has(t)))
}

/** Data for a new section, taken from the resume when it has some; otherwise clearly marked placeholders. */
export function seedSection(type: PortfolioSectionType): PortfolioSection {
  const r = useDossierStore.getState().structuredData
  const id = `${type}-${nanoid(8)}`
  switch (type) {
    case "hero":
      return { id, type, data: { name: r?.name || "Your name", title: r?.title || "Your role", tagline: "One line about the work you do." } }
    case "about":
      return { id, type, data: { body: r?.summary || "A few sentences about you: what you do, who for, and what you care about." } }
    case "skills":
      return { id, type, data: { items: r?.skills?.length ? r.skills.slice(0, 16) : ["First skill", "Second skill", "Third skill"] } }
    case "experience":
      return {
        id,
        type,
        data: { items: r?.experience?.length ? r.experience : [{ company: "Company", role: "Your role", duration: "2022 to now", description: "What you did and what changed because of it." }] },
      }
    case "projects":
      return { id, type, data: { items: r?.projects?.length ? r.projects : [{ name: "Project name", description: "What it is and what it achieved.", tech: [] }] } }
    case "education":
      return { id, type, data: { items: r?.education?.length ? r.education : [{ institution: "School or university", degree: "Degree or course", period: "2018 to 2021", details: "" }] } }
    case "highlights":
      return { id, type, data: { items: [{ value: "0", label: "What this number measures" }] } }
    case "certifications":
      return { id, type, data: { items: [{ name: "Certificate name", issuer: "Issuer", year: "2024" }] } }
    case "contact":
      return { id, type, data: { email: r?.contact?.email ?? "", phone: r?.contact?.phone ?? "", links: r?.contact?.links ?? [], headline: "Get in touch" } }
  }
}

/** Inserts a section before contact (or after `afterId`) through the store, then fills it from the resume. */
export function insertSection(type: PortfolioSectionType, opts: { afterId?: string; variant?: string } = {}): string | null {
  const s = usePortfolioStore.getState()
  if (!s.document || !s.designConfig) return null
  useStudioStatus.getState().pushHistory()
  const id = s.addSection(type, opts)
  if (id) s.updateSectionById(id, seedSection(type).data as Record<string, unknown>)
  return id
}
/** Removes a section at once and offers Undo, instead of asking first. */
export function removeSection(id: string) {
  const s = usePortfolioStore.getState()
  const section = s.document?.sections.find((x) => x.id === id)
  const before = takeSnapshot()
  if (!section || !before || section.type === "hero") return
  useStudioStatus.getState().pushHistory()
  s.deleteSection(id)
  const ui = useStudioUiStore.getState()
  if (ui.selectedId === id) ui.select(null)
  if (ui.editorId === id) ui.setEditorId(null)
  toast(`${sectionLabel(section.type)} removed`, {
    action: { label: "Undo", onClick: () => restoreSnapshot(before) },
  })
}

export function moveSection(id: string, dir: -1 | 1) {
  useStudioStatus.getState().pushHistory()
  usePortfolioStore.getState().moveSectionById(id, dir)
}

export function toggleHidden(id: string) {
  useStudioStatus.getState().pushHistory()
  usePortfolioStore.getState().toggleSectionHidden(id)
}

/** Next look for one section. Returns the variant's position, for a "2 of 5" readout. */
export function cycleVariant(id: string) {
  useStudioStatus.getState().pushHistory()
  usePortfolioStore.getState().cycleSectionVariant(id)
}

export function variantPosition(id: string): { at: number; of: number } | null {
  const { document: doc, designConfig: cfg } = usePortfolioStore.getState()
  const i = doc?.sections.findIndex((s) => s.id === id) ?? -1
  const plan = i >= 0 ? cfg?.sections[i] : undefined
  if (!plan) return null
  const p = pool(plan.type)
  const v = resolveVariant(plan.type, plan.variant, cfg ? templateVariant(cfg, plan.type) : undefined)
  return { at: Math.max(0, p.indexOf(v)) + 1, of: p.length }
}
