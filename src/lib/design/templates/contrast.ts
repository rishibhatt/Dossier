/** WCAG 2.x contrast helpers (pure, no deps) used to vet template palettes. */

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i)
  if (!m) throw new Error(`contrast: expected #rrggbb, got "${hex}"`)
  const n = parseInt(m[1]!, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

export type ContrastInput = {
  bg: string
  bg2: string
  text: string
  muted: string
  primary: string
  accent: string
}

export type ContrastIssue = { pair: string; ratio: number; min: number }

/**
 * Rules: body text, muted text and primary (used for headings/labels/links) must clear 4.5:1 on
 * both page backgrounds; the accent (decorative) must clear 3:1.
 */
export function checkPaletteContrast(p: ContrastInput): ContrastIssue[] {
  const rules: [string, string, string, number][] = [
    ["text/bg", p.text, p.bg, 4.5],
    ["text/bg2", p.text, p.bg2, 4.5],
    ["muted/bg", p.muted, p.bg, 4.5],
    ["muted/bg2", p.muted, p.bg2, 4.5],
    ["primary/bg", p.primary, p.bg, 4.5],
    ["primary/bg2", p.primary, p.bg2, 4.5],
    ["accent/bg", p.accent, p.bg, 3],
  ]
  const issues: ContrastIssue[] = []
  for (const [pair, fg, bg, min] of rules) {
    const ratio = contrastRatio(fg, bg)
    if (ratio < min) issues.push({ pair, ratio: Math.round(ratio * 100) / 100, min })
  }
  return issues
}

export function isLightHex(hex: string): boolean {
  return relativeLuminance(hex) > 0.4
}
