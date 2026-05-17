"use client"

import { CreativePortfolioComposer } from "@/components/portfolio/composer/CreativePortfolioComposer"
import { PortfolioComposer } from "@/components/portfolio/composer/PortfolioComposer"
import { CanvasModeDock } from "@/components/studio/CanvasModeDock"
import { PortfolioPreviewBackToTop } from "@/components/studio/PortfolioPreviewBackToTop"
import { PreviewToolbar } from "@/components/studio/PreviewToolbar"
import { ScrollProgress } from "@/components/ui/ScrollProgress"
import { cn } from "@/lib/utils"
import { useCreativeModeStore } from "@/store/useCreativeModeStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore } from "@/store/useStudioShellStore"
import { useCallback, useState, type CSSProperties } from "react"

const VIEWPORT_WIDTHS: Record<string, string> = {
  desktop: "min(100%, 1200px)",
  tablet: "768px",
  mobile: "375px",
}

export function LivePreviewFrame() {
  const viewport = useStudioShellStore((s) => s.viewport)
  const zoom = useStudioShellStore((s) => s.zoom)
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const rendererMode = useCreativeModeStore((s) => s.rendererMode)
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    setScrollRoot(node)
  }, [])

  const width = VIEWPORT_WIDTHS[viewport] ?? VIEWPORT_WIDTHS.desktop
  const previewReady =
    document != null && (rendererMode === "creative" || designConfig != null)
  const showClassicChrome = document && designConfig && rendererMode === "classic"

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F5F0]">
      <PreviewToolbar />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
        {showClassicChrome ? <ScrollProgress variant="embedded" scrollRoot={scrollRoot} /> : null}
        {showClassicChrome ? (
          <PortfolioPreviewBackToTop mode="element" scrollRoot={scrollRoot} />
        ) : null}
        {!previewReady ? (
          <p className="m-auto text-sm text-muted-foreground">Loading preview…</p>
        ) : (
          <div
            className={cn(
              "mx-auto flex h-full min-h-0 w-full max-w-full flex-1 flex-col items-stretch",
              rendererMode === "classic" ? "justify-start" : ""
            )}
          >
            <div
              className={cn(
                "relative flex h-full min-h-0 w-full flex-1 flex-col rounded-xl border border-black/[0.10] bg-white shadow-[0_22px_70px_rgba(23,24,31,0.10)] transition-[width] duration-300",
                rendererMode === "creative"
                  ? "overflow-hidden border-white/10 bg-[#070712]"
                  : "overflow-hidden"
              )}
              style={{
                width,
                zoom: zoom / 100,
              } as CSSProperties}
            >
              {rendererMode === "classic" ? (
                <div
                  ref={scrollRef}
                  className="studio-preview-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth"
                >
                  <PortfolioComposer />
                </div>
              ) : (
                <CreativePortfolioComposer />
              )}
              {rendererMode === "classic" ? <CanvasModeDock /> : null}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
