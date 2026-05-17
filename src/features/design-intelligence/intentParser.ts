import type { DesignIntelligenceStyle } from "@/types/design"

export type ParsedDesignIntent = {
  inferredStyle: DesignIntelligenceStyle
  /** Normalized single-word tokens */
  keywords: Set<string>
  /** Inferred section focus from phrasing */
  sectionHints: Set<string>
}

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "it",
  "is",
  "be",
  "as",
  "at",
  "my",
  "me",
  "we",
  "us",
  "make",
  "this",
  "that",
  "very",
  "just",
  "like",
  "nice",
  "good",
])

function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Rule-based intent extraction — no LLM. Vague input still yields a stable baseline.
 */
export function parseDesignIntent(userPrompt: string): ParsedDesignIntent {
  const tokens = tokenize(userPrompt)
  const keywords = new Set<string>()
  for (const t of tokens) {
    if (t.length < 2 || STOP.has(t)) continue
    keywords.add(t)
  }

  const sectionHints = new Set<string>()
  const blob = userPrompt.toLowerCase()
  if (/(project|work|portfolio|case)/.test(blob)) sectionHints.add("projects")
  if (/(hero|intro|headline|banner)/.test(blob)) sectionHints.add("hero")
  if (/(about|story|bio)/.test(blob)) sectionHints.add("about")
  if (/(contact|email|reach)/.test(blob)) sectionHints.add("contact")
  if (/(skill|stack|tech)/.test(blob)) sectionHints.add("skills")
  if (/(experience|work history|timeline|career)/.test(blob)) sectionHints.add("experience")

  let inferredStyle: DesignIntelligenceStyle = "minimal"

  if (keywords.has("corporate") || keywords.has("business") || keywords.has("consulting")) {
    inferredStyle = "corporate"
  } else if (
    keywords.has("experimental") ||
    keywords.has("avant") ||
    keywords.has("weird") ||
    keywords.has("art")
  ) {
    inferredStyle = "experimental"
  } else if (
    keywords.has("editorial") ||
    keywords.has("magazine") ||
    keywords.has("luxury") ||
    keywords.has("serif")
  ) {
    inferredStyle = "editorial"
  } else if (
    keywords.has("cool") ||
    keywords.has("bold") ||
    keywords.has("creative") ||
    keywords.has("vibrant") ||
    keywords.has("gradient") ||
    keywords.has("dynamic")
  ) {
    inferredStyle = "creative"
  } else if (keywords.has("modern") || keywords.has("clean") || keywords.has("simple") || keywords.has("minimal")) {
    inferredStyle = "minimal"
  }

  if (/(make it nice|looks good|polish|pretty)/i.test(userPrompt) && keywords.size < 3) {
    inferredStyle = "editorial"
    keywords.add("premium")
    keywords.add("spacing")
  }

  return { inferredStyle, keywords, sectionHints }
}
