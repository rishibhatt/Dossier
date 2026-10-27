import { autoLabel } from "./links"
import type { ResumeDocument, ResumeSection } from "./schema"

/**
 * Builders for the synthetic sample resumes (samples.ts, sampleLibrary.ts). Ids come from one counter, so they
 * are stable for a given import order. Every person built here is fictional.
 */

let seq = 0
export const sid = (p: string) => `${p}${(++seq).toString(36).padStart(4, "0")}`
export const b = (...lines: string[]) => lines.map((text) => ({ id: sid("b"), text }))

export type Job = { role: string; org: string; location?: string; start: string; end?: string; current?: boolean; bullets: string[] }
export type School = { school: string; degree: string; location?: string; start: string; end: string; bullets?: string[] }
export type Project = { name: string; role?: string; link?: string; linkLabel?: string; start: string; end?: string; bullets: string[] }
export type Entry = { title: string; subtitle?: string; date?: string; link?: string; linkLabel?: string; detail?: string }

export function experience(jobs: Job[], type: "experience" | "volunteering" = "experience"): ResumeSection {
  return {
    id: sid("s"),
    type,
    title: "",
    hidden: false,
    items: jobs.map((j) => ({
      id: sid("x"),
      role: j.role,
      org: j.org,
      location: j.location ?? "",
      start: j.start,
      end: j.end ?? "",
      current: j.current ?? false,
      bullets: b(...j.bullets),
    })),
  }
}

export function education(schools: School[]): ResumeSection {
  return {
    id: sid("s"),
    type: "education",
    title: "",
    hidden: false,
    items: schools.map((s) => ({
      id: sid("e"),
      school: s.school,
      degree: s.degree,
      location: s.location ?? "",
      start: s.start,
      end: s.end,
      current: false,
      bullets: b(...(s.bullets ?? [])),
    })),
  }
}

export function skills(groups: [string, string[]][]): ResumeSection {
  return {
    id: sid("s"),
    type: "skills",
    title: "",
    hidden: false,
    items: groups.map(([group, items]) => ({ id: sid("k"), group, items })),
  }
}

export function projects(items: Project[]): ResumeSection {
  return {
    id: sid("s"),
    type: "projects",
    title: "",
    hidden: false,
    items: items.map((p) => ({
      id: sid("p"),
      name: p.name,
      role: p.role ?? "",
      link: p.link ?? "",
      linkLabel: p.linkLabel ?? (p.link ? autoLabel(p.link) : ""),
      start: p.start,
      end: p.end ?? "",
      current: false,
      bullets: b(...p.bullets),
    })),
  }
}

export function entries(type: "certifications" | "awards" | "publications" | "custom", items: Entry[], title = ""): ResumeSection {
  return {
    id: sid("s"),
    type,
    title,
    hidden: false,
    items: items.map((e) => ({
      id: sid("c"),
      title: e.title,
      subtitle: e.subtitle ?? "",
      date: e.date ?? "",
      link: e.link ?? "",
      linkLabel: e.linkLabel ?? (e.link ? autoLabel(e.link) : ""),
      detail: e.detail ?? "",
    })),
  }
}

export function languages(items: [string, string][]): ResumeSection {
  return {
    id: sid("s"),
    type: "languages",
    title: "",
    hidden: false,
    items: items.map(([language, level]) => ({ id: sid("g"), language, level })),
  }
}

const NO_PERSONAL = { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" }

export function resume(
  basics: Omit<ResumeDocument["basics"], "links"> & { links?: [string, string][] },
  sections: ResumeSection[],
  personal: Partial<ResumeDocument["personal"]> = {},
): ResumeDocument {
  const { links = [], ...rest } = basics
  return {
    version: 1,
    basics: { ...rest, links: links.map(([label, url]) => ({ id: sid("l"), label: autoLabel(url, label), url })) },
    personal: { ...NO_PERSONAL, ...personal },
    sections,
  }
}
