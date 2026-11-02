/**
 * Text helpers shared by the free checkers (ATS scan, cover letter check): the skill vocabulary, alias matching,
 * light stemming and job post keyword extraction. Pure functions, no browser APIs.
 */

/* ---------- vocabulary ---------- */

export const STOP = new Set(
  "a an and are as at be been by for from has have in into is it its of on or our that the their this to we will with you your who they them than then but not can may must should would also such per via etc including include includes within across over under about using use used while both each other more most any all one two three new well".split(" ")
)

/** Words that fill job posts but carry no skill. They never count as keywords on their own. */
export const NOISE = new Set(
  "experience work working team teams role company ability strong skills skill years year looking join candidate candidates position responsibilities requirements qualifications preferred required plus bonus opportunity environment business customers customer clients client great good excellent proven knowledge understanding related relevant minimum degree field develop developing build building support ensure help helps make drive drives passion passionate seeking successful fast paced fast-paced day basis based high quality high-quality needs need part full time full-time salary benefits equal employer apply application hiring offer location remote hybrid office world organization organisations organization".split(" ")
)

/** Known hard skills and tools. A single mention in the job post is enough to make these count. */
export const SKILLS = new Set(
  [
    "javascript", "typescript", "python", "java", "csharp", "cplusplus", "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "nosql", "html", "css", "sass", "react", "angular", "vue", "svelte", "nextjs", "node", "express", "django", "flask", "spring", "dotnet", "rails", "graphql", "rest", "api", "apis", "microservices", "docker", "kubernetes", "terraform", "ansible", "jenkins", "aws", "azure", "gcp", "linux", "git", "github", "gitlab", "ci/cd", "cicd", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "kafka", "spark", "hadoop", "airflow", "dbt", "snowflake", "bigquery", "tableau", "power bi", "looker", "excel", "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "pandas", "numpy", "statistics", "a/b testing", "data analysis", "data science", "data engineering", "etl", "agile", "scrum", "kanban", "jira", "confluence", "figma", "sketch", "adobe", "photoshop", "illustrator", "indesign", "after effects", "prototyping", "wireframing", "user research", "usability testing", "design systems", "accessibility", "ux", "ui", "seo", "sem", "google analytics", "google ads", "content marketing", "email marketing", "social media", "copywriting", "hubspot", "salesforce", "marketo", "crm", "b2b", "saas", "product management", "roadmap", "stakeholder management", "project management", "pmp", "budgeting", "forecasting", "financial modeling", "financial modelling", "accounting", "gaap", "ifrs", "audit", "tax", "quickbooks", "sap", "erp", "netsuite", "supply chain", "logistics", "procurement", "lean", "six sigma", "quality assurance", "qa", "selenium", "cypress", "jest", "unit testing", "cybersecurity", "penetration testing", "siem", "soc 2", "recruiting", "onboarding", "payroll", "hris", "customer success", "customer support", "zendesk", "negotiation", "cold calling", "lead generation", "pipeline", "teaching", "curriculum", "lesson planning", "nursing", "patient care", "ehr", "hipaa", "cpr", "autocad", "solidworks", "revit", "matlab", "cad",
  ].map((s) => s.toLowerCase())
)

/** Different spellings of the same skill. Both sides are matched to one canonical form. */
export const ALIASES: [RegExp, string][] = [
  [/\bc\+\+/g, "cplusplus"],
  [/\bc#/g, "csharp"],
  [/\.net\b/g, "dotnet"],
  [/\bnode\.?js\b/g, "node"],
  [/\breact\.?js\b/g, "react"],
  [/\bvue\.?js\b/g, "vue"],
  [/\bnext\.?js\b/g, "nextjs"],
  [/\bjs\b/g, "javascript"],
  [/\bts\b/g, "typescript"],
  [/\bk8s\b/g, "kubernetes"],
  [/\bpostgres\b/g, "postgresql"],
  [/\bmongo\b/g, "mongodb"],
  [/\bgolang\b/g, "go"],
  [/\bml\b/g, "machine learning"],
  [/\bci\s*\/\s*cd\b/g, "cicd"],
  [/\bgoogle cloud( platform)?\b/g, "gcp"],
  [/\bamazon web services\b/g, "aws"],
  [/\bms excel\b|\bmicrosoft excel\b/g, "excel"],
  [/\bms power bi\b|\bpowerbi\b/g, "power bi"],
  [/\bsearch engine optimi[sz]ation\b/g, "seo"],
  [/\buser experience\b/g, "ux"],
  [/\buser interface\b/g, "ui"],
  [/\brestful\b/g, "rest"],
  [/\bapis\b/g, "api"],
]

export const ACTION_VERBS = new Set(
  "led built launched cut grew reduced increased designed wrote ran managed created shipped delivered improved closed trained organized organised negotiated automated migrated owned planned taught raised saved won opened started founded redesigned mentored resolved developed implemented analyzed analysed coordinated established executed generated identified optimized optimised produced streamlined supervised achieved architected authored boosted configured conducted directed drove enhanced evaluated expanded forecasted initiated introduced maintained monitored operated partnered presented processed programmed reviewed scaled secured simplified sold spearheaded standardized tested transformed upgraded validated".split(" ")
)

/* ---------- text helpers ---------- */

export function canon(raw: string): string {
  let t = raw.toLowerCase().replace(/[‘’]/g, "'")
  for (const [re, to] of ALIASES) t = t.replace(re, to)
  return t
}

export function stem(w: string): string {
  if (w.length <= 3) return w
  return w.replace(/(ies)$/, "y").replace(/(ing|ed|es|s)$/, (m, _g, off: number) => (off >= 3 ? "" : m))
}

export function tokens(text: string): string[] {
  return (canon(text).match(/[a-z0-9][a-z0-9+#/.&-]*[a-z0-9+#]|[a-z0-9]/g) ?? []).map((t) => t.replace(/^[./-]+|[./-]+$/g, ""))
}

export const stemmed = (words: string[]) => words.map(stem).join(" ")

let skillStems: Set<string> | null = null
/** True for a known skill, whatever its plural or tense ("design system" matches "design systems"). */
export function isSkill(phrase: string): boolean {
  skillStems ??= new Set([...SKILLS].map((s) => stemmed(s.split(" "))))
  return skillStems.has(stemmed(phrase.split(" ")))
}

/* ---------- job description keywords ---------- */

export type Term = { term: string; weight: number; required: boolean }

export function extractJobTerms(jd: string): Term[] {
  const lines = jd.replace(/\r/g, "").split("\n")
  const scores = new Map<string, { count: number; mult: number; req: boolean }>()
  let mult = 1
  let req = false

  const add = (term: string, m: number, r: boolean) => {
    const cur = scores.get(term) ?? { count: 0, mult: 0, req: false }
    cur.count += 1
    cur.mult = Math.max(cur.mult, m)
    cur.req = cur.req || r
    scores.set(term, cur)
  }

  for (const line of lines) {
    const l = line.toLowerCase()
    if (/(requirements|qualifications|must have|must-have|what you('|’)ll need|what we('|’)re looking for|you have|you bring)/.test(l) && l.length < 60) {
      mult = 1.5
      req = true
    } else if (/(nice to have|nice-to-have|preferred|bonus|a plus|good to have)/.test(l) && l.length < 60) {
      mult = 0.6
      req = false
    } else if (/(responsibilities|what you('|’)ll do|about the role|the role)/.test(l) && l.length < 40) {
      mult = 1
      req = false
    }
    const toks = tokens(line)
    const seen = new Set<string>()
    for (let i = 0; i < toks.length; i++) {
      for (const n of [3, 2, 1]) {
        if (i + n > toks.length) continue
        const phrase = toks.slice(i, i + n).join(" ")
        if (isSkill(phrase) && !seen.has(phrase)) {
          seen.add(phrase)
          add(phrase, mult, req)
        }
      }
      const w = toks[i]
      if (!isSkill(w) && w.length > 3 && !STOP.has(w) && !NOISE.has(w) && !/^\d+$/.test(w) && !seen.has(w)) {
        seen.add(w)
        add(w, mult, req)
      }
    }
  }

  const terms: Term[] = []
  for (const [term, s] of scores) {
    const skill = isSkill(term)
    if (!skill && s.count < 2) continue
    const weight = Math.min(s.count, 3) * s.mult * (skill ? 2 : 1)
    terms.push({ term, weight, required: s.req })
  }
  // Drop a single word when a longer phrase that contains it is already a keyword ("machine" vs "machine learning").
  const kept = terms.filter((t) => !terms.some((o) => o !== t && o.term.includes(" ") && o.term.split(" ").includes(t.term) && !isSkill(t.term)))
  return kept.sort((a, b) => b.weight - a.weight).slice(0, 28)
}

export function hasTerm(haystackStem: string, term: string): boolean {
  const needle = stemmed(term.split(" "))
  return new RegExp(`(^| )${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$)`).test(haystackStem)
}
