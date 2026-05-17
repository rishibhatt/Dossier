import Link from "next/link"
import { ArrowRight, Play, Sparkle } from "lucide-react"

import { cn } from "@/lib/utils"

type MarketingButtonProps = {
  href: string
  children: React.ReactNode
  variant?: "primary" | "secondary" | "purple" | "dark-outline"
  className?: string
}

export function MarketingButton({ href, children, variant = "primary", className }: MarketingButtonProps) {
  const isSecondary = variant === "secondary" || variant === "dark-outline"
  return (
    <Link
      href={href}
      className={cn(
        "mk-focus",
        variant === "primary" && "mk-btn-primary",
        variant === "purple" && "mk-btn-primary mk-btn-purple",
        variant === "secondary" && "mk-btn-secondary",
        variant === "dark-outline" && "mk-btn-dark-outline",
        className
      )}
    >
      {isSecondary ? (
        <span className={cn("mk-play-dot", variant === "dark-outline" && "mk-dark-play")} aria-hidden>
          <Play className="size-3 fill-current" />
        </span>
      ) : null}
      <span>{children}</span>
      {!isSecondary ? <ArrowRight className="size-4" aria-hidden /> : null}
    </Link>
  )
}

export function Eyebrow({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <span className={cn("mk-caption", inverse ? "text-[var(--mk-text-inverse-secondary)]" : "text-[var(--mk-accent)]")}>
      {children}
    </span>
  )
}

export function EyebrowPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="mk-eyebrow-pill">
      <Sparkle className="size-3 text-[var(--mk-accent)]" aria-hidden />
      {children}
    </span>
  )
}

export function LogoMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="mk-brand-mark" aria-hidden>
        <svg className="mk-brand-icon" viewBox="0 0 40 40" role="img">
          <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" />
          <path d="M8.4 20.1 20 25l11.6-4.9" />
          <path d="M8.4 27.3 20 32.2l11.6-4.9" />
        </svg>
      </span>
      <span className="text-[18px] font-extrabold tracking-[-0.03em] text-[var(--mk-text-primary)]">Dossier</span>
    </span>
  )
}
