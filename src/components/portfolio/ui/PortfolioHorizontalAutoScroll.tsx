"use client"

import { useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type PortfolioHorizontalAutoScrollProps = {
  children: ReactNode
  className?: string
  /** Auto-advance interval in ms (disabled when reduced motion is preferred). */
  intervalMs?: number
}

/**
 * Horizontal snap strip with optional auto-advance — use for projects / experience carousels.
 */
export function PortfolioHorizontalAutoScroll({
  children,
  className,
  intervalMs = 5200,
}: PortfolioHorizontalAutoScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || paused) return
    const el = ref.current
    if (!el) return
    const id = window.setInterval(() => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 4) return
      const step = Math.min(el.clientWidth * 0.65, max)
      const next = el.scrollLeft + step
      if (next >= max - 2) el.scrollTo({ left: 0, behavior: "smooth" })
      else el.scrollBy({ left: step, behavior: "smooth" })
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [paused, intervalMs, reduceMotion])

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={ref}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 [&>*]:min-w-[min(85vw,22rem)] [&>*]:max-w-md [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:min-w-[20rem] [&::-webkit-scrollbar]:hidden",
          className
        )}
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
        <button
          type="button"
          className="pointer-events-auto grid size-10 place-items-center rounded-full border border-black/10 bg-white/90 text-[#101114] shadow-[0_14px_34px_rgba(23,24,31,0.16)] backdrop-blur"
          onClick={() => ref.current?.scrollBy({ left: -Math.min(ref.current.clientWidth * 0.7, 420), behavior: "smooth" })}
          aria-label="Previous items"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-[#101114] text-white shadow-[0_14px_34px_rgba(8,10,15,0.2)]"
          onClick={() => ref.current?.scrollBy({ left: Math.min(ref.current.clientWidth * 0.7, 420), behavior: "smooth" })}
          aria-label="Next items"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
