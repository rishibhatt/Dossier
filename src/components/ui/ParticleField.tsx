"use client"

import { cn } from "@/lib/utils"

/** Lightweight decorative particles for portfolio canvas sections. */
export function ParticleField({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className="absolute size-0.5 animate-pulse rounded-full bg-[var(--de-accent)] opacity-50"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 10) * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}
