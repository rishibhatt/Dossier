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
import r013 from "../../../content/resume-templates/verification/r013-margin.json"
import r014 from "../../../content/resume-templates/verification/r014-harbor.json"
import r015 from "../../../content/resume-templates/verification/r015-bedside.json"
import r016 from "../../../content/resume-templates/verification/r016-counter.json"
import r017 from "../../../content/resume-templates/verification/r017-shift.json"
import r018 from "../../../content/resume-templates/verification/r018-brief.json"
import r019 from "../../../content/resume-templates/verification/r019-folio.json"
import r020 from "../../../content/resume-templates/verification/r020-transit.json"
import r021 from "../../../content/resume-templates/verification/r021-lecture.json"
import r022 from "../../../content/resume-templates/verification/r022-atelier.json"
import r023 from "../../../content/resume-templates/verification/r023-signal.json"
import r024 from "../../../content/resume-templates/verification/r024-docket.json"
import r025 from "../../../content/resume-templates/verification/r025-ward.json"
import r026 from "../../../content/resume-templates/verification/r026-site.json"
import r027 from "../../../content/resume-templates/verification/r027-quarter.json"
import r028 from "../../../content/resume-templates/verification/r028-pitch.json"
import r029 from "../../../content/resume-templates/verification/r029-campus.json"
import r030 from "../../../content/resume-templates/verification/r030-clinic.json"
import r031 from "../../../content/resume-templates/verification/r031-tally.json"
import r032 from "../../../content/resume-templates/verification/r032-field.json"
import r033 from "../../../content/resume-templates/verification/r033-atlas.json"
import r034 from "../../../content/resume-templates/verification/r034-notebook.json"
import r035 from "../../../content/resume-templates/verification/r035-kernel.json"
import r036 from "../../../content/resume-templates/verification/r036-cadence.json"
import r037 from "../../../content/resume-templates/verification/r037-mercy.json"
import r038 from "../../../content/resume-templates/verification/r038-bench.json"
import r039 from "../../../content/resume-templates/verification/r039-range.json"
import r040 from "../../../content/resume-templates/verification/r040-crew.json"
import r041 from "../../../content/resume-templates/verification/r041-civic.json"
import r042 from "../../../content/resume-templates/verification/r042-thread.json"

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
  "r013-margin": r013,
  "r014-harbor": r014,
  "r015-bedside": r015,
  "r016-counter": r016,
  "r017-shift": r017,
  "r018-brief": r018,
  "r019-folio": r019,
  "r020-transit": r020,
  "r021-lecture": r021,
  "r022-atelier": r022,
  "r023-signal": r023,
  "r024-docket": r024,
  "r025-ward": r025,
  "r026-site": r026,
  "r027-quarter": r027,
  "r028-pitch": r028,
  "r029-campus": r029,
  "r030-clinic": r030,
  "r031-tally": r031,
  "r032-field": r032,
  "r033-atlas": r033,
  "r034-notebook": r034,
  "r035-kernel": r035,
  "r036-cadence": r036,
  "r037-mercy": r037,
  "r038-bench": r038,
  "r039-range": r039,
  "r040-crew": r040,
  "r041-civic": r041,
  "r042-thread": r042,
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
