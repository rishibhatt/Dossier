"use client"

import { useEffect } from "react"

import "@/styles/build-flow.css"
import { ParsingLoader } from "@/features/dossier/components/ParsingLoader"
import { useParseProgressStore } from "@/store/useParseProgressStore"
import type { BuildPreview, BuildStage } from "@/types/buildStream"

/** Dev-only: replays the build stream with sample previews, so the live build can be checked without a PDF. */
const SCRIPT: [number, BuildStage, BuildPreview][] = [
  [300, "stream_started", {}],
  [1500, "pdf_text_extracted", { name: "Maya Lindqvist", title: "Programme Lead", sections: ["hero", "about", "experience", "projects", "skills", "education", "contact"], counts: { roles: 4, projects: 3, skills: 12, education: 2 } }],
  [5000, "llm_extract_done", { title: "Programme Lead, public sector delivery", counts: { roles: 4, projects: 3, skills: 14, education: 2 }, source: "ai" }],
  [7000, "layout_done", { template: { id: "ledger", name: "Ledger", display: "IBM Plex Serif", bg: "#f6f1e7", text: "#1c1a17", accent: "#9a3412" } }],
  [8500, "response_done", {}],
]

export default function DevBuildPage() {
  useEffect(() => {
    const s = useParseProgressStore.getState()
    s.start()
    const timers = SCRIPT.map(([at, stage, preview]) => window.setTimeout(() => useParseProgressStore.getState().setStage(stage, at, preview), at))
    return () => timers.forEach(clearTimeout)
  }, [])
  if (process.env.NODE_ENV === "production") return null
  return (
    <main className="workspace-redesign site">
      <div className="bf-root">
        <div className="bf-main">
          <div className="bf-step site-wrap max-w-3xl py-3 sm:py-6">
            <ParsingLoader onCancel={() => location.reload()} />
          </div>
        </div>
      </div>
    </main>
  )
}
