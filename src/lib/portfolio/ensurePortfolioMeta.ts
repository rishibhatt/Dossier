import type { PortfolioDocument, PortfolioMeta, PortfolioProfileKind, StructuredResume } from "@/types/dossier"
import {
  inferPortfolioProfileFromDocument,
  inferPortfolioProfileFromStructured,
  isPortfolioProfileKind,
} from "@/lib/ai/inferPortfolioType"
import { getProfession, PROFESSION_GROUPS } from "@/lib/portfolio/professions"

/**
 * Guarantees `portfolioMeta` exists and coerces invalid model values using heuristics.
 */
export function ensurePortfolioMeta(
  document: PortfolioDocument,
  structured?: StructuredResume | null
): PortfolioDocument {
  const inferred = structured
    ? inferPortfolioProfileFromStructured(structured)
    : inferPortfolioProfileFromDocument(document)

  const raw = document.portfolioMeta
  const type: PortfolioProfileKind =
    raw?.type && isPortfolioProfileKind(raw.type) ? raw.type : inferred.type

  const tone = raw?.tone?.trim() || inferred.tone
  const emphasis =
    raw?.emphasis && raw.emphasis.length > 0 ? raw.emphasis : inferred.emphasis

  const portfolioMeta: PortfolioMeta = { type, tone, emphasis }
  const profession = getProfession(raw?.profession)
  if (profession) portfolioMeta.profession = profession.id
  if (raw?.group && PROFESSION_GROUPS.some((g) => g.id === raw.group)) portfolioMeta.group = raw.group
  if (raw?.professionAsk) portfolioMeta.professionAsk = true

  return { ...document, portfolioMeta }
}
