"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

type ParsingLoaderProps = {
  className?: string
}

export function ParsingLoader({ className }: ParsingLoaderProps) {
  const copy = messages.dossier
  const steps = [
    "Reading your resume",
    "Structuring projects & experience",
    "Generating design direction",
    "Balancing typography & spacing",
    "Preparing studio preview",
  ] as const
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const timers = [500, 1050, 1600, 2250].map((delay, index) => window.setTimeout(() => setStepIndex(index + 1), delay))
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <div
      className={cn(
        "relative grid min-h-[32rem] overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_22px_70px_rgba(23,24,31,0.08)] sm:p-8 lg:grid-cols-[1fr_0.92fr] lg:items-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_42%,rgba(16,17,20,0.08),transparent_34%)]" />
      <motion.div
        className="pointer-events-none absolute left-[24%] top-[42%] h-56 w-56 rounded-full border border-black/10"
        animate={{ scale: [0.88, 1.16, 0.88], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative hidden min-h-[25rem] items-center justify-center lg:flex">
        <div className="absolute left-16 top-16 rounded-xl bg-white/82 px-4 py-2 text-xs font-semibold text-foreground shadow-[0_14px_38px_rgba(23,24,31,0.10)] ring-1 ring-black/5">
          Skills
        </div>
        <div className="absolute left-10 top-36 rounded-xl bg-white/82 px-4 py-2 text-xs font-semibold text-foreground shadow-[0_14px_38px_rgba(23,24,31,0.10)] ring-1 ring-black/5">
          Experience
        </div>
        <div className="absolute left-20 top-56 rounded-xl bg-white/82 px-4 py-2 text-xs font-semibold text-foreground shadow-[0_14px_38px_rgba(23,24,31,0.10)] ring-1 ring-black/5">
          Projects
        </div>
        <motion.div
          className="relative rotate-6 rounded-3xl bg-white/80 p-7 shadow-[0_28px_90px_rgba(23,24,31,0.14)] ring-1 ring-black/5"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <div className="h-64 w-48 rounded-2xl bg-[#FBFAF7] p-6">
            <span className="block h-2 w-24 rounded-full bg-black/10" />
            <span className="mt-5 block h-2 w-32 rounded-full bg-black/8" />
            <span className="mt-4 block h-2 w-28 rounded-full bg-black/8" />
            <span className="mt-4 block h-2 w-36 rounded-full bg-black/8" />
            <span className="mt-4 block h-2 w-20 rounded-full bg-black/8" />
          </div>
          <span className="absolute right-[-1rem] top-24 rounded-lg bg-[#101114] px-3 py-2 text-xs font-extrabold text-white shadow-[0_18px_40px_rgba(8,10,15,0.24)]">
            PDF
          </span>
        </motion.div>
      </div>

      <div className="relative mx-auto w-full max-w-md py-6 text-left">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground/55">Building your portfolio</p>
        <h2 className="workspace-serif mt-4 text-[clamp(2.35rem,5vw,3.75rem)] leading-[0.96] text-foreground">
          We&apos;re shaping your portfolio.
        </h2>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">{copy.parsingSub}</p>

        <ol className="mt-7 space-y-3">
          {steps.map((label, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            return (
              <motion.li
                key={label}
                layout
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
                  active ? "border-black/10 bg-black/[0.035] text-foreground" : "border-transparent text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border",
                    done && "border-[#101114] bg-[#101114] text-white",
                    active && "border-black/20 bg-white text-[#101114]",
                    !done && !active && "border-black/10 bg-white text-muted-foreground"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.span key="check" initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                        <Check className="size-4" aria-hidden />
                      </motion.span>
                    ) : active ? (
                      <motion.span key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      </motion.span>
                    ) : (
                      <span key="idle" className="size-2 rounded-full bg-current opacity-35" />
                    )}
                  </AnimatePresence>
                </span>
                <span className={cn(active && "font-semibold")}>{label}</span>
              </motion.li>
            )
          })}
        </ol>

        <div className="mt-10 flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#101114,#31333A,#101114)] shadow-[0_0_18px_rgba(16,17,20,0.24)]"
              animate={{ width: `${Math.max(18, ((stepIndex + 1) / steps.length) * 100)}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="w-10 text-right text-xs font-semibold text-muted-foreground">
            {Math.round(((stepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
