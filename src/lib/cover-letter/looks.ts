import { RESUME_TEMPLATES } from "../resume/templates"

/**
 * The letter look for each resume template: the masthead options kit.typ's `masthead()` takes, as plain data.
 * R-013 to R-042 copy the header options from their own `render(...)` call, so the letter's masthead is the
 * resume's masthead. R-001 to R-012 are hand-written templates; each gets the closest kit look by hand, so
 * call them "matches R-00x" in the UI rather than promising an identical design.
 *
 * Only presentation lives here. Fonts named here must be in that template's `fonts` list (templates.ts),
 * because those are the only fonts the worker loads. scripts/cover-letter/verify-letter.ts checks this.
 */

export type LetterHeader = "stack" | "center" | "split" | "banner" | "rule"

export type LetterLook = {
  /** Body face (a Typst family name, such as "PT Serif"). */
  font: string
  /** Heading face, used for the subject line. null = body face. */
  headFont: string | null
  /** Name face. null = heading face. */
  nameFont: string | null
  /** Name size in multiples of the body size. */
  nameScale: number
  nameWeight: number
  nameUpper: boolean
  /** Letter spacing of the name, in em. */
  nameTracking: number
  header: LetterHeader
  /** Separator between contact items. */
  contactSep: "dot" | "pipe"
  /** Name set in the accent colour. */
  accentName: boolean
}

const BASE: LetterLook = {
  font: "Inter",
  headFont: null,
  nameFont: null,
  nameScale: 2.3,
  nameWeight: 700,
  nameUpper: false,
  nameTracking: -0.02,
  header: "stack",
  contactSep: "dot",
  accentName: false,
}

const look = (o: Partial<LetterLook>): LetterLook => ({ ...BASE, ...o })

export const LETTER_LOOKS: Record<string, LetterLook> = {
  // Hand-picked closest looks for the hand-written templates.
  "r001-ledger": look({}),
  "r002-plain": look({ font: "Source Serif 4", header: "center", nameScale: 2.4, nameTracking: 0 }),
  "r003-column": look({ nameScale: 2.4 }),
  "r004-scholar": look({ font: "Source Serif 4", nameScale: 2.2, nameTracking: 0 }),
  "r005-compact": look({ header: "split", nameScale: 2 }),
  "r006-modern": look({ header: "rule", nameScale: 2.6, nameTracking: -0.03 }),
  "r007-executive": look({ font: "Source Serif 4", header: "center", nameScale: 2.6, nameTracking: 0.02 }),
  "r008-fresher": look({ header: "split" }),
  "r009-switcher": look({}),
  "r010-europa": look({ nameScale: 2.4 }),
  "r011-gulf": look({ header: "center", nameUpper: true, nameTracking: 0.01 }),
  "r012-specimen": look({ nameFont: "Bricolage Grotesque", nameScale: 3, nameTracking: -0.035 }),
  // Copied from each template's render(...) call. Only the options that touch the masthead or fonts matter here.
  "r013-margin": look({ font: "PT Serif" }),
  "r014-harbor": look({ font: "Lato", header: "split" }),
  "r015-bedside": look({ font: "Lato", header: "rule" }),
  "r016-counter": look({ font: "PT Sans", header: "center" }),
  "r017-shift": look({ font: "Fira Sans", header: "split" }),
  "r018-brief": look({ font: "Crimson Text", header: "center", nameUpper: true, nameTracking: 0.04 }),
  "r019-folio": look({ font: "IBM Plex Serif", header: "split" }),
  "r020-transit": look({ font: "Fira Sans", header: "rule" }),
  "r021-lecture": look({ font: "Crimson Text" }),
  "r022-atelier": look({ font: "Inter", headFont: "Bricolage Grotesque", accentName: true }),
  "r023-signal": look({ font: "Inter" }),
  "r024-docket": look({ font: "PT Serif" }),
  "r025-ward": look({ font: "PT Sans", header: "banner" }),
  "r026-site": look({ font: "Fira Sans", header: "rule" }),
  "r027-quarter": look({ font: "IBM Plex Serif", header: "center" }),
  "r028-pitch": look({ font: "Lato", header: "banner" }),
  "r029-campus": look({ font: "Inter", header: "banner" }),
  "r030-clinic": look({ font: "Source Serif 4" }),
  "r031-tally": look({ font: "PT Sans" }),
  "r032-field": look({ font: "Fira Sans" }),
  "r033-atlas": look({ font: "Lato", header: "center" }),
  "r034-notebook": look({ font: "Crimson Text" }),
  "r035-kernel": look({ font: "Fira Sans", header: "center", contactSep: "pipe" }),
  "r036-cadence": look({ font: "Inter", header: "rule" }),
  "r037-mercy": look({ font: "PT Serif", header: "center" }),
  "r038-bench": look({ font: "IBM Plex Serif" }),
  "r039-range": look({ font: "PT Sans" }),
  "r040-crew": look({ font: "Lato", header: "center", nameUpper: true, nameTracking: 0.03 }),
  "r041-civic": look({ font: "Source Serif 4", header: "rule" }),
  "r042-thread": look({ font: "Inter", headFont: "Bricolage Grotesque", header: "split" }),
}

/** The letter look for a resume template id. Unknown ids get the R-001 look. */
export function letterLook(templateId: string): LetterLook {
  return LETTER_LOOKS[templateId] ?? LETTER_LOOKS["r001-ledger"]!
}

/** The Typst source every letter compiles, whatever the template. */
export const LETTER_TEMPLATE_ID = "letter"

/**
 * Fallback face for characters the template's font lacks (Crimson Text has no ₹, for one). render-letter lists
 * it after the look's font, so it is only used glyph by glyph.
 */
export const LETTER_FALLBACK_FONT = "Inter-400"

/** The fonts the worker must load to set a letter in this template's look: the template's own fonts plus the fallback. */
export function letterFonts(templateId: string): string[] {
  const t = RESUME_TEMPLATES.find((x) => x.id === templateId) ?? RESUME_TEMPLATES[0]!
  return t.fonts.includes(LETTER_FALLBACK_FONT) ? [...t.fonts] : [...t.fonts, LETTER_FALLBACK_FONT]
}
