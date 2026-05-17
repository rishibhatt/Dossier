import { create } from "zustand"

import {
  buildDefaultExperienceFromDocument,
  type CreativeExperienceVariant,
} from "@/features/creative-mode/buildDefaultExperience"
import { parseExperiencePrompt } from "@/features/creative-mode/nlp/parseExperiencePrompt"
import type { ExperienceConfig } from "@/features/creative-mode/types/experienceConfig"
import type { PortfolioDocument } from "@/types/dossier"

export type PreviewRendererMode = "classic" | "creative"

type CreativeModeState = {
  rendererMode: PreviewRendererMode
  creativeVariant: CreativeExperienceVariant
  experienceConfig: ExperienceConfig | null
  setRendererMode: (mode: PreviewRendererMode) => void
  /** Sets creative mode + builds experience in one update (avoids empty first paint). */
  enterCreativeMode: (doc: PortfolioDocument) => void
  setCreativeVariant: (doc: PortfolioDocument, variant: CreativeExperienceVariant) => void
  exitCreativeMode: () => void
  hydrateExperienceFromDocument: (doc: PortfolioDocument) => void
  setExperienceConfig: (config: ExperienceConfig | null) => void
  applyExperiencePrompt: (text: string) => void
  resetCreative: () => void
}

export const useCreativeModeStore = create<CreativeModeState>((set, get) => ({
  rendererMode: "classic",
  creativeVariant: "cinematic",
  experienceConfig: null,

  setRendererMode: (rendererMode) => set({ rendererMode }),

  enterCreativeMode: (doc) =>
    set({
      rendererMode: "creative",
      experienceConfig: buildDefaultExperienceFromDocument(doc, get().creativeVariant),
    }),

  setCreativeVariant: (doc, creativeVariant) =>
    set({
      rendererMode: "creative",
      creativeVariant,
      experienceConfig: buildDefaultExperienceFromDocument(doc, creativeVariant),
    }),

  exitCreativeMode: () => set({ rendererMode: "classic" }),

  hydrateExperienceFromDocument: (doc) => {
    set({ experienceConfig: buildDefaultExperienceFromDocument(doc, get().creativeVariant) })
  },

  setExperienceConfig: (experienceConfig) => set({ experienceConfig }),

  applyExperiencePrompt: (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const cur = get().experienceConfig
    if (!cur) return
    set({ experienceConfig: parseExperiencePrompt(trimmed, cur) })
  },

  resetCreative: () =>
    set({
      rendererMode: "classic",
      creativeVariant: "cinematic",
      experienceConfig: null,
    }),
}))
