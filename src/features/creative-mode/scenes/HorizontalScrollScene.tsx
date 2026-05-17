"use client"

import { SceneMotionItem, SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

type ExpItem = { role: string; company: string; duration: string; blurb: string }

export function HorizontalScrollScene({ scene }: { scene: Scene }) {
  const title = String(scene.props.title ?? "Experience")
  const items = (scene.props.items as ExpItem[]) ?? []

  if (!items.length) return null

  return (
    <SceneMotionShell scene={scene} className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Experience</p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-400">
            Resume roles are shown as steady cards so the studio preview stays readable at every viewport size.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((it, i) => (
            <SceneMotionItem key={`${it.company}-${i}`} scene={scene}>
              <article className="h-full rounded-xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-300/90">{it.duration}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-white">{it.role}</h3>
                <p className="mt-1 text-sm font-medium text-cyan-200/80">{it.company}</p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">{it.blurb}</p>
              </article>
            </SceneMotionItem>
          ))}
        </div>
      </div>
    </SceneMotionShell>
  )
}
