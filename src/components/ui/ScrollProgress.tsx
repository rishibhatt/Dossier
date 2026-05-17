"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type ScrollProgressProps = {
  className?: string
  /**
   * When set, progress tracks this element’s scroll (embedded studio preview).
   * When omitted, uses `document.scrollingElement` (full-page / standalone).
   */
  scrollRoot?: HTMLElement | null
  /** `fixed` for window scroll; `sticky` sits at top of a scroll container. */
  variant?: "window" | "embedded"
}

/** Top-of-viewport reading progress for long portfolio surfaces. */
export function ScrollProgress({ className, scrollRoot, variant = "window" }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el =
      scrollRoot ?? (typeof document !== "undefined" ? (document.scrollingElement ?? document.documentElement) : null)
    if (!el) return

    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? el.scrollTop / max : 0)
    }

    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScroll) : null
    ro?.observe(el)

    return () => {
      el.removeEventListener("scroll", onScroll)
      ro?.disconnect()
    }
  }, [scrollRoot])

  const bar = (
    <div
      className={cn(
        "h-0.5 w-full bg-[var(--de-border)]",
        variant === "embedded" ? "relative" : "pointer-events-none fixed inset-x-0 top-0 z-[60]"
      )}
      aria-hidden
    >
      <div
        className="h-full origin-left bg-[var(--de-accent)] transition-[transform] duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )

  if (variant === "embedded") {
    return (
      <div className={cn("sticky top-0 z-30", className)} aria-hidden>
        {bar}
      </div>
    )
  }

  return <div className={className}>{bar}</div>
}
