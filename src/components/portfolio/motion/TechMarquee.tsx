"use client"

type Props = {
  items: string[]
  /** Seconds for one full loop. */
  durationSec?: number
}

/**
 * Infinite horizontal marquee — token-aware, no hard-coded brand strings.
 */
export function TechMarquee({ items, durationSec = 28 }: Props) {
  const clean = items.map((s) => s.trim()).filter(Boolean)
  const line = clean.length ? clean.join(" · ") : "Design · Engineering · Systems"
  const style = { "--de-marquee-duration": `${durationSec}s` } as React.CSSProperties

  return (
    <div
      className="relative overflow-hidden border-y border-[var(--color-border,var(--de-border))] bg-[color-mix(in_oklab,var(--color-surface,var(--de-elevated))_92%,transparent)] py-3"
      style={style}
    >
      <div className="de-marquee-inner flex w-max">
        <span className="de-font-body shrink-0 px-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted,var(--de-muted))]">
          {line}
        </span>
        <span className="de-font-body shrink-0 px-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted,var(--de-muted))]">
          {line}
        </span>
      </div>
    </div>
  )
}
