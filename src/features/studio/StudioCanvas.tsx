"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { PortfolioComposer } from "@/components/portfolio/composer/PortfolioComposer"
import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { openUpgrade } from "@/features/billing/useUpgrade"
import { sectionIdAt, setCanvasRoot } from "@/features/studio/canvasDom"
import { SectionToolbar } from "@/features/studio/SectionToolbar"
import { persistNow } from "@/features/studio/studioActions"
import { useStudioLayout } from "@/features/studio/useViewport"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore, type StudioViewport } from "@/store/useStudioShellStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

/** True widths the page is drawn at on desktop. The frame then scales to fit, so every size shows its real layout. */
const FRAME: Record<StudioViewport, { w: number; name: string }> = {
  desktop: { w: 1280, name: "Desktop" },
  tablet: { w: 768, name: "Tablet" },
  mobile: { w: 390, name: "Phone" },
}
const CAPTION = 28

function useBox(el: HTMLElement | null) {
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return box
}

/**
 * The live page. Phones and tablets: it fills the space edge to edge. Desktop: it sits in a proof frame
 * drawn at a true device width and scaled to the space, never overflowing. Tap a section to select it.
 */
export function StudioCanvas() {
  const layout = useStudioLayout()
  const viewport = useStudioShellStore((s) => s.viewport)
  const ready = usePortfolioStore((s) => Boolean(s.document && s.designConfig))
  const select = useStudioUiStore((s) => s.select)
  const { summary } = useAccountSummary()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [area, setArea] = useState<HTMLDivElement | null>(null)
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const { w, h } = useBox(area)
  const hostRef = useCallback((n: HTMLElement | null) => {
    setHost(n)
    setCanvasRoot(n)
  }, [])

  // The studio never uses the old hover edit mode.
  useEffect(() => usePortfolioStore.getState().setEditMode(false), [])

  const onCredit = () => openUpgrade("remove_badge", { plan: "free", beforeLeave: persistNow })

  const framed = layout === "desktop"
  const f = FRAME[viewport] ?? FRAME.desktop
  const frameW = framed ? f.w : w
  const scale = framed && w ? Math.min(1, w / f.w) : 1
  const frameH = framed ? Math.max(0, (h - CAPTION) / scale) : h

  const onTap = (e: React.MouseEvent) => {
    // Links in the preview do not navigate inside the studio; use Preview for that.
    if ((e.target as HTMLElement).closest("a")) e.preventDefault()
    if ((e.target as HTMLElement).closest("[data-dossier-credit]")) return
    select(sectionIdAt(host, e.target))
  }

  return (
    <main ref={hostRef} aria-label="Live preview" className="studio-canvas relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--site-paper-deep)]">
      <div ref={setArea} className={framed ? "absolute inset-x-6 bottom-6 top-4" : "absolute inset-0"}>
        {!ready ? (
          <p className="flex h-full items-center justify-center gap-3 text-sm text-[var(--site-ink-2)]" role="status">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            Loading your page
          </p>
        ) : (
          <>
            {framed ? (
              <p className="sp-data flex h-7 items-center justify-between" style={{ width: f.w * scale, marginInline: "auto" }}>
                <span>
                  {f.name} {f.w}px
                </span>
                <span>{Math.round(scale * 100)}%</span>
              </p>
            ) : null}
            <div
              className={framed ? "ws-frame" : "h-full"}
              style={framed ? { width: frameW, height: frameH, transform: `scale(${scale})`, marginLeft: (w - f.w * scale) / 2 } : undefined}
            >
              <div ref={setScroller} data-canvas-scroll onClickCapture={onTap} className="studio-preview-scroll h-full overflow-y-auto overflow-x-hidden overscroll-contain [container-type:inline-size]">
                <PortfolioComposer credit={summary.plan === "free" ? "free" : "none"} onCreditClick={summary.plan === "free" ? onCredit : undefined} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 [&>*]:pointer-events-auto">
        <SectionToolbar host={host} scroller={scroller} />
      </div>
    </main>
  )
}
