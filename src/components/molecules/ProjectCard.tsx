import { BodyText } from "@/components/atoms/BodyText"
import { Heading } from "@/components/atoms/Heading"
import { SkillTag } from "@/components/molecules/SkillTag"
import { cn } from "@/lib/utils"

type ProjectCardProps = {
  name: string
  description: string
  tech: string[]
  className?: string
}

export function ProjectCard({ name, description, tech, className }: ProjectCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      <div
        className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-muted via-surface-container-high to-surface-container ring-1 ring-border/60"
        aria-hidden
      />
      <div className="space-y-2">
        <Heading as="h3" className="text-balance">
          {name}
        </Heading>
        <BodyText muted className="line-clamp-3">
          {description}
        </BodyText>
        {tech.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {tech.map((t) => (
              <SkillTag key={t} label={t} className="bg-background/80" />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
