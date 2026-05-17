"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-[var(--de-accent)] via-[var(--de-fg)] to-[var(--de-muted)] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  )
}
