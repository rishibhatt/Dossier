"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"

import { messages } from "@/config/messages"
import { marketingNav } from "@/config/navigation"
import { cn } from "@/lib/utils"

function hashFromHref(href: string) {
  const i = href.indexOf("#")
  return i === -1 ? "" : href.slice(i)
}

function subscribeHash(onChange: () => void) {
  const notify = () => onChange()
  window.addEventListener("hashchange", notify)
  window.addEventListener("popstate", notify)
  return () => {
    window.removeEventListener("hashchange", notify)
    window.removeEventListener("popstate", notify)
  }
}

function getHashSnapshot() {
  return window.location.hash
}

function getServerHashSnapshot() {
  return ""
}

export function LandingAnchorNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const hash = useSyncExternalStore(subscribeHash, getHashSnapshot, getServerHashSnapshot)

  return (
    <nav
      className={cn("hidden items-center gap-6 text-sm font-medium tracking-tight md:flex lg:gap-8", className)}
      aria-label={messages.common.primaryNavAria}
    >
      {marketingNav.map((item) => {
        const itemHash = hashFromHref(item.href)
        const isActive = pathname === "/" && itemHash !== "" && hash === itemHash

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "border-b-2 border-transparent pb-1 text-muted-foreground transition-colors hover:text-foreground",
              isActive && "border-primary font-semibold text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
