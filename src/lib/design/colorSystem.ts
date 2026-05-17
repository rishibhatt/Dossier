import type { ColorSpec, DesignIntelligenceStyle } from "@/types/design"

/** Minimum contrast ratio for normal text (WCAG AA). */
const AA_NORMAL = 4.5

function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrastRatio(a: string, b: string): number {
  const L1 = luminance(a)
  const L2 = luminance(b)
  const hi = Math.max(L1, L2)
  const lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

function noteContrast(fg: string, bg: string, label: string): string {
  const r = contrastRatio(fg, bg)
  const ok = r >= AA_NORMAL
  return `${label}: contrast ${r.toFixed(2)}:1 ${ok ? "(meets AA for body text)" : "(use for headings / large type only)"}`
}

/**
 * Palette + gradient hints derived from intelligence style (not raw user tokens).
 */
export function getColorSystem(style: DesignIntelligenceStyle): ColorSpec {
  const palettes: Record<DesignIntelligenceStyle, Omit<ColorSpec, "contrastNotes">> = {
    minimal: {
      background: "#f6f7f9",
      foreground: "#0f1115",
      accent: "#0d7a4d",
      muted: "#5c6370",
      gradient: "linear-gradient(180deg, #f6f7f9 0%, #eef0f4 100%)",
      card: "#ffffff",
      border: "color-mix(in oklab, #0f1115 10%, transparent)",
    },
    creative: {
      background: "#0b0f1a",
      foreground: "#f2f5ff",
      accent: "#7c9cff",
      muted: "#9aa3b5",
      gradient: "linear-gradient(135deg, #141a2e 0%, #0b0f1a 45%, #1a1030 100%)",
      card: "#12182a",
      border: "color-mix(in oklab, #7c9cff 22%, transparent)",
    },
    editorial: {
      background: "#faf7f2",
      foreground: "#1a1814",
      accent: "#8b5a2b",
      muted: "#6e6860",
      gradient: "radial-gradient(120% 80% at 10% 0%, #efe6dc 0%, #faf7f2 55%)",
      card: "#ffffff",
      border: "color-mix(in oklab, #1a1814 12%, transparent)",
    },
    experimental: {
      background: "#070708",
      foreground: "#f4f1ea",
      accent: "#ff6b4a",
      muted: "#a39e93",
      gradient: "linear-gradient(120deg, #0f0f12 0%, #1a0a14 40%, #070708 100%)",
      card: "#121218",
      border: "color-mix(in oklab, #ff6b4a 25%, transparent)",
    },
    corporate: {
      background: "#f4f6f8",
      foreground: "#111827",
      accent: "#1d4ed8",
      muted: "#4b5563",
      gradient: "linear-gradient(180deg, #eef2f7 0%, #f4f6f8 100%)",
      card: "#ffffff",
      border: "color-mix(in oklab, #111827 10%, transparent)",
    },
  }

  const base = palettes[style]
  const contrastNotes = [
    noteContrast(base.foreground, base.background, "Body"),
    noteContrast(base.accent, base.background, "Accent on background"),
    "Use accent for CTAs and highlights; avoid long body copy in accent-only color without sufficient contrast.",
  ]

  return { ...base, contrastNotes }
}
