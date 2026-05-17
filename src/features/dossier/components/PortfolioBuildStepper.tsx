"use client"

import { motion } from "framer-motion"
import { Check, FileCheck2, Palette, WandSparkles, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type BuildVisualStep = 0 | 1 | 2

type PortfolioBuildStepperProps = {
  /** 0 = need file, 1 = configure style, 2 = parsing */
  visualStep: BuildVisualStep
  className?: string
}

const steps: { label: string; Icon: LucideIcon }[] = [
  { label: "Resume", Icon: FileCheck2 },
  { label: "Style", Icon: Palette },
  { label: "Build", Icon: WandSparkles },
]

export function PortfolioBuildStepper({ visualStep, className }: PortfolioBuildStepperProps) {
  const progress = visualStep === 0 ? "12%" : visualStep === 1 ? "50%" : "100%"

  return (
    <div className={cn("relative w-full px-1 pb-1 pt-2", className)} aria-label="Build progress">
      <div className="absolute left-[12%] right-[12%] top-[1.95rem] h-1 overflow-hidden rounded-full bg-black/[0.07]">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,#101114,#31333a,#101114)] shadow-[0_0_22px_rgba(16,17,20,0.26)]"
          initial={false}
          animate={{ width: progress }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 w-24 rounded-full bg-white/45 blur-sm"
          initial={{ x: "-120%" }}
          animate={{ x: ["-120%", "520%"] }}
          transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <ol className="relative z-10 grid grid-cols-3 gap-2 text-center">
        {steps.map(({ label, Icon }, index) => {
          const done = index < visualStep
          const active = index === visualStep
          return (
            <li key={label} className="flex flex-col items-center">
              <motion.span
                className={cn(
                  "relative grid size-12 place-items-center rounded-2xl border shadow-[0_14px_34px_rgba(23,24,31,0.08)] transition-colors",
                  active && "border-[#101114] bg-[#101114] text-white",
                  done && "border-[#101114] bg-white text-[#101114]",
                  !active && !done && "border-black/[0.10] bg-white/82 text-muted-foreground"
                )}
                initial={false}
                animate={{ scale: active ? 1.06 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
              >
                {done ? <Check className="size-5" strokeWidth={2.6} aria-hidden /> : <Icon className="size-5" aria-hidden />}
                {active ? (
                  <motion.span
                    className="absolute size-12 rounded-2xl border border-black/25"
                    initial={{ opacity: 0.4, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.42 }}
                    transition={{ duration: 1.45, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                  />
                ) : null}
              </motion.span>
              <span
                className={cn(
                  "mt-3 text-xs font-semibold",
                  active && "text-foreground",
                  done && "text-foreground/70",
                  !active && !done && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
