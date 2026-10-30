/**
 * Template thumbnails for the marketing pages, from real Typst renders (never generated images).
 *
 * Sets every template x its showcase sample resumes x paper size with the browser's own engine, splits the SVG into pages and
 * rasterises each page with sharp to WebP at 600 and 1200 px wide, plus a 600 px PNG of page one for the share
 * card (next/og cannot read WebP). Without sharp it writes the page SVGs instead. Output goes to
 * public/resume-templates/ and the index the pages read goes to content/resume-templates/thumbnails.json.
 *
 * Skips a template whose inputs (its .typ file, lib.typ, samples, render model, presets) hash the same as last
 * time and whose files are all present. Pass --force to redo everything.
 *
 * Also writes content/resume-templates/covers.json (one page-one image per template, for the editor's picker) and
 * content/resume-templates/parse-sample.json: the fields pdf.js reads back out of one sample PDF
 * (R-001 Ledger, Meera Iyer), which the /resume landing page prints as a table.
 * Run: npm run resume:thumbs (also runs before `next build`).
 */
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

import { toRenderModel } from "../../src/lib/resume/renderModel"
import { SAMPLE_RESUMES } from "../../src/lib/resume/samples"
import { RESUME_TEMPLATES } from "../../src/lib/resume/templates"
import { loadEngine, typstDir } from "./nodeEngine"

const root = process.cwd()
const outDir = path.join(root, "public/resume-templates")
const indexFile = path.join(root, "content/resume-templates/thumbnails.json")
const force = process.argv.includes("--force")

const PAPERS = ["a4", "us-letter"] as const
const WIDTHS = [600, 1200] as const

export type ThumbRender = { sample: string; paper: (typeof PAPERS)[number]; pages: number; ratio: number; files: string[]; og?: string }
export type ThumbIndex = { format: "webp" | "svg"; templates: Record<string, { hash: string; renders: ThumbRender[] }> }

const read = (p: string) => fs.readFileSync(path.join(root, p))
const sharedInputs = ["src/resume/typst/lib.typ", "src/lib/resume/samples.ts", "src/lib/resume/sampleLibrary.ts", "src/lib/resume/templates.ts", "src/lib/resume/renderModel.ts", "src/lib/resume/presets.ts"].map(read)

function hashFor(templateId: string, format: string) {
  const h = createHash("sha256").update(format)
  for (const b of sharedInputs) h.update(b)
  h.update(fs.readFileSync(path.join(typstDir, `${templateId}.typ`)))
  return h.digest("hex").slice(0, 16)
}

/** typst.ts sets each page as <g class="typst-page" transform="translate(0, y)" data-page-width data-page-height>. */
function pageBoxes(svg: string) {
  const re = /<g class="typst-page" transform="translate\(([\d.]+),\s*([\d.]+)\)"[^>]*data-page-width="([\d.]+)" data-page-height="([\d.]+)"/g
  return [...svg.matchAll(re)].map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }))
}

type Sharp = typeof import("sharp").default

async function loadSharp(): Promise<Sharp | null> {
  try {
    return (await import("sharp")).default
  } catch {
    return null
  }
}

async function main() {
  const sharp = await loadSharp()
  const format = sharp ? "webp" : "svg"
  if (!sharp) console.warn("thumbnails: sharp is not installed, writing SVG pages instead of WebP")

  const prev: ThumbIndex | null = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, "utf8")) : null
  const index: ThumbIndex = { format, templates: {} }
  let engine: Awaited<ReturnType<typeof loadEngine>> | null = null

  for (const t of RESUME_TEMPLATES) {
    const hash = hashFor(t.id, format)
    const old = prev?.format === format ? prev.templates[t.id] : undefined
    const present = old?.renders.every((r) => [...r.files, ...(r.og ? [r.og] : [])].every((f) => fs.existsSync(path.join(root, "public", f))))
    if (!force && old?.hash === hash && present) {
      index.templates[t.id] = old
      console.log(`${t.no} ${t.name.padEnd(8)} unchanged`)
      continue
    }

    engine ??= await loadEngine({ renderer: true })
    const dir = path.join(outDir, t.id)
    fs.rmSync(dir, { recursive: true, force: true })
    fs.mkdirSync(dir, { recursive: true })
    const renders: ThumbRender[] = []
    let bytes = 0

    // Only the samples that show this template off (templates.ts `showcase`), each in its own country format.
    const showcase = t.showcase.map((id) => SAMPLE_RESUMES.find((s) => s.id === id)).filter((s) => s !== undefined)
    for (const sample of showcase) {
      for (const paper of PAPERS) {
        const model = toRenderModel(sample.doc, { templateId: t.id, preset: sample.preset, paper, density: "standard", accent: "ink" })
        const r = engine.svg(`/${t.id}.typ`, JSON.stringify(model))
        if (!r.ok) throw new Error(`${t.id} / ${sample.id} / ${paper}: ${r.error}`)
        const pages = pageBoxes(r.svg)
        if (!pages.length) throw new Error(`${t.id}: no pages found in the SVG`)
        const base = `${sample.id}-${paper}`
        const files: string[] = []
        let og: string | undefined

        for (const [i, p] of pages.entries()) {
          const stem = `${base}-p${i + 1}`
          // Re-frame the whole document SVG onto one page; the other pages fall outside the viewBox.
          const page = r.svg.replace(/^<svg[^>]*?viewBox="[^"]*"[^>]*?width="[^"]*"[^>]*?height="[^"]*"/, (open) =>
            open
              .replace(/viewBox="[^"]*"/, `viewBox="${p.x} ${p.y} ${p.w} ${p.h}"`)
              .replace(/ width="[^"]*"/, ` width="${p.w}"`)
              .replace(/ height="[^"]*"/, ` height="${p.h}"`),
          )
          if (!sharp) {
            const rel = `resume-templates/${t.id}/${stem}.svg`
            fs.writeFileSync(path.join(root, "public", rel), page)
            files.push(rel)
            continue
          }
          for (const w of WIDTHS) {
            const rel = `resume-templates/${t.id}/${stem}-${w}.webp`
            const info = await sharp(Buffer.from(page), { density: (72 * w) / p.w })
              .resize({ width: w })
              .flatten({ background: "#ffffff" })
              .webp({ quality: 80 })
              .toFile(path.join(root, "public", rel))
            bytes += info.size
            files.push(rel)
          }
          if (i === 0) {
            og = `resume-templates/${t.id}/${base}-og.png`
            await sharp(Buffer.from(page), { density: (72 * 600) / p.w })
              .resize({ width: 600 })
              .flatten({ background: "#ffffff" })
              .png({ compressionLevel: 9, palette: true })
              .toFile(path.join(root, "public", og))
          }
        }
        renders.push({ sample: sample.id, paper, pages: pages.length, ratio: +(pages[0].h / pages[0].w).toFixed(4), files, og })
      }
    }

    index.templates[t.id] = { hash, renders }
    console.log(`${t.no} ${t.name.padEnd(8)} ${renders.reduce((n, r) => n + r.files.length, 0)} images, ${Math.round(bytes / 1024)} KB`)
  }

  fs.mkdirSync(path.dirname(indexFile), { recursive: true })
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2) + "\n")

  // A small id -> cover map for the editor's template picker, so the client bundle never carries the full index.
  const covers: Record<string, { src: string; sample: string }> = {}
  for (const t of RESUME_TEMPLATES) {
    const r = index.templates[t.id]?.renders.find((x) => x.paper === "a4" && x.sample === t.showcase[0])
    const src = r?.files.find((f) => f.includes("-p1-600")) ?? r?.files[0]
    if (r && src) covers[t.id] = { src: `/${src}`, sample: r.sample }
  }
  fs.writeFileSync(path.join(path.dirname(indexFile), "covers.json"), JSON.stringify(covers, null, 2) + "\n")

  engine ??= await loadEngine({ renderer: true })
  await writeParseSample(engine)
}

const norm = (s: string) => s.normalize("NFKC").replace(/[‐-―]/g, "-").replace(/\s+/g, " ").trim().toLowerCase()

/** Sets one sample as a PDF, reads its text back with pdf.js, and records which form fields came back. */
async function writeParseSample(engine: Awaited<ReturnType<typeof loadEngine>>) {
  const templateId = "r001-ledger"
  const sample = SAMPLE_RESUMES.find((s) => s.id === "meera")!
  const model = toRenderModel(sample.doc, { templateId, preset: "in", paper: "a4", density: "standard", accent: "ink" })
  const r = engine.pdf(`/${templateId}.typ`, JSON.stringify(model))
  if (!r.ok) throw new Error(`parse sample: ${r.error}`)

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  const doc = await pdfjs.getDocument({ data: r.bytes.slice(), useSystemFonts: false, isEvalSupported: false }).promise
  let text = ""
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent()
    text += tc.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : "") : "")).join("") + "\n"
  }
  const meta = await doc.getMetadata()

  const d = model.doc
  const exp = d.sections.find((s) => s.type === "experience")
  const edu = d.sections.find((s) => s.type === "education")
  const skills = d.sections.find((s) => s.type === "skills")
  const job = exp?.kind === "entries" ? exp.entries[0] : undefined
  const school = edu?.kind === "entries" ? edu.entries[0] : undefined
  const fields: [string, string][] = [
    ["Name", d.name],
    ["Headline", d.headline],
    ...d.contact.map((c): [string, string] => [c.url?.startsWith("mailto:") ? "Email" : c.url?.startsWith("tel:") ? "Phone" : c.url ? "Link" : "Location", c.text]),
    ["Latest job title", job?.title ?? ""],
    ["Employer", job?.subtitle ?? ""],
    ["Dates", job?.date ?? ""],
    ["First bullet", job?.bullets[0]?.text ?? ""],
    ["Degree", school?.title ?? ""],
    ["School", school?.subtitle ?? ""],
    ["Skills", skills?.kind === "skills" ? skills.groups[0]?.items ?? "" : ""],
  ]
  const h = norm(text)
  const out = {
    template: templateId,
    sample: sample.label,
    testedAt: new Date().toISOString().slice(0, 10),
    extractor: "pdf.js",
    pdfTitle: (meta.info as { Title?: string })?.Title ?? "",
    fields: fields.filter(([, v]) => v).map(([field, value]) => ({ field, value, found: h.includes(norm(value)) })),
  }
  fs.writeFileSync(path.join(root, "content/resume-templates/parse-sample.json"), JSON.stringify(out, null, 2) + "\n")
  console.log(`parse sample: ${out.fields.filter((f) => f.found).length}/${out.fields.length} fields read back`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
