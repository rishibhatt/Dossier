import { contrastRatio, isLightHex } from "@/lib/design/templates/contrast"
import type { DesignConfig } from "@/types/designEngine"

/**
 * DesignConfig -> CSS custom properties for a portfolio root. One namespace: `--de-*`.
 * (`--de-elevated` and `--de-font-heading` stay as aliases for shared ui widgets.)
 */

const SERIF = new Set([
  "Source Serif 4", "IBM Plex Serif", "Literata", "Newsreader", "Vollkorn", "Spectral", "Crimson Pro",
  "Playfair Display", "Cormorant Garamond",
])
const MONO = new Set(["JetBrains Mono", "IBM Plex Mono", "Fira Code", "Source Code Pro", "DM Mono"])

export function fontStack(family: string): string {
  const tail = MONO.has(family)
    ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    : SERIF.has(family)
      ? "ui-serif, Georgia, 'Times New Roman', serif"
      : "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
  return family ? `'${family}', ${tail}` : tail
}

const RADIUS: [string, string][] = [
  ["none", "0"],
  ["3xl", "1.5rem"],
  ["2xl", "1rem"],
  ["lg", "0.5rem"],
]
const radiusCss = (r: string) => RADIUS.find(([k]) => r.includes(k))?.[1] ?? "0.75rem"

const MAX: [string, string][] = [
  ["7xl", "80rem"],
  ["6xl", "72rem"],
]
const maxCss = (m: string) => MAX.find(([k]) => m.includes(k))?.[1] ?? "64rem"

/** Section rhythm from the template density (encoded in spacing.sectionPadding). */
function padY(sectionPadding: string) {
  if (sectionPadding.includes("py-32") || sectionPadding.includes("md:py-32")) return "clamp(4rem, 11cqi, 8rem)"
  if (sectionPadding.includes("py-12")) return "clamp(2.5rem, 7cqi, 4.5rem)"
  return "clamp(3.5rem, 9cqi, 6.5rem)"
}

/** Viewport units -> container units, so the studio's phone frame sizes type like a real phone. */
const cq = (v: string) => v.replace(/(\d)vw/g, "$1cqi")

export function portfolioCssVars(config: DesignConfig): Record<string, string> {
  const c = config.tokens.colors
  const ty = config.tokens.typography
  const sp = config.tokens.spacing
  const display = fontStack(ty.displayFont)
  return {
    "--de-bg": c.bg,
    "--de-bg2": c.bgSecondary,
    "--de-surface": c.surface,
    "--de-fg": c.text,
    "--de-muted": c.textMuted,
    "--de-primary": c.primary,
    "--de-on-primary": onColor(c.primary, c.bg, c.text),
    "--de-accent": c.accent,
    "--de-border": c.border,
    "--de-font-display": display,
    "--de-font-body": fontStack(ty.bodyFont),
    "--de-font-mono": fontStack(ty.monoFont),
    "--de-hero-size": cq(ty.scale.hero),
    "--de-h2-size": cq(ty.scale.h2),
    "--de-w-display": String(ty.weights.display),
    "--de-w-heading": String(ty.weights.heading),
    "--de-track-display": ty.letterSpacing.display,
    "--de-lead-display": String(ty.lineHeight.display),
    "--de-lead-body": String(ty.lineHeight.body),
    "--de-radius": radiusCss(config.tokens.effects.borderRadius),
    "--de-pad-x": "clamp(1rem, 5cqi, 3.5rem)",
    "--de-pad-y": padY(sp.sectionPadding),
    "--de-max": maxCss(sp.containerMax),
    // aliases read by shared ui widgets (ScrollProgress, GlowCard)
    "--de-elevated": c.bgSecondary,
    "--de-font-heading": display,
  }
}

/** Text colour for a filled control: whichever of the page's two inks reads best, else pure black/white. */
function onColor(fill: string, a: string, b: string): string {
  try {
    const best = [a, b, "#ffffff", "#111111"].map((c) => [c, contrastRatio(fill.slice(0, 7), c.slice(0, 7))] as const).sort((x, y) => y[1] - x[1])
    const pick = [a, b].find((c) => contrastRatio(fill.slice(0, 7), c.slice(0, 7)) >= 4.5)
    return pick ?? best[0]![0]
  } catch {
    return b
  }
}

function isLight(hex: string) {
  try {
    return isLightHex(hex.slice(0, 7))
  } catch {
    return true
  }
}

export type PortfolioShell = "stack" | "rail" | "wide"

export function shellFor(config: DesignConfig): PortfolioShell {
  const t = config.layout.type
  if (t === "split-fixed") return "rail"
  if (t === "single-column") return "stack"
  return "wide"
}

export type MotionSignature = "rise" | "clip" | "wipe"

export function motionSignature(config: DesignConfig): MotionSignature {
  const p = config.motion.preset
  if (p === "slide-reveal" || p === "parallax") return "clip"
  if (p === "magnetic") return "wipe"
  return "rise"
}

/** Root data-* attributes that switch component styling (all consumed by portfolio CSS). */
export function portfolioDataAttrs(config: DesignConfig): Record<string, string> {
  const cmp = config.components
  const chip = cmp.badge === "square-mono" ? "square" : cmp.badge === "pill-glass" ? "pill" : "outline"
  const card = cmp.card === "glass" ? "bordered" : cmp.card
  const btn = cmp.button === "text-arrow" ? "text" : cmp.button === "outline-glow" ? "outline" : cmp.button === "brutalist" ? "block" : "solid"
  return {
    "data-pf-shell": shellFor(config),
    "data-pf-nav": config.layout.navStyle,
    "data-pf-card": card,
    "data-pf-chip": chip,
    "data-pf-btn": btn,
    "data-pf-title": cmp.divider === "thick-ruled" ? "rule" : "plain",
    "data-pf-motion": motionSignature(config),
    "data-pf-parallax": config.motion.preset === "parallax" ? "on" : "off",
    "data-pf-mode": isLight(config.tokens.colors.bg) ? "light" : "dark",
    "data-pf-bg": config.layout.backgroundType === "BRUTALIST_RAW" ? "grid" : "flat",
    "data-pf-dir": config.meta.direction,
  }
}
