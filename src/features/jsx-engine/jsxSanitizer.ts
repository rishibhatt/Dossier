/**
 * Defensive transforms on LLM-produced source before compilation / new Function.
 */

const BLOCKED = [
  /\bimport\s*[\s\w*{]/,
  /\bexport\b/,
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\buseEffect\b/,
  /\buseLayoutEffect\b/,
  /\buseState\b/,
  /\buseReducer\b/,
  /\buseMemo\b/,
  /\buseCallback\b/,
  /\buseRef\b/,
  /\buseContext\b/,
  /\buseSyncExternalStore\b/,
  /\buseId\b/,
  /\buseInsertionEffect\b/,
  /\bdangerouslySetInnerHTML\b/,
  /\bwindow\s*\./,
  /\bdocument\s*\./,
  /\blocalStorage\s*[\[.]/,
  /\bsessionStorage\s*[\[.]/,
  /\blocation\s*\./,
  /\bnavigator\s*\./,
  /__proto__/,
  /<script/i,
  /javascript:/i,
] as const

const MAX_LEN = 14_000

export type SanitizeResult =
  | { ok: true; source: string }
  | { ok: false; reason: string }

export function stripCodeFences(raw: string): string {
  let s = raw.trim()
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:tsx|ts|jsx|js)?\s*/i, "").replace(/\s*```$/i, "")
  }
  return s.trim()
}

export function normalizeGeneratedFunctionSource(code: string): string {
  let c = stripCodeFences(code).trim()
  c = c.replace(/^export\s+default\s+/, "")
  c = c.replace(/^export\s+/, "")
  const sig = /function\s+(\w+)\s*\(\s*props[^)]*\)/
  const m = c.match(sig)
  if (m && m[1] !== "GeneratedSection") {
    c = c.replace(sig, "function GeneratedSection(props)")
  }
  return c.trim()
}

export function sanitizeGeneratedJsx(raw: string): SanitizeResult {
  const normalized = normalizeGeneratedFunctionSource(raw)
  if (!normalized.length) {
    return { ok: false, reason: "empty" }
  }
  if (normalized.length > MAX_LEN) {
    return { ok: false, reason: "too_long" }
  }
  if (!/^function\s+GeneratedSection\s*\(\s*props\b/.test(normalized)) {
    return { ok: false, reason: "missing_generated_section" }
  }
  for (const pattern of BLOCKED) {
    if (pattern.test(normalized)) {
      return { ok: false, reason: `blocked_pattern:${pattern.source}` }
    }
  }
  return { ok: true, source: normalized }
}
