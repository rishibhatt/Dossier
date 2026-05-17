/**
 * Phase 1 — Deep resume parser with signal extraction for the design intelligence layer.
 * Builds on heuristic `extractStructuredResume` and adds bullets, tech stacks, link typing,
 * extra sections (certifications, extracurricular), and inferred signals.
 */

import { extractStructuredResume } from "@/lib/pdf/extractSections"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import type { DesignUserType } from "@/types/designEngine"
import type { EducationEntry, ExperienceEntry, ProjectEntry, PortfolioDocument } from "@/types/dossier"

// --- Public types (spec-aligned) ---

export type ProfessionCluster =
  | "software"
  | "design"
  | "finance"
  | "marketing"
  | "healthcare"
  | "legal"
  | "education"
  | "culinary"
  | "engineering"
  | "sales"
  | "hr"
  | "creative"
  | "unknown"

export type SeniorityLevel = "student" | "junior" | "mid" | "senior" | "lead" | "executive"

export type ContentRichness = "sparse" | "moderate" | "dense"

export type PersonalityTone = "technical" | "creative" | "corporate" | "academic"

export type CareerStage = "building" | "established" | "pivoting" | "expert"

export type ParsedResumeSignals = {
  professionCluster: ProfessionCluster
  seniorityLevel: SeniorityLevel
  contentRichness: ContentRichness
  hasProjects: boolean
  hasDesignWork: boolean
  hasOpenSource: boolean
  dominantTechStack: string[]
  personalityTone: PersonalityTone
  careerStage: CareerStage
}

export type ParsedProjectLinks = {
  live?: string
  github?: string
  figma?: string
  case_study?: string
}

export type ParsedExperience = {
  company: string
  role: string
  duration: string
  bullets: string[]
  techStack: string[]
}

export type ParsedEducation = {
  institution: string
  degree: string
  year: string
}

export type ParsedProject = {
  name: string
  description: string
  techStack: string[]
  links: ParsedProjectLinks
}

export type ParsedResume = {
  name: string
  title: string
  contact: {
    email: string
    phone: string
    linkedin: string
    github: string
    website: string
    location: string
  }
  summary: string
  experience: ParsedExperience[]
  education: ParsedEducation[]
  skills: string[]
  projects: ParsedProject[]
  certifications: string[]
  extracurricular: string[]
  signals: ParsedResumeSignals
}

// --- Keyword clusters (20+ tokens per primary cluster) ---

const CLUSTER_KEYWORDS: Record<Exclude<ProfessionCluster, "unknown">, readonly string[]> = {
  software: [
    "react",
    "angular",
    "vue",
    "svelte",
    "typescript",
    "javascript",
    "node",
    "nodejs",
    "python",
    "java",
    "kotlin",
    "swift",
    "golang",
    "go ",
    " rust",
    "rust ",
    "c#",
    ".net",
    "dotnet",
    "aws",
    "gcp",
    "azure",
    "docker",
    "kubernetes",
    "k8s",
    "kafka",
    "postgres",
    "postgresql",
    "mongodb",
    "redis",
    "graphql",
    "microservice",
    "terraform",
    "devops",
    "ci/cd",
    "github",
    "gitlab",
    "full stack",
    "fullstack",
    "backend",
    "frontend",
    "software engineer",
    "developer",
    "sre",
    "platform engineer",
  ],
  design: [
    "figma",
    "sketch",
    "adobe xd",
    "photoshop",
    "illustrator",
    "indesign",
    "after effects",
    "ux",
    "ui ",
    " ui",
    "user research",
    "usability",
    "wireframe",
    "prototype",
    "design system",
    "dribbble",
    "behance",
    "visual design",
    "product design",
    "interaction design",
    "information architecture",
    "accessibility",
    "wcag",
    "design thinking",
    "human-centered",
    "brand identity",
    "typography",
    "mockup",
    "high fidelity",
    "low fidelity",
    "design lead",
    "creative suite",
  ],
  finance: [
    "gaap",
    "ifrs",
    "p&l",
    "financial model",
    "valuation",
    "audit",
    "tax",
    "investment banking",
    "fp&a",
    "risk management",
    "compliance",
    "sox",
    "due diligence",
    "portfolio management",
    "derivatives",
    "equity research",
    "fixed income",
    "ma ",
    "m&a",
    "dcf",
    "lbo",
    "bloomberg",
    "capital markets",
    "treasury",
    "controller",
    "financial analyst",
    "cpa",
    "cfa",
    "budget",
    "forecast",
    "revenue recognition",
    "sec filing",
    "10-k",
    "10-q",
  ],
  marketing: [
    "seo",
    "sem",
    "google ads",
    "facebook ads",
    "meta ads",
    "content marketing",
    "growth marketing",
    "cac",
    "ltv",
    "funnel",
    "conversion",
    "campaign",
    "brand strategy",
    "social media",
    "hubspot",
    "marketo",
    "mailchimp",
    "copywriting",
    "pr ",
    " public relations",
    "communications",
    "demand gen",
    "abm",
    "marketing automation",
    "analytics",
    "attribution",
    "influencer",
    "go-to-market",
    "gtm",
    "product marketing",
    "crm",
    "lead generation",
  ],
  healthcare: [
    "hipaa",
    "emr",
    "ehr",
    "clinical",
    "patient care",
    "nursing",
    "medical",
    "pharmacy",
    "icd-10",
    "icd 10",
    "cpt code",
    "fda",
    "healthcare administration",
    "hospital",
    "clinic",
    "physician",
    "allied health",
    "telehealth",
    "medical billing",
    "prior authorization",
    "care coordination",
    "population health",
    "value-based care",
    "rn ",
    "lpn",
    "np ",
    "physician assistant",
    "medical device",
    "clinical trial",
    "pharma",
    "health informatics",
  ],
  legal: [
    "litigation",
    "contract review",
    "paralegal",
    "discovery",
    "compliance",
    "counsel",
    "attorney",
    "esq",
    "j.d.",
    "jd ",
    "bar admission",
    "deposition",
    "motion practice",
    "due diligence legal",
    "mergers acquisitions legal",
    "intellectual property",
    "ip law",
    "trademark",
    "patent",
    "regulatory affairs",
    "gdpr",
    "privacy law",
    "corporate law",
    "employment law",
    "legal research",
    "westlaw",
    "lexis",
    "ediscovery",
    "legal assistant",
    "general counsel",
  ],
  education: [
    "curriculum",
    "pedagogy",
    "classroom",
    "k-12",
    "k12",
    "instructional",
    "lesson plan",
    "student achievement",
    "differentiated instruction",
    "special education",
    "principal",
    "superintendent",
    "adjunct",
    "tenure",
    "lms",
    "blackboard",
    "canvas lms",
    "standardized testing",
    "iep",
    "504 plan",
    "education degree",
    "teaching certificate",
    "professional development",
    "school district",
    "academic advisor",
    "higher education",
    "faculty",
    "dean",
    "registrar",
    "accreditation",
    "stem education",
    "tutor",
    "edtech",
  ],
  culinary: [
    "chef",
    "sous chef",
    "line cook",
    "culinary",
    "kitchen",
    "restaurant",
    "menu development",
    "food service",
    "banquet",
    "sommelier",
    "pastry",
    "catering",
    "hospitality",
    "food safety",
    "servsafe",
    "mise en place",
    "expeditor",
    "executive chef",
    "pastry chef",
    "garde manger",
    "brigade",
    "farm to table",
    "wine pairing",
    "mixology",
    "bartender",
    "hotel f&b",
    "culinary arts",
    "recipe development",
    "food styling",
    "nutrition",
    "dietary",
  ],
  engineering: [
    "structural",
    "mechanical engineer",
    "civil engineer",
    "autocad",
    "solidworks",
    "fea",
    "finite element",
    "cad",
    "pe license",
    "professional engineer",
    "manufacturing",
    "lean six sigma",
    "six sigma",
    "process engineer",
    "quality engineer",
    "hvac",
    "p&id",
    "plc",
    "scada",
    "bim",
    "geotechnical",
    "hydraulic",
    "cfd",
    "materials science",
    "r&d engineer",
    "npi",
    "dfm",
    "tolerance stack",
    "gd&t",
    "asme",
    "iso 9001",
  ],
  sales: [
    "quota",
    "account executive",
    "ae ",
    "sdr",
    "bdr",
    "pipeline",
    "salesforce",
    "enterprise sales",
    "territory",
    "cold call",
    "prospecting",
    "deal closure",
    "arr",
    "mrr",
    "renewal",
    "upsell",
    "cross-sell",
    "channel sales",
    "inside sales",
    "field sales",
    "sales enablement",
    "win rate",
    "forecast accuracy",
    "crm",
    "opportunity",
    "rfp",
    "negotiation",
    "closing",
    "business development",
    "revenue growth",
    "hunter",
    "farmer sales",
    "sales manager",
    "vp sales",
  ],
  hr: [
    "talent acquisition",
    "recruiting",
    "recruiter",
    "benefits administration",
    "onboarding",
    "hris",
    "people operations",
    "employee relations",
    "compensation",
    "total rewards",
    "payroll",
    "hrbp",
    "hr business partner",
    "performance management",
    "succession planning",
    "diversity equity",
    "dei",
    "talent management",
    "workday",
    "bamboohr",
    "ats",
    "offer negotiation",
    "headcount planning",
    "labor relations",
    "union",
    "compliance training",
    "policy",
    "hr generalist",
    "chief people officer",
    "people analytics",
    "employer branding",
    "candidate experience",
  ],
  creative: [
    "creative director",
    "art direction",
    "photography",
    "videography",
    "film production",
    "editorial",
    "copywriter creative",
    "storyboard",
    "motion graphics",
    "music production",
    "sound design",
    "exhibition",
    "gallery",
    "fine art",
    "illustration",
    "concept art",
    "3d modeling",
    "blender",
    "cinema 4d",
    "maya",
    "composition",
    "narrative",
    "scriptwriting",
    "podcast",
    "content creator",
    "influencer",
    "brand storytelling",
    "visual storytelling",
    "set design",
    "stylist",
    "fashion",
    "wardrobe",
  ],
}

/** Known tech / tools for dominant stack extraction (normalized matching). */
const TECH_LEXICON: readonly string[] = [
  "react",
  "angular",
  "vue",
  "svelte",
  "next.js",
  "nextjs",
  "nuxt",
  "typescript",
  "javascript",
  "node.js",
  "nodejs",
  "python",
  "django",
  "flask",
  "fastapi",
  "java",
  "spring",
  "kotlin",
  "swift",
  "go",
  "golang",
  "rust",
  "c#",
  "csharp",
  ".net",
  "ruby",
  "rails",
  "php",
  "laravel",
  "postgres",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "elasticsearch",
  "graphql",
  "rest",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "terraform",
  "kafka",
  "rabbitmq",
  "figma",
  "sketch",
  "adobe xd",
  "tailwind",
  "webpack",
  "vite",
  "jest",
  "cypress",
  "playwright",
  "git",
  "github actions",
  "jenkins",
  "linux",
  "bash",
  "snowflake",
  "databricks",
  "tableau",
  "power bi",
  "excel",
  "sql",
  "nosql",
  "prisma",
  "supabase",
  "firebase",
]

const EXECUTIVE_TITLES =
  /\b(vp|vice president|svp|evp|c[o0]o|ceo|cto|cfo|cmo|cpo|chief|director|head of|president|partner|principal|managing director)\b/i
const LEAD_TITLES =
  /\b(lead |staff |principal |architect|engineering manager|tech lead|team lead|group lead)\b/i
const SENIOR_TITLES = /\b(senior|sr\.|sr |ii\b|iii\b)\b/i
const JUNIOR_TITLES = /\b(junior|jr\.|jr |associate|entry level|graduate|intern)\b/i
const STUDENT_TITLES = /\b(intern|co-?op|student|undergraduate|graduate student|phd candidate)\b/i

const OPEN_SOURCE_HINTS =
  /\b(open source|oss|contributor|contributions|github\.com\/[\w-]+\/[\w-]+|pull request|maintainer)\b/i

const PIVOT_HINTS =
  /\b(career change|transitioning|pivot|formerly|previously a|switching from|looking to move into)\b/i

const CORPORATE_HINTS =
  /\b(p&l|revenue|ebitda|margin|stakeholder|board|executive|mba|consulting|deloitte|pwc|kpmg|ey |mckinsey|bain )\b/i

const ACADEMIC_HINTS =
  /\b(research|publication|peer-reviewed|phd|dissertation|thesis|university professor|grant|lab |citation)\b/i

// --- Line / section helpers (aligned with extractSections patterns) ---

function normalizeLines(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

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

function sliceBetween(lines: string[], startIdx: number, endIdx: number): string[] {
  if (startIdx < 0) return []
  const end = endIdx < 0 ? lines.length : endIdx
  return lines.slice(startIdx + 1, end)
}

function nextSectionEnd(lines: string[], fromIdx: number, allStarts: number[]): number {
  const sorted = allStarts.filter((i) => i > fromIdx).sort((a, b) => a - b)
  return sorted.length ? sorted[0] : lines.length
}

function parseListBlock(block: string): string[] {
  const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const items: string[] = []
  for (const line of lines) {
    const cleaned = line.replace(/^[-*•\u2022]\s*/, "").replace(/^\d+[.)]\s*/, "").trim()
    if (cleaned.length > 1 && cleaned.length < 400) items.push(cleaned)
  }
  if (items.length === 0 && block.trim()) {
    return block
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 200)
  }
  return items
}

function splitDescriptionToBullets(description: string): string[] {
  const d = description.trim()
  if (!d) return []
  const byNewline = d.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const bullets: string[] = []
  for (const line of byNewline) {
    if (/^[-*•\u2022]|\d+[.)]\s/.test(line)) {
      bullets.push(line.replace(/^[-*•\u2022]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
    }
  }
  if (bullets.length > 0) return bullets.filter(Boolean)
  if (d.length > 240) {
    const sentences = d.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
    return sentences.length > 1 ? sentences : [d]
  }
  return [d]
}

function extractTechFromCorpus(text: string): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const token of TECH_LEXICON) {
    const t = token.toLowerCase()
    const re = new RegExp(`\\b${escapeRegExp(t).replace(/\\\s+/g, "\\s+")}\\b`, "i")
    if (re.test(lower) || lower.includes(t.replace(/\s+/g, ""))) {
      found.add(formatTechLabel(token))
    }
  }
  const bracket = text.matchAll(/\[([^\]]+)\]/g)
  for (const m of bracket) {
    for (const part of m[1].split(/[,|]/)) {
      const s = part.trim()
      if (s.length > 1 && s.length < 40) found.add(s)
    }
  }
  return [...found]
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function formatTechLabel(raw: string): string {
  return raw
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace(".Net", ".NET")
}

function classifyLinks(links: string[]): {
  linkedin: string
  github: string
  website: string
} {
  let linkedin = ""
  let github = ""
  let website = ""
  for (const url of links) {
    const u = url.toLowerCase()
    if (u.includes("linkedin.com")) linkedin = linkedin || url
    else if (u.includes("github.com")) github = github || url
    else if (!website && /^https?:\/\//i.test(url)) website = url
  }
  if (!website) {
    for (const url of links) {
      if (!url.toLowerCase().includes("linkedin") && !url.toLowerCase().includes("github")) {
        website = url
        break
      }
    }
  }
  return { linkedin, github, website }
}

function inferLocation(lines: string[], rawText: string): string {
  for (let i = 0; i < Math.min(12, lines.length); i++) {
    const line = lines[i]
    if (/remote/i.test(line) && line.length < 40) return line
    if (/^[A-Z][a-zA-Z\s,.-]+,\s*[A-Z]{2}\b/.test(line) && line.length < 80) return line
    if (/^[A-Z][a-z]+,\s*[A-Z][a-z]+\s*\(?\d{4,5}\)?$/.test(line)) return line
  }
  const m = rawText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/)
  return m?.[1]?.trim() ?? ""
}

function parseProjectLinks(description: string, links: string[]): ParsedProjectLinks {
  const out: ParsedProjectLinks = {}
  const text = `${description} ${links.join(" ")}`
  const urls = text.match(/https?:\/\/[^\s)]+/gi) ?? []
  for (const url of urls) {
    const u = url.toLowerCase()
    if (u.includes("github.com")) out.github = out.github ?? url
    else if (u.includes("figma.com")) out.figma = out.figma ?? url
    else if (/notion\.|medium\.|substack\.|case study/i.test(url + description))
      out.case_study = out.case_study ?? url
    else if (!out.live && !u.includes("linkedin.com")) out.live = url
  }
  for (const url of links) {
    const u = url.toLowerCase()
    if (u.includes("github.com")) out.github = out.github ?? url
    else if (u.includes("figma.com")) out.figma = out.figma ?? url
  }
  return out
}

/**
 * Match cluster keyword without substring false positives
 * (e.g. "react" in "reactive", "java" in "javascript") — single tokens use \\b boundaries.
 */
function corpusHasKeyword(corpusLower: string, kw: string): boolean {
  const k = kw.toLowerCase().trim()
  if (k.length === 0) return false
  if (/\s/.test(k)) return corpusLower.includes(k)
  try {
    return new RegExp(`\\b${escapeRegExp(k)}\\b`, "i").test(corpusLower)
  } catch {
    return corpusLower.includes(k)
  }
}

function scoreClusters(corpus: string): Map<ProfessionCluster, number> {
  const lower = corpus.toLowerCase()
  const scores = new Map<ProfessionCluster, number>()
  const keys = Object.keys(CLUSTER_KEYWORDS) as (keyof typeof CLUSTER_KEYWORDS)[]
  for (const cluster of keys) {
    let s = 0
    for (const kw of CLUSTER_KEYWORDS[cluster]) {
      if (corpusHasKeyword(lower, kw)) s += 1
    }
    scores.set(cluster, s)
  }
  return scores
}

function inferProfessionCluster(corpus: string): ProfessionCluster {
  const scores = scoreClusters(corpus)
  let best: ProfessionCluster = "unknown"
  let max = 0
  for (const [k, v] of scores) {
    if (v > max) {
      max = v
      best = k
    }
  }
  if (max < 2) return "unknown"
  return best
}

function parseYearsFromDuration(duration: string): number {
  const m = duration.match(/(\d{4})\s*[-–]\s*(\d{4}|present|now)/i)
  if (m) {
    const start = parseInt(m[1], 10)
    const endRaw = m[2].toLowerCase()
    const end = endRaw === "present" || endRaw === "now" ? new Date().getFullYear() : parseInt(m[2], 10)
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) return end - start
  }
  const single = duration.match(/(\d{4})/g)
  if (single && single.length >= 2) {
    const ys = single.map((y) => parseInt(y, 10)).filter(Number.isFinite).sort((a, b) => a - b)
    if (ys.length >= 2) return ys[ys.length - 1] - ys[0]
  }
  return 0
}

function estimateTotalYears(experience: ExperienceEntry[], corpus: string): number {
  let y = 0
  for (const e of experience) {
    y += parseYearsFromDuration(e.duration)
    if (y === 0 && e.duration) y += 1
  }
  if (y === 0) {
    const m = corpus.match(/(\d+)\+?\s*years?\s+of\s+experience/i)
    if (m) y = parseInt(m[1], 10)
  }
  return Math.max(y, experience.length > 0 ? Math.min(experience.length, 12) : 0)
}

function inferSeniorityLevel(
  title: string,
  experience: ExperienceEntry[],
  corpus: string,
  isStudentish: boolean
): SeniorityLevel {
  const head = `${title} ${experience.map((e) => `${e.role} ${e.company}`).join(" ")}`
  if (STUDENT_TITLES.test(head) || isStudentish) return "student"
  if (EXECUTIVE_TITLES.test(head)) return "executive"
  if (LEAD_TITLES.test(head)) return "lead"
  if (SENIOR_TITLES.test(head)) return "senior"
  const years = estimateTotalYears(experience, corpus)
  if (years <= 2 && JUNIOR_TITLES.test(head)) return "junior"
  if (years <= 2) return years <= 0 ? "junior" : "junior"
  if (years <= 5) return "mid"
  if (years <= 9) return "senior"
  return "lead"
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function inferContentRichness(totalWords: number): ContentRichness {
  if (totalWords < 300) return "sparse"
  if (totalWords > 700) return "dense"
  return "moderate"
}

function inferHasDesignWork(corpus: string, links: string[]): boolean {
  const l = links.join(" ").toLowerCase()
  if (/figma|dribbble|behance|adobe|sketch\.com/i.test(corpus + l)) return true
  return /\b(figma|sketch|xd|photoshop|illustrator|invision|framer\.com)\b/i.test(corpus)
}

function inferHasOpenSource(corpus: string, links: string[]): boolean {
  if (OPEN_SOURCE_HINTS.test(corpus)) return true
  return links.some((u) => u.toLowerCase().includes("github.com"))
}

function dominantTechStackFromCorpus(corpus: string, skills: string[]): string[] {
  const combined = `${corpus}\n${skills.join(", ")}`
  const all = extractTechFromCorpus(combined)
  const counts = new Map<string, number>()
  const lower = combined.toLowerCase()
  for (const t of all) {
    const key = t.toLowerCase()
    const c = (lower.match(new RegExp(escapeRegExp(key), "gi")) ?? []).length
    counts.set(t, (counts.get(t) ?? 0) + c + 2)
  }
  for (const s of skills) {
    const sl = s.toLowerCase()
    for (const token of TECH_LEXICON) {
      if (sl.includes(token.toLowerCase())) {
        const label = formatTechLabel(token)
        counts.set(label, (counts.get(label) ?? 0) + 3)
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)
}

function inferPersonalityTone(
  profession: ProfessionCluster,
  corpus: string,
  hasDesign: boolean
): PersonalityTone {
  if (ACADEMIC_HINTS.test(corpus)) return "academic"
  if (hasDesign || profession === "design" || profession === "creative") return "creative"
  if (profession === "finance" || profession === "sales" || CORPORATE_HINTS.test(corpus)) return "corporate"
  if (profession === "software" || profession === "engineering") return "technical"
  const techHits = (corpus.toLowerCase().match(/\b(api|sql|deploy|code|stack|engineer|developer)\b/g) ?? []).length
  const creativeHits = (corpus.toLowerCase().match(/\b(design|brand|visual|creative|portfolio)\b/g) ?? []).length
  if (creativeHits > techHits + 1) return "creative"
  if (techHits > creativeHits + 1) return "technical"
  return "corporate"
}

function inferCareerStage(
  seniority: SeniorityLevel,
  richness: ContentRichness,
  years: number,
  corpus: string
): CareerStage {
  if (PIVOT_HINTS.test(corpus)) return "pivoting"
  if (seniority === "student" || seniority === "junior") return "building"
  if ((seniority === "executive" || seniority === "lead") && years >= 10 && richness === "dense") return "expert"
  if (seniority === "mid" || seniority === "senior") return years >= 5 ? "established" : "building"
  return "established"
}

function mapEducation(e: EducationEntry): ParsedEducation {
  return {
    institution: e.institution,
    degree: e.degree,
    year: e.period ? e.period : (e.details.match(/\b(19|20)\d{2}\b/)?.[0] ?? ""),
  }
}

function mapExperience(e: ExperienceEntry): ParsedExperience {
  const bullets = splitDescriptionToBullets(e.description)
  const techStack = extractTechFromCorpus(`${e.role} ${e.company} ${e.description}`)
  return {
    company: e.company,
    role: e.role,
    duration: e.duration,
    bullets,
    techStack,
  }
}

function mapProject(p: ProjectEntry, globalLinks: string[]): ParsedProject {
  const techStack = [...new Set([...p.tech, ...extractTechFromCorpus(p.description)])]
  return {
    name: p.name,
    description: p.description,
    techStack,
    links: parseProjectLinks(p.description, globalLinks),
  }
}

function extractExtraSections(rawText: string): { certifications: string[]; extracurricular: string[] } {
  const lines = normalizeLines(rawText)
  const certIdx = headerIndex(lines, [
    "CERTIFICATIONS",
    "CERTIFICATES",
    "LICENSES",
    "LICENSE",
    "CREDENTIALS",
  ])
  const extraIdx = headerIndex(lines, [
    "EXTRACURRICULAR",
    "EXTRACURRICULAR ACTIVITIES",
    "VOLUNTEER",
    "VOLUNTEERING",
    "ACTIVITIES",
    "LEADERSHIP",
    "AWARDS",
    "HONORS",
  ])
  const summaryIdx = headerIndex(lines, ["SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT"])
  const expIdx = headerIndex(lines, ["EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT"])
  const projIdx = headerIndex(lines, ["PROJECTS", "SELECTED PROJECTS", "KEY PROJECTS"])
  const eduIdx = headerIndex(lines, ["EDUCATION", "ACADEMIC"])
  const skillsIdx = headerIndex(lines, ["SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "COMPETENCIES"])

  const starts = [summaryIdx, expIdx, projIdx, eduIdx, skillsIdx, certIdx, extraIdx].filter((i) => i >= 0)

  let certifications: string[] = []
  let extracurricular: string[] = []

  if (certIdx >= 0) {
    const end = nextSectionEnd(lines, certIdx, starts)
    certifications = parseListBlock(sliceBetween(lines, certIdx, end).join("\n"))
  }
  if (extraIdx >= 0) {
    const end = nextSectionEnd(lines, extraIdx, starts)
    extracurricular = parseListBlock(sliceBetween(lines, extraIdx, end).join("\n"))
  }

  return { certifications, extracurricular }
}

/**
 * Parse raw resume text into structured fields plus inferred design signals.
 */
export function parseResume(rawText: string): ParsedResume {
  const structured = extractStructuredResume(rawText)
  const { certifications, extracurricular } = extractExtraSections(rawText)
  const lines = normalizeLines(rawText)
  const { linkedin, github, website } = classifyLinks(structured.contact.links)

  const experience = structured.experience.map(mapExperience)
  const projects = structured.projects.map((p) => mapProject(p, structured.contact.links))
  const education = structured.education.map(mapEducation)

  const corpusParts = [
    structured.title,
    structured.summary,
    structured.skills.join(" "),
    structured.experience.map((e) => `${e.role} ${e.company} ${e.description}`).join(" "),
    structured.projects.map((p) => `${p.name} ${p.description}`).join(" "),
    education.map((e) => `${e.degree} ${e.institution}`).join(" "),
    certifications.join(" "),
    extracurricular.join(" "),
  ]
  const corpus = corpusParts.join("\n")
  const totalWords = countWords(corpusParts.join(" "))

  const professionCluster = inferProfessionCluster(corpus)
  const isStudentish =
    /\b(university|college|b\.?s\.?c|b\.?a\.?|student|gpa)\b/i.test(corpus) &&
    structured.experience.length <= 1 &&
    totalWords < 500

  const seniorityLevel = inferSeniorityLevel(structured.title, structured.experience, corpus, isStudentish)
  const contentRichness = inferContentRichness(totalWords)
  const hasProjects = projects.length > 0
  const hasDesignWork = inferHasDesignWork(corpus, structured.contact.links)
  const hasOpenSource = inferHasOpenSource(corpus, structured.contact.links)
  const dominantTechStack = dominantTechStackFromCorpus(corpus, structured.skills)
  const personalityTone = inferPersonalityTone(professionCluster, corpus, hasDesignWork)
  const years = estimateTotalYears(structured.experience, corpus)
  const careerStage = inferCareerStage(seniorityLevel, contentRichness, years, corpus)

  return {
    name: structured.name,
    title: structured.title,
    contact: {
      email: structured.contact.email,
      phone: structured.contact.phone,
      linkedin,
      github,
      website,
      location: inferLocation(lines, rawText),
    },
    summary: structured.summary,
    experience,
    education,
    skills: structured.skills,
    projects,
    certifications,
    extracurricular,
    signals: {
      professionCluster,
      seniorityLevel,
      contentRichness,
      hasProjects,
      hasDesignWork,
      hasOpenSource,
      dominantTechStack,
      personalityTone,
      careerStage,
    },
  }
}

export function suggestDesignDirection(signals: ParsedResumeSignals): DesignDirectionId {
  const { professionCluster, seniorityLevel, personalityTone } = signals
  const senior = seniorityLevel === "senior" || seniorityLevel === "lead" || seniorityLevel === "executive"
  const student = seniorityLevel === "student"
  const creative = personalityTone === "creative"

  if (student) return "EDITORIAL_MONO"

  if (professionCluster === "software" && senior && personalityTone === "technical") {
    return signals.contentRichness === "dense" ? "BRUTALIST_GRID" : "LUMINOUS_DARK"
  }
  if (professionCluster === "software" && personalityTone === "technical")
    return "LUMINOUS_DARK"

  if (professionCluster === "design" && creative) return "CHROMATIC_CHAOS"
  if (professionCluster === "design") return "ORGANIC_GRADIENT"

  if (professionCluster === "finance" && senior && personalityTone === "corporate") return "LIQUID_ENTERPRISE"
  if (professionCluster === "finance") return "LIQUID_ENTERPRISE"

  if (creative && (professionCluster === "creative" || professionCluster === "marketing"))
    return "ORGANIC_GRADIENT"

  if (professionCluster === "culinary" || professionCluster === "healthcare" || professionCluster === "unknown")
    return signals.contentRichness === "sparse" ? "EDITORIAL_MONO" : "ORGANIC_GRADIENT"

  if (professionCluster === "legal" || professionCluster === "education" || professionCluster === "hr")
    return "EDITORIAL_MONO"

  if (professionCluster === "sales" && personalityTone === "corporate") return "LIQUID_ENTERPRISE"

  if (professionCluster === "engineering" && personalityTone === "technical")
    return senior ? "BRUTALIST_GRID" : "LUMINOUS_DARK"

  return "EDITORIAL_MONO"
}

const USER_TYPE_TO_CLUSTER: Record<DesignUserType, ProfessionCluster> = {
  developer: "software",
  designer: "design",
  product: "marketing",
  student: "software",
  general: "unknown",
}

/**
 * Reconstruct a ParsedResume from an existing portfolio document (e.g. after AI generation only).
 * Used by fallbacks and regenerate flows when raw PDF text is unavailable.
 */
export function portfolioDocumentToParsedResume(
  doc: PortfolioDocument,
  userTypeHint: DesignUserType = "general"
): ParsedResume {
  const hero = doc.sections.find((s) => s.type === "hero")
  const about = doc.sections.find((s) => s.type === "about")
  const skills = doc.sections.find((s) => s.type === "skills")
  const experience = doc.sections.find((s) => s.type === "experience")
  const projects = doc.sections.find((s) => s.type === "projects")
  const contact = doc.sections.find((s) => s.type === "contact")

  const name = hero && hero.type === "hero" ? hero.data.name : "Professional"
  const title = hero && hero.type === "hero" ? hero.data.title : ""
  const summary = about && about.type === "about" ? about.data.body : doc.meta.description
  const skillItems = skills && skills.type === "skills" ? skills.data.items : []

  const expItems =
    experience && experience.type === "experience"
      ? experience.data.items.map((e) => ({
          company: e.company,
          role: e.role,
          duration: e.duration,
          bullets: e.description ? e.description.split(/\n+/).map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean) : [],
          techStack: [] as string[],
        }))
      : []

  const projItems =
    projects && projects.type === "projects"
      ? projects.data.items.map((p) => ({
          name: p.name,
          description: p.description,
          techStack: p.tech ?? [],
          links: {} as ParsedProject["links"],
        }))
      : []

  const edu: ParsedEducation[] = []
  const rawExp: ExperienceEntry[] =
    experience && experience.type === "experience" ? experience.data.items : []
  const corpus = `${title} ${summary} ${skillItems.join(" ")} ${rawExp.map((e) => `${e.role} ${e.company} ${e.description}`).join(" ")}`
  const clusterFromDoc = inferProfessionCluster(corpus)
  const professionCluster =
    clusterFromDoc !== "unknown" ? clusterFromDoc : USER_TYPE_TO_CLUSTER[userTypeHint] ?? "unknown"

  const contactData =
    contact && contact.type === "contact"
      ? contact.data
      : { email: "", phone: "", links: [] as string[] }

  const links = contactData.links ?? []
  const { linkedin, github, website } = classifyLinks(links)

  const parsed: ParsedResume = {
    name,
    title,
    contact: {
      email: contactData.email ?? "",
      phone: contactData.phone ?? "",
      linkedin,
      github,
      website,
      location: "",
    },
    summary,
    experience: expItems,
    education: edu,
    skills: skillItems,
    projects: projItems,
    certifications: [],
    extracurricular: [],
    signals: {
      professionCluster,
      seniorityLevel: inferSeniorityLevel(title, rawExp, corpus, userTypeHint === "student"),
      contentRichness: inferContentRichness(countWords(corpus)),
      hasProjects: projItems.length > 0,
      hasDesignWork: inferHasDesignWork(corpus, links),
      hasOpenSource: inferHasOpenSource(corpus, links),
      dominantTechStack: dominantTechStackFromCorpus(corpus, skillItems),
      personalityTone: inferPersonalityTone(professionCluster, corpus, inferHasDesignWork(corpus, links)),
      careerStage: "established",
    },
  }

  const years = estimateTotalYears(rawExp, corpus)
  parsed.signals.careerStage = inferCareerStage(
    parsed.signals.seniorityLevel,
    parsed.signals.contentRichness,
    years,
    corpus
  )

  return parsed
}

export type { DesignDirectionId } from "@/types/resolvedDesignConfig"
