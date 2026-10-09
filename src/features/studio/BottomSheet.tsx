"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { gsap } from "@/components/marketing/motion/gsap"
import type { SheetSnap } from "@/store/useStudioUiStore"

const PEEK = 128
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

type Props = {
  snap: SheetSnap
  onSnap: (s: SheetSnap) => void
  label: string
  header: ReactNode
  children: ReactNode
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Phone tool sheet over the canvas. Rests at peek, half or full; drag the handle or header,
 * flick down to close. At full it is modal: backdrop, focus kept inside, Esc closes at any height.
 * It fills its parent, which ends above the action bar, so the bar always stays reachable.
 */
export function BottomSheet({ snap, onSnap, label, header, children }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(0)
  const drag = useRef<{ y0: number; off0: number; t0: number; on: boolean; id: number } | null>(null)

  const full = Math.max(PEEK, h - 8)
  const offsetFor = useCallback(
    (s: SheetSnap) => (s === "full" ? 0 : s === "half" ? full - Math.round(h * 0.56) : s === "peek" ? full - PEEK : full + 16),
    [full, h]
  )

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.clientHeight))
    ro.observe(el)
    setH(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  // Settle on the snap point. The body pads by the hidden height so its end stays reachable.
  useLayoutEffect(() => {
    const el = sheet.current
    if (!el || !h) return
    const y = offsetFor(snap)
    el.style.setProperty("--sheet-hidden", `${Math.max(0, y)}px`)
    if (reduced()) gsap.set(el, { y, autoAlpha: snap === "closed" ? 0 : 1 })
    else
      gsap.to(el, {
        y,
        autoAlpha: 1,
        duration: 0.42,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => void (snap === "closed" && gsap.set(el, { autoAlpha: 0 })),
      })
  }, [snap, h, offsetFor])

  // Modal at full: move focus in, keep it in, Esc closes.
  useEffect(() => {
    const el = sheet.current
    if (!el || snap === "closed") return
    if (snap === "full") el.querySelector<HTMLElement>("[data-panel-scroll]:not([hidden]) [data-sheet-title]")?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onSnap("closed")
        return
      }
      if (e.key !== "Tab" || snap !== "full") return
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [snap, onSnap])

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y0: e.clientY, off0: Number(gsap.getProperty(sheet.current, "y")) || 0, t0: performance.now(), on: false, id: e.pointerId }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || !sheet.current) return
    const dy = e.clientY - d.y0
    if (!d.on && Math.abs(dy) < 6) return
    if (!d.on) {
      d.on = true
      sheet.current.setPointerCapture(d.id)
    }
    gsap.set(sheet.current, { y: Math.min(full + 16, Math.max(0, d.off0 + dy)) })
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d?.on) return
    const dy = e.clientY - d.y0
    const v = dy / Math.max(1, performance.now() - d.t0)
    const projected = d.off0 + dy + v * 180
    const stops: SheetSnap[] = ["full", "half", "peek"]
    if (projected > offsetFor("peek") + 48) return onSnap("closed")
    const best = stops.reduce((a, b) => (Math.abs(offsetFor(b) - projected) < Math.abs(offsetFor(a) - projected) ? b : a))
    if (best === snap) gsap.to(sheet.current, { y: offsetFor(snap), duration: 0.3, ease: "power3.out" })
    else onSnap(best)
  }

  const next: Record<SheetSnap, SheetSnap> = { closed: "half", peek: "half", half: "full", full: "half" }

  return (
    <div ref={box} className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <div
        aria-hidden
        onClick={() => onSnap("half")}
        className="ws-sheet-backdrop pointer-events-auto absolute inset-0"
        data-show={snap === "full"}
      />
      <div
        ref={sheet}
        role="dialog"
        aria-modal={snap === "full"}
        aria-label={label}
        aria-hidden={snap === "closed"}
        inert={snap === "closed"}
        className="ws-sheet pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col"
        style={{ height: full, transform: `translateY(${full + 16}px)`, visibility: "hidden" }}
      >
        <div className="shrink-0 touch-none select-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <button type="button" onClick={() => onSnap(next[snap])} aria-label={snap === "full" ? "Shrink panel" : "Expand panel"} className="ws-sheet-handle">
            <span aria-hidden />
          </button>
          {header}
        </div>
        <div className="ws-sheet-body min-h-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
