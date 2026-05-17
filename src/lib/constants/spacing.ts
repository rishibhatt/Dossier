/**
 * Layout spacing tokens (mirror design baseline — use in TS when layout math is needed).
 * Visual spacing should prefer Tailwind classes mapped from theme.css variables.
 */
export const SPACING_UNIT_PX = 4 as const

export const STACK = {
  xs: SPACING_UNIT_PX * 1,
  sm: SPACING_UNIT_PX * 2,
  md: SPACING_UNIT_PX * 4,
  lg: SPACING_UNIT_PX * 8,
} as const
