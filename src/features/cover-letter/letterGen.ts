/**
 * Cover letter generator: rule-based, pure, runs in the browser. Builds the four usual paragraphs (opening,
 * proof, fit, closing) from the person's own resume facts and the job ad, in two or three shapes:
 * result first, skills first, and (when the target role differs from the current one) career change.
 *
 * Rules:
 * - Only the person's facts. Every number in the output comes from their resume; nothing is estimated.
 * - A missing fact becomes a [bracketed placeholder] that says what to add. The checker flags any left in.
 * - Plain sentences: no stock openers, no claims about feelings, and not every sentence starting with "I".
 */
import type { FactBullet, ResumeFacts } from "../../lib/cover-letter/fromResume"
import { defaultGreeting, defaultSignOff } from "../../lib/cover-letter/renderModel"
import { letterParagraph, type LetterParagraph, type ParagraphKind } from "../../lib/cover-letter/schema"
import type { PresetId } from "../../lib/resume/schema"
import { ACTION_VERBS, canon, extractJobTerms, hasTerm, isSkill, stemmed, tokens } from "../tools/textKit"

export type LetterVariantId = "result-first" | "skills-first" | "career-change"

export type LetterGenInput = {
  /** From resumeFacts() / letterFromResume(). Null or missing for a letter started blank. */
  facts?: ResumeFacts | null
  /** The job title applied for. */
  role?: string
  company?: string
  /** "Ms Jane Doe". Empty = "Dear Hiring Manager". */
  recipientName?: string
  /** Where the ad was seen ("LinkedIn"). */
  source?: string
  /** The pasted job ad. Ranks the proof bullets and picks the skills to name. */
  jobPost?: string
  preset?: PresetId
}

export type GeneratedParagraph = { kind: ParagraphKind; text: string }

export type LetterVariant = {
  id: LetterVariantId
  label: string
  greeting: string
  paragraphs: GeneratedParagraph[]
  signOff: string
}

export type BuiltLetter = {
  /** The first (recommended) variant, spread out for convenience. */
  greeting: string
  paragraphs: GeneratedParagraph[]
  signOff: string
  variant: LetterVariantId
  /** Two or three shapes built from the same facts. The first one is the one above. */
  variants: LetterVariant[]
}

const LABELS: Record<LetterVariantId, string> = {
  "result-first": "Result first",
  "skills-first": "Skills first",
  "career-change": "Career change",
}

/* ---------- small text helpers ---------- */

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim()
const strip = (s: string) => clean(s).replace(/[.;,:\s]+$/, "")
const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s)
/** Lower-cases the first letter unless the word is an acronym or a name with inner capitals ("SQL", "iOS", "McKinsey"). */
const low = (s: string) => (s && !/^[A-Z]{2,}|^[A-Z][a-z]+[A-Z]|^I\b/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s)
const article = (w: string) => (/^[aeiou]/i.test(w) && !/^(uni|use|eu|one)/i.test(w) && !/^U[A-Z]/.test(w) ? "an" : "a")

/** "a, b and c". */
export function listOf(items: string[]): string {
  const xs = items.filter(Boolean)
  if (xs.length <= 1) return xs[0] ?? ""
  return `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`
}

const IRREGULAR_GERUND: Record<string, string> = {
  leading: "led", building: "built", running: "ran", writing: "wrote", driving: "drove", making: "made", giving: "gave", taking: "took",
  selling: "sold", teaching: "taught", winning: "won", growing: "grew", cutting: "cut", holding: "held", keeping: "kept", setting: "set", overseeing: "oversaw",
}
const E_VERBS = new Set("create manage analyze analyse achieve improve service coordinate generate operate optimize optimise organize organise reduce increase use schedule resolve introduce execute produce measure handle".split(" "))

/** "managing" -> "managed", "leading" -> "led". Same rules as the ATS checker's bullet fixer. */
function gerundToPast(g: string): string | null {
  if (IRREGULAR_GERUND[g]) return IRREGULAR_GERUND[g]!
  if (!g.endsWith("ing") || g.length < 6) return null
  let base = g.slice(0, -3)
  if (E_VERBS.has(`${base}e`)) return `${base}ed`
  if (/([^aeiouyl])\1$/.test(base)) base = base.slice(0, -1)
  return `${base}ed`
}

/** Past forms that don't end in -ed. */
const IRREGULAR_PAST = new Set("built rebuilt led ran wrote rewrote grew cut sold taught won made drove held kept set gave took oversaw brought began spent met found put sent chose upheld".split(" "))
/** Common present-tense resume verbs that ACTION_VERBS (past forms only) doesn't cover. */
const PRESENT_E = new Set("prepare handle oversee coordinate manage create reduce increase produce introduce resolve analyse analyze organise organize optimise optimize improve achieve generate operate schedule measure execute translate negotiate facilitate guide serve".split(" "))
const PRESENT_ED = new Set("own support track report assist maintain process deliver lead design develop launch build help train mentor review test monitor plan audit draft partner".split(" "))

const IRREGULAR_PRESENT: Record<string, string> = {
  lead: "led", build: "built", run: "ran", write: "wrote", grow: "grew", cut: "cut", sell: "sold", teach: "taught", win: "won",
  make: "made", drive: "drove", hold: "held", keep: "kept", set: "set", give: "gave", take: "took", oversee: "oversaw", bring: "brought",
}

/**
 * A resume bullet as a first person, past tense clause: "Cut onboarding from 9 to 4 days" -> "I cut onboarding
 * from 9 to 4 days". Returns null when the bullet doesn't start with a verb, so the caller can quote it instead.
 */
export function firstPerson(bullet: string): string | null {
  const t = strip(bullet)
  const m = t.match(/^([A-Za-z]+)\b(.*)$/)
  if (!m) return null
  const word = m[1]!.toLowerCase()
  const rest = m[2]!
  let past: string | null = null
  if (ACTION_VERBS.has(word) || IRREGULAR_PAST.has(word) || /^[a-z]{3,}ed$/.test(word)) past = word
  else if (word.endsWith("ing")) past = gerundToPast(word)
  else if (IRREGULAR_PRESENT[word]) past = IRREGULAR_PRESENT[word]!
  else if (ACTION_VERBS.has(`${word}d`) || PRESENT_E.has(word)) past = `${word}d`
  else if (PRESENT_ED.has(word)) past = `${word}ed`
  else if (ACTION_VERBS.has(`${word}ed`)) past = `${word}ed`
  if (!past) return null
  return `I ${past}${rest}`
}

/* ---------- picking facts ---------- */

type Ranked = FactBullet & { score: number }

/** Numbered bullets ranked by how many job ad terms they hit (weighted); ties keep resume order (newest first). */
export function rankBullets(bullets: FactBullet[], jobPost: string): Ranked[] {
  const terms = clean(jobPost).length >= 40 ? extractJobTerms(jobPost) : []
  return bullets
    .map((b, i) => {
      const hay = stemmed(tokens(b.text))
      const score = terms.reduce((n, t) => n + (hasTerm(hay, t.term) ? t.weight : 0), 0)
      return { b: { ...b, score }, i }
    })
    .sort((x, y) => y.b.score - x.b.score || x.i - y.i)
    .map((x) => x.b)
}

/**
 * Job ad skills that are also on the resume (skills list or bullets), strongest first, spelled the way the
 * resume spells them. Without a job ad, the first resume skills.
 */
export function matchedSkills(facts: ResumeFacts | null | undefined, jobPost: string, max = 4): string[] {
  const skills = facts?.skills ?? []
  if (!skills.length) return []
  if (clean(jobPost).length < 40) return skills.slice(0, Math.min(max, 3))
  const resumeHay = stemmed(tokens([...skills, ...(facts?.numbered ?? []).map((b) => b.text), facts?.summary ?? ""].join(" \n ")))
  const out: string[] = []
  for (const t of extractJobTerms(jobPost)) {
    if (!isSkill(t.term) || !hasTerm(resumeHay, t.term)) continue
    // Prefer the resume's own spelling ("PostgreSQL", not "postgresql").
    const own = skills.find((s) => stemmed(tokens(s)) === stemmed(t.term.split(" "))) ?? skills.find((s) => canon(s).includes(t.term))
    const label = own ?? t.term
    if (!out.some((o) => o.toLowerCase() === label.toLowerCase())) out.push(label)
    if (out.length >= max) break
  }
  return out
}

/** True when the target role shares no meaningful word with the latest job title. */
function isCareerChange(role: string, facts: ResumeFacts | null | undefined) {
  const latest = facts?.latest?.role
  if (!role || !latest) return false
  const words = (s: string) => new Set(tokens(s).filter((w) => w.length > 2 && !["senior", "junior", "lead", "head", "the", "and"].includes(w)))
  const a = words(role)
  const b = words(latest)
  return a.size > 0 && ![...a].some((w) => b.has(w))
}

/* ---------- sentences ---------- */

function proofSentences(picked: FactBullet[]): string {
  const parts: string[] = []
  picked.forEach((b, i) => {
    const fp = firstPerson(b.text)
    const where = b.org ? `at ${b.org}` : ""
    const sameOrg = i > 0 && picked[i - 1]!.org === b.org
    if (fp) {
      if (i === 0) parts.push(where ? `At ${b.org}, ${fp}.` : `${cap(fp)}.`)
      else parts.push(sameOrg || !where ? `${cap(fp.replace(/^I /, "I also "))}.` : `Before that, ${where}, ${fp}.`)
    } else {
      const quoted = low(strip(b.text))
      parts.push(i === 0 ? `One result ${where ? `from my work ${where}` : "I can point to"}: ${quoted}.` : `Another result: ${quoted}${where && !sameOrg ? ` (${b.org})` : ""}.`)
    }
  })
  return parts.join(" ")
}

const PROOF_PLACEHOLDER = "[Add one result with a number: what you did, and what changed because of it.]"
const SKILLS_PLACEHOLDER = "[Name two or three skills from the ad that you have used, and where you used them.]"

function since(facts: ResumeFacts | null | undefined) {
  const y = facts?.latest?.current ? facts.latest.start.slice(0, 4) : ""
  return /^\d{4}$/.test(y) ? y : ""
}

function whoSentence(facts: ResumeFacts | null | undefined): string {
  const l = facts?.latest
  if (l && l.role && l.org) {
    const y = since(facts)
    if (l.current) return y ? `Since ${y}, I have worked as ${article(l.role)} ${l.role} at ${l.org}.` : `Right now I work as ${article(l.role)} ${l.role} at ${l.org}.`
    return `Most recently, I worked as ${article(l.role)} ${l.role} at ${l.org}.`
  }
  if (l && (l.role || l.org)) return l.role ? `Most recently, I worked as ${article(l.role)} ${l.role}.` : `Most recently, I worked at ${l.org}.`
  const e = facts?.education
  if (e && (e.degree || e.school)) {
    const what = [e.degree, e.school && `at ${e.school}`].filter(Boolean).join(" ")
    return e.current ? `My studies: ${what}, due to finish ${e.end ? e.end.slice(0, 4) : "[year]"}.` : `My background: ${what}.`
  }
  if (facts?.headline) return `My background: ${facts.headline}.`
  return "[One sentence on who you are: your current role or studies, and where.]"
}

/* ---------- builder ---------- */

export function buildLetter(input: LetterGenInput): BuiltLetter {
  const facts = input.facts ?? null
  const role = strip(input.role ?? "") || strip(facts?.headline ?? "")
  const company = strip(input.company ?? "")
  const source = strip(input.source ?? "")
  const jobPost = input.jobPost ?? ""
  const preset = input.preset ?? "us"
  const recipient = clean(input.recipientName)

  const roleRef = role || "[job title]"
  const companyRef = company || "[company]"
  const greeting = defaultGreeting(recipient)
  const signOff = defaultSignOff(preset, recipient !== "")

  const ranked = rankBullets(facts?.numbered ?? facts?.proof ?? [], jobPost)
  const picked = ranked.slice(0, 2)
  const skills = matchedSkills(facts, jobPost)
  const hasAd = clean(jobPost).length >= 40
  const whyCompany = `[Why ${company || "this company"}: add one specific thing]`

  const ask = `Please consider me for the ${roleRef} role at ${companyRef}${source ? `, which I saw on ${source}` : ""}.`
  const proof = picked.length ? proofSentences(picked) : PROOF_PLACEHOLDER

  const fitSkills = skills.length
    ? hasAd
      ? `The ad asks for ${listOf(skills)}, and I have used ${skills.length === 1 ? "it" : "each of them"} in my own work.`
      : `The tools I rely on most are ${listOf(skills)}.`
    : SKILLS_PLACEHOLDER
  const fit = `${fitSkills} ${whyCompany}`

  const closing = "Thank you for your time. Could we set up a short call to talk about the role? I can go into more detail on any of this work, and my contact details are above."

  // A fact that ends in a full stop ("Co.") must not get a second one.
  const p = (kind: ParagraphKind, text: string): GeneratedParagraph => ({ kind, text: clean(text).replace(/(?<!\.)\.\.(?!\.)/g, ".") })
  const variants: LetterVariant[] = []

  // 1. Result first: who and what, then the strongest numbered result, then fit.
  variants.push({
    id: "result-first",
    label: LABELS["result-first"],
    greeting,
    signOff,
    paragraphs: [p("opening", `${ask} ${whoSentence(facts)}`), p("proof", proof), p("fit", fit), p("closing", closing)],
  })

  // 2. Skills first: lead with the overlap between the ad and the resume, then the results that back it up.
  const skillsLead = skills.length
    ? `${hasAd ? `The ${roleRef} role calls for` : "My core skills are"} ${listOf(skills)}${hasAd ? (skills.length === 1 ? ", which I have used in my own work" : ", all of which I have used in my own work") : ""}. ${whoSentence(facts)}`
    : whoSentence(facts)
  variants.push({
    id: "skills-first",
    label: LABELS["skills-first"],
    greeting,
    signOff,
    paragraphs: [
      p("opening", `${ask} ${skillsLead}`),
      p("proof", picked.length ? `${picked.length === 1 ? "One example" : "Two examples"} of that work. ${proof}` : PROOF_PLACEHOLDER),
      p("fit", skills.length ? whyCompany : `${SKILLS_PLACEHOLDER} ${whyCompany}`),
      p("closing", closing),
    ],
  })

  // 3. Career change: name the move, then what carries over.
  if (isCareerChange(role, facts) || (!facts?.latest && facts?.education)) {
    const from = facts?.latest
      ? `after working as ${article(facts.latest.role || "x")} ${facts.latest.role || "[current role]"}${facts.latest.org ? ` at ${facts.latest.org}` : ""}`
      : facts?.education
        ? `after ${[facts.education.degree, facts.education.school && `at ${facts.education.school}`].filter(Boolean).join(" ")}`
        : "after [your current field]"
    variants.push({
      id: "career-change",
      label: LABELS["career-change"],
      greeting,
      signOff,
      paragraphs: [
        p("opening", `${ask} This would be a move into ${roleRef} work ${from}, and much of what I did there carries over.`),
        p("proof", !picked.length ? PROOF_PLACEHOLDER : proof.startsWith("At ") ? `The clearest example: at ${proof.slice(3)}` : proof),
        p("fit", `${skills.length ? `Skills that transfer directly: ${listOf(skills)}.` : SKILLS_PLACEHOLDER} ${whyCompany}`),
        p("closing", closing),
      ],
    })
  }

  // A career changer sees the career-change shape first.
  if (variants.length === 3 && isCareerChange(role, facts)) variants.unshift(variants.pop()!)

  const first = variants[0]!
  return { greeting: first.greeting, paragraphs: first.paragraphs, signOff: first.signOff, variant: first.id, variants }
}

/** Generated paragraphs as editor paragraphs, each with a fresh id. */
export function toLetterParagraphs(paragraphs: GeneratedParagraph[]): LetterParagraph[] {
  return paragraphs.map((x) => letterParagraph(x.kind, x.text))
}

/** True when a paragraph still holds a [bracketed] placeholder. */
export const hasPlaceholder = (text: string) => /\[[^\]]{2,}\]/.test(text)
