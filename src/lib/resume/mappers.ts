import type { ResumeData } from "@/lib/pdf/extractSections"

import { autoLabel } from "./links"
import { newId, type ResumeDocument, type ResumeSection } from "./schema"

/**
 * Imported resume (the shared reader's output, StructuredResume plus extras) -> ResumeDocument.
 * Never invents: anything the reader did not find stays empty for the person to fill in.
 */

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
}

/** One side of a date range: "Mar 2021", "03/2021", "2021-03", "2021" -> "2021-03" / "2021", else "". */
export function parseMonth(raw: string): string {
  const s = raw.trim().toLowerCase()
  let m = s.match(/^([a-z]{3,9})\.?\s+(\d{4})$/)
  if (m) {
    const mm = MONTHS[m[1].slice(0, 4)] ?? MONTHS[m[1].slice(0, 3)]
    if (mm) return `${m[2]}-${mm}`
  }
  m = s.match(/^(\d{1,2})[/.-](\d{4})$/)
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return `${m[2]}-${m[1].padStart(2, "0")}`
  m = s.match(/^(\d{4})-(\d{2})$/)
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return `${m[1]}-${m[2]}`
  m = s.match(/^(\d{4})$/)
  if (m) return m[1]
  return ""
}

const PRESENT = /^(present|current|now|today|ongoing|till date|to date)$/i

/** "Mar 2021 – Present" -> { start: "2021-03", end: "", current: true }. Unknown formats come back empty. */
export function parseRange(raw: string): { start: string; end: string; current: boolean } {
  const parts = raw.split(/\s*(?:–|—|-|to|until)\s*/i).filter(Boolean)
  if (parts.length === 0) return { start: "", end: "", current: false }
  const start = parseMonth(parts[0])
  const last = parts.length > 1 ? parts[parts.length - 1] : ""
  if (PRESENT.test(last.trim())) return { start, end: "", current: true }
  return { start, end: last ? parseMonth(last) : "", current: false }
}

const bullets = (lines: string[]) => lines.map((t) => t.trim()).filter(Boolean).map((text) => ({ id: newId("b"), text }))

function splitDescription(highlights: string[] | undefined, description: string) {
  if (highlights?.length) return highlights
  return description
    .split(/\n|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
}

export function resumeDataToDocument(r: ResumeData): ResumeDocument {
  const sections: ResumeSection[] = []

  if (r.experience.length) {
    sections.push({
      id: newId("s"),
      type: "experience",
      title: "",
      hidden: false,
      items: r.experience.slice(0, 30).map((e) => ({
        id: newId("x"),
        role: e.role.slice(0, 120),
        org: e.company.slice(0, 120),
        location: (e.location ?? "").slice(0, 120),
        ...parseRange(e.duration),
        bullets: bullets(splitDescription(e.highlights, e.description).slice(0, 20)).map((b) => ({ ...b, text: b.text.slice(0, 600) })),
      })),
    })
  }

  if (r.education.length) {
    sections.push({
      id: newId("s"),
      type: "education",
      title: "",
      hidden: false,
      items: r.education.slice(0, 12).map((e) => ({
        id: newId("e"),
        school: e.institution.slice(0, 160),
        degree: e.degree.slice(0, 160),
        location: "",
        ...parseRange(e.period),
        bullets: bullets(e.details ? [e.details] : []).map((b) => ({ ...b, text: b.text.slice(0, 600) })),
      })),
    })
  }

  if (r.projects.length) {
    sections.push({
      id: newId("s"),
      type: "projects",
      title: "",
      hidden: false,
      items: r.projects.slice(0, 20).map((p) => {
        const link = p.link && /^https:\/\//i.test(p.link) ? p.link.slice(0, 300) : ""
        return {
          id: newId("p"),
          name: p.name.slice(0, 120),
          role: "",
          link,
          linkLabel: link ? autoLabel(link).slice(0, 60) : "",
          start: "",
          end: "",
          current: false,
          bullets: bullets([p.description, p.tech.length ? `Built with ${p.tech.join(", ")}.` : ""]).map((b) => ({ ...b, text: b.text.slice(0, 600) })),
        }
      }),
    })
  }

  if (r.skills.length) {
    sections.push({
      id: newId("s"),
      type: "skills",
      title: "",
      hidden: false,
      items: [{ id: newId("k"), group: "", items: r.skills.slice(0, 40).map((s) => s.slice(0, 60)) }],
    })
  }

  if (r.certifications.length) {
    sections.push({
      id: newId("s"),
      type: "certifications",
      title: "",
      hidden: false,
      items: r.certifications.slice(0, 30).map((c) => ({
        id: newId("c"),
        title: c.name.slice(0, 200),
        subtitle: c.issuer.slice(0, 200),
        date: parseMonth(c.year),
        link: "",
        linkLabel: "",
        detail: "",
      })),
    })
  }

  if (r.extracurricular.length) {
    sections.push({
      id: newId("s"),
      type: "custom",
      title: "Activities",
      hidden: false,
      items: r.extracurricular.slice(0, 30).map((line) => ({
        id: newId("c"),
        title: line.slice(0, 200),
        subtitle: "",
        date: "",
        link: "",
        linkLabel: "",
        detail: "",
      })),
    })
  }

  const links = r.contact.links
    .filter((l) => l.length <= 280 && (/^https:\/\//i.test(l) || /^[\w.-]+\.[a-z]{2,}/i.test(l)))
    .slice(0, 6)
    .map((url) => {
      const cleanUrl = /^https:/i.test(url) ? url : `https://${url}`
      return { id: newId("l"), label: autoLabel(cleanUrl).slice(0, 40), url: cleanUrl }
    })

  return {
    version: 1,
    basics: {
      name: r.name.slice(0, 100),
      headline: r.title.slice(0, 140),
      email: r.contact.email.slice(0, 160),
      phone: r.contact.phone.slice(0, 40),
      location: (r.location ?? "").slice(0, 120),
      summary: (r.summary || r.about || "").slice(0, 1200),
      links,
    },
    personal: { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" },
    sections: sections.length
      ? sections
      : [
          { id: newId("s"), type: "experience", title: "", hidden: false, items: [] },
          { id: newId("s"), type: "education", title: "", hidden: false, items: [] },
          { id: newId("s"), type: "skills", title: "", hidden: false, items: [] },
        ],
  }
}
