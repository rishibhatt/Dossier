"use client"

import { useReducedMotion } from "framer-motion"

import { SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

function Row({ items, reverse, speed }: { items: string[]; reverse: boolean; speed: number }) {
  const reduce = useReducedMotion()
  const line = items.length ? items : ["Skills"]
  const dur = `${Math.max(16, 40 / speed)}s`

  const inner = (
    <div className="flex shrink-0 gap-3 pr-10">
      {line.map((t, i) => (
        <span
          key={`chip-${i}-${t}`}
          className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-100 shadow-sm backdrop-blur-md sm:text-sm"
        >
          {t}
        </span>
      ))}
    </div>
  )

  if (reduce) {
    return (
      <div className="flex flex-wrap justify-center gap-2 py-2">
        {line.map((t, i) => (
          <span key={i} className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-200">
            {t}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="creative-marquee-group group relative overflow-hidden py-2">
      <div
        className="creative-marquee-row flex w-max"
        style={
          {
            "--creative-marquee-dur": dur,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {inner}
        {inner}
      </div>
    </div>
  )
}

export function MarqueeScene({ scene }: { scene: Scene }) {
  const items = (scene.props.items as string[])?.filter(Boolean) ?? []
  const rows = Math.min(4, Math.max(1, Number(scene.props.rows) || 2))
  const speed = typeof scene.props.speed === "number" ? scene.props.speed : 1

  if (!items.length) return null

  return (
    <SceneMotionShell scene={scene} className="relative border-y border-white/10 bg-black/25 py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#070712] to-transparent sm:w-24" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#070712] to-transparent sm:w-24" aria-hidden />
      <div className="space-y-1">
        {Array.from({ length: rows }, (_, row) => {
          const shifted = items.map((_, i) => items[(i + row * 2) % items.length])
          return <Row key={row} items={shifted} reverse={row % 2 === 1} speed={speed} />
        })}
      </div>
    </SceneMotionShell>
  )
}
