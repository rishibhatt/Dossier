import parseSample from "../../../content/resume-templates/parse-sample.json"
import thumbIndex from "../../../content/resume-templates/thumbnails.json"
import r001 from "../../../content/resume-templates/verification/r001-ledger.json"
import r002 from "../../../content/resume-templates/verification/r002-plain.json"
import r003 from "../../../content/resume-templates/verification/r003-column.json"
import r004 from "../../../content/resume-templates/verification/r004-scholar.json"
import r005 from "../../../content/resume-templates/verification/r005-compact.json"
import r006 from "../../../content/resume-templates/verification/r006-modern.json"
import r007 from "../../../content/resume-templates/verification/r007-executive.json"
import r008 from "../../../content/resume-templates/verification/r008-fresher.json"
import r009 from "../../../content/resume-templates/verification/r009-switcher.json"
import r010 from "../../../content/resume-templates/verification/r010-europa.json"
import r011 from "../../../content/resume-templates/verification/r011-gulf.json"
import r012 from "../../../content/resume-templates/verification/r012-specimen.json"

/**
 * What the marketing pages may say about a template, read from the files the scripts write:
 * `npm run resume:verify` (test results) and `npm run resume:thumbs` (real Typst renders, parse-back sample).
 * Imported statically so the numbers are bundled with the page and can never claim more than the test showed.
 */

type Run = { sample: string; density: string; paper: string; pages: number; checks: { name: string; pass: boolean }[] }
type Report = { template: string; version: number; testedAt: string; engine: string; extractor: string; summary: { runs: number; passed: number }; checks: string[]; runs: Run[] }

// One import per template. A template missing here shows no stamp, so add new templates to this list.
const REPORTS: Record<string, Report> = {
  "r001-ledger": r001,
  "r002-plain": r002,
  "r003-column": r003,
  "r004-scholar": r004,
  "r005-compact": r005,
  "r006-modern": r006,
  "r007-executive": r007,
  "r008-fresher": r008,
  "r009-switcher": r009,
  "r010-europa": r010,
  "r011-gulf": r011,
  "r012-specimen": r012,
}

export type Verification = {
  testedAt: string
  testedLabel: string
  engine: string
  extractor: string
  runs: number
  passed: number
  samples: number
  checks: { name: string; passed: number; runs: number }[]
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

export function formatTested(iso: string) {
  return DATE.format(new Date(`${iso}T00:00:00Z`))
}

export function getVerification(templateId: string): Verification | null {
  const r = REPORTS[templateId]
  if (!r) return null
  return {
    testedAt: r.testedAt,
    testedLabel: formatTested(r.testedAt),
    engine: r.engine,
    extractor: r.extractor,
    runs: r.summary.runs,
    passed: r.summary.passed,
    samples: new Set(r.runs.map((x) => x.sample)).size,
    checks: r.checks.map((name) => {
      const withCheck = r.runs.filter((x) => x.checks.some((c) => c.name === name))
      return { name, runs: withCheck.length, passed: withCheck.filter((x) => x.checks.some((c) => c.name === name && c.pass)).length }
    }),
  }
}

/** The one-line stamp. Exact counts and the date, never a blanket "ATS pass". */
export function stampText(v: Verification, compact = false) {
  return compact ? `Tested ${v.testedLabel} · ${v.passed}/${v.runs} passed` : `Tested ${v.testedLabel} · ${v.passed}/${v.runs} runs passed · ${v.extractor}`
}

export type Paper = "a4" | "us-letter"
type Render = { sample: string; paper: string; pages: number; ratio: number; files: string[]; og?: string }

const INDEX = thumbIndex as { format: "webp" | "svg"; templates: Record<string, { hash: string; renders: Render[] }> }

export type Thumb = { src: string; srcLarge: string; ratio: number; pages: { src: string; srcLarge: string }[]; og: string | null }

/** Public URLs for one render. WebP comes at 600 and 1200 px; the SVG fallback is one file per page. */
export function getThumb(templateId: string, sample: string, paper: Paper): Thumb | null {
  const r = INDEX.templates[templateId]?.renders.find((x) => x.sample === sample && x.paper === paper)
  if (!r) return null
  const pages = Array.from({ length: r.pages }, (_, i) => {
    const files = r.files.filter((f) => f.includes(`-p${i + 1}`))
    const small = files.find((f) => f.endsWith("-600.webp")) ?? files[0]!
    const large = files.find((f) => f.endsWith("-1200.webp")) ?? small
    return { src: `/${small}`, srcLarge: `/${large}` }
  })
  return { src: pages[0]!.src, srcLarge: pages[0]!.srcLarge, ratio: r.ratio, pages, og: r.og ?? null }
}

export const PARSE_SAMPLE = parseSample as {
  template: string
  sample: string
  testedAt: string
  extractor: string
  pdfTitle: string
  fields: { field: string; value: string; found: boolean }[]
}
