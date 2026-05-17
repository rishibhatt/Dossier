"use client"

import { motion } from "framer-motion"

import { SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

export function TextRevealScene({ scene }: { scene: Scene }) {
  const text = String(scene.props.text ?? "")
  const label = String(scene.props.label ?? "")
  const lines = text.split(/\n+/).filter(Boolean)

  return (
    <SceneMotionShell scene={scene} className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {label ? (
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300/90">{label}</p>
        ) : null}
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.p
                className="text-lg leading-relaxed text-zinc-100 sm:text-xl"
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </SceneMotionShell>
  )
}
