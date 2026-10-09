import type { PortfolioSectionType } from "@/types/dossier"

/**
 * NDJSON events streamed by POST /api/parse-pdf while a portfolio is being built.
 * Contract shared by the server pipeline (producer) and the builder's live-build view (consumer).
 * Every `preview` carries only data already read from the user's own resume: nothing is invented.
 */
export type BuildStage =
  | "stream_started"
  | "pdf_text_extracted"
  | "llm_extract_done"
  | "llm_intent_done"
  | "layout_done"
  | "response_done"

/** What the builder can already show, filled in progressively as stages complete. */
export type BuildPreview = {
  /** From the fast regex pass right after text extraction, then replaced by the AI read. */
  name?: string
  title?: string
  /** Section types found, in the order they will be built. */
  sections?: PortfolioSectionType[]
  /** Counts that make the build feel real ("4 roles, 12 skills"). */
  counts?: Partial<Record<"roles" | "projects" | "skills" | "education" | "highlights", number>>
  /** Chosen look, once layout is done. */
  template?: { id: string; name: string; display: string; bg: string; text: string; accent: string }
  /** Which source produced the content: the AI model or the offline reader fallback. */
  source?: "ai" | "fallback"
}

export type BuildProgressEvent = {
  type: "progress"
  stage: BuildStage
  elapsedMs: number
  preview?: BuildPreview
}

export type BuildHeartbeatEvent = { type: "heartbeat" }

export type BuildStreamEvent = BuildProgressEvent | BuildHeartbeatEvent | { type: "result"; [k: string]: unknown } | { type: "error"; error: string; message?: string }
