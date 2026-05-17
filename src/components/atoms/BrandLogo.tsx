import Link from "next/link"

import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link
      href={ROUTES.home}
      className={cn("typo-h3 text-foreground transition-colors hover:text-primary", className)}
    >
      {messages.common.appName}
    </Link>
  )
}
