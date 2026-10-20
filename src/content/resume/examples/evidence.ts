import r001 from "../../../../content/resume-templates/verification/r001-ledger.json"
import r002 from "../../../../content/resume-templates/verification/r002-plain.json"
import r003 from "../../../../content/resume-templates/verification/r003-column.json"
import r004 from "../../../../content/resume-templates/verification/r004-scholar.json"
import r005 from "../../../../content/resume-templates/verification/r005-compact.json"
import r006 from "../../../../content/resume-templates/verification/r006-modern.json"
import r007 from "../../../../content/resume-templates/verification/r007-executive.json"
import r008 from "../../../../content/resume-templates/verification/r008-fresher.json"
import r009 from "../../../../content/resume-templates/verification/r009-switcher.json"
import r010 from "../../../../content/resume-templates/verification/r010-europa.json"
import r011 from "../../../../content/resume-templates/verification/r011-gulf.json"
import r012 from "../../../../content/resume-templates/verification/r012-specimen.json"

import { formatTested, type Verification } from "@/content/resume/evidence"

/**
 * Test results for all twelve templates, read the same way as content/resume/evidence.ts (which so far only
 * imports the first four). Fold this into evidence.ts when that file covers every template.
 */

type Report = {
  testedAt: string
  engine: string
  extractor: string
  summary: { runs: number; passed: number }
  checks: string[]
  runs: { sample: string; checks: { name: string; pass: boolean }[] }[]
}

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

export function getAnyVerification(templateId: string): Verification | null {
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
