"use client"

import type { CSSProperties, ElementType, ReactNode } from "react"

import { sectionTitleClassName } from "@/lib/portfolio/directionOverrides"
import type { DesignConfig } from "@/types/designEngine"
import { cn } from "@/lib/utils"

type TextProps = {
  children: ReactNode
  className?: string
}

/** Token-bound class strings for `CanvasText` and other editors. */
export const portfolioTypo = {
  hero: () => cn("de-hero-text de-font-display de-text"),
  sectionHeading: () => cn("de-h1 de-font-display de-section-heading"),
  body: () => cn("de-body de-font-body de-text-muted"),
  bodyForeground: () => cn("de-body de-font-body de-text"),
  label: () =>
    cn("de-font-body text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted,var(--de-muted))]"),
}

const heroInline: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--size-hero)",
  fontWeight: "var(--weight-display)",
  letterSpacing: "var(--tracking-display)",
  lineHeight: "var(--leading-display)",
  color: "var(--color-text, var(--de-fg))",
}

const bodyInline: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--size-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--color-text-muted, var(--de-muted))",
}

/** Static hero title — prefer `portfolioTypo.hero()` + `CanvasText` when editing. */
export function HeroText({ children, className = "" }: TextProps) {
  return (
    <h1 className={cn("de-hero-text de-font-display de-text", className)} style={heroInline}>
      {children}
    </h1>
  )
}

/** Section title from design config (direction + Part 10 modifiers). */
export function SectionTitleFromConfig({
  config,
  children,
  className = "",
  as: Comp = "h2",
}: TextProps & { config: DesignConfig; as?: ElementType }) {
  return <Comp className={cn(sectionTitleClassName(config), className)}>{children}</Comp>
}

export function SectionHeading({ children, className = "" }: TextProps) {
  return (
    <h2 className={cn("de-h1 de-font-display de-section-heading", className)}>
      {children}
    </h2>
  )
}

export function BodyText({ children, className = "" }: TextProps) {
  return (
    <p className={cn("de-body de-font-body de-text-muted", className)} style={bodyInline}>
      {children}
    </p>
  )
}
