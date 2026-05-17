import type { PortfolioDocument, PortfolioMeta, PortfolioProfileKind, StructuredResume } from "@/types/dossier"
import {
  inferPortfolioProfileFromDocument,
  inferPortfolioProfileFromStructured,
  isPortfolioProfileKind,
} from "@/lib/ai/inferPortfolioType"

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

  return { ...document, portfolioMeta }
}
