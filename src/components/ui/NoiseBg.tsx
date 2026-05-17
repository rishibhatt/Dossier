"use client"

import { useId } from "react"

import { cn } from "@/lib/utils"

type NoiseBgProps = {
  className?: string
  /** Film grain — keep ≤ 0.03 so it never competes with content (default 0.025). */
  opacity?: number
}

/** Ultra-subtle SVG noise — supporting layer only. */
export function NoiseBg({ className, opacity = 0.025 }: NoiseBgProps) {
  const uid = useId().replace(/:/g, "")
  const filterId = `de-noise-${uid}`
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{ opacity }}
      aria-hidden
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  )
}
