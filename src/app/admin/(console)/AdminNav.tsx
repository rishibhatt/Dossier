"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/audit", label: "Audit" },
] as const

export function AdminNav() {
  const path = usePathname()
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors",
              active ? "border-[var(--site-ink)] text-[var(--site-ink)]" : "border-transparent text-[var(--site-ink-2)] hover:text-[var(--site-ink)]"
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
