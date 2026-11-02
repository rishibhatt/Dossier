/**
 * ATS scan: reads a pasted resume, and optionally a job description, the way an applicant tracking system
 * does. It parses sections, matches the job's keywords (with aliases and stemming), checks that the text
 * would survive parsing, and reviews the bullets. Deterministic and explainable: every issue quotes what
 * was found and says what to change. It sees text only, so layout, fonts and columns are inferred from
 * how the pasted text looks.
 */

import { ACTION_VERBS, extractJobTerms, hasTerm, isSkill, NOISE, STOP, stem, stemmed, tokens } from "@/features/tools/textKit"

export { ACTION_VERBS }

export type Severity = "high" | "medium" | "low"
export type Area = "keywords" | "format" | "sections" | "content"

export type Issue = { id: string; area: Area; severity: Severity; title: string; evidence?: string; fix: string }

export type KeywordHit = {
  term: string
  weight: number
  found: boolean
  /** True when the term appears in the experience section, not only in a skills list. */
  inExperience: boolean
  required: boolean
}

export type BulletFix = { line: string; reason: string; rewrite: string | null }

export type AtsReport = {
  score: number
  parts: { label: string; score: number; weight: number }[]
  matchPct: number | null
  keywords: KeywordHit[] | null
  issues: Issue[]
  bulletFixes: BulletFix[]
  sections: { name: string; found: boolean }[]
  stats: { words: number; bullets: number; withNumbers: number }
}

/* ---------- sections and verb tense ---------- */

const SECTION_NAMES: Record<string, RegExp> = {
  Summary: /^(summary|profile|professional summary|about( me)?|objective|career objective)$/,
  Experience: /^(experience|work experience|professional experience|employment( history)?|work history|career history|relevant experience)$/,
  Education: /^(education|academic background|education and training|qualifications|academic qualifications)$/,
  Skills: /^(skills|technical skills|core skills|key skills|core competencies|competencies|skills and tools|tools and technologies|technologies|expertise)$/,
  Projects: /^(projects|selected projects|personal projects|portfolio)$/,
  Certifications: /^(certifications|certificates|licenses|licences|licenses and certifications|training)$/,
}
const REQUIRED_SECTIONS = ["Experience", "Education", "Skills"] as const

const E_VERBS = new Set(
  "create manage analyze analyse achieve improve service coordinate generate operate optimize optimise organize organise oversee reduce increase use schedule resolve introduce execute produce measure handle drive lead write run make give take".split(" ")
)
const IRREGULAR: Record<string, string> = { leading: "Led", building: "Built", running: "Ran", writing: "Wrote", driving: "Drove", making: "Made", giving: "Gave", taking: "Took", selling: "Sold", teaching: "Taught", winning: "Won", growing: "Grew", cutting: "Cut", holding: "Held", keeping: "Kept", setting: "Set", putting: "Put", "overseeing": "Oversaw" }

export function toPast(gerund: string): string | null {
  const g = gerund.toLowerCase()
  if (IRREGULAR[g]) return IRREGULAR[g]
  if (!g.endsWith("ing") || g.length < 6) return null
  let base = g.slice(0, -3)
  if (E_VERBS.has(`${base}e`)) return `${base[0].toUpperCase()}${base.slice(1)}ed`
  if (/([^aeiouyl])\1$/.test(base)) base = base.slice(0, -1)
  return `${base[0].toUpperCase()}${base.slice(1)}ed`
}

type Sections = Record<string, string>

function splitSections(text: string): { sections: Sections; found: Set<string> } {
  const sections: Sections = {}
  const found = new Set<string>()
  let current = "_top"
  sections[current] = ""
  for (const line of text.split("\n")) {
    const key = line.trim().toLowerCase().replace(/[^a-z& ]/g, " ").replace(/\s+/g, " ").trim().replace(/&/g, "and")
    const name = line.trim().length > 0 && line.trim().length <= 40 ? Object.keys(SECTION_NAMES).find((n) => SECTION_NAMES[n].test(key)) : undefined
    if (name) {
      current = name
      found.add(name)
      sections[current] ??= ""
      continue
    }
    sections[current] += `${line}\n`
  }
  return { sections, found }
}

/* ---------- experience years ---------- */

const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec"

function datedYears(text: string): number | null {
  const re = new RegExp(`(?:(?:${MONTHS})[a-z]*\\.?\\s+|\\d{1,2}/)?((?:19|20)\\d{2})\\s*(?:-|–|—|to)\\s*(?:(?:(?:${MONTHS})[a-z]*\\.?\\s+|\\d{1,2}/)?((?:19|20)\\d{2})|(present|current|now|today))`, "gi")
  const spans: [number, number][] = []
  const nowYear = new Date().getFullYear()
  for (const m of text.matchAll(re)) {
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : nowYear
    if (b >= a && a > 1980) spans.push([a, b])
  }
  if (!spans.length) return null
  spans.sort((x, y) => x[0] - y[0])
  let total = 0
  let [s, e] = spans[0]
  for (const [a, b] of spans.slice(1)) {
    if (a <= e) e = Math.max(e, b)
    else {
      total += e - s
      ;[s, e] = [a, b]
    }
  }
  return total + (e - s)
}

/* ---------- main ---------- */

const sev = { high: 0, medium: 1, low: 2 } as const

export function runAtsScan(resumeRaw: string, jdRaw = ""): AtsReport {
  const resume = resumeRaw.replace(/\r/g, "")
  const jd = jdRaw.trim()
  const lines = resume.split("\n")
  const nonEmpty = lines.filter((l) => l.trim())
  const words = resume.split(/\s+/).filter(Boolean)
  const wc = words.length
  const issues: Issue[] = []
  const push = (i: Issue) => issues.push(i)
  const { sections, found } = splitSections(resume)

  /* contact */
  const top = nonEmpty.slice(0, 8).join("\n")
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(resume)
  const emailTop = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(top)
  const phone = /(\+?\d[\d\s().-]{8,}\d)/.test(top)
  const linked = /(linkedin\.com\/in\/|github\.com\/|behance\.net\/|dribbble\.com\/|https?:\/\/[\w.-]+\.\w+)/i.test(resume)
  const place = /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+)\b/.test(top) || /remote/i.test(top)
  if (!email) push({ id: "email", area: "sections", severity: "high", title: "No email address found", fix: "Add an email address as plain text in the first lines. Recruiters cannot reply, and many systems reject a profile with no email." })
  else if (!emailTop) push({ id: "email-top", area: "sections", severity: "medium", title: "Email is not in the header", fix: "Move your email, phone and city to the top of page one. Parsers read contact details from the first few lines. Details in a page header or footer are often skipped." })
  if (!phone) push({ id: "phone", area: "sections", severity: "medium", title: "No phone number in the header", fix: "Add a phone number beside your email at the top." })
  if (!linked) push({ id: "link", area: "sections", severity: "low", title: "No profile or portfolio link", fix: "Add a LinkedIn URL or a portfolio link. Write the full address as text so a parser can read it." })

  /* sections */
  const sectionList = [...REQUIRED_SECTIONS, "Summary", "Projects"].map((name) => ({ name, found: found.has(name) }))
  for (const name of REQUIRED_SECTIONS) {
    if (found.has(name)) continue
    const wordSeen = new RegExp(`\\b${name === "Experience" ? "experience|employment" : name === "Education" ? "education|degree|university" : "skills"}\\b`, "i").test(resume)
    push({
      id: `section-${name}`,
      area: "sections",
      severity: name === "Experience" ? "high" : "medium",
      title: `No "${name}" heading found`,
      fix: wordSeen
        ? `The word appears, but not as a heading on its own line. Put "${name}" alone on a line so the parser can start a new section there.`
        : `Add a heading called "${name}" on its own line. Creative names like "My journey" are not recognised by most systems.`,
    })
  }

  /* format */
  const tabLines = lines.filter((l) => /\t/.test(l) || /\S {4,}\S/.test(l))
  if (tabLines.length >= 3) push({ id: "columns", area: "format", severity: "high", title: "Text looks like columns or a table", evidence: tabLines[0].trim().slice(0, 90), fix: "Use a single column. Many parsers read across columns line by line and mix up your jobs and skills. Put the sidebar content into its own section below the main one." })
  const pipeLines = nonEmpty.slice(5).filter((l) => (l.match(/\|/g) ?? []).length >= 2)
  if (pipeLines.length >= 3) push({ id: "pipes", area: "format", severity: "medium", title: "Pipe characters are separating data", evidence: pipeLines[0].trim().slice(0, 90), fix: "Put skills and role details in plain lines or a comma list. Pipes often come from tables, and tables parse badly." })
  const glyphs = resume.match(/[★☆●◆◇►▶➢➤❖✓✔✦■□▪▫◦○→⇒]|[\u{1F300}-\u{1FAFF}]/gu) ?? []
  if (glyphs.length) push({ id: "glyphs", area: "format", severity: "medium", title: `${glyphs.length} decorative symbols found`, evidence: [...new Set(glyphs)].slice(0, 6).join(" "), fix: "Switch to standard bullets (• or -). Some systems drop unknown symbols, and others print them as boxes." })
  const dateStyles = new Set<string>()
  if (new RegExp(`\\b(${MONTHS})[a-z]*\\.?\\s+(19|20)\\d{2}`, "i").test(resume)) dateStyles.add("Month YYYY")
  if (/\b\d{1,2}\/(19|20)\d{2}\b/.test(resume)) dateStyles.add("MM/YYYY")
  if (/\b\d{1,2}\/\d{1,2}\/(19|20)?\d{2}\b/.test(resume)) dateStyles.add("DD/MM/YYYY")
  if (dateStyles.size > 1) push({ id: "dates-mixed", area: "format", severity: "low", title: "Dates use more than one format", evidence: [...dateStyles].join(" and "), fix: "Pick one format, such as \"Mar 2022 – Aug 2024\", and use it for every role." })
  const shortLines = nonEmpty.filter((l) => l.trim().split(/\s+/).length <= 2)
  if (wc > 150 && shortLines.length / nonEmpty.length > 0.5) push({ id: "fragments", area: "format", severity: "medium", title: "Text breaks into very short lines", fix: "This usually means columns or text boxes copied out of order. Rebuild the resume in one text flow, then paste it again." })
  const caps = nonEmpty.filter((l) => l.length > 60 && l === l.toUpperCase() && /[A-Z]{6}/.test(l))
  if (caps.length) push({ id: "caps", area: "format", severity: "low", title: "Long lines in all capitals", evidence: caps[0].trim().slice(0, 80), fix: "Use capitals for section headings only. Long capitalised lines are harder to read and to match." })
  if (/\bpage \d+ of \d+\b/i.test(resume)) push({ id: "pagenum", area: "format", severity: "low", title: "Page numbers sit inside the text", fix: "Remove page numbers and footers. They can land in the middle of a job description." })
  if (wc > 1000) push({ id: "long", area: "format", severity: "medium", title: `Long at ${wc} words`, fix: "Aim for one or two pages. Keep the last ten years in detail and cut older jobs to one line." })
  else if (wc < 200) push({ id: "short", area: "content", severity: "medium", title: `Short at ${wc} words`, fix: "Add results under each recent role, or paste the whole resume if part is missing." })

  /* bullets */
  const bulletRe = /^\s*[•\-*▪◦●–·]\s+/
  const expText = sections.Experience ?? ""
  const bulletLines = lines.filter((l) => bulletRe.test(l)).map((l) => l.replace(bulletRe, "").trim())
  const pool = bulletLines.length >= 3 ? bulletLines : expText.split("\n").map((l) => l.trim()).filter((l) => l.split(/\s+/).length >= 6 && l.length < 350)
  const hasNumber = (l: string) => /\d/.test(l) && /(%|\b\d{2,}\b|\$|£|€|₹|\b\d+\s?(k|m|x)\b|\bhours?\b|\bdays?\b|\bweeks?\b|\busers?\b|\bclients?\b|\bcustomers?\b)/i.test(l)
  const withNumbers = pool.filter(hasNumber)
  const numShare = pool.length ? withNumbers.length / pool.length : 0
  const firstWord = (l: string) => l.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? ""
  const verbStart = pool.filter((l) => ACTION_VERBS.has(firstWord(l)) || /^[a-z]{4,}ed$/.test(firstWord(l)))
  const verbShare = pool.length ? verbStart.length / pool.length : 0
  const weakRe = /^(responsible for|duties (included|include)|worked on|helped( with| to)?|assisted (with|in)|involved in|tasked with|in charge of)\b/i
  const weakLines = pool.filter((l) => weakRe.test(l))
  const bulletFixes: BulletFix[] = []

  if (pool.length >= 3) {
    if (numShare < 0.3) push({ id: "numbers", area: "content", severity: "high", title: `Only ${withNumbers.length} of ${pool.length} bullets contain a number`, fix: "Add a number to each bullet that has one to give: how many, how much, how fast, how often. Systems that rank candidates and the people reading both favour results they can compare." })
    else if (numShare < 0.5) push({ id: "numbers", area: "content", severity: "low", title: `${withNumbers.length} of ${pool.length} bullets contain a number`, fix: "Add a number to the next few bullets. About half is a good aim." })
    if (verbShare < 0.6) push({ id: "verbs", area: "content", severity: "medium", title: `${pool.length - verbStart.length} of ${pool.length} bullets do not open with an action verb`, fix: "Start each bullet with what you did: led, built, cut, launched, wrote." })
    if (weakLines.length) push({ id: "weak", area: "content", severity: "medium", title: `${weakLines.length} bullets open with a weak phrase`, evidence: weakLines[0].slice(0, 90), fix: "Replace \"responsible for\" and \"helped with\" with the verb for what you actually did. See the rewrites below." })
    const starts = pool.map(firstWord)
    const repeat = [...new Set(starts)].map((w) => [w, starts.filter((s) => s === w).length] as const).sort((a, b) => b[1] - a[1])[0]
    if (repeat && repeat[1] >= 4 && repeat[0].length > 2) push({ id: "repeat", area: "content", severity: "low", title: `"${repeat[0]}" starts ${repeat[1]} bullets`, fix: "Vary the opening verb. The same word four times reads as a template." })
  } else if (found.has("Experience")) {
    push({ id: "nobullets", area: "content", severity: "medium", title: "No bullet points found under Experience", fix: "Write each role as 3 to 5 short bullets. Paragraphs are harder to scan and to match against a job." })
  }

  for (const l of weakLines.slice(0, 4)) {
    const m = l.match(/^(?:responsible for|in charge of|tasked with|involved in)\s+([a-z]+ing)\s+(.*)$/i)
    const past = m ? toPast(m[1]) : null
    bulletFixes.push({
      line: l,
      reason: m && past ? "Opens with a duty, not an achievement." : "Opens with a duty. Swap the opener for the verb for what you did (built, tested, led, fixed) and add the result.",
      rewrite: m && past ? `${past} ${m[2].replace(/\.$/, "")}, [add a number: how many, how much, how fast].` : null,
    })
  }
  for (const l of pool.filter((x) => !hasNumber(x) && !weakRe.test(x) && x.split(/\s+/).length >= 6)
    .sort((a, b) => b.length - a.length)
    .slice(0, Math.max(0, 5 - bulletFixes.length))) {
    bulletFixes.push({ line: l, reason: "No number. A reader cannot tell the size of the result.", rewrite: null })
  }

  /* keywords */
  let keywords: KeywordHit[] | null = null
  let matchPct: number | null = null
  if (jd.length >= 120) {
    const resumeStem = stemmed(tokens(resume))
    const expStem = stemmed(tokens(`${expText}\n${sections.Projects ?? ""}`))
    const terms = extractJobTerms(jd)
    keywords = terms.map((t) => ({
      term: t.term,
      weight: t.weight,
      required: t.required,
      found: hasTerm(resumeStem, t.term),
      inExperience: hasTerm(expStem, t.term),
    }))
    const total = keywords.reduce((s, k) => s + k.weight, 0) || 1
    const earned = keywords.reduce((s, k) => s + (k.found ? k.weight * (k.inExperience || !found.has("Experience") ? 1 : 0.7) : 0), 0)
    matchPct = Math.round((earned / total) * 100)

    const missing = keywords.filter((k) => !k.found)
    const missReq = missing.filter((k) => k.required || isSkill(k.term)).slice(0, 8)
    if (missReq.length) push({ id: "kw-missing", area: "keywords", severity: matchPct < 50 ? "high" : "medium", title: `${missing.length} job keywords are missing`, evidence: missReq.map((k) => k.term).join(", "), fix: "Add each one where you honestly used it: in a bullet under the role, and in your Skills list. Use the job post's wording, since systems match the words themselves. Skip any you cannot back up in an interview." })
    const skillOnly = keywords.filter((k) => k.found && !k.inExperience && found.has("Experience") && isSkill(k.term))
    if (skillOnly.length) push({ id: "kw-context", area: "keywords", severity: "low", title: `${skillOnly.length} keywords appear only in a list`, evidence: skillOnly.slice(0, 6).map((k) => k.term).join(", "), fix: "Show them in use. A bullet such as \"Cut page load 38% by moving the app to Next.js\" proves the skill and counts for more than a name in a list." })

    const titleLine = jd.split("\n").map((l) => l.trim()).find((l) => l.length > 3 && l.length <= 80)
    if (titleLine) {
      const tw = tokens(titleLine).filter((w) => !STOP.has(w) && !NOISE.has(w) && w.length > 2)
      const rs = new Set(tokens(top + "\n" + expText).map(stem))
      const hit = tw.filter((w) => rs.has(stem(w))).length
      if (tw.length >= 2 && tw.length <= 6 && hit / tw.length < 0.5) push({ id: "title", area: "keywords", severity: "medium", title: "The job title does not appear in your resume", evidence: titleLine, fix: "If it honestly describes you, put the target title in your headline or summary, for example \"Senior Product Designer\". Recruiters and filters search titles first." })
    }

    const need = jd.match(/(\d{1,2})\s*\+?\s*(?:years|yrs)/i)
    const have = datedYears(resume)
    if (need && have !== null && have + 0.5 < Number(need[1])) push({ id: "years", area: "keywords", severity: "medium", title: `Job asks for ${need[1]}+ years, your dated roles add up to about ${have}`, fix: "This is an estimate from the date ranges on the page. If you have related work that is not dated here, such as freelance work or internships, add it with dates." })
    const wantsDegree = /\b(bachelor|master|phd|doctorate|b\.?sc|m\.?sc|degree)\b/i.test(jd)
    if (wantsDegree && !/\b(bachelor|master|phd|doctorate|b\.?sc|m\.?sc|b\.?a\.?|b\.?s\.?|b\.?tech|m\.?tech|mba|diploma|degree)\b/i.test(resume)) push({ id: "degree", area: "keywords", severity: "low", title: "Job mentions a degree and none is listed", fix: "Add your highest qualification under Education, with the school and the year." })
  }

  /* scoring */
  const contactPts = (email ? 50 : 0) + (emailTop ? 10 : 0) + (phone ? 20 : 0) + (linked ? 10 : 0) + (place ? 10 : 0)
  const sectionPts = (REQUIRED_SECTIONS.filter((n) => found.has(n)).length / REQUIRED_SECTIONS.length) * 100
  const formatScore = Math.max(0, 100 - issues.filter((i) => i.area === "format").reduce((s, i) => s + (i.severity === "high" ? 35 : i.severity === "medium" ? 18 : 8), 0))
  const contentScore = pool.length >= 3
    ? Math.min(40, (numShare / 0.5) * 40) + Math.min(30, (verbShare / 0.8) * 30) + Math.max(0, 30 - weakLines.length * 10)
    : found.has("Experience") ? 30 : 10
  const parts = [
    { label: "Keyword match", score: matchPct ?? 0, weight: matchPct === null ? 0 : 40 },
    { label: "Readable by a parser", score: formatScore, weight: matchPct === null ? 25 : 20 },
    { label: "Sections and contact", score: Math.round(sectionPts * 0.6 + contactPts * 0.4), weight: matchPct === null ? 25 : 15 },
    { label: "Bullet quality", score: Math.round(contentScore), weight: matchPct === null ? 50 : 25 },
  ].filter((p) => p.weight > 0)
  const wsum = parts.reduce((s, p) => s + p.weight, 0)
  const score = Math.round(parts.reduce((s, p) => s + p.score * p.weight, 0) / wsum)

  issues.sort((a, b) => sev[a.severity] - sev[b.severity])

  return {
    score,
    parts,
    matchPct,
    keywords,
    issues,
    bulletFixes,
    sections: sectionList,
    stats: { words: wc, bullets: pool.length, withNumbers: withNumbers.length },
  }
}
