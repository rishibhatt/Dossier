/**
 * Shrinks raw PDF text before it is sent to a (free-tier) LLM.
 * Strips PDF noise (page numbers, bullet glyphs, rules, repeated headers/footers, runs of
 * whitespace) and, if still over budget, drops the least informative lines first while keeping
 * section headings and the top of the document (name, contact, summary).
 */

/** ~2k input tokens. A dense two-page resume cleans down to about 6-8k chars. */
export const RESUME_TEXT_CAP = 8_000

const BULLET_GLYPHS = /^[\s ]*[•●◦▪▫■□►▶➢➤✓✔★☆◆◇‣⁃∙·–—*>»]+[\s ]*/u
const PAGE_NUMBER = /^-{1,3}\s*\d{1,3}\s*of\s*\d{1,3}\s*-{1,3}$|^(?:page\s*)?\d{1,3}\s*(?:\/|of)\s*\d{1,3}$|^page\s*\d{1,3}$|^-\s*\d{1,3}\s*-$|^\d{1,2}$/i
const RULE_LINE = /^[\s_=\-~.*#|]{3,}$/
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‍﻿]/g
const HEADING = /^(?:summary|profile|about(?: me)?|objective|experience|work experience|professional experience|employment(?: history)?|education|skills|technical skills|projects|certifications?|awards?|publications?|languages|interests|volunteer(?:ing)?|contact|references?)\s*:?$/i

export function cleanResumeLines(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const original of raw.replace(/\r\n?/g, "\n").replace(CONTROL, "").split("\n")) {
    let line = original.replace(/[\t ]+/g, " ").replace(BULLET_GLYPHS, "- ").replace(/ {2,}/g, " ").trim()
    if (line === "-") continue
    if (!line || RULE_LINE.test(line) || PAGE_NUMBER.test(line)) continue
    line = line.replace(/^-\s+(?=[A-Z0-9])/, "- ")
    const key = line.toLowerCase()
    // dedupe repeated headers/footers; keep short fragments (e.g. "Remote") that can legitimately repeat
    // (> 40 chars: a job title repeated from the header, e.g. "Senior Software Engineer", must survive)
    if (line.length > 40 && seen.has(key)) continue
    seen.add(key)
    // PDF text wraps long bullets: a lowercase line continues the previous one (fewer lines, whole bullets).
    const prev = out[out.length - 1]
    if (prev && /^[a-z(&]/.test(line) && !/[.!?:]$/.test(prev) && !HEADING.test(prev)) {
      out[out.length - 1] = `${prev} ${line}`
      continue
    }
    out.push(line)
  }
  return out
}

/** Letters and digits only: under ~200 the PDF is a scan or an image and there is nothing to read. */
export function meaningfulChars(lines: string[]): number {
  let n = 0
  for (const l of lines) n += l.replace(/[^\p{L}\p{N}]/gu, "").length
  return n
}

function lineValue(line: string, index: number): number {
  if (HEADING.test(line)) return 100
  if (index < 12) return 60 // name, title, contact block, summary lead-in
  let v = 1
  if (/\d/.test(line)) v += 2
  if (/[%$€£]|\b\d+\s?(?:k|m|x|years?|yrs?)\b/i.test(line)) v += 2
  if (/@|linkedin|github|https?:\/\//i.test(line)) v += 4
  if (/\b(?:19|20)\d{2}\b/.test(line)) v += 2 // dates anchor jobs/education
  if (/^[A-Z][A-Za-z&.,' -]{2,60}$/.test(line)) v += 1 // role/company-ish titles
  if (line.length < 18) v -= 1
  if (line.length > 240) v -= 1
  return v
}

/** Takes the lines from cleanResumeLines (cleaned once per upload) and fits them under the cap. */
export function compactResumeText(lines: string[], maxChars: number = RESUME_TEXT_CAP): string {
  let total = lines.reduce((n, l) => n + l.length + 1, 0)
  if (total <= maxChars) return lines.join("\n")

  // drop lowest-value lines first (later lines first on ties) until under the cap
  const ranked = lines
    .map((line, i) => ({ i, v: lineValue(line, i), len: line.length + 1 }))
    .sort((a, b) => a.v - b.v || b.i - a.i)
  const drop = new Set<number>()
  for (const r of ranked) {
    if (total <= maxChars) break
    if (r.v >= 60) break
    drop.add(r.i)
    total -= r.len
  }
  let kept = lines.filter((_, i) => !drop.has(i)).join("\n")
  if (kept.length > maxChars) kept = `${kept.slice(0, maxChars - 1)}…`
  return kept
}
