"use client"

import { useRef } from "react"

import { usePortfolioMotion } from "@/components/portfolio/motion/usePortfolioMotion"
import { PortfolioPage, type PortfolioPageProps } from "@/components/portfolio/page/PortfolioPage"

/** Read-only portfolio with motion: published page, preview tab, dev QA. SSR-safe (motion runs after hydration). */
export function PortfolioView({ motion = true, ...props }: Omit<PortfolioPageProps, "rootRef" | "T" | "editing" | "wrapSection" | "wrapList"> & { motion?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const c = props.config
  usePortfolioMotion(rootRef, { disabled: !motion, key: `${c.meta.templateId}|${c.meta.variationSeed}|${c.motion.preset}` })
  return <PortfolioPage {...props} rootRef={rootRef} />
}
