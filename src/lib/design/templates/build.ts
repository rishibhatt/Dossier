import { HERO_SCALE_TIERS, motionBlock, professionSpecifics, seededRandom } from "@/lib/design/enginePrimitives"
import type { ParsedResume } from "@/lib/parseResume"
import type { PortfolioSectionType } from "@/types/dossier"
import type { DesignConfig, DesignSectionPlan } from "@/types/resolvedDesignConfig"

import { isLightHex } from "./contrast"
import { TEMPLATE_SPECS } from "./specs"
import type { PaletteInput, TemplateSpec } from "./types"

const SPEC_BY_ID = new Map<string, TemplateSpec>(TEMPLATE_SPECS.map((s) => [s.id, s]))

export function getTemplateSpec(id: string): TemplateSpec | undefined {
  return SPEC_BY_ID.get(id)
}

export const DEFAULT_TEMPLATE_ID = "classic"

/** Sections a resume can actually populate. Keep in sync with buildPortfolioFromStructured. */
export function presentSectionTypes(parsed: ParsedResume): PortfolioSectionType[] {
  const out: PortfolioSectionType[] = ["hero"]
  if (parsed.summary.trim()) out.push("about")
  if (parsed.experience.length > 0) out.push("experience")
  if (parsed.projects.length > 0) out.push("projects")
  if (parsed.skills.length > 0) out.push("skills")
  if (parsed.education.length > 0) out.push("education")
  if (parsed.certifications.length > 0) out.push("certifications")
  out.push("contact")
  return out
}

/** Order the template wants, restricted to `available`; leftovers keep their relative order at the end. */
export function orderSectionsForTemplate(
  spec: Pick<TemplateSpec, "order">,
  available: readonly PortfolioSectionType[]
): PortfolioSectionType[] {
  const set = new Set(available)
  const ordered = spec.order.filter((t) => set.has(t))
  const rest = available.filter((t) => !ordered.includes(t))
  const out = [...ordered, ...rest]
  // contact always closes the page, hero always opens it
  const hero = out.filter((t) => t === "hero")
  const contact = out.filter((t) => t === "contact")
  const middle = out.filter((t) => t !== "hero" && t !== "contact")
  return [...hero, ...middle, ...contact]
}

/** Reorder a document's sections to `order` (stable; unknown types keep relative order at the end). */
export function reorderSectionsByTemplate<S extends { type: PortfolioSectionType }, D extends { sections: S[] }>(
  doc: D,
  order: readonly PortfolioSectionType[]
): D {
  const byType = new Map<PortfolioSectionType, S[]>()
  for (const s of doc.sections) byType.set(s.type, [...(byType.get(s.type) ?? []), s])
  const sections: S[] = []
  for (const t of order) {
    const next = byType.get(t)?.shift()
    if (next) sections.push(next)
  }
  for (const rest of byType.values()) sections.push(...rest)
  return { ...doc, sections }
}

function mixHex(a: string, b: string, t: number): string {
  const pa = a.match(/^#([0-9a-f]{6})/i)
  const pb = b.match(/^#([0-9a-f]{6})/i)
  if (!pa || !pb) return a
  const na = parseInt(pa[1]!, 16)
  const nb = parseInt(pb[1]!, 16)
  const ch = (shift: number) => {
    const x = (na >> shift) & 255
    const y = (nb >> shift) & 255
    return Math.round(x + (y - x) * t)
  }
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`
}

function colorsFromPalette(p: PaletteInput): DesignConfig["tokens"]["colors"] {
  const light = isLightHex(p.bg)
  return {
    bg: p.bg,
    bgSecondary: p.bg2,
    surface: light ? mixHex(p.bg, "#FFFFFF", 0.65) : "rgba(255,255,255,0.05)",
    surfaceHover: light ? "#FFFFFF" : "rgba(255,255,255,0.09)",
    border: light ? `${p.text}29` : `${p.text}26`,
    text: p.text,
    textMuted: p.muted,
    primary: p.primary,
    accent: p.accent,
    gradients: {
      hero: `linear-gradient(120deg, ${p.primary} 0%, ${mixHex(p.primary, p.text, 0.18)} 100%)`,
      surface: `linear-gradient(180deg, ${p.bg2} 0%, ${p.bg} 100%)`,
      // solid on purpose: templates never use gradient text
      text: `linear-gradient(90deg, ${p.text} 0%, ${p.text} 100%)`,
      border: `linear-gradient(90deg, ${p.muted}33 0%, ${p.muted}33 100%)`,
      mesh: `radial-gradient(ellipse 60% 40% at 20% -10%, ${p.primary}24 0%, transparent 60%)`,
    },
  }
}

function spacingFor(spec: TemplateSpec) {
  const sectionPadding =
    spec.density === "airy"
      ? "py-24 px-6 md:py-32 md:px-16"
      : spec.density === "normal"
        ? "py-20 px-6 md:py-28 md:px-12"
        : "py-12 px-5 md:py-16 md:px-8"
  const containerMax =
    spec.layout === "magazine" ? "max-w-6xl" : spec.layout === "bento" ? "max-w-7xl" : "max-w-5xl"
  return {
    sectionPadding,
    containerMax,
    cardPadding: spec.radius === "rounded-none" ? "p-6 md:p-8" : "p-8",
    gap: spec.layout === "bento" ? "gap-6 md:gap-8" : "gap-8",
  }
}

export type BuildFromTemplateOptions = {
  /** Section types of the document this config will be paired with (index-aligned). Overrides template order. */
  sectionTypes?: readonly PortfolioSectionType[]
}

/**
 * Valid DesignConfig for a curated template. `variationSeed` only varies safe things:
 * same-family palette alternate, hero scale tier and motion stagger. Layout, hero, variants,
 * fonts and section order never change, so "shuffle" keeps the template's identity.
 */
export function buildConfigFromTemplate(
  parsed: ParsedResume,
  templateId: string,
  variationSeed: number,
  options?: BuildFromTemplateOptions
): DesignConfig {
  const spec = SPEC_BY_ID.get(templateId) ?? SPEC_BY_ID.get(DEFAULT_TEMPLATE_ID)!
  const seed = Math.abs(Math.floor(Number.isFinite(variationSeed) ? variationSeed : 0))
  const rng = seededRandom(seed + spec.id.length * 131)

  const palette = spec.palettes[seed % spec.palettes.length]!
  const tierIdx = Math.floor(seed / spec.palettes.length) % spec.heroTiers.length
  const heroTier = spec.heroTiers[tierIdx]!
  const stagger = Math.round(spec.motion.stagger * (0.85 + rng() * 0.3) * 1000) / 1000
  const y = Math.round(spec.motion.y * (0.9 + rng() * 0.2))

  const sectionOrder = options?.sectionTypes
    ? [...options.sectionTypes]
    : orderSectionsForTemplate(spec, presentSectionTypes(parsed))

  // Every variant handles sparse and dense content itself, so the template's choice is used as is.
  const plans: DesignSectionPlan[] = sectionOrder.map((type) => ({
    type,
    variant: type === "hero" ? spec.heroSection : spec.variants[type],
  }))

  const f = spec.fonts
  const colors = colorsFromPalette(palette)
  const glowOn = false // glow was retired: templates do not use neon halos

  return {
    meta: {
      direction: spec.direction,
      profession: parsed.signals.professionCluster,
      variationSeed: seed,
      generatedAt: new Date().toISOString(),
      templateId: spec.id,
    },
    tokens: {
      colors,
      typography: {
        displayFont: f.display,
        bodyFont: f.body,
        monoFont: f.mono,
        scale: {
          hero: HERO_SCALE_TIERS[heroTier],
          h1: "clamp(2rem, 5vw, 4rem)",
          h2: "clamp(1.5rem, 3.2vw, 2.5rem)",
          h3: "clamp(1.25rem, 2.5vw, 1.875rem)",
          body: "clamp(1rem, 2.2vw, 1.125rem)",
          small: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
          mono: "clamp(0.75rem, 1.4vw, 0.875rem)",
        },
        weights: { display: f.displayWeight, heading: f.headingWeight, body: 400 },
        letterSpacing: { display: f.tracking, heading: "-0.015em", body: "0em", label: f.label },
        lineHeight: { display: f.leading, body: 1.65 },
      },
      spacing: spacingFor(spec),
      effects: {
        cardBlur: "backdrop-blur-none",
        glowColor: glowOn ? `${palette.primary}40` : `${palette.primary}00`,
        glowSize: glowOn ? "0 0 48px" : "0 0 0",
        noiseOpacity: 0.02,
        borderRadius: spec.radius,
        borderStyle: spec.mode === "dark" ? "border border-white/10" : "border border-zinc-500/20",
      },
    },
    layout: {
      type: spec.layout,
      heroVariant: spec.hero,
      navStyle: spec.nav,
      sectionOrder,
      gridSystem: "grid-cols-12",
      backgroundType: spec.bgType,
    },
    motion: motionBlock(spec.motion.preset, stagger, y),
    components: {
      card: spec.components.card,
      button: spec.components.button,
      badge: spec.components.badge,
      divider: spec.components.divider,
      cursor: "default",
      scrollIndicator: "none",
    },
    profession_specifics: professionSpecifics(parsed),
    sections: plans,
  }
}

/** Templates in a design direction, catalogue order (falls back to the whole catalogue). */
export function templatesForDirection(direction: DesignConfig["meta"]["direction"]): TemplateSpec[] {
  const hit = TEMPLATE_SPECS.filter((s) => s.direction === direction)
  return hit.length ? hit : [...TEMPLATE_SPECS]
}

/**
 * Deterministic replacement for the retired random engine: the seed cycles template, then palette.
 * seed 0 = first template of the direction, palette 0; seed 1 = next template; ... wraps to palette 1.
 */
export function buildConfigForDirection(
  parsed: ParsedResume,
  direction: DesignConfig["meta"]["direction"],
  variationSeed: number,
  options?: BuildFromTemplateOptions
): DesignConfig {
  const pool = templatesForDirection(direction)
  const seed = Math.abs(Math.floor(Number.isFinite(variationSeed) ? variationSeed : 0))
  const spec = pool[seed % pool.length]!
  return buildConfigFromTemplate(parsed, spec.id, Math.floor(seed / pool.length), options)
}