"use client"

import { motion } from "framer-motion"

import { SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

export function StickyStackScene({ scene }: { scene: Scene }) {
  const title = String(scene.props.title ?? "Stack")
  const lines = (scene.props.lines as string[])?.filter(Boolean) ?? []

  return (
    <SceneMotionShell scene={scene} className="py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-10 text-center text-2xl font-semibold text-white">{title}</h2>
        <div className="relative space-y-6">
          {lines.map((line, i) => (
            <motion.article
              key={`${line}-${i}`}
              className="sticky top-24 rounded-2xl border border-white/10 bg-zinc-900/85 p-8 shadow-2xl backdrop-blur-xl"
              style={{ zIndex: 10 + i }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <span className="text-xs font-bold text-violet-300">0{i + 1}</span>
              <p className="mt-3 text-xl font-medium leading-snug text-white sm:text-2xl">{line}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </SceneMotionShell>
  )
}
