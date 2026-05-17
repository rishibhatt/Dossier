"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type BentoGridProps = {
  children: ReactNode
  className?: string
}

/** Responsive bento shell — pair with cards that use `md:col-span-2` / `md:row-span-2`. */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(140px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6",
        className
      )}
    >
      {children}
    </div>
  )
}
