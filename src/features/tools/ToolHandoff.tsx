import { UploadSlot } from "@/components/marketing/UploadSlot"
import { cn } from "@/lib/utils"

/** The bridge from a free tool into the builder: a short reason and the working upload slot. */
export function ToolHandoff({ title, body, className }: { title: string; body: string; className?: string }) {
  return (
    <aside className={cn("border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 sm:p-6", className)} aria-label="Next step">
      <p className="site-h3">{title}</p>
      <p className="mt-2 text-[0.9375rem] text-[var(--site-ink-2)]">{body}</p>
      <UploadSlot id="tool-upload" className="mt-5" />
    </aside>
  )
}
