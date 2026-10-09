import "server-only"

import { TEMPLATES } from "@/lib/design/templates"

/** One look the design engine can set, described the way a type specimen describes a face. */
export type Specimen = {
  no: string
  id: string
  name: string
  tagline: string
  bestFor: string
  audience: string[]
  mode: "light" | "dark"
  display: string
  body: string
  layout: string
  hero: string
  swatch: { bg: string; surface: string; text: string; accent: string }
}

const LAYOUT_LABEL: Record<string, string> = {
  "single-column": "Single column",
  "split-fixed": "Fixed sidebar",
  asymmetric: "Asymmetric",
  magazine: "Magazine",
}

const HERO_LABEL: Record<string, string> = {
  terminal: "Terminal",
  editorial: "Editorial",
  kinetic: "Kinetic",
  "split-left": "Split",
  "fullscreen-center": "Centred",
}

function label(map: Record<string, string>, v: string) {
  return map[v] ?? v.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
}

/** Every template in the engine, numbered in catalogue order. Real data, read from the template specs. */
export function getSpecimens(): Specimen[] {
  return TEMPLATES.map((t, i) => ({
    no: String(i + 1).padStart(3, "0"),
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    bestFor: t.bestFor[0] ?? "",
    audience: [...t.bestFor],
    mode: t.mode,
    display: t.displayFont,
    body: t.bodyFont,
    layout: label(LAYOUT_LABEL, t.layout),
    hero: label(HERO_LABEL, t.hero),
    swatch: t.swatch,
  }))
}

/**
 * A Google Fonts stylesheet for the display faces of the given specimens, bold only and subset to the
 * characters in `text`, so a showing costs a few kilobytes per face rather than a full family.
 */
export function specimenFontsHref(specimens: readonly Specimen[], text: string): string {
  const families = [...new Set(specimens.map((s) => s.display))].map((f) => `family=${f.replace(/\s+/g, "+")}:wght@700`)
  const glyphs = [...new Set(text.replace(/\s+/g, ""))].sort().join("")
  return `https://fonts.googleapis.com/css2?${families.join("&")}&text=${encodeURIComponent(glyphs + " ")}&display=swap`
}
