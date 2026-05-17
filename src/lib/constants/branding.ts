/**
 * Brand assets — paths are relative to `public/`.
 */
export const BRANDING = {
  logoSrc: "/dossier.svg",
  /** Display height in px; width scales to preserve aspect ratio */
  logoHeightPx: 96,
  logoMaxWidthPx: 240,
  /** Intrinsic size for `next/image` on marketing chrome (display clipped in `BrandMark`). */
  logoMarketingScale: 1.35,
} as const
