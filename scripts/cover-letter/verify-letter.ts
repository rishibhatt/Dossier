/**
 * Cover letter verification. Renders a sample letter with /letter.typ for every resume template x country
 * preset x paper size (plus every density for a long letter), with the same Typst wasm compiler the browser
 * uses and ONLY the fonts the browser worker would load for that template. Then it reads the PDF back with
 * pdf.js and checks:
 *   - it compiles;
 *   - every field comes out, in reading order (masthead, date/recipient, subject, greeting, paragraphs, sign-off);
 *   - no replacement or private-use glyphs, and no font fallback warnings (missing glyphs);
 *   - a typical letter fits on one page at every density, and a long one (about 330 words) at standard and compact;
 *   - the page is the right paper size, and the title metadata is set;
 *   - Typst markup typed into the letter is printed literally (no injection).
 * Also checks statically that every look in looks.ts names fonts the template actually loads.
 *
 * Exit code 1 on any failure. Run: npm run letter:verify  (--only=r013,r042 limits the templates; --keep writes PDFs
 * to .resume-verify/letters/).
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { buildLetter, toLetterParagraphs } from "../../src/features/cover-letter/letterGen"
import { letterFromResume } from "../../src/lib/cover-letter/fromResume"
import { LETTER_LOOKS, letterFonts, letterLook } from "../../src/lib/cover-letter/looks"
import { toLetterRenderModel, type LetterRenderModel } from "../../src/lib/cover-letter/renderModel"
import type { CoverLetterDesign, CoverLetterDocument } from "../../src/lib/cover-letter/schema"
import { SAMPLE_RESUMES } from "../../src/lib/resume/samples"
import { DENSITIES, PRESET_IDS } from "../../src/lib/resume/schema"
import { RESUME_TEMPLATES } from "../../src/lib/resume/templates"
import { loadEngine } from "../resume/nodeEngine"

const root = process.cwd()
const keep = process.argv.includes("--keep")
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").filter(Boolean)
const TODAY = new Date(2026, 10, 3)

const JOB_POST = `Data Analyst
About the role
You will turn product and sales data into decisions for our commercial team.
Requirements
- 3+ years with SQL and Python
- Dashboards in Tableau or Power BI
- A/B testing and statistics
- Clear writing for stakeholders
Nice to have
- dbt, Snowflake`

const norm = (s: string) =>
  s.normalize("NFKC").replace(/[‐-―]/g, "-").replace(/\s+/g, " ").replace(/- /g, "-").trim().toLowerCase()

function inOrder(haystack: string, needles: string[]) {
  const h = norm(haystack)
  let at = 0
  const missing: string[] = []
  const outOfOrder: string[] = []
  for (const n of needles.map(norm).filter(Boolean)) {
    const i = h.indexOf(n, at)
    if (i === -1) (h.includes(n) ? outOfOrder : missing).push(n)
    else at = i + n.length
  }
  return { missing, outOfOrder }
}

async function pdfInfo(bytes: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: false, isEvalSupported: false }).promise
  const pages: string[] = []
  const sizes: number[][] = []
  const links: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    sizes.push(page.view.map((v: number) => Math.round(v)))
    const tc = await page.getTextContent()
    pages.push(tc.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : "") : "")).join(""))
    for (const a of await page.getAnnotations()) if (a.url) links.push(a.url)
  }
  const meta = await doc.getMetadata()
  await doc.destroy()
  return { text: pages.join("\n"), pages: doc.numPages, sizes, links, title: (meta.info as { Title?: string })?.Title ?? "" }
}

/** A letter generated from a sample resume: the "typical length" case. */
function typicalLetter(i: number): CoverLetterDocument {
  const sample = SAMPLE_RESUMES[i % SAMPLE_RESUMES.length]!
  const { letter, facts } = letterFromResume(sample.doc, { templateId: "r001-ledger", preset: "us", paper: null, density: "standard", accent: "ink" })
  letter.recipient = { name: "Ms Priya Raman", title: "Head of Analytics", company: "Northwind Traders", address: "21 Market Street\nLeeds LS1 6DT" }
  letter.job = { role: "Data Analyst", reference: "DA-2291", source: "LinkedIn" }
  letter.date = "2026-11-03"
  letter.jobPost = JOB_POST
  const built = buildLetter({ facts, role: letter.job.role, company: "Northwind Traders", recipientName: letter.recipient.name, source: "LinkedIn", jobPost: JOB_POST })
  letter.paragraphs = toLetterParagraphs(built.paragraphs)
  return letter
}

/** About 400 words with user text that looks like Typst markup: the long case and the injection check. */
function longLetter(): CoverLetterDocument {
  const base = typicalLetter(0)
  const para = (n: number) =>
    `Paragraph ${n}: at my current job I rebuilt the weekly revenue report, cut its run time from 40 to 6 minutes, and wrote the guide the sales team now uses to read it. The same approach would suit your commercial team, where the numbers need to reach people who make the calls.`
  base.paragraphs = [1, 2, 3, 4, 5, 6].map((n) => ({ id: `p${n}`, kind: "custom" as const, text: para(n) }))
  base.paragraphs[5]!.text = `Literal markup check: #panic("injected") *not bold* $x^2$ <label> @ref [link] \\ backslash and a second line\nthat stays a line of its own.`
  return base
}

function expectedOrder(m: LetterRenderModel) {
  const d = m.doc
  const dateAndRecipient = m.layout.date === "before" ? [d.date, ...d.recipient] : [...d.recipient, d.date]
  return [d.name, d.headline, ...d.contact.map((c) => c.text), ...dateAndRecipient, d.subject, d.greeting, ...d.paragraphs.flatMap((p) => p.lines), d.signOff, d.signature]
}

const PAPER = { a4: [595, 842], "us-letter": [612, 792] } as const
/** Typst family name -> font file prefix ("Source Serif 4" -> "SourceSerif4"). */
const fileFamily = (family: string) => family.replace(/\s+/g, "")

async function main() {
  let failures = 0
  const fail = (msg: string) => {
    failures++
    console.log(`   FAIL ${msg}`)
  }

  // Static: every look's fonts are in its template's font list.
  for (const t of RESUME_TEMPLATES.filter((x) => !only || only.some((o) => x.id.startsWith(o)))) {
    const lk = LETTER_LOOKS[t.id]
    if (!lk) {
      fail(`${t.id}: no letter look in looks.ts`)
      continue
    }
    for (const fam of [lk.font, lk.headFont, lk.nameFont].filter(Boolean) as string[])
      if (!t.fonts.some((f) => f.startsWith(`${fileFamily(fam)}-`))) fail(`${t.id}: look font "${fam}" is not in the template's fonts`)
  }

  const keepDir = path.join(root, ".resume-verify/letters")
  if (keep) fs.mkdirSync(keepDir, { recursive: true })
  const long = longLetter()

  for (const [ti, t] of RESUME_TEMPLATES.filter((x) => !only || only.some((o) => x.id.startsWith(o))).entries()) {
    const fonts = letterFonts(t.id)
    let engine = await loadEngine({ fonts })
    let compiles = 0
    let runs = 0
    let passed = 0
    const typical = typicalLetter(ti)

    const cases: { label: string; doc: CoverLetterDocument; design: CoverLetterDesign }[] = []
    // Every sample resume's letter once, so every name, symbol and currency sign meets every template's fonts.
    SAMPLE_RESUMES.forEach((s, i) =>
      cases.push({ label: `sample ${s.id}`, doc: typicalLetter(i), design: { templateId: t.id, preset: "uk", paper: "a4", density: "standard", accent: "forest" } }),
    )
    for (const preset of PRESET_IDS)
      for (const paper of ["a4", "us-letter"] as const)
        cases.push({ label: `typical ${preset} ${paper}`, doc: typical, design: { templateId: t.id, preset, paper, density: "standard", accent: "navy" } })
    // A typical letter must fit one page at every density; the long one (about 330 words in six paragraphs, the top of
    // the 250 to 400 word range) at standard and compact. Comfortable is the person's choice of a looser page.
    for (const density of DENSITIES)
      for (const preset of ["us", "de"] as const) {
        cases.push({ label: `typical ${preset} ${density}`, doc: typical, design: { templateId: t.id, preset, paper: null, density, accent: "ink" } })
        if (density !== "comfortable")
          cases.push({ label: `long ${preset} ${density}`, doc: long, design: { templateId: t.id, preset, paper: null, density, accent: "ink" } })
      }

    for (const c of cases) {
      runs++
      if (++compiles % 25 === 0) engine = await loadEngine({ fonts })
      const model = toLetterRenderModel(c.doc, c.design, TODAY)
      const r = engine.pdf("/letter.typ", JSON.stringify(model))
      const where = `${t.id} ${c.label}`
      if (!r.ok) {
        fail(`${where}: compile (${r.error})`)
        continue
      }
      const before = failures
      if (keep) fs.writeFileSync(path.join(keepDir, `${t.id}-${c.label.replace(/\s+/g, "-")}.pdf`), r.bytes)
      const out = await pdfInfo(r.bytes)
      const { missing, outOfOrder } = inOrder(out.text, expectedOrder(model))
      if (missing.length) fail(`${where}: missing text: ${missing.join(" | ").slice(0, 200)}`)
      if (outOfOrder.length) fail(`${where}: out of order: ${outOfOrder.join(" | ").slice(0, 200)}`)
      const bad = out.text.match(/[�-]/g)
      if (bad) fail(`${where}: ${bad.length} broken glyphs`)
      if (out.pages !== 1) fail(`${where}: ${out.pages} pages`)
      const want = PAPER[model.style.paper]
      if (!out.sizes.every((s) => s[2] === want[0] && s[3] === want[1])) fail(`${where}: page size ${JSON.stringify(out.sizes[0])}, want ${want}`)
      if (out.title !== model.meta.title) fail(`${where}: title metadata "${out.title}"`)
      const wantLinks = model.doc.contact.filter((x) => x.url).map((x) => x.url)
      const lost = wantLinks.filter((u) => !out.links.some((l) => l.replace(/\/$/, "") === u.replace(/\/$/, "")))
      if (lost.length) fail(`${where}: links not clickable: ${lost.join(" ")}`)
      if (c.doc === long && !norm(out.text).includes(norm(`#panic("injected") *not bold* $x^2$ <label> @ref [link]`)))
        fail(`${where}: markup typed into the letter was not printed literally`)
      if (failures === before) passed++
    }
    // Font fallback check: compile once with the template's fonts and look for Typst's "unknown font family" warning
    // indirectly, by checking the look's font is actually embedded in the PDF.
    const r = engine.pdf("/letter.typ", JSON.stringify(toLetterRenderModel(typical, { templateId: t.id, preset: "us", paper: null, density: "standard", accent: "ink" }, TODAY)))
    if (r.ok) {
      const raw = Buffer.from(r.bytes).toString("latin1")
      const lk = letterLook(t.id)
      for (const fam of [lk.font, lk.headFont, lk.nameFont].filter(Boolean) as string[])
        if (!raw.includes(fileFamily(fam).replace(/4$/, ""))) fail(`${t.id}: font "${fam}" not embedded (fell back to another font)`)
    }
    console.log(`${t.no} ${t.name.padEnd(9)} ${passed}/${runs} letter runs pass`)
  }

  if (failures) {
    console.error(`\n${failures} check(s) failed.`)
    process.exit(1)
  }
}

/** Without --only, each template runs in its own child process: the wasm compiler's memory only grows. */
function runAll() {
  let failed = 0
  for (const t of RESUME_TEMPLATES) {
    const jiti = path.join(root, "node_modules/.bin/jiti")
    const r = spawnSync(jiti, [process.argv[1]!, ...process.argv.slice(2), `--only=${t.id}`], { stdio: "inherit" })
    if (r.status !== 0) failed++
  }
  if (failed) {
    console.error(`\n${failed} template(s) failed.`)
    process.exit(1)
  }
  console.log("\nAll letter checks pass.")
}

if (!only) runAll()
else
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
