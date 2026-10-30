const NAMED_DOMAINS: [RegExp, string][] = [
  [/github\./i, "GitHub"],
  [/linkedin\./i, "LinkedIn"],
  [/gitlab\./i, "GitLab"],
  [/(twitter|x)\.com/i, "X"],
  [/behance\./i, "Behance"],
  [/dribbble\./i, "Dribbble"],
  [/medium\./i, "Medium"],
  [/substack\./i, "Substack"],
  [/youtube\./i, "YouTube"],
  [/scholar\.google/i, "Google Scholar"],
  [/orcid\./i, "ORCID"],
  [/researchgate\./i, "ResearchGate"],
  [/codepen\./i, "CodePen"],
  [/leetcode\./i, "LeetCode"],
  [/huggingface\./i, "Hugging Face"],
  [/kaggle\./i, "Kaggle"],
  [/stackoverflow\./i, "Stack Overflow"],
  [/figma\./i, "Figma"],
  [/dev\.to/i, "Dev.to"],
]

/**
 * Attempts to guess a human label for a link from its URL (e.g. "GitHub" from github.com/user).
 * Returns empty string if no known brand is matched.
 */
export function guessLinkLabel(raw: string): string {
  const v = raw.trim()
  if (!v) return ""
  for (const [re, label] of NAMED_DOMAINS) {
    if (re.test(v)) return label
  }
  return ""
}

/**
 * Strips protocol, www, and trailing slashes for display.
 */
export function stripUrl(raw: string): string {
  return raw
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/^tel:/i, "")
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/\/$/, "")
}

/**
 * Returns a clean display text for a link:
 * - If explicitLabel is given (and not just an echoed URL path), uses it.
 * - Otherwise guesses based on domain (e.g. "GitHub", "LinkedIn").
 * - Falls back to clean URL domain/path.
 */
export function autoLabel(url: string, explicitLabel?: string): string {
  const cleaned = explicitLabel?.trim()
  if (cleaned) {
    // If the label is not an exact duplicate of the raw url / path, respect the user's text
    if (!/^(https?:\/\/|[\w.-]+\.[a-z]{2,}\/)/i.test(cleaned)) {
      return cleaned
    }
  }
  const guessed = guessLinkLabel(url)
  if (guessed) return guessed
  return cleaned || stripUrl(url)
}
