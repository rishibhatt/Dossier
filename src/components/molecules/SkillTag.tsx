import { cn } from "@/lib/utils"

type SkillTagProps = {
  label: string
  className?: string
}

export function SkillTag({ label, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground sm:text-sm",
        className
      )}
    >
      {label}
    </span>
  )
}
