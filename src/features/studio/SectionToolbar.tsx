"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { ArrowDown, ArrowUp, EyeOff, PenLine, Shapes, Trash2 } from "lucide-react"

import { crossfadeSection, sectionEl } from "@/features/studio/canvasDom"
import { sectionLabel } from "@/features/studio/sectionCatalog"
import { cycleVariant, moveSection, removeSection, toggleHidden, variantPosition } from "@/features/studio/sectionOps"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

type Box = { top: number; left: number; width: number; height: number; visTop: number; visBottom: number; right: number }

/**
 * Selection on the canvas: a violet proof outline around the chosen section, a tag with its name,
 * and an ink tool strip that stays inside the visible frame while the section scrolls.
 * Everything is reachable by touch; nothing waits for hover.
 */
export function SectionToolbar({ host, scroller }: { host: HTMLElement | null; scroller: HTMLElement | null }) {
  const id = useStudioUiStore((s) => s.selectedId)
  const editSection = useStudioUiStore((s) => s.editSection)
  const index = usePortfolioStore((s) => (id ? (s.document?.sections.findIndex((x) => x.id === id) ?? -1) : -1))
  const total = usePortfolioStore((s) => s.document?.sections.length ?? 0)
  const type = usePortfolioStore((s) => (index >= 0 ? s.document?.sections[index]?.type : undefined))
  const variant = usePortfolioStore((s) => (index >= 0 ? s.designConfig?.sections[index]?.variant : undefined))
  const [box, setBox] = useState<Box | null>(null)

  const measure = useCallback(() => {
    const el = sectionEl(host, id)
    if (!el || !host || !scroller) return setBox(null)
    const h = host.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const v = scroller.getBoundingClientRect()
    setBox({ top: r.top - h.top, left: r.left - h.left, width: r.width, height: r.height, right: r.right - h.left, visTop: v.top - h.top, visBottom: v.bottom - h.top })
  }, [host, scroller, id])

  useLayoutEffect(() => {
    const r = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(r)
  }, [measure, variant, index])

  useEffect(() => {
    if (!scroller || !host || !id) return
    let raf = 0
    const tick = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    scroller.addEventListener("scroll", tick, { passive: true })
    const ro = new ResizeObserver(tick)
    ro.observe(host)
    if (scroller.firstElementChild) ro.observe(scroller.firstElementChild)
    const unsub = usePortfolioStore.subscribe(tick)
    return () => {
      cancelAnimationFrame(raf)
      scroller.removeEventListener("scroll", tick)
      ro.disconnect()
      unsub()
    }
  }, [scroller, host, id, measure])

  if (!id || !box || !type || box.top > box.visBottom || box.top + box.height < box.visTop) return null

  const label = sectionLabel(type)
  const pos = variantPosition(id)
  // Below the name tag, kept inside the visible frame while the section scrolls.
  const top = Math.min(Math.max(box.top + 30, box.visTop + 30), box.visBottom - 56)
  const tagTop = Math.max(box.top, box.visTop)

  return (
    <>
      <div aria-hidden className="ws-sel" style={{ top: box.top, left: box.left, width: box.width, height: box.height, clipPath: `inset(${Math.max(0, box.visTop - box.top)}px 0 ${Math.max(0, box.top + box.height - box.visBottom)}px 0)` }} />
      <span aria-hidden className="ws-sel-tag" style={{ top: tagTop, left: box.left }}>
        {String(index + 1).padStart(2, "0")} {label}
        {pos ? ` / style ${pos.at} of ${pos.of}` : ""}
      </span>
      <div role="toolbar" aria-label={`${label} section tools`} className="ws-tools" style={{ top, right: `max(0.5rem, calc(100% - ${box.right - 8}px))` }}>
        <button type="button" disabled={index <= 0} onClick={() => moveSection(id, -1)} aria-label={`Move ${label} up`}>
          <ArrowUp className="size-4" aria-hidden />
        </button>
        <button type="button" disabled={index >= total - 1} onClick={() => moveSection(id, 1)} aria-label={`Move ${label} down`}>
          <ArrowDown className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={() => crossfadeSection(host, id, () => cycleVariant(id))} aria-label={`Next style for ${label}`} title="Next style">
          <Shapes className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            toggleHidden(id)
            useStudioUiStore.getState().select(null)
          }}
          aria-label={`Hide ${label}`}
          title="Hide"
        >
          <EyeOff className="size-4" aria-hidden />
        </button>
        {type !== "hero" ? (
          <button type="button" onClick={() => removeSection(id)} aria-label={`Remove ${label}`} title="Remove">
            <Trash2 className="size-4" aria-hidden />
          </button>
        ) : null}
        <button type="button" onClick={() => editSection(id)} className="ws-tools-edit">
          <PenLine className="size-4" aria-hidden />
          Edit
        </button>
      </div>
    </>
  )
}
