"use client"

import { createDraft } from "@/features/resume/lib/drafts"
import { guessPreset } from "@/lib/resume/presets"
import { blankResume } from "@/lib/resume/samples"
import { newId } from "@/lib/resume/schema"
import { DEFAULT_TEMPLATE_ID } from "@/lib/resume/templates"

/**
 * Hands a free tool's output to the resume builder: a blank resume saved on this device with the summary,
 * headline or bullets already in place. Nothing goes in the URL; the editor opens the draft by its id.
 */
export function startResumeWith(fill: { summary?: string; headline?: string; bullets?: string[] }): string {
  const doc = blankResume()
  if (fill.summary) doc.basics.summary = fill.summary.slice(0, 1200)
  if (fill.headline) doc.basics.headline = fill.headline.slice(0, 160)
  const bullets = (fill.bullets ?? []).filter(Boolean).slice(0, 8)
  if (bullets.length) {
    const exp = doc.sections.find((s) => s.type === "experience")
    if (exp?.type === "experience") {
      exp.items.push({ id: newId("e"), role: "", org: "", location: "", start: "", end: "", current: false, bullets: bullets.map((text) => ({ id: newId("b"), text: text.slice(0, 600) })) })
    }
  }
  return createDraft({ doc, design: { templateId: DEFAULT_TEMPLATE_ID, preset: guessPreset(), paper: null, density: "standard", accent: "ink" } })
}
