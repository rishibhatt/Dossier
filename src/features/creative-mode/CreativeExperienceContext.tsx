"use client"

import { createContext, useContext } from "react"

import type { ExperienceConfig } from "@/features/creative-mode/types/experienceConfig"
import type { PortfolioDocument } from "@/types/dossier"

export type CreativeExperienceContextValue = {
  document: PortfolioDocument
  config: ExperienceConfig
}

export const CreativeExperienceContext = createContext<CreativeExperienceContextValue | null>(null)

export function useCreativeExperience(): CreativeExperienceContextValue {
  const v = useContext(CreativeExperienceContext)
  if (!v) throw new Error("useCreativeExperience must be used inside CreativeExperienceContext.Provider")
  return v
}
