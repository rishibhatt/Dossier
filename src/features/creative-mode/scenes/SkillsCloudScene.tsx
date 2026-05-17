"use client"

import { motion } from "framer-motion"

import { SceneMotionItem, SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

export function SkillsCloudScene({ scene }: { scene: Scene }) {
  const items = (scene.props.items as string[])?.filter(Boolean) ?? []
  if (!items.length) return null

  const primary = items.slice(0, 8)
  const secondary = items.slice(8, 24)

  return (
    <SceneMotionShell scene={scene} className="relative overflow-hidden border-y border-white/10 bg-zinc-950/45 py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(139,92,246,0.08),transparent_45%,rgba(6,182,212,0.06))]" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-violet-300/90">Skills</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">A practical working set</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-400">
            Organized from the resume so the preview reads like a portfolio section, not a particle cloud.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {primary.map((skill, i) => (
            <SceneMotionItem key={skill} scene={scene}>
              <motion.div
                className="min-h-24 rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-lg backdrop-blur-md"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-base font-semibold leading-snug text-white">{skill}</p>
              </motion.div>
            </SceneMotionItem>
          ))}
        </div>

        {secondary.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {secondary.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-medium text-zinc-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </SceneMotionShell>
  )
}
