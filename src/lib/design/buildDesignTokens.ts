import type { DesignConfig } from "@/types/designEngine"
import type { DesignTokens } from "@/types/designTokens"

function isLightHex(bg: string): boolean {
  const m = bg.match(/^#([0-9a-f]{6})$/i)
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 186
}

function tailwindBlurToPx(blur: string): string {
  if (blur.includes("2xl")) return "40px"
  if (blur.includes("xl")) return "24px"
  if (blur.includes("lg")) return "16px"
  if (blur.includes("md")) return "12px"
  if (blur.includes("sm")) return "8px"
  return "20px"
}

function tailwindRadiusToCss(radius: string): string {
  if (radius.includes("none")) return "0"
  if (radius.includes("lg")) return "0.5rem"
  if (radius.includes("2xl")) return "1rem"
  if (radius.includes("3xl")) return "1.5rem"
  return "0.75rem"
}

function tailwindMaxWToCss(max: string): string {
  if (max.includes("7xl")) return "min(100%, 80rem)"
  if (max.includes("6xl")) return "min(100%, 72rem)"
  return "min(100%, 64rem)"
}

/**
 * Maps resolved `DesignConfig` (concrete tokens) into canvas CSS variables.
 */
export function buildDesignTokens(config: DesignConfig, variationSeed: number): DesignTokens {
  const c = config.tokens.colors
  const ty = config.tokens.typography
  const sp = config.tokens.spacing
  const fx = config.tokens.effects
  const motion = config.motion

  const baseLight = isLightHex(c.bg)

  const background = c.bg
  let elevated = c.bgSecondary
  const foreground = c.text
  const muted = c.textMuted
  const accent = c.primary
  const accentSoft = c.accent
  const border = c.border

  if (!baseLight) {
    elevated = c.surface
  }

  const seedJitter = (Math.abs(variationSeed) % 17) * 0.002
  const gradientMesh = `${c.gradients.mesh}, linear-gradient(180deg, ${background} 0%, ${elevated} 100%)`
  const gradientAccent = c.gradients.hero.includes("gradient") ? c.gradients.hero : `linear-gradient(120deg, ${accent} 0%, ${accentSoft} 100%)`

  const fontHeading = `'${ty.displayFont}', ui-sans-serif, system-ui, sans-serif`
  const fontBody = `'${ty.bodyFont}', ui-sans-serif, system-ui, sans-serif`

  const padFrom = (cls: string) => {
    if (cls.includes("px-6") && cls.includes("md:px-16")) return { x: "clamp(1rem, 4vw, 4rem)", y: "clamp(2.5rem, 8vw, 8rem)" }
    if (cls.includes("md:px-12")) return { x: "clamp(1rem, 3.5vw, 3rem)", y: "clamp(2rem, 6vw, 6rem)" }
    return { x: "clamp(1rem, 4vw, 3rem)", y: "clamp(2rem, 6vw, 5rem)" }
  }
  const pad = padFrom(sp.sectionPadding)

  const staggerMs = Math.round((motion.staggerDelay ?? 0.07) * 1000)
  const revealY =
    typeof motion.cardAnimation.initial?.y === "number" ? motion.cardAnimation.initial.y : 28
  const parallaxFactor =
    config.motion.preset === "parallax" ? 0.1 : config.motion.preset === "magnetic" ? 0.08 : 0.04

  const glow = `${fx.glowSize} ${fx.glowColor}`

  return {
    colors: {
      background,
      elevated,
      foreground: foreground,
      muted,
      accent,
      accentSoft,
      border,
      gradientMesh,
      gradientAccent,
    },
    typography: {
      fontHeading,
      fontBody,
      displaySize: ty.scale.hero,
      headingLgSize: ty.scale.h2,
      bodySize: ty.scale.body,
      lineHeight: String(ty.lineHeight.body),
    },
    space: {
      padX: pad.x,
      padY: pad.y,
      stack: sp.gap.replace("gap-", "") ? "clamp(1.5rem, 3vw, 2.5rem)" : "clamp(1.5rem, 3vw, 2.5rem)",
      sectionGap: sp.sectionPadding.includes("py-32") ? "clamp(3rem, 8vw, 6rem)" : "clamp(2rem, 5vw, 4rem)",
    },
    effects: {
      blurGlass: tailwindBlurToPx(fx.cardBlur),
      glowAccent: glow,
      shadowElevated: "0 20px 50px color-mix(in oklab, #000 25%, transparent)",
      radiusLg: tailwindRadiusToCss(fx.borderRadius),
      radiusXl: tailwindRadiusToCss(fx.borderRadius),
    },
    motion: {
      staggerMs: staggerMs + Math.round(seedJitter * 1000),
      revealDistance: revealY,
      parallaxFactor,
    },
  }
}

export function designTokensToRootCss(tokens: DesignTokens): string {
  const entries = Object.entries(designTokensToCssVars(tokens))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")
  return `:root {\n${entries}\n}\n`
}

/**
 * Full premium canvas variable schema + legacy `--de-*` / `--dt-*` aliases.
 * Section components should prefer `var(--color-*)` and utility classes in `portfolio-canvas-utilities.css`.
 */
export function mergeCanvasCssVars(config: DesignConfig, tokens: DesignTokens): Record<string, string> {
  const base = designTokensToCssVars(tokens)
  const raw = config.tokens.colors
  const ty = config.tokens.typography
  const fx = config.tokens.effects
  const motion = config.motion
  const c = tokens.colors
  const dir = config.meta.direction
  const heading =
    dir === "EDITORIAL_MONO" || dir === "BRUTALIST_GRID" ? c.foreground : raw.primary

  const monoStack = `'${ty.monoFont}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  const radiusCss = tailwindRadiusToCss(fx.borderRadius)

  return {
    ...base,
    "--color-bg": c.background,
    "--color-bg-secondary": raw.bgSecondary,
    "--color-surface": raw.surface,
    "--color-surface-hover": raw.surfaceHover,
    "--color-border": c.border,
    "--color-text": c.foreground,
    "--color-text-muted": c.muted,
    "--color-primary": raw.primary,
    "--color-accent": raw.accent,
    "--color-heading": heading,
    "--gradient-hero": raw.gradients.hero,
    "--gradient-surface": raw.gradients.surface,
    "--gradient-text": raw.gradients.text,
    "--gradient-mesh": c.gradientMesh,
    "--font-display": tokens.typography.fontHeading,
    "--font-body": tokens.typography.fontBody,
    "--font-mono": monoStack,
    "--size-hero": ty.scale.hero,
    "--size-h1": ty.scale.h1,
    "--size-h2": ty.scale.h2,
    "--size-h3": ty.scale.h3,
    "--size-body": ty.scale.body,
    "--weight-display": String(ty.weights.display),
    "--weight-heading": String(ty.weights.heading),
    "--tracking-display": ty.letterSpacing.display,
    "--tracking-heading": ty.letterSpacing.heading,
    "--leading-display": String(ty.lineHeight.display),
    "--leading-body": String(ty.lineHeight.body),
    "--effect-blur": tailwindBlurToPx(fx.cardBlur),
    "--effect-radius": radiusCss,
    "--effect-border": fx.borderStyle,
    "--effect-glow": fx.glowColor,
    "--effect-glow-size": fx.glowSize,
    "--spacing-section": `${tokens.space.padY} ${tokens.space.padX}`,
    "--spacing-container": tailwindMaxWToCss(config.tokens.spacing.containerMax),
    "--motion-ease-x": String(motion.transitionEase[0] ?? 0.16),
    "--motion-ease-y": String(motion.transitionEase[1] ?? 1),
    "--motion-ease-z": String(motion.transitionEase[2] ?? 0.3),
    "--motion-ease-w": String(motion.transitionEase[3] ?? 1),
    "--motion-stagger": String(motion.staggerDelay ?? 0.07),
  }
}

export function designTokensToCssVars(tokens: DesignTokens): Record<string, string> {
  const { c, t, s, e, m } = {
    c: tokens.colors,
    t: tokens.typography,
    s: tokens.space,
    e: tokens.effects,
    m: tokens.motion,
  }
  return {
    "--de-bg": c.background,
    "--de-elevated": c.elevated,
    "--de-fg": c.foreground,
    "--de-muted": c.muted,
    "--de-accent": c.accent,
    "--de-border": c.border,
    "--de-pad-x": s.padX,
    "--de-pad-y": s.padY,
    "--de-stack": s.stack,
    "--de-font-heading": t.fontHeading,
    "--de-font-body": t.fontBody,
    "--de-body-size": t.bodySize,
    "--de-leading": t.lineHeight,
    "--dt-bg": c.background,
    "--dt-fg": c.foreground,
    "--dt-muted": c.muted,
    "--dt-accent": c.accent,
    "--dt-accent-soft": c.accentSoft,
    "--dt-border": c.border,
    "--dt-elevated": c.elevated,
    "--dt-gradient-mesh": c.gradientMesh,
    "--dt-gradient-accent": c.gradientAccent,
    "--dt-display-size": t.displaySize,
    "--dt-heading-lg-size": t.headingLgSize,
    "--dt-blur-glass": e.blurGlass,
    "--dt-glow-accent": e.glowAccent,
    "--dt-shadow-elevated": e.shadowElevated,
    "--dt-radius-lg": e.radiusLg,
    "--dt-radius-xl": e.radiusXl,
    "--dt-section-gap": s.sectionGap,
    "--dt-stagger-ms": String(m.staggerMs),
    "--dt-reveal-y": `${m.revealDistance}px`,
    "--dt-parallax": String(m.parallaxFactor),
  }
}
