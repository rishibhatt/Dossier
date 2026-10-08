import { cn } from "@/lib/utils"

/**
 * Opening of an inner page: a running head (where you are, in specimen data) over an ink rule, then the
 * page title and lead on the 12-column grid. The running head sits across the sheet, never over the h1.
 */
export function PageHead({
  title,
  lead,
  running,
  children,
  className,
}: {
  title: React.ReactNode
  lead?: React.ReactNode
  running: [string, string]
  children?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("site-wrap pt-6 sm:pt-10", className)}>
      <div className="sp-data flex items-center justify-between gap-4 border-b border-[var(--site-ink)] pb-2">
        <span>{running[0]}</span>
        <span className="sp-no">{running[1]}</span>
      </div>
      <div className="grid gap-6 py-10 sm:py-14 lg:grid-cols-12">
        <h1 className="site-h1 lg:col-span-8 lg:text-[clamp(3rem,5vw,4.5rem)]">{title}</h1>
        {lead ? <div className="site-lead self-end lg:col-span-4">{lead}</div> : null}
      </div>
      {children}
    </header>
  )
}

/** A section's running head on the home page: label left, specimen number right, over an ink rule. */
export function RunningHead({ label, no, className }: { label: string; no: string; className?: string }) {
  return (
    <div className={cn("sp-data mb-8 flex items-center justify-between gap-4 border-b border-current pb-2 !text-current sm:mb-10", className)}>
      <span className="opacity-75">{label}</span>
      <span className="sp-no opacity-75">No. {no}</span>
    </div>
  )
}
