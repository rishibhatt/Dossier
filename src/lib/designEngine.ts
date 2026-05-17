import {
  BRUTALIST_BANK,
  CHROMATIC_CHAOS_BANK,
  EDITORIAL_MONO_BANK,
  FONT_PAIRINGS,
  LIQUID_ENTERPRISE_BANK,
  LUMINOUS_DARK_BANK,
  ORGANIC_GRADIENT_BANK,
  type FontPairing,
  type PaletteBank,
} from "@/lib/design/designEngineBanks"
import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import type { ParsedResume } from "@/lib/parseResume"
import type {
  DesignCanvasBackgroundType,
  DesignConfig,
  DesignDirectionId,
  DesignLayoutBlock,
  DesignMotionBlock,
  DesignSectionPlan,
  HeroVariant,
  LayoutType,
  MotionPreset,
  MotionVariantJson,
  NavStyle,
} from "@/types/resolvedDesignConfig"
import type { PortfolioSectionType } from "@/types/dossier"

export type { DesignDirectionId } from "@/types/resolvedDesignConfig"

/** Maps upload style preset → mood vector for the resolved engine. */
export function mapPresetToDesignDirection(preset: PortfolioStylePreset): DesignDirectionId {
  switch (preset) {
    case "minimal_dev":
      return "EDITORIAL_MONO"
    case "creative_dev":
      return "LUMINOUS_DARK"
    case "designer":
      return "ORGANIC_GRADIENT"
    case "editorial":
      return "EDITORIAL_MONO"
    case "experimental":
      return "CHROMATIC_CHAOS"
    default:
      return "LUMINOUS_DARK"
  }
}

/** Mulberry32 PRNG — seed must be stable per (direction, variationSeed) run. */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(seed: number) {
  const a = Math.floor(seed) ^ 0x9e3779b9
  const b = (seed * 2654435761) >>> 0
  const rng = mulberry32((a + b) >>> 0)
  return rng
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length]!
}

function bankForDirection(direction: DesignDirectionId): readonly PaletteBank[] {
  switch (direction) {
    case "LUMINOUS_DARK":
      return LUMINOUS_DARK_BANK
    case "EDITORIAL_MONO":
      return EDITORIAL_MONO_BANK
    case "ORGANIC_GRADIENT":
      return ORGANIC_GRADIENT_BANK
    case "BRUTALIST_GRID":
      return BRUTALIST_BANK
    case "LIQUID_ENTERPRISE":
      return LIQUID_ENTERPRISE_BANK
    case "CHROMATIC_CHAOS":
      return CHROMATIC_CHAOS_BANK
    default:
      return EDITORIAL_MONO_BANK
  }
}

const EASE_SNAPPY = [0.16, 1, 0.3, 1] as const

function motionBlock(preset: MotionPreset, stagger: number, intensityY: number): DesignMotionBlock {
  const hero: MotionVariantJson = {
    initial: { opacity: 0, y: intensityY, scale: preset === "magnetic" ? 0.96 : 1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.72, ease: [...EASE_SNAPPY] },
  }
  const card: MotionVariantJson = {
    initial: { opacity: 0, y: preset === "slide-reveal" ? 48 : 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [...EASE_SNAPPY] },
  }
  const text: MotionVariantJson = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [...EASE_SNAPPY] },
  }
  return {
    preset,
    heroAnimation: hero,
    cardAnimation: card,
    textAnimation: text,
    transitionEase: [...EASE_SNAPPY],
    staggerDelay: stagger,
  }
}

const DEFAULT_SECTION_BASE: readonly PortfolioSectionType[] = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "contact",
]

function sectionOrderFor(
  parsed: ParsedResume,
  rng: () => number,
  layoutType: LayoutType
): PortfolioSectionType[] {
  const base = [...DEFAULT_SECTION_BASE]
  const hasProjects = parsed.signals.hasProjects && parsed.projects.length > 0
  const senior = ["senior", "lead", "executive"].includes(parsed.signals.seniorityLevel)
  const swapProjectsFirst = (rng() > 0.45 && hasProjects && senior) || (layoutType === "bento" && hasProjects)
  if (swapProjectsFirst) {
    const pi = base.indexOf("projects")
    const ei = base.indexOf("experience")
    if (pi > 0 && ei > 0 && pi < base.length && ei < base.length) {
      ;[base[pi], base[ei]] = [base[ei]!, base[pi]!]
    }
  }
  if (parsed.signals.professionCluster === "design" && rng() > 0.35) {
    const h = base.indexOf("hero")
    const p = base.indexOf("projects")
    if (p > h + 2 && h >= 0) {
      base.splice(p, 1)
      base.splice(h + 1, 0, "projects")
    }
  }
  return base
}

function heroVariantPool(direction: DesignDirectionId): HeroVariant[] {
  switch (direction) {
    case "LUMINOUS_DARK":
      return ["fullscreen-center", "split-left", "terminal", "kinetic"]
    case "EDITORIAL_MONO":
      return ["editorial", "fullscreen-center", "split-left"]
    case "ORGANIC_GRADIENT":
      return ["kinetic", "fullscreen-center", "split-left", "editorial"]
    case "BRUTALIST_GRID":
      return ["split-left", "terminal", "editorial"]
    case "LIQUID_ENTERPRISE":
      return ["fullscreen-center", "split-left", "editorial"]
    case "CHROMATIC_CHAOS":
      return ["kinetic", "split-left", "fullscreen-center", "terminal"]
    default:
      return ["fullscreen-center"]
  }
}

function layoutPool(direction: DesignDirectionId): LayoutType[] {
  switch (direction) {
    case "BRUTALIST_GRID":
      return ["asymmetric", "bento", "split-fixed", "magazine"]
    case "LIQUID_ENTERPRISE":
      return ["split-fixed", "single-column", "magazine"]
    case "CHROMATIC_CHAOS":
      return ["asymmetric", "magazine", "bento", "split-fixed"]
    case "ORGANIC_GRADIENT":
      return ["asymmetric", "single-column", "magazine", "bento"]
    case "LUMINOUS_DARK":
      return ["split-fixed", "asymmetric", "bento", "single-column"]
    case "EDITORIAL_MONO":
    default:
      return ["single-column", "magazine", "split-fixed", "asymmetric"]
  }
}

function motionPresetPool(direction: DesignDirectionId): MotionPreset[] {
  switch (direction) {
    case "BRUTALIST_GRID":
      return ["fade-up", "slide-reveal", "stagger-grid"]
    case "LIQUID_ENTERPRISE":
      return ["fade-up", "slide-reveal"]
    case "CHROMATIC_CHAOS":
      return ["stagger-grid", "magnetic", "parallax", "slide-reveal"]
    case "ORGANIC_GRADIENT":
      return ["parallax", "stagger-grid", "slide-reveal", "magnetic"]
    case "LUMINOUS_DARK":
      return ["parallax", "stagger-grid", "magnetic", "fade-up"]
    default:
      return ["fade-up", "slide-reveal", "stagger-grid"]
  }
}

function variantForSection(
  type: PortfolioSectionType,
  direction: DesignDirectionId,
  profession: ParsedResume["signals"]["professionCluster"],
  rng: () => number
): string {
  const r = rng()
  if (type === "hero") {
    if (profession === "software" && direction === "LUMINOUS_DARK" && r > 0.55) return "terminal-hero"
    if (profession === "software" && r > 0.65) return "terminal-hero"
    if (direction === "EDITORIAL_MONO") return r > 0.38 ? "showcase-marquee-hero" : "editorial-hero-v2"
    if (direction === "BRUTALIST_GRID") return "brutalist-hero"
    if (direction === "CHROMATIC_CHAOS") return "chaos-hero"
    if (direction === "LIQUID_ENTERPRISE") return "enterprise-hero"
    return "organic-hero"
  }
  if (type === "skills") {
    if (profession === "software") return r > 0.5 ? "constellation-skills" : "tech-strip-skills"
    if (profession === "design") return "tools-cloud-skills"
    if (profession === "finance") return "finance-category-skills"
    return r > 0.5 ? "terminal-tags-skills" : "grouped-badges-skills"
  }
  if (type === "experience") {
    const r2 = rng()
    if (profession === "finance") return "finance-timeline-metrics"
    if (profession === "design") {
      if (r2 > 0.82) return "exp-horizontal-carousel"
      if (r2 > 0.52) return "case-rows-exp"
      if (r2 > 0.26) return "numbered-list-exp"
      return "design-process-row"
    }
    if (profession === "software") {
      if (r2 > 0.78) return "exp-horizontal-carousel"
      if (r2 > 0.52) return "numbered-list-exp"
      if (r2 > 0.26) return "branch-timeline-exp"
      return "card-stack-exp"
    }
    if (r2 > 0.72) return "exp-horizontal-carousel"
    if (r2 > 0.48) return "case-rows-exp"
    if (r2 > 0.24) return "numbered-list-exp"
    return "branch-timeline-exp"
  }
  if (type === "projects") {
    const r2 = rng()
    if (profession === "design") {
      if (r2 > 0.7) return "carousel-projects"
      if (r2 > 0.36) return "masonry-work"
      return "stack-projects"
    }
    if (profession === "software") {
      if (r2 > 0.58) return "carousel-projects"
      if (r2 > 0.32) return "horizontal-project-cards"
      return "bento-projects"
    }
    if (r2 > 0.62) return "carousel-projects"
    if (r2 > 0.34) return "bento-projects"
    return "horizontal-project-cards"
  }
  if (type === "about") {
    return direction === "EDITORIAL_MONO" ? "pull-quote-about" : "two-column-about"
  }
  if (type === "contact") {
    if (direction === "EDITORIAL_MONO" && r > 0.22) return "dramatic-footer-contact"
    if (profession === "software" && direction === "LUMINOUS_DARK") return "terminal-contact"
    if (direction === "LIQUID_ENTERPRISE") return "minimal-links-contact"
    if (direction === "ORGANIC_GRADIENT" && r > 0.55) return "dramatic-footer-contact"
    return "glow-contact"
  }
  return "default"
}

export function getDesignSectionPlans(config: DesignConfig): DesignSectionPlan[] {
  return config.sections
}

/**
 * Structural + palette variation — palette index, fonts, layout, hero, motion, section order, variants.
 */
export function backgroundTypeForDirection(direction: DesignDirectionId): DesignCanvasBackgroundType {
  switch (direction) {
    case "LUMINOUS_DARK":
      return "CLEAN_DARK"
    case "ORGANIC_GRADIENT":
      return "GRADIENT_MESH"
    case "EDITORIAL_MONO":
      return "EDITORIAL_FLAT"
    case "BRUTALIST_GRID":
      return "BRUTALIST_RAW"
    case "LIQUID_ENTERPRISE":
      return "ENTERPRISE_GRADIENT"
    case "CHROMATIC_CHAOS":
      return "GRADIENT_MESH"
    default:
      return "EDITORIAL_FLAT"
  }
}

export function getVariation(seed: number, direction: DesignDirectionId, parsed: ParsedResume) {
  const rng = seededRandom(seed + direction.length * 997 + parsed.name.length * 31)
  const bank = bankForDirection(direction)
  const paletteIndex = Math.abs(seed) % bank.length
  const fontIndex = Math.abs(seed) % FONT_PAIRINGS.length
  const layouts = layoutPool(direction)
  const slot = Math.abs(seed) % 5
  const layoutCycle: LayoutType[] = ["single-column", "asymmetric", "split-fixed", "magazine", "bento"]
  const forcedLayout = layoutCycle[slot]!
  const layoutType = layouts.includes(forcedLayout)
    ? forcedLayout
    : layouts[Math.floor(rng() * layouts.length) % layouts.length]!
  const heroes = heroVariantPool(direction)
  const heroCycle: HeroVariant[] = ["fullscreen-center", "split-left", "terminal", "editorial", "kinetic"]
  const forcedHero = heroCycle[slot]!
  const heroVariant = heroes.includes(forcedHero)
    ? forcedHero
    : heroes[Math.floor(rng() * heroes.length) % heroes.length]!
  const motions = motionPresetPool(direction)
  const motionPreset = motions[Math.floor(rng() * motions.length) % motions.length]!
  const cardStyles =
    direction === "BRUTALIST_GRID"
      ? (["flat", "brutalist", "bordered"] as const)
      : direction === "LUMINOUS_DARK"
        ? (["glass", "bordered", "solid"] as const)
        : (["glass", "solid", "bordered", "flat"] as const)
  const cardCycle = ["glass", "bordered", "flat", "solid", "brutalist"] as const
  const forcedCard = cardCycle[slot]!
  const card = (cardStyles as readonly string[]).includes(forcedCard)
    ? (forcedCard as (typeof cardStyles)[number])
    : cardStyles[Math.floor(rng() * cardStyles.length) % cardStyles.length]!
  const navStyles: NavStyle[] =
    layoutType === "split-fixed" ? ["side-rail", "floating-pill"] : ["floating-pill", "full-width-bar", "none"]
  const navStyle = navStyles[Math.floor(rng() * navStyles.length) % navStyles.length]!
  const stagger = 0.04 + rng() * 0.06
  const yInt = 36 + Math.floor(rng() * 40)
  return {
    palette: bank[paletteIndex]!,
    fonts: FONT_PAIRINGS[fontIndex]!,
    layoutType,
    heroVariant,
    motionPreset,
    card,
    navStyle,
    motion: motionBlock(motionPreset, stagger, yInt),
    sectionOrder: sectionOrderFor(parsed, rng, layoutType),
  }
}

/** Hero display clamp — tier rotates with `variationSeed` so every portfolio is not “mega hero”. */
const HERO_SCALE_TIERS = [
  "clamp(2rem, 4.2vw, 3.35rem)",
  "clamp(2.65rem, 5.5vw, 4.85rem)",
  "clamp(3.35rem, 7.5vw, 7rem)",
] as const

type HeroScaleTier = 0 | 1 | 2

function typographyFromFonts(f: FontPairing, direction: DesignDirectionId, heroScaleTier: HeroScaleTier = 1) {
  const heroScale = HERO_SCALE_TIERS[heroScaleTier]
  return {
    displayFont: f.display,
    bodyFont: f.body,
    monoFont: f.mono,
    scale: {
      hero: heroScale,
      h1: "clamp(2rem, 5vw, 4rem)",
      h2: "clamp(1.5rem, 3.5vw, 2.75rem)",
      h3: "clamp(1.25rem, 2.5vw, 2rem)",
      body: "clamp(1rem, 2.2vw, 1.125rem)",
      small: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
      mono: "clamp(0.75rem, 1.4vw, 0.875rem)",
    },
    weights: {
      display: direction === "EDITORIAL_MONO" ? 600 : 800,
      heading: 700,
      body: 400,
    },
    letterSpacing: {
      display: direction === "EDITORIAL_MONO" ? "-0.02em" : "-0.04em",
      heading: "-0.025em",
      body: "0.01em",
      label: "0.15em",
    },
    lineHeight: {
      display: direction === "BRUTALIST_GRID" ? 0.95 : 0.9,
      body: direction === "BRUTALIST_GRID" ? 1.5 : 1.65,
    },
  }
}

function spacingTokens(direction: DesignDirectionId, layoutType: LayoutType) {
  const airy = direction === "ORGANIC_GRADIENT" || direction === "CHROMATIC_CHAOS"
  const sectionPad = airy ? "py-24 px-6 md:py-32 md:px-16" : "py-20 px-6 md:py-28 md:px-12"
  const max =
    layoutType === "magazine" ? "max-w-6xl" : layoutType === "bento" ? "max-w-7xl" : "max-w-5xl"
  return {
    sectionPadding: sectionPad,
    containerMax: max,
    cardPadding: direction === "BRUTALIST_GRID" ? "p-6 md:p-8" : "p-8",
    gap: layoutType === "bento" ? "gap-6 md:gap-8" : "gap-8",
  }
}

function effectsFrom(direction: DesignDirectionId, palette: PaletteBank, card: string) {
  const blur = direction === "LUMINOUS_DARK" || direction === "ORGANIC_GRADIENT" ? "backdrop-blur-xl" : "backdrop-blur-md"
  const radius =
    direction === "BRUTALIST_GRID"
      ? "rounded-none"
      : direction === "LIQUID_ENTERPRISE"
        ? "rounded-lg"
        : "rounded-2xl"
  const borderStyle =
    direction === "BRUTALIST_GRID"
      ? "border-2 border-zinc-950 dark:border-white"
      : "border border-zinc-500/20 dark:border-white/10"

  return {
    cardBlur: blur,
    glowColor: `${palette.primary}4D`,
    glowSize: direction === "LUMINOUS_DARK" ? "0 0 80px" : "0 0 48px",
    noiseOpacity: direction === "EDITORIAL_MONO" ? 0.04 : 0.035,
    borderRadius: radius,
    borderStyle,
  }
}

function professionSpecifics(parsed: ParsedResume): DesignConfig["profession_specifics"] {
  const c = parsed.signals.professionCluster
  if (c === "software") {
    return {
      primaryCTA: parsed.signals.hasOpenSource ? "View GitHub" : "View projects",
      projectCardStyle: "links-tech-badges",
      socialLinks: ["github", "linkedin"].filter((k) => {
        if (k === "github") return Boolean(parsed.contact.github)
        return Boolean(parsed.contact.linkedin)
      }),
      metricHighlights: ["senior", "lead", "executive"].includes(parsed.signals.seniorityLevel),
    }
  }
  if (c === "design") {
    return {
      primaryCTA: "See case studies",
      projectCardStyle: "thumbnail-figma",
      socialLinks: ["website", "linkedin"].filter(Boolean),
      metricHighlights: false,
    }
  }
  if (c === "finance") {
    return {
      primaryCTA: "Download CV",
      projectCardStyle: "conservative-list",
      socialLinks: ["linkedin"],
      metricHighlights: true,
    }
  }
  return {
    primaryCTA: "Get in touch",
    projectCardStyle: "standard",
    socialLinks: ["email", "linkedin"],
    metricHighlights: false,
  }
}

export function buildDesignConfig(
  parsed: ParsedResume,
  direction: DesignDirectionId,
  variationSeed: number
): DesignConfig {
  const v = getVariation(variationSeed, direction, parsed)
  const heroScaleTier = (Math.abs(variationSeed) % 3) as HeroScaleTier
  const typography = typographyFromFonts(v.fonts, direction, heroScaleTier)
  const spacing = spacingTokens(direction, v.layoutType)
  const effects = effectsFrom(direction, v.palette, v.card)

  const layout: DesignLayoutBlock = {
    type: v.layoutType,
    heroVariant: v.heroVariant,
    navStyle: v.navStyle,
    sectionOrder: v.sectionOrder,
    gridSystem: v.layoutType === "bento" ? "grid-cols-12" : "grid-cols-12",
    backgroundType: backgroundTypeForDirection(direction),
  }

  const sections: DesignSectionPlan[] = v.sectionOrder.map((type) => ({
    type,
    variant: variantForSection(type, direction, parsed.signals.professionCluster, seededRandom(variationSeed + type.charCodeAt(0))),
  }))

  const components: DesignConfig["components"] = {
    card: v.card as DesignConfig["components"]["card"],
    button:
      direction === "CHROMATIC_CHAOS"
        ? "gradient-fill"
        : direction === "BRUTALIST_GRID"
          ? "brutalist"
          : direction === "LUMINOUS_DARK"
            ? "outline-glow"
            : "solid",
    badge: direction === "BRUTALIST_GRID" ? "square-mono" : "pill-glass",
    divider: direction === "EDITORIAL_MONO" ? "thick-ruled" : "gradient-line",
    cursor: direction === "CHROMATIC_CHAOS" ? "magnetic" : "default",
    scrollIndicator: direction === "LIQUID_ENTERPRISE" ? "progress-line" : "arrow",
  }

  return {
    meta: {
      direction,
      profession: parsed.signals.professionCluster,
      variationSeed,
      generatedAt: new Date().toISOString(),
    },
    tokens: {
      colors: {
        bg: v.palette.bg,
        bgSecondary: v.palette.bgSecondary,
        surface: v.palette.surface,
        surfaceHover: v.palette.surfaceHover,
        border: v.palette.border,
        text: v.palette.text,
        textMuted: v.palette.textMuted,
        primary: v.palette.primary,
        accent: v.palette.accent,
        gradients: v.palette.gradients,
      },
      typography,
      spacing,
      effects,
    },
    layout,
    motion: v.motion,
    components,
    profession_specifics: professionSpecifics(parsed),
    sections,
  }
}

/** Map resolved layout → legacy shell layout component. */
export function layoutTypeToShellKey(layoutType: LayoutType): "sidebar" | "centered" | "asymmetric" {
  switch (layoutType) {
    case "split-fixed":
      return "sidebar"
    case "single-column":
      return "centered"
    case "asymmetric":
    case "magazine":
    case "bento":
    default:
      return "asymmetric"
  }
}
