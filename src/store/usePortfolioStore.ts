import { arrayMove } from "@dnd-kit/sortable"
import { create } from "zustand"

import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { createEmptySection } from "@/lib/portfolio/createEmptySection"
import { STUDIO_DESIGN_PRESETS, type StudioDesignPresetId } from "@/lib/portfolio/designTokenPresets"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { SECTION_VARIANT_CYCLE } from "@/lib/portfolio/sectionVariantPools"
import type {
  ExperienceEntry,
  PortfolioDocument,
  PortfolioSection,
  PortfolioSectionType,
  ProjectEntry,
} from "@/types/dossier"
import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig } from "@/types/designEngine"
import type { DesignColorTokens, DesignEffectsTokens, DesignSpacingTokens, DesignTypographyTokens } from "@/types/resolvedDesignConfig"

type HeroData = Extract<PortfolioSection, { type: "hero" }>["data"]
type AboutData = Extract<PortfolioSection, { type: "about" }>["data"]
type SkillsData = Extract<PortfolioSection, { type: "skills" }>["data"]
type ExperienceData = Extract<PortfolioSection, { type: "experience" }>["data"]
type ProjectsData = Extract<PortfolioSection, { type: "projects" }>["data"]
type ContactData = Extract<PortfolioSection, { type: "contact" }>["data"]

type SectionDataMap = {
  hero: HeroData
  about: AboutData
  skills: SkillsData
  experience: ExperienceData
  projects: ProjectsData
  contact: ContactData
}

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
    parsedResume?: ParsedResume | null
  ) => void
  reset: () => void
  setEditMode: (on: boolean) => void
  toggleSectionHidden: (sectionId: string) => void
  setSectionSurfaceOverride: (sectionId: string, patch: { bg?: string } | null) => void
  reorderSections: (activeSectionId: string, overSectionId: string) => void
  deleteSection: (sectionId: string) => void
  cycleSectionVariant: (sectionId: string) => void
  updateMeta: (patch: Partial<PortfolioDocument["meta"]>) => void
  /** Shallow-merge into the first section of `type` (AI output uses one block per type). */
  updateSection: <T extends PortfolioSectionType>(type: T, patch: Partial<SectionDataMap[T]>) => void
  updateExperienceItem: (index: number, patch: Partial<ExperienceEntry>) => void
  updateProjectItem: (index: number, patch: Partial<ProjectEntry>) => void
  setSkillItems: (items: string[]) => void
  /** Update a single skill chip by index (canvas inline edit). */
  updateSkillItem: (index: number, value: string) => void
  setSectionNickname: (sectionId: string, name: string) => void
  setSectionVariantBySectionId: (sectionId: string, variant: string) => void
  moveSectionById: (sectionId: string, direction: -1 | 1) => void
  addSection: (type: PortfolioSectionType, variant: string) => void
  mockRegenerateSection: (sectionId: string) => void
  patchDesignTokens: (patch: {
    colors?: Partial<DesignColorTokens>
    typography?: Partial<DesignTypographyTokens>
    effects?: Partial<DesignEffectsTokens>
    spacing?: Partial<DesignSpacingTokens>
  }) => void
  applyDesignPreset: (preset: StudioDesignPresetId) => void
}

function replaceSection(
  sections: readonly PortfolioSection[],
  nextSection: PortfolioSection
): PortfolioSection[] {
  return sections.map((s) => (s.id === nextSection.id ? nextSection : s))
}

const styleInitial: PortfolioStylePreferences = {
  portfolioStylePreset: DEFAULT_GENERATION_CONTEXT.portfolioStylePreset,
  portfolioDesignNotes: DEFAULT_GENERATION_CONTEXT.designNotes,
  generationVariation: DEFAULT_GENERATION_CONTEXT.variationSeed,
}

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  document: null,
  designConfig: null,
  parsedResume: null,
  editMode: false,
  hiddenSectionIds: {},
  sectionSurfaceOverrides: {},
  sectionNicknames: {},
  ...styleInitial,

  setDocument: (document) =>
    set({
      document: document ? ensurePortfolioMeta(document) : null,
      designConfig: null,
      parsedResume: null,
      editMode: false,
      hiddenSectionIds: {},
      sectionSurfaceOverrides: {},
      sectionNicknames: {},
    }),

  setDesignConfig: (designConfig) => set({ designConfig }),

  hydratePortfolio: (document, designConfig, prefs, parsedResume) =>
    set((s) => ({
      document: ensurePortfolioMeta(document),
      designConfig,
      parsedResume: parsedResume ?? s.parsedResume,
      portfolioStylePreset: prefs?.portfolioStylePreset ?? s.portfolioStylePreset,
      portfolioDesignNotes: prefs?.portfolioDesignNotes ?? s.portfolioDesignNotes,
      generationVariation: prefs?.generationVariation ?? s.generationVariation,
      hiddenSectionIds: {},
      sectionSurfaceOverrides: {},
      sectionNicknames: {},
    })),

  reset: () =>
    set({
      document: null,
      designConfig: null,
      parsedResume: null,
      editMode: false,
      hiddenSectionIds: {},
      sectionSurfaceOverrides: {},
      sectionNicknames: {},
      ...styleInitial,
    }),

  setEditMode: (on) => set({ editMode: on }),

  toggleSectionHidden: (sectionId) =>
    set((s) => ({
      hiddenSectionIds: {
        ...s.hiddenSectionIds,
        [sectionId]: !s.hiddenSectionIds[sectionId],
      },
    })),

  setSectionSurfaceOverride: (sectionId, patch) =>
    set((s) => {
      const next = { ...s.sectionSurfaceOverrides }
      if (patch === null) {
        delete next[sectionId]
        return { sectionSurfaceOverrides: next }
      }
      const merged = { ...next[sectionId], ...patch }
      if (!merged.bg?.trim()) {
        delete next[sectionId]
      } else {
        next[sectionId] = merged
      }
      return { sectionSurfaceOverrides: next }
    }),

  reorderSections: (activeSectionId, overSectionId) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg || activeSectionId === overSectionId) return
    const ids = doc.sections.map((x) => x.id)
    const oldI = ids.indexOf(activeSectionId)
    const newI = ids.indexOf(overSectionId)
    if (oldI < 0 || newI < 0) return
    const nextSections = arrayMove([...doc.sections], oldI, newI)
    const nextPlans = arrayMove([...cfg.sections], oldI, newI)
    const sectionOrder = nextSections.map((x) => x.type)
    set({
      document: { ...doc, sections: nextSections },
      designConfig: {
        ...cfg,
        sections: nextPlans,
        layout: { ...cfg.layout, sectionOrder },
      },
    })
  },

  deleteSection: (sectionId) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg) return
    const idx = doc.sections.findIndex((s) => s.id === sectionId)
    if (idx < 0 || doc.sections.length <= 1) return
    const nextSections = doc.sections.filter((s) => s.id !== sectionId)
    const nextPlans = cfg.sections.filter((_, i) => i !== idx)
    const sectionOrder = nextSections.map((s) => s.type)
    const hidden = { ...get().hiddenSectionIds }
    delete hidden[sectionId]
    const overrides = { ...get().sectionSurfaceOverrides }
    delete overrides[sectionId]
    const nick = { ...get().sectionNicknames }
    delete nick[sectionId]
    set({
      document: { ...doc, sections: nextSections },
      designConfig: {
        ...cfg,
        sections: nextPlans,
        layout: { ...cfg.layout, sectionOrder },
      },
      hiddenSectionIds: hidden,
      sectionSurfaceOverrides: overrides,
      sectionNicknames: nick,
    })
  },

  cycleSectionVariant: (sectionId) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg) return
    const idx = doc.sections.findIndex((s) => s.id === sectionId)
    if (idx < 0) return
    const section = doc.sections[idx]
    const plan = cfg.sections[idx]
    if (!plan || plan.type !== section.type) return
    const pool = [...SECTION_VARIANT_CYCLE[section.type]]
    const cur = plan.variant
    const i = pool.findIndex((v) => v.toLowerCase() === cur.toLowerCase())
    const nextVariant = pool[(i < 0 ? 0 : i + 1) % pool.length]
    const nextPlans = cfg.sections.map((p, j) => (j === idx ? { ...p, variant: nextVariant } : p))
    set({ designConfig: { ...cfg, sections: nextPlans } })
  },

  updateMeta: (patch) => {
    const doc = get().document
    if (!doc) return
    set({ document: { ...doc, meta: { ...doc.meta, ...patch } } })
  },

  updateSection: (type, patch) => {
    const doc = get().document
    if (!doc) return
    const idx = doc.sections.findIndex((s) => s.type === type)
    if (idx === -1) return
    const current = doc.sections[idx]
    if (current.type !== type) return
    const nextData = { ...current.data, ...patch } as (typeof current)["data"]
    const nextSection = { ...current, data: nextData } as PortfolioSection
    set({ document: { ...doc, sections: replaceSection(doc.sections, nextSection) } })
  },

  updateExperienceItem: (index, patch) => {
    const doc = get().document
    if (!doc) return
    const idx = doc.sections.findIndex((s) => s.type === "experience")
    if (idx === -1) return
    const s = doc.sections[idx]
    if (s.type !== "experience") return
    const items = s.data.items.map((it, i) => (i === index ? { ...it, ...patch } : it))
    const nextSection: PortfolioSection = { ...s, data: { items } }
    set({ document: { ...doc, sections: replaceSection(doc.sections, nextSection) } })
  },

  updateProjectItem: (index, patch) => {
    const doc = get().document
    if (!doc) return
    const idx = doc.sections.findIndex((s) => s.type === "projects")
    if (idx === -1) return
    const s = doc.sections[idx]
    if (s.type !== "projects") return
    const items = s.data.items.map((it, i) => (i === index ? { ...it, ...patch } : it))
    const nextSection: PortfolioSection = { ...s, data: { items } }
    set({ document: { ...doc, sections: replaceSection(doc.sections, nextSection) } })
  },

  setSkillItems: (items) => {
    const doc = get().document
    if (!doc) return
    const idx = doc.sections.findIndex((s) => s.type === "skills")
    if (idx === -1) return
    const s = doc.sections[idx]
    if (s.type !== "skills") return
    const nextSection: PortfolioSection = { ...s, data: { items } }
    set({ document: { ...doc, sections: replaceSection(doc.sections, nextSection) } })
  },

  updateSkillItem: (index, value) => {
    const doc = get().document
    if (!doc) return
    const idx = doc.sections.findIndex((s) => s.type === "skills")
    if (idx === -1) return
    const s = doc.sections[idx]
    if (s.type !== "skills") return
    const items = [...s.data.items]
    if (index < 0 || index >= items.length) return
    items[index] = value.trim() || items[index]
    const nextSection: PortfolioSection = { ...s, data: { items } }
    set({ document: { ...doc, sections: replaceSection(doc.sections, nextSection) } })
  },

  setSectionNickname: (sectionId, name) =>
    set((s) => {
      const next = { ...s.sectionNicknames }
      const t = name.trim()
      if (!t) delete next[sectionId]
      else next[sectionId] = t
      return { sectionNicknames: next }
    }),

  setSectionVariantBySectionId: (sectionId, variant) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg) return
    const idx = doc.sections.findIndex((s) => s.id === sectionId)
    if (idx < 0 || !cfg.sections[idx]) return
    const nextPlans = cfg.sections.map((p, i) => (i === idx ? { ...p, variant } : p))
    set({ designConfig: { ...cfg, sections: nextPlans } })
  },

  moveSectionById: (sectionId, direction) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg) return
    const idx = doc.sections.findIndex((s) => s.id === sectionId)
    const j = idx + direction
    if (idx < 0 || j < 0 || j >= doc.sections.length) return
    const nextSections = arrayMove([...doc.sections], idx, j)
    const nextPlans = arrayMove([...cfg.sections], idx, j)
    const sectionOrder = nextSections.map((x) => x.type)
    set({
      document: { ...doc, sections: nextSections },
      designConfig: {
        ...cfg,
        sections: nextPlans,
        layout: { ...cfg.layout, sectionOrder },
      },
    })
  },

  addSection: (type, variant) => {
    const doc = get().document
    const cfg = get().designConfig
    if (!doc || !cfg) return
    const section = createEmptySection(type)
    const plan = { type, variant }
    const nextSections = [...doc.sections, section]
    const nextPlans = [...cfg.sections, plan]
    const sectionOrder = nextSections.map((x) => x.type)
    set({
      document: { ...doc, sections: nextSections },
      designConfig: {
        ...cfg,
        sections: nextPlans,
        layout: { ...cfg.layout, sectionOrder },
      },
    })
  },

  mockRegenerateSection: (sectionId) => {
    const doc = get().document
    if (!doc) return
    const idx = doc.sections.findIndex((s) => s.id === sectionId)
    if (idx < 0) return
    const s = doc.sections[idx]!
    let nextSection: PortfolioSection = s
    if (s.type === "hero") {
      const tag = s.data.tagline.replace(/\s*·\s*mock refresh\s*$/i, "")
      nextSection = { ...s, data: { ...s.data, tagline: `${tag} · mock refresh` } }
    } else if (s.type === "skills") {
      const items = [...s.data.items].sort(() => Math.random() - 0.5)
      nextSection = { ...s, data: { items } }
    } else if (s.type === "about") {
      const body = s.data.body.endsWith("\n\n— refreshed") ? s.data.body : `${s.data.body}\n\n— refreshed`
      nextSection = { ...s, data: { body } }
    } else if (s.type === "projects") {
      nextSection = {
        ...s,
        data: {
          items: s.data.items.map((p) => ({
            ...p,
            description: p.description.endsWith(" (variation)") ? p.description : `${p.description} (variation)`,
          })),
        },
      }
    } else if (s.type === "experience") {
      nextSection = {
        ...s,
        data: {
          items: [...s.data.items].reverse(),
        },
      }
    } else if (s.type === "contact") {
      nextSection = {
        ...s,
        data: {
          ...s.data,
          headline: s.data.headline?.includes("refresh") ? s.data.headline : `${s.data.headline ?? "Contact"} · refresh`,
        },
      }
    }
    set({ document: { ...doc, sections: replaceSection(doc.sections, nextSection) } })
  },

  patchDesignTokens: (patch) => {
    const cfg = get().designConfig
    if (!cfg) return
    const t = cfg.tokens
    const nextColors = patch.colors
      ? (() => {
          const { gradients: pg, ...rest } = patch.colors
          return {
            ...t.colors,
            ...rest,
            gradients: { ...t.colors.gradients, ...(pg ?? {}) },
          } as DesignColorTokens
        })()
      : t.colors
    const nextTypography = patch.typography
      ? {
          ...t.typography,
          ...patch.typography,
          scale: patch.typography.scale
            ? { ...t.typography.scale, ...patch.typography.scale }
            : t.typography.scale,
          weights: patch.typography.weights
            ? { ...t.typography.weights, ...patch.typography.weights }
            : t.typography.weights,
          letterSpacing: patch.typography.letterSpacing
            ? { ...t.typography.letterSpacing, ...patch.typography.letterSpacing }
            : t.typography.letterSpacing,
          lineHeight: patch.typography.lineHeight
            ? { ...t.typography.lineHeight, ...patch.typography.lineHeight }
            : t.typography.lineHeight,
        }
      : t.typography
    const nextEffects = patch.effects ? { ...t.effects, ...patch.effects } : t.effects
    const nextSpacing = patch.spacing ? { ...t.spacing, ...patch.spacing } : t.spacing
    set({
      designConfig: {
        ...cfg,
        tokens: {
          ...t,
          colors: nextColors,
          typography: nextTypography,
          effects: nextEffects,
          spacing: nextSpacing,
        },
      },
    })
  },

  applyDesignPreset: (preset) => {
    const cfg = get().designConfig
    if (!cfg) return
    const p = STUDIO_DESIGN_PRESETS[preset]
    const { gradients: pg, ...colorRest } = p.colors
    const mergedColors: DesignColorTokens = {
      ...cfg.tokens.colors,
      ...colorRest,
      gradients: { ...cfg.tokens.colors.gradients, ...(pg ?? {}) },
    }
    const mergedTypography: DesignTypographyTokens = {
      ...cfg.tokens.typography,
      ...(p.typography ?? {}),
    }
    const mergedEffects: DesignEffectsTokens = {
      ...cfg.tokens.effects,
      ...(p.effects ?? {}),
    }
    set({
      designConfig: {
        ...cfg,
        tokens: {
          ...cfg.tokens,
          colors: mergedColors,
          typography: mergedTypography,
          effects: mergedEffects,
        },
      },
    })
  },
}))
