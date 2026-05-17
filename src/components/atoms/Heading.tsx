import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type HeadingLevel = "h1" | "h2" | "h3"

const styles: Record<HeadingLevel, string> = {
  h1: "font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl",
  h2: "font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
  h3: "font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg",
}

type HeadingProps = {
  as?: HeadingLevel
  id?: string
  className?: string
  children: ReactNode
}

export function Heading({ as = "h2", id, className, children }: HeadingProps) {
  const Tag = as
  return (
    <Tag id={id} className={cn(styles[as], className)}>
      {children}
    </Tag>
  )
}
