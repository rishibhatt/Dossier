"use client"

import useEmblaCarousel from "embla-carousel-react"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"
import { cn } from "@/lib/utils"

type ProjectSlide = {
  name: string
  description: string
  tech: string[]
  imageUrl?: string
}

export function ProjectsCarouselScene({ scene }: { scene: Scene }) {
  const items = (scene.props.items as ProjectSlide[]) ?? []
  const autoplay = Boolean(scene.props.autoplay)
  const reduce = useReducedMotion()
  const count = items.length

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: count > 1,
    align: "center",
    skipSnaps: false,
    containScroll: "trimSnaps",
  })
  const [selected, setSelected] = useState(0)
  const [paused, setPaused] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi || !autoplay || reduce || paused) return
    const id = window.setInterval(() => emblaApi.scrollNext(), 5200)
    return () => window.clearInterval(id)
  }, [emblaApi, autoplay, paused, reduce])

  useEffect(() => {
    if (!emblaApi) return
    queueMicrotask(() => emblaApi.reInit())
  }, [emblaApi, count])

  if (!items.length) return null

  return (
    <SceneMotionShell scene={scene} className="bg-gradient-to-b from-transparent via-violet-950/20 to-transparent px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/90"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Selected work
        </motion.h2>
        <p className="mb-8 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">Projects</p>
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden pb-4 pt-2" ref={emblaRef}>
            <div className="flex touch-pan-x items-center">
              {items.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="min-w-0 shrink-0 grow-0 pl-2 pr-2"
                  style={{
                    flex: "0 0 78%",
                    maxWidth: "min(420px, 78%)",
                    transform: selected === i ? "scale(1.04)" : "scale(0.94)",
                    opacity: selected === i ? 1 : 0.55,
                    transition: "transform 0.35s ease, opacity 0.35s ease",
                  }}
                >
                  <div
                    className={cn(
                      "relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl backdrop-blur-md"
                    )}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-violet-900/40 to-cyan-900/30">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-sm text-white/50">No image</div>
                      )}
                    </div>
                    <div className="space-y-2 p-5">
                      <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-zinc-300">{p.description}</p>
                      <p className="text-xs font-medium text-cyan-300/90">{p.tech.join(" · ")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {count > 1 ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 sm:px-4">
              <button
                type="button"
                className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/14 bg-white/90 text-[#101114] shadow-2xl backdrop-blur transition hover:-translate-x-0.5"
                onClick={scrollPrev}
                aria-label="Previous project"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white text-[#101114] shadow-2xl transition hover:translate-x-0.5"
                onClick={scrollNext}
                aria-label="Next project"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </SceneMotionShell>
  )
}
