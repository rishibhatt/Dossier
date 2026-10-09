"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"

import { PanelFrame, PanelGroup } from "@/features/studio/panels/PanelFrame"
import { refineDesign } from "@/features/studio/studioActions"
import { useMedia } from "@/features/studio/useViewport"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { DesignConfig } from "@/types/designEngine"

const IDEAS = ["Make it darker", "Warmer colours", "Bigger headline", "Projects before experience", "Cleaner and simpler", "More playful"] as const

/** Plain words for what a refine changed, read from the config before and after. */
function whatChanged(a: DesignConfig, b: DesignConfig): string[] {
  const out: string[] = []
  const ca = a.tokens.colors
  const cb = b.tokens.colors
  if (ca.bg !== cb.bg) out.push(`Background ${cb.bg}`)
  if (ca.accent !== cb.accent) out.push(`Accent ${cb.accent}`)
  if (a.tokens.typography.displayFont !== b.tokens.typography.displayFont) out.push(`Headings in ${b.tokens.typography.displayFont}`)
  if (a.tokens.typography.scale.hero !== b.tokens.typography.scale.hero) out.push("Headline size")
  if (a.layout.sectionOrder.join() !== b.layout.sectionOrder.join()) out.push("Section order")
  if (a.layout.type !== b.layout.type) out.push(`Layout ${b.layout.type}`)
  return out.length ? out : ["Small style changes"]
}

type Entry = { ask: string; changes: string[] }

export function AiPanel() {
  const router = useRouter()
  const ready = usePortfolioStore((s) => Boolean(s.document && s.designConfig))
  const busy = useStudioUiStore((s) => s.busy.ai)
  const fine = useMedia("(pointer: fine)")
  const [text, setText] = useState("")
  const [log, setLog] = useState<Entry[]>([])

  const send = async () => {
    const before = usePortfolioStore.getState().designConfig
    const ask = text.trim()
    if (!ask || !before) return
    if (await refineDesign(router, ask)) {
      const after = usePortfolioStore.getState().designConfig
      setLog((l) => [{ ask, changes: after ? whatChanged(before, after) : [] }, ...l].slice(0, 8))
      setText("")
    }
  }

  return (
    <PanelFrame title="Ask for a change" hint="Say it in plain words. It changes colours, type size, mood and section order, not your text.">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
        className="space-y-3"
      >
        <label htmlFor="studio-ai" className="sr-only">
          Describe the change
        </label>
        <textarea
          id="studio-ai"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void send()
            }
          }}
          disabled={!ready || busy}
          maxLength={2000}
          rows={3}
          placeholder="Try: green and calm, or a bigger headline"
          className="sp-field resize-none"
        />
        <div className="flex flex-wrap gap-1.5" aria-label="Ideas">
          {IDEAS.map((idea) => (
            <button key={idea} type="button" disabled={!ready || busy} onClick={() => setText(idea)} aria-pressed={text === idea} className="sp-chip">
              {idea}
            </button>
          ))}
        </div>
        <button type="submit" disabled={!ready || busy || !text.trim()} className="site-btn site-btn-primary site-btn-sm w-full">
          {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Send className="size-4" aria-hidden />}
          <span className="site-btn-label">{busy ? "Applying" : "Apply change"}</span>
        </button>
        {fine ? <p className="sp-data text-center">Ctrl or Cmd + Enter sends. Ctrl + K opens this.</p> : null}
      </form>

      {log.length ? (
        <PanelGroup title="Done this session" aside={<span className="sp-data">Undo in the top bar</span>}>
          <ol className="ws-rows" aria-live="polite">
            {log.map((e, i) => (
              <li key={i} className="ws-row px-3 py-2.5">
                <p className="text-sm font-semibold">&ldquo;{e.ask}&rdquo;</p>
                <p className="sp-data mt-1">{e.changes.join(" / ")}</p>
              </li>
            ))}
          </ol>
        </PanelGroup>
      ) : null}
    </PanelFrame>
  )
}
