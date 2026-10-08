import { create } from "zustand"

import type { PortfolioDocument, StructuredResume } from "@/types/dossier"

export type DossierParseState = {
  file: File | null
  structuredData: StructuredResume | null
  portfolioData: PortfolioDocument | null
  /** Who read the resume: the AI model, or the offline reader when the AI was unavailable. */
  source: "ai" | "fallback" | null
  loading: boolean
  error: string | null
  setFile: (file: File | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFromParseResult: (payload: { structuredData: StructuredResume; portfolioData: PortfolioDocument; source?: "ai" | "fallback" }) => void
  updatePortfolio: (next: PortfolioDocument) => void
  reset: () => void
}

const initial: Pick<DossierParseState, "file" | "structuredData" | "portfolioData" | "source" | "loading" | "error"> = {
  file: null,
  structuredData: null,
  portfolioData: null,
  source: null,
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
      structuredData: payload.structuredData,
      portfolioData: payload.portfolioData,
      source: payload.source ?? null,
      loading: false,
      error: null,
    }),
  updatePortfolio: (portfolioData) => set({ portfolioData }),
  reset: () => set(initial),
}))
