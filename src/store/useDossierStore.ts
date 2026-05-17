import { create } from "zustand"

import type { PortfolioDocument, StructuredResume } from "@/types/dossier"

export type DossierParseState = {
  file: File | null
  rawText: string | null
  structuredData: StructuredResume | null
  portfolioData: PortfolioDocument | null
  loading: boolean
  error: string | null
  setFile: (file: File | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFromParseResult: (payload: {
    rawText: string
    structuredData: StructuredResume
    portfolioData: PortfolioDocument
  }) => void
  updatePortfolio: (next: PortfolioDocument) => void
  reset: () => void
}

const initial: Pick<
  DossierParseState,
  "file" | "rawText" | "structuredData" | "portfolioData" | "loading" | "error"
> = {
  file: null,
  rawText: null,
  structuredData: null,
  portfolioData: null,
  loading: false,
  error: null,
}

export const useDossierStore = create<DossierParseState>((set) => ({
  ...initial,
  setFile: (file) => set({ file }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFromParseResult: (payload) =>
    set({
      rawText: payload.rawText,
      structuredData: payload.structuredData,
      portfolioData: payload.portfolioData,
      loading: false,
      error: null,
    }),
  updatePortfolio: (portfolioData) => set({ portfolioData }),
  reset: () => set(initial),
}))
