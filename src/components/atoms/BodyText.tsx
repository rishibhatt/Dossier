import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type BodyTextProps = {
  as?: "p" | "span"
  size?: "md" | "lg"
  muted?: boolean
  className?: string
  children: ReactNode
}

const sizes = {
  md: "text-sm leading-relaxed sm:text-base sm:leading-relaxed",
  lg: "text-base leading-relaxed sm:text-lg sm:leading-relaxed",
}

export function BodyText({ as: Tag = "p", size = "md", muted, className, children }: BodyTextProps) {
  return (
    <Tag
      className={cn(sizes[size], muted ? "text-muted-foreground" : "text-foreground", className)}
    >
      {children}
    </Tag>
  )
}
