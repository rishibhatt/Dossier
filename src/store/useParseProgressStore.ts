import { create } from "zustand"

import type { BuildPreview, BuildStage } from "@/types/buildStream"

/** Server stages streamed by /api/parse-pdf, in the order they arrive. */
export const PARSE_STAGES = ["stream_started", "pdf_text_extracted", "llm_extract_done", "llm_intent_done", "layout_done", "response_done"] as const

/** The four steps a person sees. Each one is done once its stage has arrived. */
export const BUILD_STEPS = [
  { id: "read", label: "Read PDF", doneAt: 1 },
  { id: "ai", label: "AI read", doneAt: 2 },
  { id: "look", label: "Set look", doneAt: 4 },
  { id: "open", label: "Open", doneAt: 5 },
] as const

/** Steps finished for a stage index. One source for the header bar and the live build. */
export function buildStepsDone(stageIndex: number): number {
  return BUILD_STEPS.filter((s) => stageIndex >= s.doneAt).length
}

/** 0..1, finished steps over all steps. */
export function buildProgress(stageIndex: number): number {
  return buildStepsDone(stageIndex) / BUILD_STEPS.length
}

type ParseProgressState = {
  /** Index of the latest stage seen in PARSE_STAGES, or -1 before the first one. */
  stageIndex: number
  /** Everything the server has shown so far, merged stage by stage. */
  preview: BuildPreview
  /** Server clock of the latest stage. */
  elapsedMs: number
  /** Client clock: when the upload started (ms). */
  startedAt: number | null
  start: () => void
  setStage: (stage: BuildStage | string, elapsedMs?: number, preview?: BuildPreview) => void
  reset: () => void
}

const initial = { stageIndex: -1, preview: {} as BuildPreview, elapsedMs: 0, startedAt: null as number | null }

export const useParseProgressStore = create<ParseProgressState>((set) => ({
  ...initial,
  start: () => set({ ...initial, startedAt: Date.now() }),
  setStage: (stage, elapsedMs, preview) =>
    set((s) => {
      const i = PARSE_STAGES.indexOf(stage as (typeof PARSE_STAGES)[number])
      const merged = preview ? { ...s.preview, ...preview, counts: { ...s.preview.counts, ...preview.counts } } : s.preview
      return {
        stageIndex: Math.max(i, s.stageIndex),
        preview: merged,
        elapsedMs: typeof elapsedMs === "number" ? Math.max(elapsedMs, s.elapsedMs) : s.elapsedMs,
      }
    }),
  reset: () => set(initial),
}))
