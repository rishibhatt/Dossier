/**
 * Resume checks that run on pasted text. Deterministic and explainable: every result names what was found
 * and what to do. Weights add up to 100.
 */
export type CheckResult = {
  id: string
  label: string
  weight: number
  /** 0..1 share of the weight earned. */
  score: number
  found: string
  fix: string | null
}

const ACTION_VERBS =
  /\b(led|built|launched|cut|grew|reduced|increased|designed|wrote|ran|managed|created|shipped|delivered|improved|closed|trained|organised|organized|negotiated|automated|migrated|owned|planned|taught|raised|saved|won|opened|started|founded|redesigned|mentored|resolved)\b/gi

const WEAK_PHRASES = [
  "responsible for",
  "duties included",
  "hard-working",
  "hardworking",
  "team player",
  "go-getter",
  "detail-oriented",
  "results-driven",
  "dynamic",
  "synergy",
  "think outside the box",
  "self-starter",
  "passionate about",
  "references available",
]

const SECTION_PATTERNS: [string, RegExp][] = [
  ["Experience", /\b(experience|employment|work history|career)\b/i],
  ["Education", /\b(education|qualifications|degree|university|college|school)\b/i],
  ["Skills", /\b(skills|tools|technologies|competencies|expertise)\b/i],
]

function bullets(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 25 && l.length < 400)
}

export function runResumeChecks(raw: string): CheckResult[] {
  const text = raw.replace(/\r/g, "")
  const words = text.split(/\s+/).filter(Boolean)
  const wc = words.length
  const lines = bullets(text)
  const lower = text.toLowerCase()

  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text)
  const phone = /(\+?\d[\d\s().-]{7,}\d)/.test(text)
  const link = /(linkedin\.com\/in\/|github\.com\/|behance\.net\/|dribbble\.com\/|https?:\/\/)/i.test(text)

  const withNumbers = lines.filter((l) => /\d/.test(l) && /(%|\b\d{2,}\b|₹|\$|£|€|\bx\b|\bhours?\b|\bdays?\b|\bweeks?\b|\bclients?\b|\bpeople\b|\bstudents?\b)/i.test(l))
  const numberShare = lines.length ? withNumbers.length / lines.length : 0

  const verbHits = new Set((text.match(ACTION_VERBS) ?? []).map((v) => v.toLowerCase()))
  const weakHits = WEAK_PHRASES.filter((p) => lower.includes(p))
  const firstPerson = (text.match(/\b(I|me|my)\b/g) ?? []).length
  const sections = SECTION_PATTERNS.filter(([, re]) => re.test(text)).map(([n]) => n)
  const missing = SECTION_PATTERNS.map(([n]) => n).filter((n) => !sections.includes(n))
  const years = text.match(/\b(19[89]\d|20[0-3]\d)\b/g) ?? []
  const longLines = lines.filter((l) => l.split(/\s+/).length > 35)

  const lengthScore = wc < 150 ? 0.3 : wc < 250 ? 0.7 : wc <= 900 ? 1 : wc <= 1200 ? 0.6 : 0.3

  return [
    {
      id: "contact",
      label: "Contact details",
      weight: 14,
      score: (email ? 0.6 : 0) + (phone ? 0.4 : 0),
      found: [email ? "email" : null, phone ? "phone" : null].filter(Boolean).join(" and ") || "no email or phone",
      fix: email && phone ? null : `Add ${!email ? "an email address" : ""}${!email && !phone ? " and " : ""}${!phone ? "a phone number" : ""} at the top.`,
    },
    {
      id: "numbers",
      label: "Numbers in your bullets",
      weight: 18,
      score: Math.min(1, numberShare / 0.4),
      found: `${withNumbers.length} of ${lines.length} lines have a number`,
      fix:
        numberShare >= 0.4
          ? null
          : "Add a number to more lines: how many, how much, how fast, how often. \"Closed month-end in 4 days for 14 clients\" beats \"Handled month-end\".",
    },
    {
      id: "verbs",
      label: "Lines start with what you did",
      weight: 12,
      score: Math.min(1, verbHits.size / 6),
      found: verbHits.size ? `${verbHits.size} action verbs: ${[...verbHits].slice(0, 6).join(", ")}` : "no action verbs found",
      fix: verbHits.size >= 6 ? null : "Open more lines with a verb for what you did: led, built, cut, wrote, taught, launched.",
    },
    {
      id: "weak",
      label: "Phrases recruiters skip",
      weight: 12,
      score: Math.max(0, 1 - weakHits.length * 0.25),
      found: weakHits.length ? weakHits.map((w) => `"${w}"`).join(", ") : "none found",
      fix: weakHits.length ? "Replace each one with a fact that proves it. Instead of \"team player\", say who you worked with and what came of it." : null,
    },
    {
      id: "sections",
      label: "Standard sections",
      weight: 12,
      score: sections.length / SECTION_PATTERNS.length,
      found: sections.length ? sections.join(", ") : "no section headings found",
      fix: missing.length ? `Add a clear heading for ${missing.join(" and ")}.` : null,
    },
    {
      id: "length",
      label: "Length",
      weight: 10,
      score: lengthScore,
      found: `${wc} words`,
      fix:
        lengthScore === 1
          ? null
          : wc < 250
            ? "This is short. Add one or two lines of results under each recent role."
            : "This is long for most roles. Cut older jobs to one line each and keep the last ten years in detail.",
    },
    {
      id: "links",
      label: "A link to your work",
      weight: 8,
      score: link ? 1 : 0,
      found: link ? "link found" : "no links",
      fix: link ? null : "Add a LinkedIn URL or a portfolio link. A portfolio link lets a recruiter see the work, not just read about it.",
    },
    {
      id: "dates",
      label: "Dates on your roles",
      weight: 6,
      score: years.length >= 2 ? 1 : years.length === 1 ? 0.5 : 0,
      found: years.length ? `${years.length} years mentioned` : "no dates",
      fix: years.length >= 2 ? null : "Put start and end years beside every job and qualification.",
    },
    {
      id: "voice",
      label: "Resume voice",
      weight: 4,
      score: firstPerson <= 2 ? 1 : firstPerson <= 6 ? 0.5 : 0,
      found: `${firstPerson} uses of I, me or my`,
      fix: firstPerson <= 2 ? null : "Drop \"I\" and \"my\" from bullet points. Start with the verb instead.",
    },
    {
      id: "skim",
      label: "Easy to skim",
      weight: 4,
      score: longLines.length === 0 ? 1 : longLines.length <= 2 ? 0.5 : 0,
      found: longLines.length ? `${longLines.length} lines over 35 words` : "lines are a readable length",
      fix: longLines.length ? "Split long lines in two. One result per line reads faster." : null,
    },
  ]
}

export function totalScore(results: CheckResult[]): number {
  return Math.round(results.reduce((sum, r) => sum + r.weight * Math.max(0, Math.min(1, r.score)), 0))
}
