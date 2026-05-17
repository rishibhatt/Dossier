import Image from "next/image"
import Link from "next/link"

import { messages } from "@/config/messages"
import { BRANDING } from "@/lib/constants/branding"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
  priority?: boolean
  /** Compact header/footer lockup. Keep the asset bounded so it never clips in chrome. */
  variant?: "default" | "marketing"
}

export function BrandMark({ className, priority, variant = "default" }: BrandMarkProps) {
  const isMarketing = variant === "marketing"
  const w = BRANDING.logoMaxWidthPx
  const h = BRANDING.logoHeightPx

  const image = (
    <Image
      src={BRANDING.logoSrc}
      alt=""
      width={w}
      height={h}
      priority={priority}
      className={cn(
        "block object-contain object-left transition-opacity hover:opacity-90",
        isMarketing
          ? "h-8 w-auto max-w-[8.75rem] sm:h-9 sm:max-w-[9.5rem]"
          : "h-20 w-auto max-w-[10.5rem] sm:h-[5.5rem] sm:max-w-[13rem] md:h-24 md:max-w-[15rem]"
      )}
      sizes={isMarketing ? "(max-width: 768px) 140px, 152px" : "(max-width: 768px) 168px, 240px"}
    />
  )

  return (
    <Link
      href={ROUTES.home}
      className={cn(
        "flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={messages.common.appName}
    >
      {isMarketing ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="relative flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary text-[0.72rem] font-semibold leading-none text-primary-foreground shadow-sm"
            aria-hidden
          >
            D
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {messages.common.appName}
          </span>
        </span>
      ) : (
        image
      )}
    </Link>
  )
}
