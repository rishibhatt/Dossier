import type { ReactNode } from "react"

import type { SocialPlatform } from "@/lib/portfolio/links"

/**
 * Monoline platform glyphs, 24px grid, drawn in currentColor so every theme tints them.
 * Inline SVG only: these render on the server, in the studio and in the ZIP export.
 */
const GLYPHS: Record<SocialPlatform, ReactNode> = {
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17M8 7.25v.01M12 17v-6.5M12 13.6c0-1.8 1.1-3.1 2.7-3.1S17 11.6 17 13.4V17" />
    </>
  ),
  github: (
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2" />
  ),
  x: <path d="M4 4h4.5L20 20h-4.5zM20 4l-6.6 7.4M4 20l6.6-7.4" />,
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  behance: <path d="M2.5 6.5h5a2.75 2.75 0 0 1 0 5.5h-5zM2.5 12h5.75a2.75 2.75 0 0 1 0 5.5H2.5zM14 14h7c0-2-1.5-3.5-3.5-3.5S14 12 14 14s1.5 3.5 3.5 3.5c1.2 0 2.2-.5 2.9-1.4M15 7.5h5" />,
  dribbble: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.6 10.94M21.4 12.84c-6.62-1.41-12.14 1-16.38 6.32M8.56 3c4.37 6 6 9.42 8 17.4" />
    </>
  ),
  youtube: (
    <>
      <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  medium: (
    <>
      <ellipse cx="7.5" cy="12" rx="5" ry="5.5" />
      <ellipse cx="16.5" cy="12" rx="2.25" ry="5" />
      <path d="M21.5 7v10" />
    </>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 2.5a14 14 0 0 0 0 19 14 14 0 0 0 0-19M2.5 12h19" />
    </>
  ),
}

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[platform]}
    </svg>
  )
}
