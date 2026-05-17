"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignConfig } from "@/types/designEngine"

/**
 * Floating natural-language design commands (⌘K / Ctrl+K).
 * Applies heuristics via `/api/portfolio-refine-design` (deterministic — no Groq required).
 */
export function NLEditor() {
  const pathname = usePathname()
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const setDesignConfig = usePortfolioStore((s) => s.setDesignConfig)
  const onBuild = pathname === ROUTES.build || pathname?.startsWith(`${ROUTES.build}/`)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const inField = tag === "INPUT" || tag === "TEXTAREA" || Boolean(target?.isContentEditable)
      if (inField && !(e.metaKey || e.ctrlKey)) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        e.stopPropagation()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  const run = useCallback(async () => {
    const msg = text.trim()
    if (!document || !designConfig || !msg || busy) return
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch("/api/portfolio-refine-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioData: document, designConfig, message: msg }),
      })
      const body = (await res.json()) as {
        error?: string
        message?: string
        designConfig?: DesignConfig
      }
      if (!res.ok) {
        const hint =
          body.error === "invalidPayload"
            ? "Design state could not be sent — try Regenerate design from the right panel."
            : body.error === "invalidMessage"
              ? "Enter a short instruction (max 2000 characters)."
              : body.error === "groqMissing"
                ? body.message ?? "Server misconfiguration."
                : body.message ?? body.error ?? `Request failed (${res.status})`
        setErr(hint)
        return
      }
      if (!body.designConfig) {
        setErr("No design returned — try a clearer phrase (e.g. “pink palette”, “bigger hero”).")
        return
      }
      setDesignConfig(body.designConfig)
      setText("")
      setOpen(false)
    } catch {
      setErr("Network error — check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }, [busy, designConfig, document, setDesignConfig, text])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-background/95 px-4 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur",
          onBuild ? "bottom-24" : "bottom-4"
        )}
      >
        Design command ⌘K
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-[100] border-t border-border bg-background/98 p-4 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-xl sm:border",
        onBuild ? "bottom-24 sm:bottom-24" : "bottom-0 sm:bottom-6"
      )}
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">Natural language — applies instantly (palette, hero size, section order, mood)</p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='e.g. “pink palette”, “green nature theme”, “projects before experience”, “bigger typography”'
        className="min-h-24 resize-none"
        disabled={busy}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            void run()
          }
          if (e.key === "Escape") {
            e.preventDefault()
            setOpen(false)
          }
        }}
      />
      {err ? <p className="mt-2 text-xs text-destructive">{err}</p> : null}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={busy}>
          Close
        </Button>
        <Button type="button" size="sm" onClick={() => void run()} disabled={busy || !text.trim()}>
          Apply
        </Button>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">⌘↵ / Ctrl+↵ to apply · Esc to close</p>
    </div>
  )
}
