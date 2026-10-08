import type { BuildPreview } from "@/types/buildStream"

/** Honest status per stage index (see PARSE_STAGES). */
export function statusFor(stageIndex: number): string {
  if (stageIndex < 1) return "Opening your PDF"
  if (stageIndex < 2) return "Reading your resume"
  if (stageIndex < 4) return "Choosing a look for your work"
  if (stageIndex < 5) return "Setting your page"
  return "Opening the editor"
}

/** Plain name for a background colour: "warm paper", "white", "near black"... */
export function describeBg(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return "its own paper"
  const n = parseInt(m[1]!, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  if (l > 0.9) return r - b > 6 ? "warm paper" : "white"
  if (l > 0.55) return r > b ? "warm stock" : "cool grey"
  if (l > 0.2) return b > r ? "slate" : "dusk"
  return b > r + 12 ? "deep navy" : "near black"
}

/** "Set in Ledger: IBM Plex Serif on warm paper". */
export function lookCaption(t: NonNullable<BuildPreview["template"]>): string {
  return `Set in ${t.name}: ${t.display} on ${describeBg(t.bg)}`
}

export function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}
