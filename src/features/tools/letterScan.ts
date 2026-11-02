/**
 * Cover letter check: reads a pasted letter, and optionally the job post, the way a recruiter reads it on the
 * first pass. It looks for the company and role by name, a clear structure, a sensible length, proof with a
 * number, the job post's key words, and stock phrases. Deterministic and explainable like the ATS scan: every
 * issue quotes what was found and says what to change. Shared by the free checker page and the editor's Check tab.
 */

import type { Severity } from "@/features/tools/atsScan"
import { ACTION_VERBS, extractJobTerms, hasTerm, isSkill, NOISE, STOP, stem, stemmed, tokens } from "@/features/tools/textKit"

export type { Severity }

export type LetterArea = "keywords" | "personal" | "structure" | "length" | "evidence" | "tone"

export type LetterIssue = { id: string; area: LetterArea; severity: Severity; title: string; evidence?: string; fix: string }

export type LetterKeyword = { term: string; weight: number; found: boolean; required: boolean }

/** One sentence that uses a stock phrase, with the reason and a plainer way to say it. */
export type LineFix = { line: string; phrase: string; reason: string; fix: string }

export type LetterReport = {
  score: number
  parts: { label: string; score: number; weight: number }[]
  /** Share of the job post's top keywords found, weighted. Null when no job post (120+ characters) was given. */
  matchPct: number | null
  keywords: LetterKeyword[] | null
  issues: LetterIssue[]
  lineFixes: LineFix[]
  /** What the check took to be the company and role, so a caller can show or correct it. */
  detected: { company: string | null; role: string | null; greeting: string | null; signOff: string | null }
  stats: { words: number; paragraphs: number; sentences: number; withNumbers: number }
}

export type LetterScanOptions = {
  /** Known company name, for example from the editor's form. Wins over what is guessed from the job post. */
  company?: string
  /** Known job title. Wins over the job post's first line. */
  role?: string
  /** The writer's name, checked under the sign-off. */
  name?: string
  /** Resume text. When given, sentences copied word for word from it are flagged. */
  resume?: string
}

/** sessionStorage key the checker uses to pass the pasted letter (plain text) to the cover letter maker. */
export const LETTER_HANDOFF_KEY = "dossier:letter:handoff"

/* ---------- phrase lists ---------- */

type Phrase = { re: RegExp; reason: string; fix: string }

const CLICHES: Phrase[] = [
  { re: /\bI(?: am|'m) writing (?:to|in order to) (?:apply|express|submit|inquire)\b/i, reason: "Every second letter opens this way. It tells the reader nothing the subject line has not.", fix: "Open with the role and one reason you fit it: \"I'd like to bring five years of retail pricing work to the Data Analyst role at Northwind.\"" },
  { re: /\bI would like to apply for\b/i, reason: "A stock opener that delays the point.", fix: "Name the role and the strongest reason you fit it in the first sentence." },
  { re: /\bpassion(?:ate)?\b/i, reason: "Everyone says it, so it carries no weight.", fix: "Show the interest instead: something you built, studied or followed in this field." },
  { re: /\bteam player\b/i, reason: "A claim with no proof.", fix: "Name a team result you were part of and what your part was." },
  { re: /\bhard[- ]?working\b/i, reason: "A claim every applicant makes.", fix: "Replace it with something you did that took effort, with a number." },
  { re: /\bthink(?:ing)? outside (?:of )?the box\b/i, reason: "A worn phrase that reads as filler.", fix: "Describe the unusual fix you found and what it changed." },
  { re: /\b(?:perfect|ideal|great|good|strong) (?:fit|match|candidate)\b/i, reason: "The reader decides fit. Saying it does not make it so.", fix: "Point to the one requirement in the job post you meet best and show it." },
  { re: /\bdream (?:job|role|company)\b/i, reason: "Sounds eager but says nothing about the job.", fix: "Say what about this team or product drew you, in one specific sentence." },
  { re: /\bresults?[- ](?:driven|oriented)\b/i, reason: "A label without a result.", fix: "Give the result itself: what changed, by how much." },
  { re: /\bgo[- ]getter\b/i, reason: "Informal and unprovable.", fix: "Name something you started without being asked, and what came of it." },
  { re: /\bdetail[- ]oriented\b/i, reason: "A claim every applicant makes.", fix: "Show it: an error rate you cut, a review you ran, a launch with no defects." },
  { re: /\bself[- ]starter\b/i, reason: "A label without proof.", fix: "Name something you started on your own and what it led to." },
  { re: /\bproven track record\b/i, reason: "Stock wording that promises proof and gives none.", fix: "Give the record: one result, with a number." },
  { re: /\b(?:quick|fast) learner\b/i, reason: "Every applicant says it.", fix: "Name a tool or field you picked up and how fast you used it for real work." },
  { re: /\bthink I would be a great\b|\bI believe I (?:would|will) be an? (?:great|valuable|excellent)\b/i, reason: "Hedged self-praise.", fix: "Cut it and let the example before it make the case." },
  { re: /\bplease find (?:attached|enclosed)\b/i, reason: "Old letter wording. The reader can see the attachment.", fix: "Cut it, or say \"My resume has the full detail.\"" },
]

const HEDGES = /\b(?:I think|I feel|I hope|I guess|I would like to think|maybe|perhaps|somewhat|hopefully|I just)\b/gi
const APOLOGIES = /\b(?:sorry|apologi[sz]e|although I (?:do not|don't) have|despite (?:my )?(?:lack|limited)|I (?:know|realize|realise|understand) (?:that )?I (?:do not|don't|may not|might not)|I may not have|while I lack|lack of experience|not the most experienced)\b/gi

const GREETING = /^(?:dear|hi|hello|hey|greetings|to whom|good (?:morning|afternoon|day))\b/i
const GENERIC_GREETING = /to whom it may concern|sir\s*(?:\/|or)\s*madam|^dear (?:sir|madam|sirs)\b/i
const ROLE_GREETING = /^(?:dear|hi|hello)\s+(?:the\s+)?(?:hiring (?:manager|team)|recruit(?:er|ment team|ing team)|talent (?:team|acquisition)|selection committee|[\w&-]+ team)\b/i
const SIGN_OFF = /^(?:(?:yours )?sincerely|(?:with )?(?:best|kind|warm|warmest)(?: regards| wishes)?|regards|yours (?:faithfully|truly|sincerely)|(?:many )?thanks(?: again)?|thank you(?: for your (?:time|consideration))?|respectfully(?: yours)?|cheers|all the best|with thanks|best)[,.!]?$/i
const PLACEHOLDER = /\[[^\]\n]{1,60}\]|\{[^}\n]{1,60}\}|<[A-Za-z][^>\n]{0,40}>|\b(?:XXX+|insert (?:company|name|role)[^.\n]*|hiring manager's name)\b/gi
const ASK = /\b(?:interview|call|chat|talk|discuss|meet|meeting|conversation|speak|walk you through|show you|next step|available|availability)\b/i
const SOFT_ASK = /\b(?:hear(?:ing)? from you|hear back|consideration|in touch|contact me|reach me)\b/i
const RESULT_WORDS = /\b(?:doubled|tripled|halved|quadrupled|cut|raised|grew|reduced|increased|saved|won|ranked|first|top)\b/i
const NUMBER = /(?:\d+(?:[.,]\d+)?\s?(?:%|percent|x\b|k\b|m\b|million|billion|hours?|days?|weeks?|months?|years?|people|users|clients|customers|students|patients|projects|sites|stores|countries|languages|accounts|reports|tickets|deals)|[$£€₹]\s?\d|\b\d{2,}\b)/i
const ACRONYMS = new Set("HIPAA GAAP IFRS NASDAQ SCRUM AGILE UX UI SQL HTML CSS API AWS GCP ERP CRM SAAS NHS NGO MBA PHD BSC MSC KPI KPIS OKR OKRS SEO SEM CEO CTO CFO COO VP USA UK UAE EU".split(" "))

/* ---------- parsing ---------- */

const sev = { high: 0, medium: 1, low: 2 } as const
const clip = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
const countWords = (s: string) => s.split(/\s+/).filter(Boolean).length
const splitSentences = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=["“‘(]?[A-Z0-9])/)
    .map((x) => x.trim())
    .filter((x) => countWords(x) >= 2)
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

type Parsed = { greeting: string | null; signOff: string | null; signName: string | null; paragraphs: string[]; contact: boolean }

function parseLetter(text: string): Parsed {
  const lines = text.split("\n").map((l) => l.trim())
  const firstLines = lines.map((l, i) => [l, i] as const).filter(([l]) => l).slice(0, 10)
  const gHit = firstLines.find(([l]) => l.length <= 90 && GREETING.test(l))
  const gIdx = gHit ? gHit[1] : -1
  let sIdx = -1
  for (let i = lines.length - 1; i > gIdx; i--) {
    if (lines[i] && lines[i].length <= 45 && SIGN_OFF.test(lines[i])) {
      sIdx = i
      break
    }
  }
  let start = gIdx + 1
  if (gIdx < 0) {
    // No greeting: skip a header block (name, address, date) and start at the first line that reads like prose.
    const firstProse = lines.findIndex((l) => countWords(l) >= 8)
    start = firstProse < 0 ? 0 : firstProse
  }
  const end = sIdx < 0 ? lines.length : sIdx
  const bodyLines = lines.slice(start, end)
  const hasBlank = bodyLines.some((l, i) => !l && bodyLines.slice(0, i).some(Boolean) && bodyLines.slice(i).some(Boolean))
  const blocks: string[] = []
  if (hasBlank) {
    let cur: string[] = []
    for (const l of bodyLines) {
      if (l) cur.push(l)
      else if (cur.length) {
        blocks.push(cur.join(" "))
        cur = []
      }
    }
    if (cur.length) blocks.push(cur.join(" "))
  } else {
    blocks.push(...bodyLines.filter(Boolean))
  }
  // Without a sign-off, a short last line or two is usually the name, not a paragraph.
  let paragraphs = blocks.filter((b) => countWords(b) >= 4)
  let signName: string | null = null
  if (sIdx >= 0) {
    const after = lines.slice(sIdx + 1).filter(Boolean)
    signName = after.find((l) => /^[A-Z][\p{L}'.-]+(?:\s+[A-Z][\p{L}'.-]*){0,3}$/u.test(l)) ?? null
  } else if (paragraphs.length > 1) {
    const last = paragraphs[paragraphs.length - 1]
    if (countWords(last) <= 4) paragraphs = paragraphs.slice(0, -1)
  }
  const contact = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text) || /(\+?\d[\d\s().-]{8,}\d)/.test(text) || /linkedin\.com\/in\//i.test(text)
  return { greeting: gIdx >= 0 ? lines[gIdx] : null, signOff: sIdx >= 0 ? lines[sIdx] : null, signName, paragraphs, contact }
}

/* ---------- company and role ---------- */

const NOT_COMPANY = new Set("The Our Us This That We You Your A An It Its Their Them Home Least Most Scale Speed Pace Work Remote Hybrid Times Every All Any Some One Least Present Least I My Me Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(" "))

function guessCompany(jd: string): string | null {
  const field = jd.match(/^(?:company|employer|organi[sz]ation|hiring company)\s*[:\-–]\s*(.{2,60})$/im)
  if (field) return field[1].trim()
  const counts = new Map<string, number>()
  const re = /\b(?:at|join|about)[ \t]+((?:[A-Z][\w&'-]*)(?:[ \t]+(?:[A-Z][\w&'-]*|&)){0,3})|((?:[A-Z][\w&'-]*)(?:[ \t]+[A-Z][\w&'-]*){0,2})[ \t]+is[ \t]+(?:hiring|looking|seeking|a\b|an\b)/g
  for (const m of jd.matchAll(re)) {
    const raw = (m[1] ?? m[2] ?? "").replace(/[.,'’]+$/, "").replace(/\s+&$/, "").trim()
    const first = raw.split(/\s+/)[0]
    if (!raw || NOT_COMPANY.has(first) || raw.length < 2 || isSkill(raw.toLowerCase())) continue
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }
  let best: string | null = null
  let n = 0
  for (const [k, v] of counts) {
    const total = v + (jd.match(new RegExp(`\\b${escapeRe(k)}\\b`, "g"))?.length ?? 0)
    if (total > n) {
      best = k
      n = total
    }
  }
  return best
}

function guessRole(jd: string, company: string | null): string | null {
  for (const raw of jd.split("\n").slice(0, 6)) {
    let l = raw.trim().replace(/^(?:job title|title|role|position)\s*[:\-–]\s*/i, "")
    if (l.length < 3 || l.length > 80 || /[.!?]$/.test(l) || countWords(l) > 8) continue
    if (/^(?:about|company|location|salary|we|our|the role|job description|overview)\b/i.test(l)) continue
    l = l.split(/\s+(?:at|@)\s+|\s+[|–—-]\s+|,\s+/)[0].trim()
    if (l.length >= 3 && l.toLowerCase() !== company?.toLowerCase()) return l
  }
  return null
}

function roleWords(role: string): string[] {
  return tokens(role).filter((w) => !STOP.has(w) && !NOISE.has(w) && w.length > 1)
}

function namesRole(text: string, words: string[]): boolean {
  if (!words.length) return false
  const have = new Set(tokens(text).map(stem))
  const hit = words.filter((w) => have.has(stem(w))).length
  // Short titles need every word ("Data Analyst" is not named by "data" alone).
  return hit / words.length >= (words.length <= 2 ? 1 : 0.66)
}

/* ---------- main ---------- */

export function runLetterScan(letterRaw: string, jdRaw = "", opts: LetterScanOptions = {}): LetterReport {
  const letter = letterRaw.replace(/\r/g, "").trim()
  const jd = jdRaw.replace(/\r/g, "").trim()
  const hasJd = jd.length >= 120
  const issues: LetterIssue[] = []
  const push = (i: LetterIssue) => issues.push(i)
  const lineFixes: LineFix[] = []

  const p = parseLetter(letter)
  const words = countWords(letter)
  const body = p.paragraphs.join("\n\n")
  const bodySentences = p.paragraphs.flatMap(splitSentences)
  const opening = bodySentences.slice(0, 2).join(" ")
  const lastPara = p.paragraphs[p.paragraphs.length - 1] ?? ""

  /* personalization */
  let personal = 100
  // Without a job post, take the employer from the letter itself ("the Data Analyst role at Northwind").
  const fromLetter =
    body
      .match(/\b(?:join|(?:position|role|opening|vacancy|job|team) (?:at|with))[ \t]+((?:[A-Z][\w&'-]*)(?:[ \t]+[A-Z][\w&'-]*){0,2})/)?.[1]
      ?.trim() ?? null
  const company = opts.company?.trim() || (hasJd ? guessCompany(jd) : null) || (fromLetter && !NOT_COMPANY.has(fromLetter.split(" ")[0]) ? fromLetter : null)
  const role = opts.role?.trim() || (hasJd ? guessRole(jd, company) : null)
  const rWords = role ? roleWords(role) : []

  if (company && company !== fromLetter) {
    const named = new RegExp(`\\b${escapeRe(company.toLowerCase())}\\b`).test(body.toLowerCase())
    if (!named) {
      personal -= 40
      push({ id: "company", area: "personal", severity: "high", title: `"${company}" is not named in the letter`, evidence: opening ? clip(opening) : undefined, fix: `Name ${company} in the first paragraph and say one specific thing about it: a product, a market or a recent move that drew you. A letter that could go to any company reads like it did.` })
    }
    const wrong = [...body.matchAll(/\b(?:join|(?:position|role|opening|vacancy|job) (?:at|with))[ \t]+((?:[A-Z][\w&'-]*)(?:[ \t]+[A-Z][\w&'-]*){0,2})/g)]
      .map((m) => m[1].replace(/[.,]+$/, ""))
      .find((n) => !NOT_COMPANY.has(n.split(" ")[0]) && !company.toLowerCase().includes(n.toLowerCase()) && !n.toLowerCase().includes(company.toLowerCase()))
    if (wrong) {
      personal -= 50
      push({ id: "wrong-company", area: "personal", severity: "high", title: `The letter names "${wrong}" as the employer`, evidence: wrong, fix: `The job post is from ${company}. If this letter was reused, change every company name, and check the role and any product names too.` })
    }
  } else if (!company) {
    const generic = body.match(/\byour (?:company|organi[sz]ation|firm|esteemed (?:company|organi[sz]ation)|business)\b/i)
    if (generic) {
      personal -= 30
      push({ id: "company", area: "personal", severity: "medium", title: "The company is not named", evidence: generic[0], fix: "Replace \"your company\" with the company's name, and add one line on why this company in particular." })
    } else if (!hasJd) {
      personal -= 10
      push({ id: "company-unknown", area: "personal", severity: "low", title: "Could not tell which company this is for", fix: "Name the company in the first paragraph. If you already did, paste the job post as well so the check knows the name to look for." })
    }
  }

  if (role && rWords.length) {
    if (!namesRole(body, rWords)) {
      personal -= 25
      push({ id: "role", area: "personal", severity: "high", title: `The role "${role}" is not named`, evidence: opening ? clip(opening) : undefined, fix: `Use the job title from the post, "${role}", in your first or second sentence. Recruiters often hire for several roles at once.` })
    }
  } else if (!/\b(?:role|position|opening|vacancy|post|job)\b/i.test(body) && !/\bas an? [A-Z]/.test(body)) {
    personal -= 20
    push({ id: "role", area: "personal", severity: "medium", title: "The role you want is not named", evidence: opening ? clip(opening) : undefined, fix: "Name the exact job title in the first sentence, as it appears in the job post." })
  }

  if (!p.greeting) {
    personal -= 15
    push({ id: "greeting", area: "personal", severity: "medium", title: "No greeting found", fix: "Start with \"Dear\" and the hiring manager's name on its own line. If you cannot find a name, \"Dear Hiring Manager\" works." })
  } else if (GENERIC_GREETING.test(p.greeting)) {
    personal -= 20
    push({ id: "greeting", area: "personal", severity: "medium", title: "The greeting could go to anyone", evidence: p.greeting, fix: "Look up the hiring manager on the job post or LinkedIn and write \"Dear Priya Shah\". If no name is listed, use \"Dear Hiring Manager\" or \"Dear [Team name] team\"." })
  } else if (ROLE_GREETING.test(p.greeting)) {
    personal -= 8
    push({ id: "greeting-name", area: "personal", severity: "low", title: "The greeting uses a title, not a name", evidence: p.greeting, fix: "This is fine when no name is listed. If the job post or the company's LinkedIn names the hiring manager, use their name." })
  }

  const holders = [...new Set((letter.match(PLACEHOLDER) ?? []).map((s) => s.trim()))]
  if (holders.length) {
    personal -= 50
    push({ id: "placeholder", area: "personal", severity: "high", title: `${holders.length} template ${holders.length === 1 ? "gap" : "gaps"} left in`, evidence: holders.slice(0, 4).join(", "), fix: "Replace each bracketed gap with the real detail before you send. One left in tells the reader the letter came from a template." })
  }

  /* structure */
  let structure = 0
  const nPara = p.paragraphs.length
  if (nPara >= 3 && nPara <= 5) structure += 30
  else if (nPara > 5) {
    structure += 20
    push({ id: "paragraphs", area: "structure", severity: "low", title: `${nPara} paragraphs`, fix: "Merge to three or four: why this role, one or two proof paragraphs, and a close. Short letters get read to the end." })
  } else {
    structure += nPara === 2 ? 15 : 5
    push({ id: "paragraphs", area: "structure", severity: "medium", title: nPara <= 1 ? "Written as one block" : "Only 2 paragraphs", evidence: nPara === 1 ? clip(p.paragraphs[0], 80) : undefined, fix: "Use three to five short paragraphs: the role and why you want it, one or two with proof, then a close that asks for a conversation. Leave a blank line between them." })
  }

  const roleEarly = rWords.length ? namesRole(opening, rWords) : /\b(?:role|position|opening|vacancy|job)\b|\bas an? [A-Z]/.test(opening)
  if (roleEarly) structure += 25
  else if (!issues.some((i) => i.id === "role")) {
    push({ id: "role-late", area: "structure", severity: "medium", title: "The role comes late", evidence: opening ? clip(opening) : undefined, fix: `Say which role you are applying for${role ? `, "${role}",` : ""} in the first two sentences. The reader should know why the letter is in front of them before anything else.` })
  }

  if (ASK.test(lastPara)) structure += 20
  else if (SOFT_ASK.test(lastPara)) {
    structure += 10
    push({ id: "ask", area: "structure", severity: "low", title: "The close waits instead of asking", evidence: clip(splitSentences(lastPara).slice(-1)[0] ?? lastPara), fix: "End with a direct next step: \"Could we talk this week? I can walk you through the dashboard I built.\"" })
  } else if (lastPara) {
    push({ id: "ask", area: "structure", severity: "medium", title: "The letter does not ask for anything", evidence: clip(splitSentences(lastPara).slice(-1)[0] ?? lastPara), fix: "Close by asking for an interview or a short call, and say when you are free." })
  }

  if (p.signOff) structure += 15
  else push({ id: "signoff", area: "structure", severity: "low", title: "No sign-off found", fix: "End with \"Kind regards\" or \"Sincerely\" on its own line, then your full name." })
  const nameOk = opts.name ? new RegExp(`\\b${escapeRe(opts.name.trim().split(/\s+/)[0])}\\b`, "i").test(letter.split("\n").slice(-6).join("\n")) : Boolean(p.signName)
  if (nameOk) structure += 10
  else if (p.signOff) push({ id: "name", area: "structure", severity: "low", title: "No name under the sign-off", evidence: p.signOff, fix: "Put your full name on the line after the sign-off." })
  if (!p.contact) push({ id: "contact", area: "structure", severity: "low", title: "No email or phone number", fix: "Add your email and phone under your name or in a header line, so the reader can reply from the letter alone." })

  /* length */
  let length: number
  if (words >= 250 && words <= 400) length = 100
  else if (words < 150) {
    length = 30
    push({ id: "short", area: "length", severity: "medium", title: `Short at ${words} words`, fix: "Aim for 250 to 400 words. Add one paragraph with a result that matches the job post, and a line on why this company." })
  } else if (words < 250) {
    length = 70
    push({ id: "short", area: "length", severity: "low", title: `A little short at ${words} words`, fix: "There is room for one more specific example. 250 to 400 words is a common range." })
  } else if (words <= 500) {
    length = 75
    push({ id: "long", area: "length", severity: "low", title: `A little long at ${words} words`, fix: "Cut toward 400 words. Remove anything the resume already says and keep the examples that match the job post." })
  } else {
    length = 40
    push({ id: "long", area: "length", severity: "medium", title: `Long at ${words} words`, fix: "Cut to 400 words or fewer. Keep one or two examples that match the job post, and drop the career history the resume already covers." })
  }
  const longParas = p.paragraphs.filter((x) => countWords(x) > 120)
  if (longParas.length) {
    length = Math.max(0, length - Math.min(30, longParas.length * 15))
    push({ id: "long-para", area: "length", severity: "low", title: `${longParas.length} ${longParas.length === 1 ? "paragraph runs" : "paragraphs run"} past 120 words`, evidence: clip(longParas[0], 80), fix: "Split it, or cut it to the one point it makes. Long blocks get skimmed." })
  }

  /* evidence */
  const withNumbers = bodySentences.filter((s) => NUMBER.test(s) || (RESULT_WORDS.test(s) && /\d/.test(s)))
  let evidence = withNumbers.length ? 50 : 0
  if (!withNumbers.length) {
    const resultish = bodySentences.find((s) => RESULT_WORDS.test(s))
    if (resultish) evidence = 25
    push({ id: "numbers", area: "evidence", severity: "high", title: "No result with a number", evidence: resultish ? clip(resultish) : undefined, fix: "Add one result the reader can picture: how many, how much, how fast. \"Cut month-end close from 9 days to 5\" does more than any adjective." })
  }
  const iStarts = bodySentences.filter((s) => /^["“]?I\b/.test(s))
  const iShare = bodySentences.length ? iStarts.length / bodySentences.length : 0
  evidence += iShare <= 0.3 ? 25 : Math.max(0, Math.round(25 * (1 - (iShare - 0.3) / 0.4)))
  if (bodySentences.length >= 4 && iShare > 0.3) push({ id: "i-starts", area: "evidence", severity: iShare > 0.5 ? "medium" : "low", title: `${iStarts.length} of ${bodySentences.length} sentences start with "I"`, evidence: iStarts.slice(0, 3).map((s) => clip(s, 40)).join(" / "), fix: "Lead some sentences with the result or the company: \"At Bluefin, the onboarding emails I rewrote lifted trial upgrades 34%.\"" })
  const verbHits = new Set(tokens(body).filter((w) => ACTION_VERBS.has(w)))
  evidence += verbHits.size >= 3 ? 25 : verbHits.size >= 1 ? 12 : 0
  if (verbHits.size < 2) push({ id: "verbs", area: "evidence", severity: "medium", title: verbHits.size ? "Only one action verb" : "No action verbs", evidence: verbHits.size ? [...verbHits].join(", ") : undefined, fix: "Say what you did with verbs like led, built, cut, launched or wrote, then what changed." })

  if (opts.resume && opts.resume.trim().length > 200) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim()
    const resumeNorm = norm(opts.resume)
    const copied = bodySentences.filter((s) => {
      const w = norm(s).split(" ")
      for (let i = 0; i + 8 <= w.length; i++) if (resumeNorm.includes(w.slice(i, i + 8).join(" "))) return true
      return false
    })
    if (copied.length >= 2) {
      evidence = Math.max(0, evidence - 15)
      push({ id: "copied", area: "evidence", severity: "medium", title: `${copied.length} sentences repeat your resume word for word`, evidence: clip(copied[0]), fix: "Tell the story behind one result instead: what the problem was, what you did, and why it matters to this job." })
    }
  }

  /* clichés and tone */
  let tone = 100
  const found: string[] = []
  for (const c of CLICHES) {
    const m = body.match(c.re)
    if (!m) continue
    tone -= 15
    const phrase = clip(m[0].trim(), 50)
    found.push(phrase)
    const line = bodySentences.find((s) => c.re.test(s)) ?? m[0]
    if (lineFixes.length < 6) lineFixes.push({ line: clip(line, 200), phrase, reason: c.reason, fix: c.fix })
  }
  if (found.length) push({ id: "cliches", area: "tone", severity: found.length >= 3 ? "medium" : "low", title: `${found.length} stock ${found.length === 1 ? "phrase" : "phrases"}`, evidence: found.slice(0, 4).map((f) => `"${f}"`).join(", "), fix: "Replace each with a fact about you or the job. See the lines to rewrite below." })
  const hedges = [...new Set((body.match(HEDGES) ?? []).map((h) => h.toLowerCase()))]
  if (hedges.length) {
    tone -= Math.min(20, hedges.length * 7)
    push({ id: "hedges", area: "tone", severity: "low", title: `${hedges.length} hedging ${hedges.length === 1 ? "word" : "words"}`, evidence: hedges.slice(0, 4).map((h) => `"${h}"`).join(", "), fix: "Cut them and state the point plainly. \"I think I could help\" becomes \"I can help\"." })
  }
  const sorry = [...new Set(body.match(APOLOGIES) ?? [])]
  if (sorry.length) {
    tone -= 20
    push({ id: "apology", area: "tone", severity: "medium", title: "The letter apologises for a gap", evidence: `"${sorry[0]}"`, fix: "Drop the apology. Lead with what you do bring, and let the reader judge the gap." })
  }
  const bangs = (body.match(/!/g) ?? []).length
  if (bangs) {
    tone -= Math.min(20, bangs * 7)
    push({ id: "exclaim", area: "tone", severity: bangs >= 3 ? "medium" : "low", title: `${bangs} exclamation ${bangs === 1 ? "mark" : "marks"}`, evidence: clip(bodySentences.find((s) => s.includes("!")) ?? "!", 80), fix: "Use full stops. Let the content carry the energy." })
  }
  const caps = (body.match(/\b[A-Z]{3,}(?:\s+[A-Z]{3,})+\b|\b[A-Z]{6,}\b/g) ?? []).filter((w) => !w.split(/\s+/).every((x) => ACRONYMS.has(x)))
  if (caps.length) {
    tone -= 10
    push({ id: "caps", area: "tone", severity: "low", title: "Words in all capitals", evidence: [...new Set(caps)].slice(0, 3).join(", "), fix: "Write them in normal case. Capitals read as shouting in a letter." })
  }
  tone = Math.max(0, tone)

  /* keywords */
  let keywords: LetterKeyword[] | null = null
  let matchPct: number | null = null
  let kwScore = 0
  if (hasJd) {
    const letterStem = stemmed(tokens(letter))
    // The company's own name is not a skill to match.
    const companyStems = new Set(company ? tokens(company) : [])
    keywords = extractJobTerms(jd)
      .filter((t) => !companyStems.has(t.term))
      .slice(0, 10)
      .map((t) => ({ term: t.term, weight: t.weight, required: t.required, found: hasTerm(letterStem, t.term) }))
    const total = keywords.reduce((s, k) => s + k.weight, 0) || 1
    const earned = keywords.reduce((s, k) => s + (k.found ? k.weight : 0), 0)
    matchPct = Math.round((earned / total) * 100)
    // A letter is not a keyword list: about 60% of the weighted terms earns full marks.
    kwScore = Math.min(100, Math.round((matchPct / 60) * 100))
    const missing = keywords.filter((k) => !k.found)
    if (missing.length && matchPct < 60) {
      const top = [...missing.filter((k) => k.required || isSkill(k.term)), ...missing.filter((k) => !k.required && !isSkill(k.term))].slice(0, 5)
      push({ id: "kw-missing", area: "keywords", severity: matchPct < 30 ? "high" : "medium", title: `${missing.length} of ${keywords.length} key words from the job post are missing`, evidence: top.map((k) => k.term).join(", "), fix: "Work two or three of them into your examples, where you really used them. A sentence that shows the skill in use reads better than a list." })
    }
    const stuffed = p.paragraphs
      .map((para, k) => {
        const toks = tokens(para)
        const seen = new Set<string>()
        for (let i = 0; i < toks.length; i++)
          for (const n of [3, 2, 1]) {
            const phrase = toks.slice(i, i + n).join(" ")
            if (i + n <= toks.length && isSkill(phrase)) seen.add(stem(phrase))
          }
        return { k, n: seen.size, para }
      })
      .find((x) => x.n > 8)
    if (stuffed) {
      kwScore = Math.min(kwScore, 70)
      push({ id: "kw-stuffing", area: "keywords", severity: "medium", title: `Paragraph ${stuffed.k + 1} lists ${stuffed.n} skills`, evidence: clip(stuffed.para, 90), fix: "Keep the two or three skills this job needs most and show each one in use. The resume can carry the full list." })
    }
  }

  /* scoring */
  const parts = [
    { label: "Job match", score: kwScore, weight: hasJd ? 30 : 0 },
    { label: "Personal to this job", score: Math.max(0, personal), weight: 20 },
    { label: "Structure", score: structure, weight: 15 },
    { label: "Length", score: length, weight: 10 },
    { label: "Specific examples", score: Math.min(100, evidence), weight: 15 },
    { label: "Clichés and tone", score: tone, weight: 10 },
  ].filter((x) => x.weight > 0)
  const wsum = parts.reduce((s, x) => s + x.weight, 0)
  const score = Math.round(parts.reduce((s, x) => s + x.score * x.weight, 0) / wsum)

  issues.sort((a, b) => sev[a.severity] - sev[b.severity])

  return {
    score,
    parts,
    matchPct,
    keywords,
    issues,
    lineFixes,
    detected: { company, role, greeting: p.greeting, signOff: p.signOff },
    stats: { words, paragraphs: nPara, sentences: bodySentences.length, withNumbers: withNumbers.length },
  }
}
