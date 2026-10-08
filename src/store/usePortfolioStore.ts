import { arrayMove } from "@dnd-kit/sortable"
import { create } from "zustand"

import { resolveVariant, VARIANT_IDS } from "@/components/portfolio/sections/registry"
import type { TextPath } from "@/components/portfolio/sections/types"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { createEmptySection } from "@/lib/portfolio/createEmptySection"
export { listAddableSections, type AddableSection } from "@/lib/portfolio/createEmptySection"
import { STUDIO_DESIGN_PRESETS, type StudioDesignPresetId } from "@/lib/portfolio/designTokenPresets"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { templateVariant } from "@/lib/portfolio/pairSections"
import { insertIndex, patchSectionData, patchSectionItem, setTextField } from "@/lib/portfolio/sectionEdits"
import type { ExperienceEntry, PortfolioDocument, PortfolioSection, PortfolioSectionType, ProjectEntry } from "@/types/dossier"
import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig } from "@/types/designEngine"
import type { DesignColorTokens, DesignEffectsTokens, DesignSpacingTokens, DesignTypographyTokens } from "@/types/resolvedDesignConfig"

type SectionDataMap = { [K in PortfolioSectionType]: Extract<PortfolioSection, { type: K }>["data"] }

/** Owner view settings that travel with publish / preview / export. */
export type PortfolioViewState = {
  hiddenSectionIds?: readonly string[] | Record<string, boolean>
  sectionSurfaceOverrides?: Record<string, { bg?: string }>
}

export type AddSectionOptions = { afterId?: string; variant?: string }

export type PortfolioStylePreferences = {
  portfolioStylePreset: PortfolioStylePreset
  portfolioDesignNotes: string
  /** Mirrors last-used parse/regenerate variation seed for the design brain. */
  generationVariation: number
}

export type PortfolioStoreState = {
  document: PortfolioDocument | null
  designConfig: DesignConfig | null
  /** Deep parse + signals — drives mood vectors & rebuild-design API. */
  parsedResume: ParsedResume | null
  portfolioStylePreset: PortfolioStylePreset
  portfolioDesignNotes: string
  generationVariation: number
  /** Canvas edit mode — reorder, hide, variant cycle, inline text. */
  editMode: boolean
  hiddenSectionIds: Record<string, boolean>
  sectionSurfaceOverrides: Record<string, { bg?: string }>
  /** Optional display names for structure panel (keyed by section `id`). */
  sectionNicknames: Record<string, string>
  setDocument: (document: PortfolioDocument | null) => void
  setDesignConfig: (designConfig: DesignConfig | null) => void
  /** Sets document + designConfig in one update so nothing renders with designConfig cleared. */
  hydratePortfolio: (
    document: PortfolioDocument,
    designConfig: DesignConfig,
    prefs?: Partial<PortfolioStylePreferences>,
    parsedResume?: ParsedResume | null,
    /** Restore hidden sections / surface tints (e.g. from a saved draft). Omitted = reset. */
    view?: PortfolioViewState
  ) => void
  reset: () => void
  setEditMode: (on: boolean) => void
  toggleSectionHidden: (sectionId: string) => void
  setSectionSurfaceOverride: (sectionId: string, patch: { bg?: string } | null) => void
  reorderSections: (activeSectionId: string, overSectionId: string) => void
  deleteSection: (sectionId: string) => void
  cycleSectionVariant: (sectionId: string) => void
  updateMeta: (patch: Partial<PortfolioDocument["meta"]>) => void
  /** Legacy: shallow-merge into the FIRST section of `type`. Prefer updateSectionById. */
  updateSection: <T extends PortfolioSectionType>(type: T, patch: Partial<SectionDataMap[T]>) => void
  /** Shallow-merge into one section's data, by id. */
  updateSectionById: (sectionId: string, patch: Record<string, unknown>) => void
  /** Shallow-merge into `data.items[index]` of one section, by id. */
  updateSectionItem: (sectionId: string, index: number, patch: Record<string, unknown>) => void
  /** Write one canvas text field (used by EditableText). */
  updateSectionField: (path: TextPath, value: string) => void
  /** Append an item to a list section (any section whose data has `items`). */
  addSectionItem: (sectionId: string, item: unknown) => void
  removeSectionItem: (sectionId: string, index: number) => void
  /** Legacy (first experience section). */
  updateExperienceItem: (index: number, patch: Partial<ExperienceEntry>) => void
  /** Legacy (first projects section). */
  updateProjectItem: (index: number, patch: Partial<ProjectEntry>) => void
  /** Legacy (first skills section). */
  setSkillItems: (items: string[]) => void
  /** Legacy (first skills section). */
  updateSkillItem: (index: number, value: string) => void
  setSectionNickname: (sectionId: string, name: string) => void
  setSectionVariantBySectionId: (sectionId: string, variant: string) => void
  moveSectionById: (sectionId: string, direction: -1 | 1) => void
  /**
   * Insert a new section and return its id. Second arg: a variant id (legacy) or { afterId?, variant? }.
   * Position: after `afterId`, else just before contact (hero always first).
   */
  addSection: (type: PortfolioSectionType, variantOrOptions?: string | AddSectionOptions) => string | null
  /** Studio "regenerate section": switches to the next layout variant. Never edits the person's text. */
  mockRegenerateSection: (sectionId: string) => void
  patchDesignTokens: (patch: {
    colors?: Partial<DesignColorTokens>
    typography?: Partial<DesignTypographyTokens>
    effects?: Partial<DesignEffectsTokens>
    spacing?: Partial<DesignSpacingTokens>
  }) => void
  applyDesignPreset: (preset: StudioDesignPresetId) => void
}

const styleInitial: PortfolioStylePreferences = {
  portfolioStylePreset: DEFAULT_GENERATION_CONTEXT.portfolioStylePreset,
  portfolioDesignNotes: DEFAULT_GENERATION_CONTEXT.designNotes,
  generationVariation: DEFAULT_GENERATION_CONTEXT.variationSeed,
}

const viewReset = { hiddenSectionIds: {}, sectionSurfaceOverrides: {}, sectionNicknames: {} }

function hiddenMap(h: PortfolioViewState["hiddenSectionIds"]): Record<string, boolean> {
  if (!h) return {}
  return Array.isArray(h) ? Object.fromEntries(h.map((id) => [id, true])) : { ...(h as Record<string, boolean>) }
}

/** Publish / preview / export body fields (the PublishView contract). */
export function selectPublishView(s: Pick<PortfolioStoreState, "hiddenSectionIds" | "sectionSurfaceOverrides">) {
  return {
    hiddenSectionIds: Object.entries(s.hiddenSectionIds).filter(([, v]) => v).map(([k]) => k),
    sectionSurfaceOverrides: s.sectionSurfaceOverrides,
  }
}

const firstIdOf = (doc: PortfolioDocument, type: PortfolioSectionType) => doc.sections.find((s) => s.type === type)?.id

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => {
  /** Apply a pure document edit. */
  const editDoc = (fn: (doc: PortfolioDocument) => PortfolioDocument) => {
    const doc = get().document
    if (doc) set({ document: fn(doc) })
  }

  /** Move sections and their plans together so they stay index-aligned. */
  const setOrder = (sections: PortfolioSection[], plans: DesignConfig["sections"]) => {
    const cfg = get().designConfig!
    set({
      document: { ...get().document!, sections },
      designConfig: { ...cfg, sections: plans, layout: { ...cfg.layout, sectionOrder: sections.map((x) => x.type) } },
    })
  }

  const setVariant = (sectionId: string, pick: (current: string, type: PortfolioSectionType) => string) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg) return
    const idx = doc.sections.findIndex((s) => s.id === sectionId)
    const section = doc.sections[idx]
    if (!section) return
    const plans = [...cfg.sections]
    const current = plans[idx]?.type === section.type ? plans[idx]!.variant : ""
    plans[idx] = { type: section.type, variant: pick(current, section.type) }
    set({ designConfig: { ...cfg, sections: plans } })
  }

  const nextVariant = (current: string, type: PortfolioSectionType) => {
    const ids = VARIANT_IDS[type]
    const cur = resolveVariant(type, current, templateVariant(get().designConfig!, type))
    return ids[(ids.indexOf(cur) + 1) % ids.length]!
  }

  return {
    document: null,
    designConfig: null,
    parsedResume: null,
    editMode: false,
    ...viewReset,
    ...styleInitial,

    setDocument: (document) =>
      set({
        document: document ? ensurePortfolioMeta(document) : null,
        designConfig: null,
        parsedResume: null,
        editMode: false,
        ...viewReset,
      }),

    setDesignConfig: (designConfig) => set({ designConfig }),

    hydratePortfolio: (document, designConfig, prefs, parsedResume, view) =>
      set((s) => ({
        document: ensurePortfolioMeta(document),
        designConfig,
        parsedResume: parsedResume ?? s.parsedResume,
        portfolioStylePreset: prefs?.portfolioStylePreset ?? s.portfolioStylePreset,
        portfolioDesignNotes: prefs?.portfolioDesignNotes ?? s.portfolioDesignNotes,
        generationVariation: prefs?.generationVariation ?? s.generationVariation,
        ...viewReset,
        ...(view
          ? { hiddenSectionIds: hiddenMap(view.hiddenSectionIds), sectionSurfaceOverrides: { ...(view.sectionSurfaceOverrides ?? {}) } }
          : {}),
      })),

    reset: () => set({ document: null, designConfig: null, parsedResume: null, editMode: false, ...viewReset, ...styleInitial }),

    setEditMode: (on) => set({ editMode: on }),

    toggleSectionHidden: (sectionId) =>
      set((s) => ({ hiddenSectionIds: { ...s.hiddenSectionIds, [sectionId]: !s.hiddenSectionIds[sectionId] } })),

    setSectionSurfaceOverride: (sectionId, patch) =>
      set((s) => {
        const next = { ...s.sectionSurfaceOverrides }
        const merged = patch === null ? {} : { ...next[sectionId], ...patch }
        if (!merged.bg?.trim()) delete next[sectionId]
        else next[sectionId] = merged
        return { sectionSurfaceOverrides: next }
      }),

    reorderSections: (activeSectionId, overSectionId) => {
      const doc = get().document
      const cfg = get().designConfig
      if (!doc || !cfg || activeSectionId === overSectionId) return
      const ids = doc.sections.map((x) => x.id)
      const from = ids.indexOf(activeSectionId)
      const to = ids.indexOf(overSectionId)
      if (from < 0 || to < 0) return
      setOrder(arrayMove([...doc.sections], from, to), arrayMove([...cfg.sections], from, to))
    },

    moveSectionById: (sectionId, direction) => {
      const doc = get().document
      const cfg = get().designConfig
      if (!doc || !cfg) return
      const i = doc.sections.findIndex((s) => s.id === sectionId)
      const j = i + direction
      if (i < 0 || j < 0 || j >= doc.sections.length) return
      setOrder(arrayMove([...doc.sections], i, j), arrayMove([...cfg.sections], i, j))
    },

    deleteSection: (sectionId) => {
      const doc = get().document
      const cfg = get().designConfig
      if (!doc || !cfg) return
      const idx = doc.sections.findIndex((s) => s.id === sectionId)
      if (idx < 0 || doc.sections.length <= 1) return
      const drop = <T,>(m: Record<string, T>) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== sectionId))
      setOrder(
        doc.sections.filter((s) => s.id !== sectionId),
        cfg.sections.filter((_, i) => i !== idx)
      )
      set((s) => ({
        hiddenSectionIds: drop(s.hiddenSectionIds),
        sectionSurfaceOverrides: drop(s.sectionSurfaceOverrides),
        sectionNicknames: drop(s.sectionNicknames),
      }))
    },

    cycleSectionVariant: (sectionId) => setVariant(sectionId, nextVariant),

    setSectionVariantBySectionId: (sectionId, variant) => setVariant(sectionId, () => variant),

    mockRegenerateSection: (sectionId) => setVariant(sectionId, nextVariant),

    updateMeta: (patch) => editDoc((doc) => ({ ...doc, meta: { ...doc.meta, ...patch } })),

    updateSectionById: (sectionId, patch) => editDoc((doc) => patchSectionData(doc, sectionId, patch)),

    updateSectionItem: (sectionId, index, patch) => editDoc((doc) => patchSectionItem(doc, sectionId, index, patch)),

    updateSectionField: (path, value) => editDoc((doc) => setTextField(doc, path, value)),

    addSectionItem: (sectionId, item) =>
      editDoc((doc) => {
        const s = doc.sections.find((x) => x.id === sectionId)
        const items = (s?.data as { items?: unknown[] } | undefined)?.items
        return Array.isArray(items) ? patchSectionData(doc, sectionId, { items: [...items, item] }) : doc
      }),

    removeSectionItem: (sectionId, index) =>
      editDoc((doc) => {
        const s = doc.sections.find((x) => x.id === sectionId)
        const items = (s?.data as { items?: unknown[] } | undefined)?.items
        return Array.isArray(items) ? patchSectionData(doc, sectionId, { items: items.filter((_, i) => i !== index) }) : doc
      }),

    updateSection: (type, patch) =>
      editDoc((doc) => {
        const id = firstIdOf(doc, type)
        return id ? patchSectionData(doc, id, patch as Record<string, unknown>) : doc
      }),

    updateExperienceItem: (index, patch) =>
      editDoc((doc) => {
        const id = firstIdOf(doc, "experience")
        return id ? patchSectionItem(doc, id, index, patch) : doc
      }),

    updateProjectItem: (index, patch) =>
      editDoc((doc) => {
        const id = firstIdOf(doc, "projects")
        return id ? patchSectionItem(doc, id, index, patch) : doc
      }),

    setSkillItems: (items) =>
      editDoc((doc) => {
        const id = firstIdOf(doc, "skills")
        return id ? patchSectionData(doc, id, { items }) : doc
      }),

    updateSkillItem: (index, value) =>
      editDoc((doc) => {
        const id = firstIdOf(doc, "skills")
        return id && value.trim() ? setTextField(doc, { sectionId: id, field: "item", index }, value.trim()) : doc
      }),

    setSectionNickname: (sectionId, name) =>
      set((s) => {
        const next = { ...s.sectionNicknames }
        const t = name.trim()
        if (!t) delete next[sectionId]
        else next[sectionId] = t
        return { sectionNicknames: next }
      }),

    addSection: (type, variantOrOptions) => {
      const doc = get().document
      const cfg = get().designConfig
      if (!doc || !cfg) return null
      if (type === "hero" && doc.sections.some((s) => s.type === "hero")) return null
      const opts: AddSectionOptions = typeof variantOrOptions === "string" ? { variant: variantOrOptions } : (variantOrOptions ?? {})
      const section = createEmptySection(type)
      const variant = resolveVariant(type, opts.variant, templateVariant(cfg, type))
      const at = insertIndex(doc, type, opts.afterId)
      const sections = [...doc.sections]
      const plans = [...cfg.sections]
      sections.splice(at, 0, section)
      plans.splice(Math.min(at, plans.length), 0, { type, variant })
      setOrder(sections, plans)
      return section.id
    },

    patchDesignTokens: (patch) => {
      const cfg = get().designConfig
      if (!cfg) return
      const t = cfg.tokens
      const colors = patch.colors
        ? (() => {
            const { gradients: pg, ...rest } = patch.colors
            return { ...t.colors, ...rest, gradients: { ...t.colors.gradients, ...(pg ?? {}) } } as DesignColorTokens
          })()
        : t.colors
      const pt = patch.typography
      const typography = pt
        ? {
            ...t.typography,
            ...pt,
            scale: { ...t.typography.scale, ...(pt.scale ?? {}) },
            weights: { ...t.typography.weights, ...(pt.weights ?? {}) },
            letterSpacing: { ...t.typography.letterSpacing, ...(pt.letterSpacing ?? {}) },
            lineHeight: { ...t.typography.lineHeight, ...(pt.lineHeight ?? {}) },
          }
        : t.typography
      set({
        designConfig: {
          ...cfg,
          tokens: {
            ...t,
            colors,
            typography,
            effects: patch.effects ? { ...t.effects, ...patch.effects } : t.effects,
            spacing: patch.spacing ? { ...t.spacing, ...patch.spacing } : t.spacing,
          },
        },
      })
    },

    applyDesignPreset: (preset) => {
      const cfg = get().designConfig
      if (!cfg) return
      const p = STUDIO_DESIGN_PRESETS[preset]
      const { gradients: pg, ...colorRest } = p.colors
      set({
        designConfig: {
          ...cfg,
          tokens: {
            ...cfg.tokens,
            colors: { ...cfg.tokens.colors, ...colorRest, gradients: { ...cfg.tokens.colors.gradients, ...(pg ?? {}) } },
            typography: { ...cfg.tokens.typography, ...(p.typography ?? {}) },
            effects: { ...cfg.tokens.effects, ...(p.effects ?? {}) },
          },
        },
      })
    },
  }
})
