import { PlainText } from "@/components/portfolio/sections/PlainText"
import { renderSectionVariant } from "@/components/portfolio/sections/registry"
import type { TextSlot } from "@/components/portfolio/sections/types"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument, PortfolioSection } from "@/types/dossier"

/**
 * Thin dispatcher kept for older call sites. Section modules live in components/portfolio/sections/<type>;
 * variant ids resolve exactly (plus legacy aliases) in sections/registry.
 */
export function renderComposerSection(
  section: PortfolioSection,
  variant: string,
  designConfig: DesignConfig,
  opts?: { doc?: PortfolioDocument; T?: TextSlot; editing?: boolean }
) {
  const doc = opts?.doc ?? { meta: { title: "", description: "" }, sections: [section] }
  return renderSectionVariant(section, variant, { config: designConfig, doc, T: opts?.T ?? PlainText, editing: opts?.editing ?? false })
}
