"use client"

import { AbstractAiPlaceholder } from "@/components/portfolio/ui/AbstractAiPlaceholder"
import type { ProjectEntry } from "@/types/dossier"
import { cn } from "@/lib/utils"

type ProjectCardArtProps = {
  project: ProjectEntry
  index: number
  className?: string
  imgClassName?: string
}

/** Placeholder art — CSS generative mesh only (no remote image URLs). */
export function ProjectCardArt({ project, index, className, imgClassName }: ProjectCardArtProps) {
  const seed = `${project.name}-${index}-${project.tech.join("-")}`.slice(0, 80)
  return <AbstractAiPlaceholder seed={seed} className={cn(className, imgClassName)} />
}
