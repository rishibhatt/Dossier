/**
 * Google Fonts URL builder for portfolio canvases.
 *
 * The CSS2 API answers 400 (and loads NOTHING) if any family is asked for a weight it does not
 * ship, so each family lists only weights it really has. Unknown families fall back to 400;700.
 * Portfolio fonts are loaded at runtime from this URL (see PortfolioDesignSurface), so any family
 * referenced by a template must have an entry here.
 */
const WEIGHTS: Record<string, string> = {
  // legacy FONT_PAIRINGS families
  Syne: "400;500;600;700;800",
  Inter: "400;500;600;700;800",
  Outfit: "400;500;600;700;800",
  "Plus Jakarta Sans": "400;500;600;700;800",
  "Playfair Display": "400;500;600;700;800",
  "Space Grotesk": "400;500;600;700",
  "DM Sans": "400;500;600;700",
  "Cormorant Garamond": "400;500;600;700",
  "Libre Franklin": "400;500;600;700;800",
  "Bebas Neue": "400",
  "Source Sans 3": "400;500;600;700",
  Manrope: "400;500;600;700;800",
  "JetBrains Mono": "400;500;700",
  "IBM Plex Mono": "400;500;600",
  "Fira Code": "400;500;600",
  "Source Code Pro": "400;500;600",
  // template families
  "IBM Plex Sans": "400;500;600;700",
  "IBM Plex Serif": "400;500;600;700",
  "Schibsted Grotesk": "400;500;600;700;800",
  Sora: "400;500;600;700;800",
  Figtree: "400;500;600;700;800",
  "Bricolage Grotesque": "400;500;600;700;800",
  "Hanken Grotesk": "400;500;600;700;800",
  "DM Mono": "400;500",
  "Albert Sans": "400;500;600;700;800",
  "Source Serif 4": "400;500;600;700;800",
  Gabarito: "400;500;600;700;800",
  "Nunito Sans": "400;500;600;700;800",
  "Public Sans": "400;500;600;700;800",
  "Work Sans": "400;500;600;700;800",
  Literata: "400;500;600;700;800",
  "Atkinson Hyperlegible": "400;700",
  Newsreader: "400;500;600;700;800",
  "Red Hat Display": "400;500;600;700;800",
  "Red Hat Text": "400;500;700",
  Archivo: "400;500;600;700;800",
  Chivo: "400;500;600;700;800",
  Epilogue: "400;500;600;700;800",
  Karla: "400;500;600;700;800",
  Vollkorn: "400;500;600;700;800",
  Mulish: "400;500;600;700;800",
  "Barlow Condensed": "400;500;600;700",
  Barlow: "400;500;600;700",
  "Familjen Grotesk": "400;500;600;700",
  Onest: "400;500;600;700;800",
  Spectral: "400;500;600;700;800",
  "Crimson Pro": "400;500;600;700;800",
  Lexend: "400;500;600;700;800",
}

const FALLBACK_WEIGHTS = "400;700"

export function googleFontFamilyParam(family: string): string {
  const w = WEIGHTS[family] ?? FALLBACK_WEIGHTS
  return `${family.replace(/\s+/g, "+")}:wght@${w}`
}

export function googleFontsHref(families: readonly string[]): string {
  const unique = [...new Set(families.filter(Boolean))]
  return `https://fonts.googleapis.com/css2?family=${unique.map(googleFontFamilyParam).join("&family=")}&display=swap`
}

export function knownGoogleFont(family: string): boolean {
  return family in WEIGHTS
}
