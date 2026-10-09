"use client"

import { useRouter } from "next/navigation"
import { Globe, Layers, Loader2, Palette, Plus } from "lucide-react"

import { publish } from "@/features/studio/studioActions"
import { useStudioUiStore, type StudioPanelId } from "@/store/useStudioUiStore"

const TOOLS: { id: StudioPanelId; label: string; Icon: typeof Layers }[] = [
  { id: "content", label: "Edit", Icon: Layers },
  { id: "design", label: "Design", Icon: Palette },
  { id: "add", label: "Add", Icon: Plus },
]

/**
 * Phone action bar. Always on screen under the sheet, 56px cells, safe-area aware.
 * Tapping the open tool again closes the sheet. Publish is the one ink cell.
 */
export function ActionBar() {
  const router = useRouter()
  const panel = useStudioUiStore((s) => s.panel)
  const snap = useStudioUiStore((s) => s.snap)
  const openTool = useStudioUiStore((s) => s.openTool)
  const setSnap = useStudioUiStore((s) => s.setSnap)
  const publishing = useStudioUiStore((s) => s.busy.publish)
  const published = useStudioUiStore((s) => s.publishedPath)
  const open = snap !== "closed"

  return (
    <nav aria-label="Studio actions" className="ws-actionbar">
      {TOOLS.map(({ id, label, Icon }) => {
        const on = open && panel === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => (on ? setSnap("closed") : openTool(id, id === "add" ? "full" : undefined))}
          >
            <Icon className="size-[1.125rem]" aria-hidden />
            <span>{label}</span>
          </button>
        )
      })}
      <button type="button" className="ws-actionbar-ink" disabled={publishing} onClick={() => void publish(router)}>
        {publishing ? <Loader2 className="size-[1.125rem] animate-spin motion-reduce:animate-none" aria-hidden /> : <Globe className="size-[1.125rem]" aria-hidden />}
        <span>{published ? "Update" : "Publish"}</span>
      </button>
    </nav>
  )
}
