import { cleanResumeLines } from "@/lib/ai/compactResumeText"
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  HighlightEntry,
  ProjectEntry,
  StructuredResume,
} from "@/types/dossier"

/**
 * The offline resume reader: fast first pass for the live preview, the facts the AI may miss, and the
 * whole answer when every model is down. Line-based (works on cleanResumeLines output, where bullets are "- ").
 * Never invents: anything it cannot find stays empty.
 */

/** Everything the pipeline knows about a resume. Extends the client contract (StructuredResume) with the newer sections. */
export type ResumeData = StructuredResume & {
  location: string
  certifications: CertificationEntry[]
  highlights: HighlightEntry[]
  /** Awards, volunteering, activities (one line each). */
  extracurricular: string[]
  /** Hero one-liner, when the AI wrote one. */
  tagline?: string
  /** First-person about text, when the AI wrote one. */
  about?: string
}

type SectionKey = "summary" | "experience" | "projects" | "education" | "skills" | "certifications" | "awards" | "activities" | "ignore"

const HEADINGS: Record<SectionKey, string[]> = {
  summary: ["summary", "professional summary", "career summary", "profile", "professional profile", "about", "about me", "objective", "career objective", "overview", "personal statement", "introduction"],
  experience: ["experience", "work experience", "professional experience", "relevant experience", "employment", "employment history", "work history", "career history", "experience history", "internships", "internship"],
  projects: ["projects", "personal projects", "selected projects", "key projects", "academic projects", "side projects", "notable projects", "portfolio", "open source"],
  education: ["education", "academic background", "education & training", "education and training", "academics", "academic qualifications", "qualifications", "education & certifications"],
  skills: ["skills", "technical skills", "core skills", "key skills", "core competencies", "competencies", "expertise", "areas of expertise", "tools", "technologies", "tech stack", "skills & tools", "skills and tools", "toolbox", "skills & interests", "skills & expertise"],
  certifications: ["certifications", "certification", "certificates", "licenses", "licences", "licenses & certifications", "licenses and certifications", "certifications & licenses", "certifications and licenses", "credentials", "training", "courses"],
  awards: ["awards", "honors", "honours", "awards & honors", "awards and honors", "honors & awards", "achievements", "accomplishments", "key achievements"],
  activities: ["volunteer", "volunteering", "volunteer experience", "extracurricular", "extracurricular activities", "activities", "leadership", "community", "leadership & activities"],
  ignore: ["references", "publications", "languages", "interests", "hobbies", "contact", "contact information", "personal details", "personal information"],
}

const HEADING_LOOKUP = new Map<string, SectionKey>()
for (const [key, list] of Object.entries(HEADINGS) as [SectionKey, string[]][]) for (const h of list) HEADING_LOOKUP.set(h, key)

const normHeading = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z& ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

/** A heading line ("EXPERIENCE", "Work Experience:"), or an inline one ("SKILLS BLS, ACLS" / "Skills: Python, Go"). */
function matchHeading(line: string): { key: SectionKey; rest: string } | null {
  if (line.startsWith("- ")) return null
  if (line.length <= 42 && !/\d/.test(line)) {
    const key = HEADING_LOOKUP.get(normHeading(line))
    if (key) return { key, rest: "" }
  }
  const words = line.split(" ")
  for (let k = Math.min(4, words.length - 1); k >= 1; k--) {
    const head = words.slice(0, k).join(" ")
    const key = HEADING_LOOKUP.get(normHeading(head))
    if (!key) continue
    const colon = /:$/.test(head)
    const caps = head.replace(/[^A-Za-z]/g, "") === head.replace(/[^A-Za-z]/g, "").toUpperCase()
    if (colon || caps) {
      const rest = words.slice(k).join(" ").replace(/^[:\s-]+/, "").trim()
      if (rest) return { key, rest }
    }
  }
  return null
}

/* ---------- patterns ---------- */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const URL_RE = /\bhttps?:\/\/[^\s)|,]+/gi
const PROFILE_RE = /\b(?:www\.)?(?:linkedin\.com\/(?:in|company)\/[\w%-]+|github\.com\/[\w-]+(?:\/[\w.-]+)?|gitlab\.com\/[\w-]+|behance\.net\/[\w-]+|dribbble\.com\/[\w-]+|medium\.com\/@?[\w-]+)\/?/gi
const BARE_SITE_RE = /\b(?:www\.)?[a-z0-9-]+\.(?:dev|io|me|design|co|com|net|org|app|site|xyz|in)(?:\/[\w/-]*)?\b/gi
const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,5}\)[\s.-]?)?\d[\d\s.-]{5,14}\d/g

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?"
const DATE_TOKEN = `(?:${MONTH}\\s*['’]?\\d{2,4}|\\d{1,2}[/.-]\\d{4}|(?:19|20)\\d{2})`
const RANGE_RE = new RegExp(`${DATE_TOKEN}\\s*(?:-|–|—|to|until)\\s*(?:${DATE_TOKEN}|present|current|now|today|ongoing|date)`, "i")
const SINGLE_DATE_RE = new RegExp(`${MONTH}\\s*\\d{4}|\\b(?:19|20)\\d{2}\\b`, "i")
const YEAR_RE = /\b(?:19|20)\d{2}\b/g

const ROLE_WORDS =
  /\b(engineer|developer|designer|manager|lead|director|head|analyst|consultant|specialist|architect|scientist|intern|trainee|associate|assistant|officer|coordinator|executive|administrator|nurse|teacher|lecturer|professor|researcher|chef|cook|accountant|auditor|writer|editor|producer|founder|co-founder|owner|president|vp|cto|ceo|cfo|coo|cmo|technician|representative|agent|adviser|advisor|strategist|marketer|recruiter|programmer|tester|qa|sre|devops|supervisor|operator|clerk|attorney|lawyer|paralegal|pharmacist|physician|doctor|therapist|tutor|instructor|mentor|fellow|apprentice|freelancer?|contractor|partner|principal|cashier|barista|sales\w*|photographer|artist|illustrator|animator)\b/i
const COMPANY_WORDS =
  /\b(inc|llc|ltd|limited|corp|corporation|company|gmbh|plc|pvt|technologies|technology|labs?|solutions|hospital|clinic|university|college|school|bank|group|agency|studios?|systems|services|software|consulting|partners|foundation|institute|health|media|capital|ventures)\b\.?/i
const DEGREE_WORDS =
  /\b(b\.?\s?sc|bsc|m\.?\s?sc|msc|b\.?\s?a\.?(?=\s|,|$)|m\.?\s?a\.?(?=\s|,|$)|b\.?\s?s\.?(?=\s|,|$)|m\.?\s?s\.?(?=\s|,|$)|b\.?\s?e\.?(?=\s|,|$)|m\.?\s?e\.?(?=\s|,|$)|b\.?\s?tech|m\.?\s?tech|bba|mba|b\.?\s?com|m\.?\s?com|ph\.?\s?d|doctorate|bachelor\w*|master\w*|associate\w* degree|diploma|certificate|high school|secondary school|a-levels?|hsc|ssc|ged|llb|llm|mbbs|bds|j\.?d\.?(?=\s|,|$)|m\.?d\.?(?=\s|,|$))/i
const INSTITUTION_WORDS = /\b(university|college|institute|school|academy|polytechnic|iit|nit|iim|conservatory|faculty|universit\w+)\b/i
const LOCATION_RE = /^(?:remote|hybrid|[A-Z][A-Za-z.'-]+(?: [A-Z][A-Za-z.'-]+){0,2},\s?(?:[A-Z]{2}|[A-Z][A-Za-z.'-]+(?: [A-Z][A-Za-z.'-]+)?)(?:\s\d{4,6})?)(?:\s?\((?:remote|hybrid)\))?$/i

const SEP_RE = /\s*(?:\||•|·|◆|♦|▪|\s[–—-]\s)\s*/

/* ---------- small helpers ---------- */

const isBullet = (l: string) => l.startsWith("- ")
const unbullet = (l: string) => l.replace(/^-\s+/, "").trim()
const squash = (s: string) => s.replace(/\s+/g, " ").trim()
const trimTo = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/[\s,;:]+\S*$/, "")}…`)

function uniq(items: string[], max: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of items) {
    const v = squash(raw)
    const k = v.toLowerCase()
    if (!v || seen.has(k)) continue
    seen.add(k)
    out.push(v)
    if (out.length >= max) break
  }
  return out
}

/** "PRIYA NAIR" -> "Priya Nair". Mixed-case names are left alone. */
function titleCase(s: string): string {
  if (s !== s.toUpperCase()) return s
  return s.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase())
}

const isSentence = (l: string) => l.length > 95 || (/[.!]$/.test(l) && l.split(" ").length > 8)
const looksLikeHead = (l: string) => l.length <= 95 && !/[.;,]$/.test(l) && /^[\p{Lu}\d]/u.test(l)

/** Joined bullets: the one-paragraph `description` for renderers that do not list highlights. */
export function bulletsToDescription(bullets: string[]): string {
  return bullets
    .map((b) => squash(b.replace(/^[-•*\s]+/, "")))
    .filter(Boolean)
    .map((b) => (/[.!?)]$/.test(b) ? b : `${b}.`))
    .join(" ")
}

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) ?? []).map((s) => s.trim()).filter((s) => s.length > 2)
}

function normalizeUrl(u: string): string {
  const t = u.replace(/[.,;)]+$/, "")
  return /^https?:\/\//i.test(t) ? t : `https://${t.replace(/^www\./i, "www.")}`
}

/* ---------- contact ---------- */

function findLinks(text: string, headerText: string): string[] {
  const noEmail = (s: string) => s.replace(EMAIL_RE, " ")
  const urls = [...(noEmail(text).match(URL_RE) ?? []), ...(noEmail(text).match(PROFILE_RE) ?? [])]
  const bare = (noEmail(headerText).match(BARE_SITE_RE) ?? []).filter((u) => !/\.(?:js|ts|net)$/i.test(u) || /\//.test(u))
  const all = uniq([...urls, ...bare].map(normalizeUrl), 12)
  // drop "https://linkedin.com/in/x" when "https://www.linkedin.com/in/x" is also there, and plain duplicates
  const key = (u: string) => u.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
  const seen = new Set<string>()
  return all.filter((u) => {
    const k = key(u)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function findPhone(text: string): string {
  for (const m of text.match(PHONE_RE) ?? []) {
    const digits = m.replace(/\D/g, "")
    if (digits.length < 9 || digits.length > 15) continue
    if (RANGE_RE.test(m) || /^(?:19|20)\d{2}\s*[-–]\s*(?:19|20)\d{2}$/.test(m.trim())) continue
    return m.trim()
  }
  return ""
}

/* ---------- sections ---------- */

type Split = { header: string[]; sections: Map<SectionKey, string[]> }

function splitSections(lines: string[]): Split {
  const header: string[] = []
  const sections = new Map<SectionKey, string[]>()
  let current: string[] = header
  let currentKey: SectionKey | null = null
  for (const line of lines) {
    const h = matchHeading(line)
    // "Languages: Go, SQL" / "Tools: Figma" inside SKILLS is a skill group, not a new section
    if (h && !(h.rest && currentKey === "skills")) {
      currentKey = h.key
      const list = sections.get(h.key) ?? []
      sections.set(h.key, list)
      current = list
      if (h.rest) current.push(h.rest)
      continue
    }
    current.push(line)
  }
  return { header, sections }
}

type Draft = { head: string[]; bullets: string[]; hasRange: boolean }

/** Groups a section's lines into entries: a head (1-3 short lines) followed by bullets or sentences. */
function groupEntries(lines: string[]): Draft[] {
  const out: Draft[] = []
  let cur: Draft | null = null
  for (const line of lines) {
    if (isBullet(line)) {
      if (!cur) {
        cur = { head: [], bullets: [], hasRange: false }
        out.push(cur)
      }
      cur.bullets.push(unbullet(line))
      continue
    }
    const hasRange = RANGE_RE.test(line)
    if (cur && isSentence(line) && !hasRange) {
      cur.bullets.push(line)
      continue
    }
    const startNew = !cur || (cur.bullets.length > 0 && (hasRange || looksLikeHead(line))) || (hasRange && cur.hasRange) || cur.head.length >= 3
    if (startNew) {
      cur = { head: [line], bullets: [], hasRange }
      out.push(cur)
    } else if (cur) {
      cur.head.push(line)
      cur.hasRange ||= hasRange
    }
  }
  return out
}

/** Pulls "City, ST" / "Remote" out of a head string. */
function takeLocation(parts: string[]): { location: string; rest: string[] } {
  const rest: string[] = []
  let location = ""
  for (const p of parts) {
    if (!location && LOCATION_RE.test(p) && !ROLE_WORDS.test(p) && !COMPANY_WORDS.test(p)) location = p
    else rest.push(p)
  }
  return { location, rest }
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = []
  for (const d of groupEntries(lines)) {
    let text = d.head.join(" | ")
    let duration = ""
    const bullets = [...d.bullets]
    const range = text.match(RANGE_RE) ?? text.match(SINGLE_DATE_RE)
    if (range && range.index !== undefined) {
      duration = range[0].trim()
      const after = text.slice(range.index + range[0].length)
      text = text.slice(0, range.index)
      // "Staff Nurse, City Hospital Pune, 2017 - present. ICU care, triage ..." -> the tail is the description
      const tail = after.replace(/^[\s.,;:|)–—-]+/, "").trim()
      if (tail.length > 30) bullets.unshift(...splitSentences(tail))
      else if (tail) text = `${text} | ${tail}`
    }
    const tidy = (s: string) => squash(s.replace(/^[,;:\s]+|[,;:\s]+$/g, ""))
    const coarse = text
      .replace(/[()]/g, " ")
      .replace(/,\s*(remote|hybrid)\b/gi, " | $1")
      .split(/\s*\|\s*|\s+(?:at|@)\s+|\s[–—-]\s/)
      .map(tidy)
      .filter(Boolean)
    // "San Francisco, CA" is one piece: take the location before splitting on commas
    const { location, rest: kept } = takeLocation(coarse)
    const fine = kept.flatMap((p) => p.split(/,\s*(?=[A-Z])/).map(tidy)).filter(Boolean)
    const { location: loc2, rest } = location ? { location, rest: fine } : takeLocation(fine)
    const roleIdx = rest.findIndex((p) => ROLE_WORDS.test(p) && !COMPANY_WORDS.test(p))
    const role = roleIdx >= 0 ? rest[roleIdx]! : (rest[0] ?? "")
    const others = rest.filter((_, i) => i !== (roleIdx >= 0 ? roleIdx : 0))
    const company = others.find((p) => COMPANY_WORDS.test(p)) ?? others[0] ?? ""
    const highlights = uniq(bullets, 8).slice(0, 5).map((b) => trimTo(b, 160))
    if (!role && !company && !highlights.length) continue
    entries.push({
      company,
      role,
      duration,
      description: bulletsToDescription(uniq(bullets, 8)),
      highlights,
      ...(loc2 ? { location: loc2 } : {}),
    })
  }
  return entries.slice(0, 10)
}

const TECH_LINE = /^(?:tech(?:nologies|nology| stack)?|stack|built with|tools|tools used|languages)\s*[:\-–]\s*/i

function parseProjects(lines: string[]): ProjectEntry[] {
  const out: ProjectEntry[] = []
  for (const d of groupEntries(lines)) {
    const all = [...d.head, ...d.bullets]
    const link = all.map((l) => l.match(URL_RE)?.[0] ?? l.match(PROFILE_RE)?.[0]).find(Boolean)
    let tech: string[] = []
    const desc: string[] = []
    for (const l of d.bullets) {
      if (TECH_LINE.test(l)) tech.push(...l.replace(TECH_LINE, "").split(/[,;|/]/))
      else desc.push(l.replace(URL_RE, "").trim())
    }
    const headLine = (d.head[0] ?? desc.shift() ?? "").replace(URL_RE, "").replace(RANGE_RE, "").replace(SINGLE_DATE_RE, "").trim()
    const bracket = headLine.match(/\[([^\]]+)\]|\(([^)]+)\)/)
    const parts = headLine.replace(/\[[^\]]+\]/, "").split(/\s*\|\s*|\s[–—-]\s|:\s+/)
    const name = squash(parts[0] ?? "").replace(/[,;:\s]+$/, "")
    for (const p of parts.slice(1)) {
      if (/,/.test(p) && p.split(",").every((x) => x.trim().split(" ").length <= 3)) tech.push(...p.split(","))
      else if (p.trim()) desc.unshift(p.trim())
    }
    if (bracket) tech.push(...(bracket[1] ?? bracket[2] ?? "").split(/[,|]/))
    const headDesc: string[] = []
    for (const h of d.head.slice(1)) {
      if (TECH_LINE.test(h)) tech.push(...h.replace(TECH_LINE, "").split(/[,;|/]/))
      else {
        const t = h.replace(URL_RE, "").replace(PROFILE_RE, "").trim()
        if (t.length > 2) headDesc.push(t)
      }
    }
    desc.splice(0, 0, ...headDesc)
    tech = uniq(tech.map((t) => t.replace(/[.)\]]+$/, "")).filter((t) => t.trim().length > 1 && t.trim().length < 30), 8)
    if (!name && !desc.length) continue
    const description = trimTo(squash(desc.join(" ")), 320)
    out.push({ name: name || "Project", description: description.toLowerCase() === name.toLowerCase() ? "" : description, tech, link: link ? normalizeUrl(link) : null })
  }
  return out.slice(0, 8)
}

function parseEducation(lines: string[]): EducationEntry[] {
  const out: EducationEntry[] = []
  let cur: EducationEntry | null = null
  const push = () => {
    if (cur && (cur.institution || cur.degree)) out.push(cur)
  }
  for (const raw of lines) {
    const line = unbullet(raw)
    const parts = line.split(/\s*(?:\||,(?!\s*\d{4}\s*$)|\s[–—-]\s)\s*/).map(squash).filter(Boolean)
    const period = line.match(RANGE_RE)?.[0] ?? line.match(SINGLE_DATE_RE)?.[0] ?? ""
    // "University of California, Berkeley": a line naming only a school keeps its commas
    const wholeInst = INSTITUTION_WORDS.test(line) && !DEGREE_WORDS.test(line) ? squash(line.replace(RANGE_RE, "").replace(SINGLE_DATE_RE, "").replace(/[,|\s–—-]+$/, "")) : ""
    const inst = wholeInst || parts.find((p) => INSTITUTION_WORDS.test(p) && !DEGREE_WORDS.test(p.split(" ")[0] ?? ""))
    const degree = parts.find((p) => DEGREE_WORDS.test(p) && p !== inst)
    if (!cur || (inst && cur.institution) || (degree && cur.degree && !inst)) {
      if (inst || degree || !cur) {
        push()
        cur = { institution: "", degree: "", period: "", details: "" }
      }
    }
    const c: EducationEntry = cur!
    if (inst && !c.institution) c.institution = inst.replace(RANGE_RE, "").replace(SINGLE_DATE_RE, "").replace(/[,\s]+$/, "").trim()
    if (degree && !c.degree) c.degree = degree.replace(RANGE_RE, "").replace(SINGLE_DATE_RE, "").replace(/[,\s]+$/, "").trim()
    if (period && !c.period) c.period = period
    const extra = parts.filter((p) => p !== inst && p !== degree && !RANGE_RE.test(p) && !/^\s*(?:19|20)\d{2}\s*$/.test(p) && !LOCATION_RE.test(p))
    if (extra.length && (inst || degree)) {
      // leftover words next to a degree line (major, honors) stay as details
      const more = extra.join(", ")
      if (/gpa|cgpa|honou?rs|cum laude|distinction|grade|%|first class|dean/i.test(more) || isBullet(raw)) c.details = squash(`${c.details} ${more}`)
    } else if (!inst && !degree && line && !period) {
      c.details = squash(`${c.details} ${line}`)
    }
  }
  push()
  return out.map((e) => ({ ...e, details: trimTo(e.details, 200) })).slice(0, 6)
}

function parseSkills(lines: string[]): string[] {
  const items: string[] = []
  for (const raw of lines) {
    const line = unbullet(raw).replace(/^[A-Za-z &/]{2,30}:\s*/, "")
    for (const part of line.split(/\s*(?:[,;|•·]|\s\/\s)\s*/)) {
      const s = part.replace(/^(?:and|&)\s+/i, "").replace(/[.\s]+$/, "").trim()
      if (s.length >= 2 && s.length <= 40 && s.split(" ").length <= 5) items.push(s)
    }
  }
  return uniq(items, 30)
}

const ISSUERS =
  /\b(AWS|Amazon Web Services|Google(?: Cloud)?|Microsoft|Coursera|Udemy|edX|PMI|Cisco|Oracle|Scrum Alliance|Scrum\.org|CompTIA|Meta|IBM|Salesforce|HubSpot|American Heart Association|AHA|Red Cross|ISC2|ISACA|Linux Foundation|CNCF|HashiCorp|Adobe|Autodesk|Tableau|Databricks|Snowflake|NVIDIA|SHRM|CFA Institute|AICPA|ACCA|ICAI)\b/i

function parseCertifications(lines: string[]): CertificationEntry[] {
  const out: CertificationEntry[] = []
  for (const raw of lines) {
    let line = squash(unbullet(raw))
    if (line.length < 3) continue
    const years = line.match(YEAR_RE)
    const year = years ? years[years.length - 1]! : ""
    line = line.replace(RANGE_RE, "").replace(new RegExp(`(?:${MONTH}\\s*)?${year || "$^"}`, "i"), "").replace(/[\s,|(–—-]+$/, "").trim()
    let name = line
    let issuer = ""
    const paren = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
    const split = line.split(/\s*(?:\||\s[–—-]\s|,\s|\sby\s|\sfrom\s)\s*/)
    if (paren) {
      name = paren[1]!
      issuer = paren[2]!
    } else if (split.length >= 2) {
      const iss = split.findIndex((p, i) => i > 0 && (ISSUERS.test(p) || p.split(" ").length <= 4))
      if (iss > 0) {
        issuer = split[iss]!
        name = split.filter((_, i) => i !== iss).join(", ")
      }
    }
    if (!issuer) issuer = name.match(ISSUERS)?.[0] ?? ""
    name = squash(name.replace(/[,\s]+$/, ""))
    if (name) out.push({ name: trimTo(name, 90), issuer: squash(issuer), year })
  }
  return out.slice(0, 8)
}

function parseList(lines: string[]): string[] {
  return uniq(lines.map(unbullet).filter((l) => l.length > 2 && l.length < 300), 10)
}

/* ---------- highlights: real numbers only ---------- */

const PAST_VERB = /^(?:[a-z]+ed|cut|grew|won|built|led|ran|made|sold|drove|brought|wrote|taught|shipped)$/i
const STOP = /^(?:and|with|using|via|through|while|which|that|to|for|in|on|at|by|from|across|per|of|within|over|under)$/i
const UNIT_AFTER = /^(?:years?|yrs?|months?|weeks?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|am|pm|st|nd|rd|th|x\b)/i

/** "Reduced page load time" -> "page load time reduced", so the label reads under a big number. */
function verbLast(clause: string): string {
  const words = clause.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2 && PAST_VERB.test(words[0]!)) return `${words.slice(1).join(" ")} ${words[0]!.toLowerCase()}`
  return words.join(" ")
}

function labelAfter(text: string, from: number): string {
  const words = text.slice(from).replace(/^[\s+]+/, "").split(/\s+/)
  const out: string[] = []
  for (const w of words) {
    const clean = w.replace(/[^\p{L}\p{N}&'-]/gu, "")
    if (!clean) break
    if (STOP.test(clean) && (out.length > 0 || !/^(?:in|of|for)$/i.test(clean))) break
    if (out.length === 0 && /^(?:in|of|for)$/i.test(clean)) continue
    out.push(clean)
    if (/[.,;:)]$/.test(w) || out.length >= 5) break
  }
  return out.join(" ")
}

function labelBefore(text: string, idx: number): string {
  const before = text.slice(0, idx).replace(/\b(?:by|of|to|than)\s*$/i, "").trim()
  const clause = before.split(/[,;:.()]/).pop() ?? ""
  const words = clause.trim().split(/\s+/).filter(Boolean).slice(-6)
  return verbLast(words.join(" "))
}

export function findHighlights(texts: string[]): HighlightEntry[] {
  const found: { h: HighlightEntry; rank: number }[] = []
  const add = (value: string, label: string, rank: number) => {
    const l = squash(label).replace(/^[^\p{L}]+/u, "")
    if (l.length < 3 || l.length > 60 || l.split(" ").length > 7) return
    found.push({ h: { value: value.trim(), label: l.charAt(0).toLowerCase() + l.slice(1) }, rank })
  }
  for (const t of texts) {
    const text = squash(t)
    const yrs = text.match(/\b(\d{1,2})(\+)?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)\b/i)
    if (yrs) add(`${yrs[1]}${yrs[2] ?? ""}`, "years of experience", 1)
    for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s?%/g)) {
      const value = `${m[1]}%`
      const idx = m.index ?? 0
      const after = labelAfter(text, idx + m[0].length)
      const before = labelBefore(text, idx)
      add(value, /\bby\s*$/i.test(text.slice(0, idx)) || !after ? before : after, 0)
    }
    for (const m of text.matchAll(/([$€£₹])\s?(\d[\d,.]*)\s?(k|m|mm|b|bn|million|billion|thousand|cr|crore|lakh)?\b(\+)?/gi)) {
      const value = `${m[1]}${m[2]!.replace(/[.,]$/, "")}${m[3] ? (m[3].length <= 2 ? m[3].toUpperCase() : ` ${m[3].toLowerCase()}`) : ""}${m[4] ?? ""}`
      const idx = m.index ?? 0
      const after = labelAfter(text, idx + m[0].length)
      add(value, after || labelBefore(text, idx), 0)
    }
    for (const m of text.matchAll(/(?<![\d.,$€£₹#-])(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?[kKmM]?)(\+)?\s+(?=[a-z])/g)) {
      const raw = m[1]!
      const n = Number(raw.replace(/[,kKmM]/g, ""))
      if (/^(?:19|20)\d{2}$/.test(raw) || n < 2) continue
      const rest = text.slice((m.index ?? 0) + m[0].length)
      if (UNIT_AFTER.test(rest)) continue
      const label = labelAfter(text, (m.index ?? 0) + m[0].length)
      const verb = text.slice(0, m.index ?? 0).trim().split(/\s+/).pop() ?? ""
      add(`${raw}${m[2] ?? ""}`, PAST_VERB.test(verb) && !/ed$/i.test(label) ? `${label} ${verb.toLowerCase()}` : label, 2)
    }
  }
  const seen = new Set<string>()
  return found
    .sort((a, b) => a.rank - b.rank)
    .map((f) => f.h)
    .filter((h) => (seen.has(h.value) ? false : (seen.add(h.value), true)))
    .slice(0, 4)
}

/* ---------- header ---------- */

function readHeader(header: string[], emails: string[], phone: string) {
  const tokens: { text: string; line: number }[] = []
  header.forEach((l, i) => {
    for (const t of l.split(SEP_RE)) if (t.trim()) tokens.push({ text: t.trim(), line: i })
  })
  const isContact = (t: string) =>
    emails.some((e) => t.toLowerCase().includes(e)) ||
    (phone && t.replace(/\D/g, "").includes(phone.replace(/\D/g, "").slice(-8))) ||
    /https?:\/\/|www\.|linkedin|github|\.com\b|@/i.test(t)
  let name = ""
  let title = ""
  let location = ""
  const leftovers: string[] = []
  for (const tok of tokens) {
    const t = tok.text
    if (isContact(t)) continue
    if (!name && tok.line < 4 && /^[\p{L}][\p{L} .'-]{1,48}$/u.test(t) && t.split(" ").length <= 5 && !ROLE_WORDS.test(t)) {
      name = titleCase(t)
      continue
    }
    if (!location && LOCATION_RE.test(t) && !ROLE_WORDS.test(t) && !COMPANY_WORDS.test(t)) {
      location = t
      continue
    }
    if (!title && name && t.length <= 90 && !isSentence(t) && /\p{L}/u.test(t)) {
      title = t
      continue
    }
    leftovers.push(t)
  }
  return { name, title, location, leftovers }
}

/** Reads the cleaned lines of one resume. Pure and fast (a few ms), no network. */
export function readResume(lines: string[]): ResumeData {
  const { header, sections } = splitSections(lines)
  const text = lines.join("\n")
  const headerText = header.join("\n")
  const emails = [...new Set((text.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))]
  const phone = findPhone(headerText) || findPhone(text)
  const links = findLinks(text, headerText)
  const head = readHeader(header, emails, phone)

  const get = (k: SectionKey) => sections.get(k) ?? []
  const summaryLines = get("summary")
  let summary = squash(summaryLines.map(unbullet).join(" "))
  if (!summary) summary = squash(head.leftovers.filter(isSentence).join(" "))

  const experience = parseExperience(get("experience"))
  const projects = parseProjects(get("projects"))
  const education = parseEducation(get("education"))
  const skills = parseSkills(get("skills"))
  const certifications = parseCertifications(get("certifications"))
  const awards = parseList(get("awards"))
  const extracurricular = [...awards, ...parseList(get("activities"))].slice(0, 10)
  const highlights = findHighlights([...experience.flatMap((e) => e.highlights ?? []), summary, ...awards])

  // contact = the person's own profiles: header links first, project links stay on their project
  const projectLinks = new Set(projects.map((p) => p.link).filter(Boolean))
  const inHeader = (u: string) => headerText.toLowerCase().includes(u.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))
  const contactLinks = links.filter((u) => !projectLinks.has(u)).sort((a, b) => Number(inHeader(b)) - Number(inHeader(a)))

  const emailName =emails[0]?.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\d+/g, "").trim() ?? ""
  return {
    name: head.name || (emailName.includes(" ") ? titleCase(emailName.toUpperCase()) : ""),
    title: head.title || experience[0]?.role || "",
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    highlights,
    extracurricular,
    location: head.location,
    contact: { email: emails[0] ?? "", phone, links: contactLinks },
  }
}

/** Raw (or already cleaned) resume text -> resume data. Prefer `readResume(cleanResumeLines(raw))` when the lines are reused. */
export function extractStructuredResume(rawText: string): ResumeData {
  return readResume(cleanResumeLines(rawText))
}
