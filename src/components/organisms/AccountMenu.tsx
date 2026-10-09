"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, CreditCard, LogOut, Settings } from "lucide-react"

import { messages } from "@/config/messages"
import { signOutAction } from "@/features/auth/actions/auth.actions"
import { ROUTES } from "@/lib/constants/routes"

const itemClass =
  "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-[var(--site-ink)] transition-colors hover:bg-black/[0.05] focus-visible:bg-black/[0.05]"

export function AccountMenu({ email, planName }: { email: string | null; planName: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const initial = (email?.trim()[0] ?? "?").toUpperCase()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={messages.dashboard.userMenuLabel}
        className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--site-rule-strong)] bg-white py-1 pl-1 pr-2.5 text-sm font-medium transition-colors hover:border-[var(--site-ink)] sm:pr-3"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-[var(--site-accent-wash)] text-sm font-bold text-[var(--site-accent-ink)]" aria-hidden>
          {initial}
        </span>
        <span className="hidden max-w-[12rem] truncate sm:block">{email ?? "Account"}</span>
        <ChevronDown className="size-4 text-[var(--site-ink-2)]" aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-xl border border-[var(--site-rule-strong)] bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(16,17,20,0.25)]"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="truncate text-sm font-semibold" title={email ?? undefined}>
              {email ?? "Signed in"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--site-ink-2)]">{planName} plan</p>
          </div>
          <div className="border-t border-[var(--site-rule)] pt-1.5">
            <Link href={ROUTES.settings} className={itemClass} onClick={() => setOpen(false)}>
              <Settings className="size-4 text-[var(--site-ink-2)]" aria-hidden />
              {messages.dashboard.nav.settings}
            </Link>
            <Link href={ROUTES.billing} className={itemClass} onClick={() => setOpen(false)}>
              <CreditCard className="size-4 text-[var(--site-ink-2)]" aria-hidden />
              {messages.dashboard.nav.billing}
            </Link>
            <form action={signOutAction}>
              <button type="submit" className={itemClass}>
                <LogOut className="size-4 text-[var(--site-ink-2)]" aria-hidden />
                {messages.common.signOut}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
