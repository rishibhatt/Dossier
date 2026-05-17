"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Children, useCallback, useEffect, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type PortfolioEmblaCarouselProps = {
  children: ReactNode
  className?: string
  /** Auto-advance interval in ms; disabled when reduced motion is preferred. */
  intervalMs?: number
}

/**
 * Touch-friendly carousel with drag, snap, and optional auto-advance.
 * Replaces scroll-based strips where parent overflow would block programmatic scroll.
 */
export function PortfolioEmblaCarousel({ children, className, intervalMs = 5200 }: PortfolioEmblaCarouselProps) {
  const slideCount = Children.count(children)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slideCount > 1,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    skipSnaps: false,
  })
  const reduceMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || reduceMotion || paused) return
    const id = window.setInterval(() => scrollNext(), intervalMs)
    return () => window.clearInterval(id)
  }, [emblaApi, intervalMs, paused, reduceMotion, scrollNext])

  useEffect(() => {
    if (!emblaApi) return
    queueMicrotask(() => emblaApi.reInit())
  }, [emblaApi, slideCount])

  return (
    <div className={cn("relative", className)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden pb-1" ref={emblaRef}>
        <div className="flex touch-pan-x items-stretch gap-4 sm:gap-6">{children}</div>
      </div>
      {slideCount > 1 ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
          <button
            type="button"
            className="pointer-events-auto grid size-10 place-items-center rounded-full border border-black/10 bg-white/90 text-[#101114] shadow-[0_14px_34px_rgba(23,24,31,0.16)] backdrop-blur transition hover:-translate-x-0.5"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className="pointer-events-auto grid size-10 place-items-center rounded-full bg-[#101114] text-white shadow-[0_14px_34px_rgba(8,10,15,0.2)] transition hover:translate-x-0.5"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function PortfolioEmblaSlide({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-[min(88vw,22rem)] sm:basis-[20rem]",
        "[&>*]:h-full",
        className
      )}
    >
      {children}
    </div>
  )
}
