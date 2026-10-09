"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"

export type MenuItem = { label: string; Icon: React.ComponentType<{ className?: string }>; onSelect: () => void; disabled?: boolean; className?: string }

/** The top bar's "more" menu. A plain popover: Esc or a tap outside closes it, arrow keys move. */
export function OverflowMenu({ items, footer }: { items: MenuItem[]; footer?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>("[role=menuitem]:not([disabled])")?.focus()
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        root.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus()
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        const list = Array.from(root.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not([disabled])") ?? [])
        const i = list.indexOf(document.activeElement as HTMLElement)
        list[(i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length]?.focus()
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label="More actions" onClick={() => setOpen((o) => !o)} className="ws-icon-btn" data-on={open}>
        <MoreHorizontal className="size-4" aria-hidden />
      </button>
      {open ? (
        <div role="menu" className="ws-menu">
          {items.map(({ label, Icon, onSelect, disabled, className }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={disabled}
              className={className}
              onClick={() => {
                setOpen(false)
                onSelect()
              }}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </button>
          ))}
          {footer}
        </div>
      ) : null}
    </div>
  )
}
