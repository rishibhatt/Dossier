/**
 * Resume summary generator: rule-based, runs in the browser. Four shapes built from the same answers,
 * each two or three sentences, in the order a recruiter reads: who you are, proof, what you bring.
 * A part left blank is dropped, never printed as a placeholder.
 */
export type Stage = "student" | "mid" | "senior" | "change"

export type SummaryInput = {
  role: string
  stage: Stage
  years: string
  focus: string
  skills: string
  proof: string
  /** Student: what and where you study. Career change: the field you are leaving. */
  background: string
}

export type SummaryOut = { shape: string; text: string }

export const SUMMARY_LIMIT = 600

export const STAGES: { id: Stage; label: string }[] = [
  { id: "student", label: "Student or new graduate" },
  { id: "mid", label: "Working in this field" },
  { id: "senior", label: "Senior or leading teams" },
  { id: "change", label: "Changing careers" },
]

function clean(s: string) {
  return s.trim().replace(/\s+/g, " ").replace(/[.;,\s]+$/, "")
}

const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s)
/** Keeps acronyms and proper nouns at the start ("SQL", "Python") as typed. */
const low = (s: string) => (s && !/^[A-Z]{2,}|^[A-Z][a-z]+[A-Z]/.test(s) && !/^(I|I'm)\b/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s)

/** "SQL, Python, Tableau" -> "SQL, Python and Tableau". Caps at four so the line stays readable. */
export function joinList(raw: string): string {
  const items = raw
    .split(/[,;\n|]+/)
    .map((s) => clean(s))
    .filter(Boolean)
    .slice(0, 4)
  if (items.length <= 1) return items[0] ?? ""
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
}

const article = (w: string) => (/^[aeiou]/i.test(w) && !/^(uni|use|eu)/i.test(w) && !/^U[A-Z]/.test(w) ? "an" : "a")

function yearsPhrase(years: string, stage: Stage) {
  const n = Number(years)
  if (!years || !Number.isFinite(n) || n <= 0) return stage === "senior" ? "over ten years" : ""
  return n === 1 ? "one year" : `${n} years`
}

export function buildSummaries(raw: SummaryInput): SummaryOut[] {
  const role = clean(raw.role)
  if (!role) return []
  // Job titles stay as typed: "a Data Analyst" reads fine on a resume, "a data Analyst" does not.
  const roleLow = role
  const focus = low(clean(raw.focus))
  const skills = joinList(raw.skills)
  const proof = clean(raw.proof)
  const proofS = proof ? `${cap(proof)}.` : ""
  const bg = clean(raw.background)
  const yrs = yearsPhrase(raw.years, raw.stage)
  const inFocus = focus ? ` in ${focus}` : ""

  const out: SummaryOut[] = []

  // 1. Result first: identity, then the proof, then the toolkit. Fits most people.
  const who =
    raw.stage === "student"
      ? `${bg ? cap(bg) : "Student"} looking for ${article(roleLow)} ${roleLow} role${inFocus}.`
      : raw.stage === "change"
        ? `${bg ? `${cap(bg)} professional` : "Professional"} moving into ${roleLow} work${inFocus}.`
        : `${cap(roleLow)}${yrs ? ` with ${yrs} of experience` : ""}${inFocus}.`
  out.push({ shape: "Result first", text: [who, proofS, skills ? `Skilled in ${skills}.` : ""].filter(Boolean).join(" ") })

  // 2. Skills first: leads with the keywords a recruiter searches for.
  if (skills) {
    const lead =
      raw.stage === "student"
        ? `${cap(roleLow)} candidate with hands-on work in ${skills}`
        : `${cap(roleLow)} with ${yrs ? `${yrs} of ` : ""}hands-on work in ${skills}`
    out.push({ shape: "Skills first", text: [`${lead}${focus ? `, focused on ${focus}` : ""}.`, proofS].filter(Boolean).join(" ") })
  }

  // 3. Stage-specific: what a reader needs to hear at this point in a career.
  if (raw.stage === "student") {
    out.push({
      shape: "New graduate",
      text: [
        `${bg ? `${cap(bg)}` : "Recent graduate"} applying for ${roleLow} roles.`,
        proof ? `Recent project: ${low(proof)}.` : "",
        skills ? `Comfortable with ${skills}, and quick to pick up new tools.` : "Quick to pick up new tools and processes.",
      ]
        .filter(Boolean)
        .join(" "),
    })
  } else if (raw.stage === "change") {
    out.push({
      shape: "Career change",
      text: [
        `${cap(roleLow)} with a background in ${bg ? low(bg) : "a related field"}.`,
        proof ? `${bg ? `In ${low(bg)}, ` : "Recent result: "}${low(proof)}.` : "",
        skills ? `Brings ${skills} to ${focus || "the new role"}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    })
  } else if (raw.stage === "senior") {
    out.push({
      shape: "Leadership",
      text: [`${cap(roleLow)} with ${yrs || "over ten years"} leading ${focus || "teams and programmes"}.`, proofS, skills ? `Known for ${skills}.` : ""].filter(Boolean).join(" "),
    })
  } else {
    out.push({
      shape: "Experience first",
      text: [`${yrs ? `${cap(yrs)} as ${article(roleLow)} ${roleLow}` : cap(roleLow)}${inFocus}.`, proofS, skills ? `Works daily with ${skills}.` : ""].filter(Boolean).join(" "),
    })
  }

  // 4. Short: one sentence, for a one-page resume or a LinkedIn intro. Students and career changers do not hold the title yet, so it is not claimed.
  const short =
    raw.stage === "student"
      ? `${bg ? cap(bg) : "Student"} aiming for ${roleLow} roles${skills ? `, with skills in ${skills}` : ""}${proof ? `, who ${pastClause(proof)}` : ""}.`
      : raw.stage === "change"
        ? `${bg ? `${cap(bg)} professional` : "Professional"} moving into ${roleLow} work${skills ? `, with skills in ${skills}` : ""}${proof ? `, who ${pastClause(proof)}` : ""}.`
        : `${cap(roleLow)}${yrs ? ` with ${yrs} of experience` : ""}${proof ? ` who ${pastClause(proof)}` : inFocus}.`
  out.push({ shape: "One sentence", text: short })

  const seen = new Set<string>()
  return out.filter((s) => {
    const k = s.text.toLowerCase()
    if (!s.text || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** "Cut churn by 18%" -> "cut churn by 18%". A proof that does not start with a verb reads as "delivered ...". */
function pastClause(proof: string) {
  const first = proof.split(" ")[0] ?? ""
  const verbish = /^[A-Za-z]+ed$/.test(first) || /^(built|led|ran|wrote|cut|grew|made|sold|taught|won|drove|set|kept|held|oversaw|shipped|rebuilt)$/i.test(first)
  return verbish ? low(proof) : `delivered ${low(proof)}`
}
