import { BodyText } from "@/components/atoms/BodyText"
import { Heading } from "@/components/atoms/Heading"
import { cn } from "@/lib/utils"

type TimelineItemProps = {
  company: string
  role: string
  duration: string
  description: string
  isLast?: boolean
  className?: string
}

export function TimelineItem({
  company,
  role,
  duration,
  description,
  isLast,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4 sm:gap-6", className)}>
      <div className="flex flex-col items-center">
        <span
          className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-primary bg-background"
          aria-hidden
        />
        {!isLast ? (
          <span
            className="mt-2 w-px grow min-h-[2.5rem] bg-border"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 space-y-2 pb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Heading as="h3" className="text-base sm:text-lg">
            {role}
          </Heading>
          <span className="typo-label-sm shrink-0 text-muted-foreground">{duration}</span>
        </div>
        <p className="text-sm font-medium text-primary sm:text-base">{company}</p>
        <BodyText muted className="whitespace-pre-line">
          {description}
        </BodyText>
      </div>
    </div>
  )
}
