import { getThumb } from "@/content/resume/evidence"
import { RESUME_TEMPLATES } from "@/lib/resume/templates"
import { SAMPLE_RESUMES, type SampleResume } from "@/lib/resume/samples"

import { EXAMPLES_A } from "./a"
import { EXAMPLES_B } from "./b"
import { EXAMPLES_C } from "./c"
import type { ResumeExample } from "./types"

export type { ResumeExample } from "./types"

/** Bump when the example copy changes in a way worth recrawling. */
export const EXAMPLES_UPDATED = "2026-10-20"

export const RESUME_EXAMPLES: readonly ResumeExample[] = [...EXAMPLES_A, ...EXAMPLES_B, ...EXAMPLES_C]

export type ExampleEntry = ResumeExample & { person: SampleResume }

/** Examples whose sample exists and has a real render in its lead template. Anything else is dropped, never faked. */
export function exampleEntries(): ExampleEntry[] {
  return RESUME_EXAMPLES.flatMap((e) => {
    const person = SAMPLE_RESUMES.find((s) => s.id === e.sample)
    if (!person || !getThumb(e.templateId, e.sample, "a4")) return []
    return [{ ...e, person }]
  })
}

export function getExample(slug: string): ExampleEntry | undefined {
  return exampleEntries().find((e) => e.slug === slug)
}

/** Templates with a build-time render of this sample, lead template first. */
export function rendersFor(e: ResumeExample) {
  return [...RESUME_TEMPLATES]
    .filter((t) => t.showcase.includes(e.sample))
    .sort((a, b) => Number(b.id === e.templateId) - Number(a.id === e.templateId))
}
