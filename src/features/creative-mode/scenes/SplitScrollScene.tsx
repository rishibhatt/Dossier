"use client"

import { motion } from "framer-motion"

import { SceneMotionShell } from "@/features/creative-mode/SceneMotionShell"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

export function SplitScrollScene({ scene }: { scene: Scene }) {
  const headline = String(scene.props.headline ?? "Connect")
  const email = String(scene.props.email ?? "")
  const links = (scene.props.links as string[])?.filter(Boolean) ?? []

  return (
    <SceneMotionShell scene={scene} className="py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-2 md:gap-14 md:px-6">
        <div className="md:sticky md:top-28">
          <motion.h2
            className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-white"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {headline}
          </motion.h2>
          <p className="mt-4 text-sm text-zinc-400">Scroll the column — split narrative layout.</p>
        </div>
        <div className="space-y-4">
          {email ? (
            <motion.a
              href={`mailto:${email}`}
              className="block rounded-xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur-md transition hover:border-violet-400/50"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs uppercase tracking-widest text-zinc-400">Email</span>
              <p className="mt-2 font-medium">{email}</p>
            </motion.a>
          ) : null}
          {links.map((link, i) => (
            <motion.a
              key={`${link}-${i}`}
              href={link.startsWith("http") ? link : `https://${link}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-white/10 bg-gradient-to-br from-violet-950/40 to-zinc-950/60 p-5 text-sm text-zinc-100 backdrop-blur-md transition hover:border-cyan-400/40"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              {link}
            </motion.a>
          ))}
        </div>
      </div>
    </SceneMotionShell>
  )
}
