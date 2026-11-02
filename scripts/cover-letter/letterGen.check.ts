/**
 * Unit checks for the cover letter core (the repo has no test runner, so this is a plain assert script).
 * Covers: schema defaults, prefill from a resume, render model conventions per preset, and the generator's
 * rules (only the person's facts, no invented numbers, placeholders when a fact is missing, no stock phrases).
 * Run: npm run letter:check
 */
import assert from "node:assert/strict"

import { buildLetter, firstPerson, listOf, matchedSkills, rankBullets } from "../../src/features/cover-letter/letterGen"
import { letterFromResume, resumeFacts } from "../../src/lib/cover-letter/fromResume"
import { letterLook } from "../../src/lib/cover-letter/looks"
import { defaultSignOff, formatLetterDate, toLetterRenderModel } from "../../src/lib/cover-letter/renderModel"
import { coverLetterDocumentSchema, emptyLetter } from "../../src/lib/cover-letter/schema"
import { SAMPLE_RESUMES } from "../../src/lib/resume/samples"
import type { ResumeDesign, ResumeDocument } from "../../src/lib/resume/schema"

let n = 0
const test = (name: string, fn: () => void) => {
  try {
    fn()
    n++
  } catch (e) {
    console.error(`FAIL ${name}\n`, e)
    process.exit(1)
  }
}

const design: ResumeDesign = { templateId: "r014-harbor", preset: "uk", paper: null, density: "standard", accent: "navy" }
const resume: ResumeDocument = {
  version: 1,
  basics: {
    name: "Ana Lopez",
    headline: "Data Analyst",
    email: "ana@example.com",
    phone: "+44 7700 900123",
    location: "Leeds",
    summary: "",
    links: [
      { id: "l1", label: "", url: "https://linkedin.com/in/ana" },
      { id: "l2", label: "", url: "https://github.com/ana" },
      { id: "l3", label: "", url: "https://ana.dev" },
    ],
  },
  personal: { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" },
  sections: [
    {
      id: "s1", type: "experience", title: "", hidden: false,
      items: [
        { id: "e0", role: "Junior Analyst", org: "Old Co", location: "", start: "2019-01", end: "2021-02", current: false,
          bullets: [{ id: "b0", text: "Cleaned 12 legacy reports" }] },
        { id: "e1", role: "Data Analyst", org: "Acme Retail", location: "", start: "2021-03", end: "", current: true,
          bullets: [
            { id: "b1", text: "Built Tableau dashboards used by 40 store managers" },
            { id: "b2", text: "Cut the weekly SQL report run time from 40 to 6 minutes" },
            { id: "b3", text: "Worked closely with finance" },
          ] },
      ],
    },
    { id: "s2", type: "skills", title: "", hidden: false, items: [{ id: "g1", group: "", items: ["SQL", "Python", "Tableau", "sql", "Excel"] }] },
    { id: "s3", type: "education", title: "", hidden: false, items: [{ id: "d1", school: "University of Leeds", degree: "BSc Mathematics", location: "", start: "2015", end: "2018", current: false, bullets: [] }] },
  ],
}

const JOB = `Data Analyst at Northwind
Requirements
- SQL and Python every day
- Tableau dashboards for store teams
- Excel is a plus`

test("emptyLetter parses and has four empty paragraphs", () => {
  const l = coverLetterDocumentSchema.parse(emptyLetter())
  assert.equal(l.paragraphs.length, 4)
  assert.deepEqual(l.paragraphs.map((p) => p.kind), ["opening", "proof", "fit", "closing"])
})

test("schema rejects unsafe links and fills defaults", () => {
  const bad = { ...emptyLetter(), sender: { ...emptyLetter().sender, links: [{ id: "x", label: "", url: "javascript:alert(1)" }] } }
  assert.equal(coverLetterDocumentSchema.safeParse(bad).success, false)
  const min = coverLetterDocumentSchema.parse({ version: 1, sender: {} })
  assert.equal(min.recipient.company, "")
  assert.equal(min.source.resumeDraftId, null)
})

test("prefill from resume", () => {
  const { letter, design: d, facts } = letterFromResume(resume, design, { resumeDraftId: "draft1" })
  assert.equal(letter.sender.name, "Ana Lopez")
  assert.equal(letter.sender.links.length, 2)
  assert.equal(letter.job.role, "Data Analyst")
  assert.deepEqual(d, design)
  assert.notEqual(d, design)
  assert.equal(letter.source.resumeDraftId, "draft1")
  assert.equal(facts.latest?.org, "Acme Retail")
  assert.deepEqual(facts.earlier, [{ role: "Junior Analyst", org: "Old Co" }])
  assert.deepEqual(facts.proof.map((b) => b.id), ["b1", "b2"])
  assert.deepEqual(facts.skills, ["SQL", "Python", "Tableau", "Excel"])
  assert.equal(facts.education?.school, "University of Leeds")
  assert.ok(coverLetterDocumentSchema.safeParse(letter).success)
})

test("every sample resume prefills a valid letter", () => {
  for (const s of SAMPLE_RESUMES) {
    const { letter } = letterFromResume(s.doc, design)
    assert.ok(coverLetterDocumentSchema.safeParse(letter).success, s.id)
  }
})

test("render model: preset conventions", () => {
  const { letter } = letterFromResume(resume, design)
  const today = new Date(2026, 10, 3)
  const uk = toLetterRenderModel(letter, design, today)
  assert.equal(uk.doc.signOff, "Yours faithfully,")
  assert.equal(uk.doc.greeting, "Dear Hiring Manager,")
  assert.equal(uk.doc.date, "3 November 2026")
  assert.equal(uk.doc.subject, "")
  assert.equal(uk.style.paper, "a4")
  letter.recipient.name = "Ms Raman"
  assert.equal(toLetterRenderModel(letter, design, today).doc.signOff, "Yours sincerely,")
  assert.equal(toLetterRenderModel(letter, design, today).doc.greeting, "Dear Ms Raman,")
  const us = toLetterRenderModel(letter, { ...design, preset: "us" }, today)
  assert.equal(us.doc.signOff, "Sincerely,")
  assert.equal(us.doc.date, "November 3, 2026")
  assert.equal(us.layout.date, "before")
  assert.equal(us.style.paper, "us-letter")
  letter.job.reference = "DA-1"
  const de = toLetterRenderModel(letter, { ...design, preset: "de" }, today)
  assert.equal(de.doc.subject, "Application for Data Analyst (ref. DA-1)")
  assert.equal(de.doc.date, "03.11.2026")
  assert.equal(de.layout.date, "after")
  assert.equal(formatLetterDate("2025-01-09", "eu"), "9 January 2025")
  assert.equal(defaultSignOff("uk", false), "Yours faithfully,")
  // Typed values win over the preset.
  letter.signOff = "Best wishes,"
  assert.equal(toLetterRenderModel(letter, design, today).doc.signOff, "Best wishes,")
})

test("render model: links and text stay plain data", () => {
  const { letter } = letterFromResume(resume, design)
  letter.sender.links = [{ id: "z", label: "", url: "ana.dev" }]
  letter.paragraphs[0]!.text = '#panic("x") *b*\nline two'
  const m = toLetterRenderModel(letter, design, new Date(2026, 0, 1))
  assert.ok(m.doc.contact.some((c) => c.url === "https://ana.dev"))
  assert.deepEqual(m.doc.paragraphs[0]!.lines, ['#panic("x") *b*', "line two"])
  assert.equal(m.doc.paragraphs.length, 1, "empty paragraphs are dropped")
  assert.equal(m.look.font, letterLook("r014-harbor").font)
  assert.equal(m.look.header, "split")
})

test("firstPerson rewrites verbs and refuses non-verbs", () => {
  assert.equal(firstPerson("Cut costs by 12%."), "I cut costs by 12%")
  assert.equal(firstPerson("Leading a team of 5"), "I led a team of 5")
  assert.equal(firstPerson("Manage 3 stores"), "I managed 3 stores")
  assert.equal(firstPerson("Revenue up 30%"), null)
  assert.equal(listOf(["a", "b", "c"]), "a, b and c")
})

test("bullets ranked by job ad overlap", () => {
  const facts = resumeFacts(resume)
  const ranked = rankBullets(facts.numbered, "SQL reporting and SQL run time.\nRequirements\nSQL, Python")
  assert.equal(ranked[0]!.id, "b2")
  assert.deepEqual(matchedSkills(facts, JOB).slice(0, 3).sort(), ["Python", "SQL", "Tableau"])
})

const STOCK = /i am writing to|passionate|excited|thrilled|perfect fit|team player|hard[- ]working|go-getter|dynamic|synerg|i believe|look forward to hearing|to whom it may concern/i

function numbersIn(s: string) {
  return s.match(/\d+(?:[.,]\d+)*/g) ?? []
}

test("generator: full facts", () => {
  const { facts } = letterFromResume(resume, design)
  const out = buildLetter({ facts, role: "Data Analyst", company: "Northwind", source: "LinkedIn", jobPost: JOB, preset: "uk" })
  assert.ok(out.variants.length >= 2 && out.variants.length <= 3)
  assert.equal(out.greeting, "Dear Hiring Manager,")
  assert.equal(out.signOff, "Yours faithfully,")
  assert.deepEqual(out.paragraphs.map((p) => p.kind), ["opening", "proof", "fit", "closing"])
  const all = out.variants.flatMap((v) => v.paragraphs.map((p) => p.text)).join("\n")
  assert.ok(!STOCK.test(all), all.match(STOCK)?.[0])
  assert.ok(all.includes("[Why Northwind: add one specific thing]"))
  assert.ok(/Northwind/.test(out.paragraphs[0]!.text) && /Data Analyst/.test(out.paragraphs[0]!.text))
  // Every number comes from the input.
  const source = [JSON.stringify(resume), JOB].join(" ")
  for (const num of numbersIn(all)) assert.ok(source.includes(num), `invented number ${num}`)
  // The proof paragraph uses the person's own bullets.
  assert.ok(/40 to 6 minutes/.test(out.paragraphs[1]!.text))
  // Not every sentence starts with "I".
  const sentences = out.paragraphs.map((p) => p.text).join(" ").split(/(?<=[.?!])\s+/)
  assert.ok(sentences.filter((s) => /^I\b/.test(s)).length / sentences.length <= 0.3)
  const words = out.paragraphs.map((p) => p.text).join(" ").split(/\s+/).length
  assert.ok(words > 90 && words < 400, `words ${words}`)
  for (const v of out.variants) assert.equal(v.signOff, "Yours faithfully,")
})

test("generator: named recipient, US", () => {
  const { facts } = letterFromResume(resume, design)
  const out = buildLetter({ facts, role: "Data Analyst", company: "Northwind", recipientName: "Ms Raman", preset: "us" })
  assert.equal(out.greeting, "Dear Ms Raman,")
  assert.equal(out.signOff, "Sincerely,")
})

test("generator: nothing known gives placeholders, not invented facts", () => {
  const out = buildLetter({})
  const all = out.paragraphs.map((p) => p.text).join(" ")
  assert.ok(all.includes("[job title]") && all.includes("[company]"))
  assert.ok(all.includes("[Add one result with a number"))
  assert.ok(all.includes("[Why this company: add one specific thing]"))
  assert.equal(numbersIn(all).length, 0)
})

test("generator: career change variant comes first for a career changer", () => {
  const { facts } = letterFromResume(resume, design)
  const out = buildLetter({ facts, role: "Product Manager", company: "Northwind", jobPost: JOB })
  assert.equal(out.variant, "career-change")
  assert.ok(/move into Product Manager work after working as a Data Analyst at Acme Retail/.test(out.paragraphs[0]!.text))
  assert.ok(out.variants.some((v) => v.id === "result-first"))
})

test("generator over every sample resume: no stock phrases, no invented numbers", () => {
  for (const s of SAMPLE_RESUMES) {
    const { facts } = letterFromResume(s.doc, design)
    const out = buildLetter({ facts, role: "Operations Lead", company: "Northwind", jobPost: JOB })
    const all = out.variants.flatMap((v) => v.paragraphs.map((p) => p.text)).join("\n")
    assert.ok(!STOCK.test(all), `${s.id}: ${all.match(STOCK)?.[0]}`)
    const source = JSON.stringify(s.doc) + JOB
    for (const num of numbersIn(all)) assert.ok(source.includes(num), `${s.id}: invented number ${num}`)
    assert.ok(!/\b(a|an) (a|an)\b|\s[,.]|\.\./.test(all), `${s.id}: malformed text: ${all}`)
  }
})

console.log(`letter checks: ${n} passed`)
