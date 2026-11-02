import type { ExperienceItem, ResumeDesign, ResumeDocument } from "../resume/schema"

import { emptyLetter, type CoverLetterDesign, type CoverLetterDocument } from "./schema"

/**
 * Prefill a cover letter from a resume. Pure: no storage, no clock, no ids beyond the paragraph ids that
 * emptyLetter() makes. The resume is read once, when the letter is created or rebuilt; the two documents
 * are not kept in sync afterwards.
 */

/** A resume bullet that contains a number, with the job it came from. */
export type FactBullet = { id: string; text: string; role: string; org: string }

/** The facts the letter generator may use. Everything here is copied from the resume; nothing is inferred. */
export type ResumeFacts = {
  name: string
  headline: string
  /** The most recent job (a current one first, then the latest end or start date). */
  latest: { role: string; org: string; start: string; end: string; current: boolean } | null
  /** Earlier jobs, newest first, without the latest one. Used by the career-change variant. */
  earlier: { role: string; org: string }[]
  /** Up to 2 bullets with a number: the latest job's first, then other jobs and projects. */
  proof: FactBullet[]
  /** Every bullet with a number (experience, volunteering, projects), newest job first. The generator ranks these. */
  numbered: FactBullet[]
  /** Skills from every visible skills section, flattened, trimmed and de-duplicated (case-insensitive). */
  skills: string[]
  /** The most recent education item. */
  education: { degree: string; school: string; end: string; current: boolean } | null
  summary: string
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim()
const hasNumber = (s: string) => /\d/.test(s)

/** Sort key for "most recent": current first, then end date, then start date ("2024-03" sorts as a string). */
const recency = (i: { start: string; end: string; current: boolean }) => `${i.current ? "1" : "0"}${i.end || i.start || ""}|${i.start || ""}`
const newestFirst = <T extends { start: string; end: string; current: boolean }>(xs: T[]) =>
  xs
    .map((x, n) => ({ x, n }))
    // Stable: ties keep the order the person wrote them in (resumes are usually newest first already).
    .sort((a, b) => (recency(a.x) < recency(b.x) ? 1 : recency(a.x) > recency(b.x) ? -1 : a.n - b.n))
    .map(({ x }) => x)

export function resumeFacts(resume: ResumeDocument): ResumeFacts {
  const visible = resume.sections.filter((s) => !s.hidden)
  const jobs: ExperienceItem[] = newestFirst(
    visible.flatMap((s) => (s.type === "experience" ? s.items : [])).filter((i) => clean(i.role) || clean(i.org)),
  )
  const volunteering = newestFirst(visible.flatMap((s) => (s.type === "volunteering" ? s.items : [])))
  const projects = visible.flatMap((s) => (s.type === "projects" ? s.items : []))

  const latestJob = jobs[0]
  const numbered: FactBullet[] = []
  const seen = new Set<string>()
  const push = (b: { id: string; text: string }, role: string, org: string) => {
    const t = clean(b.text)
    if (!t || !hasNumber(t) || seen.has(t.toLowerCase())) return
    seen.add(t.toLowerCase())
    numbered.push({ id: b.id, text: t, role: clean(role), org: clean(org) })
  }
  for (const j of jobs) for (const b of j.bullets) push(b, j.role, j.org)
  for (const v of volunteering) for (const b of v.bullets) push(b, v.role, v.org)
  for (const p of projects) for (const b of p.bullets) push(b, p.role || p.name, p.name)

  const skills: string[] = []
  const skillSeen = new Set<string>()
  for (const s of visible)
    if (s.type === "skills")
      for (const g of s.items)
        for (const raw of g.items) {
          const k = clean(raw)
          if (k && !skillSeen.has(k.toLowerCase())) {
            skillSeen.add(k.toLowerCase())
            skills.push(k)
          }
        }

  const edu = newestFirst(visible.flatMap((s) => (s.type === "education" ? s.items : [])).filter((e) => clean(e.school) || clean(e.degree)))[0]

  return {
    name: clean(resume.basics.name),
    headline: clean(resume.basics.headline),
    latest: latestJob
      ? { role: clean(latestJob.role), org: clean(latestJob.org), start: latestJob.start, end: latestJob.end, current: latestJob.current }
      : null,
    earlier: jobs.slice(1).map((j) => ({ role: clean(j.role), org: clean(j.org) })),
    proof: numbered.slice(0, 2),
    numbered,
    skills,
    education: edu ? { degree: clean(edu.degree), school: clean(edu.school), end: edu.end, current: edu.current } : null,
    summary: clean(resume.basics.summary),
  }
}

/**
 * A new letter from a resume: sender from `basics` (first 2 links), the resume's design copied as is, the role
 * defaulting to the resume headline, and links back to the resume. Paragraphs start empty; run the generator
 * (features/cover-letter/letterGen.ts) with `facts` to fill them.
 */
export function letterFromResume(
  resume: ResumeDocument,
  design: ResumeDesign,
  source: { resumeDraftId?: string | null; resumeRemoteId?: string | null } = {},
): { letter: CoverLetterDocument; design: CoverLetterDesign; facts: ResumeFacts } {
  const b = resume.basics
  const letter = emptyLetter()
  letter.sender = {
    name: clean(b.name),
    headline: clean(b.headline),
    email: clean(b.email),
    phone: clean(b.phone),
    location: clean(b.location),
    links: b.links.filter((l) => clean(l.url)).slice(0, 2).map((l) => ({ ...l })),
  }
  letter.job.role = clean(b.headline).slice(0, 120)
  letter.source = { resumeDraftId: source.resumeDraftId ?? null, resumeRemoteId: source.resumeRemoteId ?? null }
  return { letter, design: { ...design }, facts: resumeFacts(resume) }
}
