import type { EducationEntry, ExperienceEntry, ProjectEntry, StructuredResume } from "@/types/dossier"

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const URL_RE = /https?:\/\/[^\s)]+/gi
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,9}/g

function normalizeLines(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

function sliceBetween(lines: string[], startIdx: number, endIdx: number): string[] {
  if (startIdx < 0) return []
  const end = endIdx < 0 ? lines.length : endIdx
  return lines.slice(startIdx + 1, end)
}

/** Match line as a section header (common resume headings). */
function headerIndex(lines: string[], labels: string[]): number {
  const upperLines = lines.map((l) => l.toUpperCase().replace(/[:#]/g, "").trim())
  for (let i = 0; i < upperLines.length; i++) {
    const line = upperLines[i]
    for (const label of labels) {
      if (line === label || line.startsWith(`${label} `) || line === `${label}:`) {
        return i
      }
    }
  }
  return -1
}

function extractEmails(text: string): string[] {
  const m = text.match(EMAIL_RE)
  return m ? [...new Set(m.map((e) => e.toLowerCase()))] : []
}

function extractPhones(text: string): string[] {
  const m = text.match(PHONE_RE)
  return m ? [...new Set(m.map((p) => p.trim()))] : []
}

function extractLinks(text: string): string[] {
  const m = text.match(URL_RE)
  return m ? [...new Set(m)] : []
}

function parseExperienceBlock(block: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = []
  const chunks = block.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean)

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue
    const head = lines[0]
    const durationMatch = head.match(
      /(.+?)\s*[|–—-]\s*(.+?\d{4}.*?)(?:\s*$|\s*\||\s*@)/i
    )
    let company = ""
    let role = head
    let duration = ""
    if (durationMatch) {
      role = durationMatch[1].trim()
      duration = durationMatch[2].trim()
    } else {
      const pipe = head.split(/\s*[|]\s*/)
      if (pipe.length >= 2) {
        role = pipe[0].trim()
        company = pipe[1].trim()
      }
    }
    const description = lines.slice(1).join(" ").trim()
    entries.push({
      company: company || role,
      role: role || "Role",
      duration: duration || "",
      description,
    })
  }

  if (entries.length === 0 && block.trim()) {
    entries.push({
      company: "Experience",
      role: "Summary",
      duration: "",
      description: block.trim(),
    })
  }

  return entries
}

function parseProjectsBlock(block: string): ProjectEntry[] {
  const items: ProjectEntry[] = []
  const chunks = block.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean)
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean)
    if (!lines[0]) continue
    const name = lines[0].replace(/^[-*•]\s*/, "")
    const rest = lines.slice(1).join(" ")
    const tech = rest.match(/\[([^\]]+)\]/)?.[1]?.split(/[,|]/)?.map((t) => t.trim()).filter(Boolean) ?? []
    items.push({
      name,
      description: rest.replace(/\[[^\]]+\]/, "").trim() || name,
      tech,
    })
  }
  if (items.length === 0 && block.trim()) {
    items.push({ name: "Project", description: block.trim(), tech: [] })
  }
  return items
}

function parseEducationBlock(block: string): EducationEntry[] {
  const entries: EducationEntry[] = []
  const chunks = block.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean)
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean)
    if (!lines[0]) continue
    const head = lines[0]
    const periodMatch = head.match(/(\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*Present)/i)
    const period = periodMatch?.[0]?.trim() ?? ""
    const institution = head.replace(period, "").replace(/[,|]/g, " ").trim()
    entries.push({
      institution: institution || "Institution",
      degree: lines[1] ?? "",
      period,
      details: lines.slice(2).join(" "),
    })
  }
  if (entries.length === 0 && block.trim()) {
    entries.push({
      institution: "Education",
      degree: "",
      period: "",
      details: block.trim(),
    })
  }
  return entries
}

function parseSkillsBlock(block: string): string[] {
  const flat = block.replace(/\n/g, ",")
  return flat
    .split(/[,;|•\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 80)
}

/**
 * Heuristic + regex extraction — replace with ML / layout parser when needed.
 */
export function extractStructuredResume(rawText: string): StructuredResume {
  const lines = normalizeLines(rawText)
  const emails = extractEmails(rawText)
  const phones = extractPhones(rawText)
  const links = extractLinks(rawText)

  const summaryIdx = headerIndex(lines, ["SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT"])
  const expIdx = headerIndex(lines, ["EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT"])
  const projIdx = headerIndex(lines, ["PROJECTS", "SELECTED PROJECTS", "KEY PROJECTS"])
  const eduIdx = headerIndex(lines, ["EDUCATION", "ACADEMIC"])
  const skillsIdx = headerIndex(lines, ["SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "COMPETENCIES"])

  const indices = [summaryIdx, expIdx, projIdx, eduIdx, skillsIdx]
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)

  const nextIndex = (from: number) => {
    const sorted = indices.filter((i) => i > from)
    return sorted.length ? sorted[0] : lines.length
  }

  let name = ""
  const first = lines[0] ?? ""
  if (first && !first.includes("@") && first.length < 90 && !/^https?:/i.test(first)) {
    name = first.replace(/\s{2,}/g, " ")
  }

  let title = lines[1] && lines[1] !== first ? lines[1] : ""
  if (title.length > 120) title = ""

  let summary = ""
  if (summaryIdx >= 0) {
    summary = sliceBetween(lines, summaryIdx, nextIndex(summaryIdx)).join("\n").trim()
  } else if (expIdx > 1) {
    summary = lines.slice(1, expIdx).join("\n").trim()
  }

  const experienceText =
    expIdx >= 0 ? sliceBetween(lines, expIdx, nextIndex(expIdx)).join("\n") : ""
  const projectsText =
    projIdx >= 0 ? sliceBetween(lines, projIdx, nextIndex(projIdx)).join("\n") : ""
  const educationText =
    eduIdx >= 0 ? sliceBetween(lines, eduIdx, nextIndex(eduIdx)).join("\n") : ""
  const skillsText =
    skillsIdx >= 0 ? sliceBetween(lines, skillsIdx, nextIndex(skillsIdx)).join("\n") : ""

  const skills = skillsText ? parseSkillsBlock(skillsText) : []
  const experience = experienceText ? parseExperienceBlock(experienceText) : []
  const projects = projectsText ? parseProjectsBlock(projectsText) : []
  const education = educationText ? parseEducationBlock(educationText) : []

  return {
    name: name || (emails[0]?.split("@")[0] ?? "Candidate"),
    title: title || "Professional",
    summary: summary || rawText.slice(0, 800).trim(),
    skills,
    experience,
    projects,
    education,
    contact: {
      email: emails[0] ?? "",
      phone: phones[0] ?? "",
      links,
    },
  }
}
