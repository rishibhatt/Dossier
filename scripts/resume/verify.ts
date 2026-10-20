/**
 * Resume template verification ("ATS tested" evidence).
 *
 * Renders every template x sample resume x density x paper with the same Typst wasm compiler and fonts the
 * browser uses, extracts the PDF text with pdf.js, and checks that a parser gets every field back in order:
 * name, contact details, headings, each entry's title/subtitle/date, every bullet. Also checks for replacement
 * or private-use glyphs, missing links, and that metadata is set.
 *
 * Writes content/resume-templates/verification/<template>.json. Exit code 1 on any failure.
 * Run: npm run resume:verify
 */
import fs from "node:fs"
import path from "node:path"

import { toRenderModel, type RenderEntry } from "../../src/lib/resume/renderModel"
import { SAMPLE_RESUMES } from "../../src/lib/resume/samples"
import { DENSITIES, type ResumeDesign } from "../../src/lib/resume/schema"
import { RESUME_TEMPLATES } from "../../src/lib/resume/templates"
import { loadEngine } from "./nodeEngine"

const root = process.cwd()
const outDir = path.join(root, "content/resume-templates/verification")
const keepPdfs = process.argv.includes("--keep")

const norm = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/[‐-―]/g, "-")
    .replace(/\s+/g, " ")
    // A line may break after an existing hyphen or dash ("mid-" / "size"); parsers rejoin it, so do we.
    .replace(/- /g, "-")
    .trim()
    .toLowerCase()

type Check = { name: string; pass: boolean; detail?: string }

async function pdfText(bytes: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await pdfjs.getDocument({ data: bytes.slice(), useSystemFonts: false, isEvalSupported: false }).promise
  const pages: string[] = []
  const links: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const tc = await page.getTextContent()
    pages.push(tc.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : "") : "")).join(""))
    for (const a of await page.getAnnotations()) if (a.url) links.push(a.url)
  }
  const meta = await doc.getMetadata()
  return { text: pages.join("\n"), pages: doc.numPages, links, title: (meta.info as { Title?: string })?.Title ?? "" }
}

/** Every expected string must appear, and in this order. */
function inOrder(haystack: string, needles: string[]) {
  const h = norm(haystack)
  let at = 0
  const missing: string[] = []
  const outOfOrder: string[] = []
  for (const n of needles.map(norm).filter(Boolean)) {
    const i = h.indexOf(n, at)
    if (i === -1) {
      if (h.includes(n)) outOfOrder.push(n)
      else missing.push(n)
    } else at = i + n.length
  }
  return { missing, outOfOrder }
}

async function main() {
  const engine = await loadEngine()
  fs.mkdirSync(outDir, { recursive: true })
  let failures = 0

  for (const t of RESUME_TEMPLATES) {
    const runs: { sample: string; density: string; paper: string; pages: number; ms: number; checks: Check[] }[] = []
    for (const sample of SAMPLE_RESUMES) {
      for (const density of DENSITIES) {
        for (const paper of ["a4", "us-letter"] as const) {
          const design: ResumeDesign = { templateId: t.id, preset: "eu", paper, density, accent: "ink" }
          const model = toRenderModel(sample.doc, design)
          const r = engine.pdf(`/${t.id}.typ`, JSON.stringify(model))
          const checks: Check[] = []
          if (!r.ok) {
            checks.push({ name: "compiles", pass: false, detail: r.error })
            runs.push({ sample: sample.id, density, paper, pages: 0, ms: r.ms, checks })
            failures++
            continue
          }
          checks.push({ name: "compiles", pass: true })
          if (keepPdfs && density === "standard") {
            const dir = path.join(root, ".resume-verify")
            fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(path.join(dir, `${t.id}-${sample.id}-${paper}.pdf`), r.bytes)
          }
          const out = await pdfText(r.bytes)

          // Reading order: header, then each section's heading and every entry field in the order the template
          // sets them. Two-column templates read the main column first, then the sidebar, matching their source.
          const d = model.doc
          const side = ["skills", "languages", "certifications", "awards"]
          const entryFields = (e: RenderEntry, type: string, inSide: boolean) => {
            const bullets = e.bullets.map((b) => b.text)
            if (t.id === "r002-plain") {
              const orgFirst = ["experience", "volunteering", "education"].includes(type) && e.subtitle
              return orgFirst ? [e.subtitle, e.title, e.date, ...bullets, e.detail] : [e.title, e.subtitle, e.date, ...bullets, e.detail]
            }
            if (inSide) return [e.title, e.subtitle, e.date, e.detail]
            // One-line roles ("Title, Company ... dates") and numbered references set the subtitle before the date.
            if (t.id === "r005-compact") return [e.title, e.subtitle, e.date, e.detail, ...bullets]
            if (t.id === "r004-scholar" && type === "publications") return [e.title, e.subtitle, e.date, e.detail]
            return [e.title, e.date, e.subtitle, ...bullets, e.detail]
          }
          const ordered = (sections: typeof d.sections, inSide = false) =>
            sections.flatMap((s) => [
              s.title,
              ...(s.kind === "entries"
                ? s.entries.flatMap((e) => entryFields(e, s.type, inSide))
                : s.kind === "skills"
                  ? s.groups.flatMap((g) => [g.label, g.items])
                  : s.pairs.flatMap((p) => [p.label, p.value])),
            ])
          const body =
            t.columns === 2
              ? [...ordered(d.sections.filter((s) => !side.includes(s.type))), ...ordered(d.sections.filter((s) => side.includes(s.type)), true)]
              : ordered(d.sections)
          const expected = [d.name, d.headline, ...d.contact.map((c) => c.text), d.summary, ...body]
          const { missing, outOfOrder } = inOrder(out.text, expected)
          checks.push({ name: "all fields extracted", pass: missing.length === 0, detail: missing.join(" | ") || undefined })
          checks.push({ name: "reading order", pass: outOfOrder.length === 0, detail: outOfOrder.join(" | ") || undefined })

          const bad = out.text.match(/[�-]/g)
          checks.push({ name: "no broken glyphs", pass: !bad, detail: bad ? `${bad.length} broken glyphs` : undefined })

          const wantLinks = d.contact.filter((c) => c.url).map((c) => c.url)
          const missingLinks = wantLinks.filter((u) => !out.links.some((l) => l.replace(/\/$/, "") === u.replace(/\/$/, "")))
          checks.push({ name: "links clickable", pass: missingLinks.length === 0, detail: missingLinks.join(" ") || undefined })

          checks.push({ name: "title metadata", pass: out.title === model.meta.title, detail: out.title })

          const contactEarly = d.contact.length === 0 || norm(out.text).slice(0, 400).includes(norm(d.contact[0].text))
          checks.push({ name: "contact near top", pass: contactEarly })

          if (checks.some((c) => !c.pass)) failures++
          runs.push({ sample: sample.id, density, paper, pages: out.pages, ms: Math.round(r.ms), checks })
        }
      }
    }

    const passed = runs.filter((r) => r.checks.every((c) => c.pass)).length
    const report = {
      template: t.id,
      version: t.version,
      testedAt: new Date().toISOString().slice(0, 10),
      engine: "typst 0.14.2 via typst.ts 0.7.0",
      extractor: "pdf.js",
      summary: { runs: runs.length, passed },
      checks: [...new Set(runs.flatMap((r) => r.checks.map((c) => c.name)))],
      runs,
    }
    fs.writeFileSync(path.join(outDir, `${t.id}.json`), JSON.stringify(report, null, 2) + "\n")
    console.log(`${t.no} ${t.name.padEnd(8)} ${passed}/${runs.length} runs pass`)
    for (const r of runs)
      for (const c of r.checks)
        if (!c.pass) console.log(`   FAIL ${r.sample} ${r.density} ${r.paper}: ${c.name}${c.detail ? ` (${c.detail.slice(0, 200)})` : ""}`)
  }

  if (failures) {
    console.error(`\n${failures} run(s) failed.`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
