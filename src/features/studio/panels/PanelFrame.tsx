import { cn } from "@/lib/utils"

/** Common heading block for each studio tool panel. */
export function PanelFrame({ title, hint, children, className }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 pb-[calc(2.5rem+var(--sheet-hidden,0px))] pt-4 sm:px-5", className)}>
      <h2 data-sheet-title tabIndex={-1} className="text-lg font-bold tracking-[-0.02em] outline-none" style={{ fontFamily: "var(--site-display)" }}>
        {title}
      </h2>
      {hint ? <p className="mt-1 text-sm text-[var(--site-ink-2)]">{hint}</p> : null}
      <div className="mt-4 space-y-6">{children}</div>
    </div>
  )
}

/** A titled group inside a panel, opened by a hairline rule. */
export function PanelGroup({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--site-rule)] pt-4">
      <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}
