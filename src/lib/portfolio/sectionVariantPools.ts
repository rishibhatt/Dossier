import { VARIANT_IDS } from "@/components/portfolio/sections/registry"
import type { PortfolioSectionType } from "@/types/dossier"

/** Variant ids cycled in canvas edit mode, straight from the section registry (exact ids). */
export const SECTION_VARIANT_CYCLE: Record<PortfolioSectionType, readonly string[]> = VARIANT_IDS
