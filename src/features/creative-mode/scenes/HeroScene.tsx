"use client"

import { motion } from "framer-motion"

import { SceneMotionItem, SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

type HeroVariant = "centered" | "split" | "overlay"

export function HeroScene({ scene }: { scene: Scene }) {
  const variant = (scene.props.variant as HeroVariant) ?? "split"
  const name = String(scene.props.name ?? "")
  const title = String(scene.props.title ?? "")
  const tagline = String(scene.props.tagline ?? "")
  const imageUrl = typeof scene.props.imageUrl === "string" ? scene.props.imageUrl.trim() : ""

  const letters = (s: string) => s.split("")

  return (
    <SceneMotionShell scene={scene} className="relative min-h-[min(100dvh,920px)] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.35), transparent), radial-gradient(circle at 100% 100%, rgba(6,182,212,0.2), transparent 45%), linear-gradient(180deg, #070712 0%, #0c0f1a 55%, #070712 100%)",
        }}
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex h-full min-h-[inherit] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8 md:px-10">
        {variant === "centered" && (
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/80"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.p>
            <h1 className="text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
              {letters(name).map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.45 }}
                  className="inline-block"
                >
                  {ch === " " ? "\u00a0" : ch}
                </motion.span>
              ))}
            </h1>
            <SceneMotionItem scene={scene} className="mt-8 text-base text-zinc-300 sm:text-lg">
              <p>{tagline}</p>
            </SceneMotionItem>
          </div>
        )}

        {variant === "split" && (
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <motion.p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {title}
              </motion.p>
              <h1 className="text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-tight tracking-tight text-white">{name}</h1>
              <SceneMotionItem scene={scene} className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                <p>{tagline}</p>
              </SceneMotionItem>
            </div>
            <div className="relative aspect-[4/5] max-h-[min(72vh,520px)] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/30 to-cyan-500/20 shadow-2xl shadow-violet-950/50 backdrop-blur-md">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="size-full object-cover opacity-90" />
              ) : (
                <div className="flex size-full items-center justify-center p-6 text-center text-sm text-white/70">
                  Visual layer — add a portrait in classic mode to flow here.
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
            </div>
          </div>
        )}

        {variant === "overlay" && (
          <div className="relative mx-auto max-w-4xl rounded-3xl border border-white/10 bg-black/35 p-10 text-center shadow-2xl backdrop-blur-xl sm:p-14">
            <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white">{name}</h1>
            <p className="mt-2 text-sm font-medium text-violet-200">{title}</p>
            <SceneMotionItem scene={scene} className="mt-6 text-zinc-200">
              <p>{tagline}</p>
            </SceneMotionItem>
          </div>
        )}
      </div>
    </SceneMotionShell>
  )
}
