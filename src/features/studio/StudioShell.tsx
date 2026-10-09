"use client"

import { useEffect } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { UpgradeSheet } from "@/features/billing/UpgradeSheet"
import { ActionBar } from "@/features/studio/ActionBar"
import { BottomSheet } from "@/features/studio/BottomSheet"
import { PublishDialog } from "@/features/studio/PublishDialog"
import { StudioCanvas } from "@/features/studio/StudioCanvas"
import { StudioTopBar } from "@/features/studio/StudioTopBar"
import { ToolPanelBodies, ToolTabs } from "@/features/studio/ToolPanels"
import { useStudioLayout } from "@/features/studio/useViewport"
import { useStudioUiStore } from "@/store/useStudioUiStore"

/** Ctrl or Cmd + K opens Ask; Esc clears the canvas selection. */
function useStudioKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useStudioUiStore.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        ui.openTool("ai")
        window.setTimeout(() => document.getElementById("studio-ai")?.focus(), 80)
      } else if (e.key === "Escape" && ui.selectedId && ui.snap !== "full") ui.select(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
}

/** Tablet and desktop: a docked tool column beside the canvas, tucked away with one button. */
function SidePanel({ onStartOver }: { onStartOver: () => void }) {
  const setPanelOpen = useStudioUiStore((s) => s.setPanelOpen)
  return (
    <aside aria-label="Tools" className="ws-side">
      <ToolTabs
        trailing={
          <button type="button" onClick={() => setPanelOpen(false)} aria-label="Hide tools" title="Hide tools" className="ws-icon-btn self-center">
            <PanelLeftClose className="size-4" aria-hidden />
          </button>
        }
      />
      <ToolPanelBodies onStartOver={onStartOver} />
    </aside>
  )
}

/**
 * Phone: the canvas owns the screen, tools live in a bottom sheet over it, and the action bar stays below.
 * Tablet: canvas plus a 20rem side panel. Desktop: a 23rem panel and a scaled device frame.
 */
export function StudioShell({ onStartOver }: { onStartOver: () => void }) {
  const layout = useStudioLayout()
  const panelOpen = useStudioUiStore((s) => s.panelOpen)
  const setPanelOpen = useStudioUiStore((s) => s.setPanelOpen)
  const snap = useStudioUiStore((s) => s.snap)
  const setSnap = useStudioUiStore((s) => s.setSnap)
  useStudioKeys()
  const phone = layout === "phone"

  return (
    <div className="ws-shell">
      <StudioTopBar />
      <div className="relative flex min-h-0 flex-1">
        {!phone && panelOpen ? <SidePanel onStartOver={onStartOver} /> : null}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <StudioCanvas />
          {!phone && !panelOpen ? (
            <button type="button" onClick={() => setPanelOpen(true)} className="site-btn site-btn-primary site-btn-sm absolute left-4 top-4 z-30">
              <PanelLeftOpen className="size-4" aria-hidden />
              <span className="site-btn-label">Tools</span>
            </button>
          ) : null}
          {phone ? (
            <BottomSheet snap={snap} onSnap={setSnap} label="Studio tools" header={<ToolTabs />}>
              <ToolPanelBodies onStartOver={onStartOver} className="h-full" />
            </BottomSheet>
          ) : null}
        </div>
      </div>
      {phone ? <ActionBar /> : null}
      <PublishDialog />
      <UpgradeSheet />
    </div>
  )
}
