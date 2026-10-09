/** Link helpers shared by sections, nav and the static export. Pure. */

export function linkHref(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^(mailto:|tel:|https?:\/\/)/i.test(t)) return t
  if (t.includes("@") && !/\s/.test(t) && !t.includes("/")) return `mailto:${t}`
  if (/\s/.test(t)) return null
  return `https://${t}`
}

/** "https://www.linkedin.com/in/x/" -> "linkedin.com/in/x" */
export function linkText(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "")
}

const NAMED: [RegExp, string][] = [
  [/linkedin\./i, "LinkedIn"],
  [/github\./i, "GitHub"],
  [/gitlab\./i, "GitLab"],
  [/behance\./i, "Behance"],
  [/dribbble\./i, "Dribbble"],
  [/(twitter|x)\.com/i, "X"],
  [/instagram\./i, "Instagram"],
  [/medium\./i, "Medium"],
  [/scholar\.google/i, "Google Scholar"],
  [/orcid\./i, "ORCID"],
  [/youtube\./i, "YouTube"],
]

/** Short human label for a link ("LinkedIn", "Website"). */
export function linkLabel(raw: string): string {
  for (const [re, name] of NAMED) if (re.test(raw)) return name
  return "Website"
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`
