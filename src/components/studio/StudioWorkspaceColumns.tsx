"use client"

import { useCallback } from "react"
import { ChevronLeft, PanelRightOpen } from "lucide-react"

import { LivePreviewFrame } from "@/components/studio/LivePreviewFrame"
import { StudioRightPanel } from "@/components/studio/StudioRightPanel"
import { StudioSidebar } from "@/components/studio/StudioSidebar"
import { Button } from "@/components/ui/button"
import { useStudioShellStore } from "@/store/useStudioShellStore"

function ResizeEdge({ onDelta }: { onDelta: (dx: number) => void }) {
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      let lastX = e.clientX

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - lastX
        lastX = ev.clientX
        onDelta(dx)
      }
      const onUp = () => {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          /* released */
        }
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
      }
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
    },
    [onDelta]
  )

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      onPointerDown={onPointerDown}
      className="w-2 shrink-0 cursor-col-resize bg-black/[0.06] hover:bg-black/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  )
}

export function StudioWorkspaceColumns() {
  const leftW = useStudioShellStore((s) => s.leftPanelWidth)
  const rightW = useStudioShellStore((s) => s.rightPanelWidth)
  const leftCollapsed = useStudioShellStore((s) => s.leftCollapsed)
  const rightCollapsed = useStudioShellStore((s) => s.rightCollapsed)
  const toggleRightCollapsed = useStudioShellStore((s) => s.toggleRightCollapsed)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-[#F7F5F0]">
      <div
        className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-black/[0.08] bg-[#F8F6F1]"
        style={{ width: leftCollapsed ? 56 : leftW }}
      >
        <StudioSidebar />
      </div>
      <ResizeEdge
        onDelta={(dx) => {
          const s = useStudioShellStore.getState()
          s.setLeftPanelWidth(s.leftPanelWidth + dx)
        }}
      />
      <LivePreviewFrame />
      {!rightCollapsed ? (
        <ResizeEdge
          onDelta={(dx) => {
            const s = useStudioShellStore.getState()
            s.setRightPanelWidth(s.rightPanelWidth - dx)
          }}
        />
      ) : null}
      <div
        className="flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-black/[0.08] bg-[#F8F6F1]"
        style={{ width: rightCollapsed ? 44 : rightW }}
      >
        {rightCollapsed ? (
          <div className="flex h-full min-h-0 flex-col items-center border-border bg-black/[0.02] py-3">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-9 shrink-0 rounded-md"
              onClick={() => toggleRightCollapsed()}
              aria-label="Expand design panel"
            >
              <PanelRightOpen className="size-4" />
            </Button>
            <span className="mt-3 hidden max-w-[2.5rem] text-center text-[9px] font-medium uppercase leading-tight text-muted-foreground [writing-mode:vertical-rl] sm:block">
              Design
            </span>
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-end border-b border-black/[0.08] bg-[#F8F6F1] px-1 py-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => useStudioShellStore.getState().setRightCollapsed(true)}
                aria-label="Minimize design panel"
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <StudioRightPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
