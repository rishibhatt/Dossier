"use client"

import { ArrowUp } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props =
  | { mode: "element"; scrollRoot: HTMLElement | null }
  | { mode: "window" }

const THRESHOLD = 320

export function PortfolioPreviewBackToTop(props: Props) {
  const [visible, setVisible] = useState(false)
  const scrollRoot = props.mode === "element" ? props.scrollRoot : null

  useEffect(() => {
    if (props.mode === "window") {
      const onScroll = () => setVisible(window.scrollY > THRESHOLD)
      onScroll()
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => window.removeEventListener("scroll", onScroll)
    }
    const el = scrollRoot
    if (!el) return
    const onScroll = () => setVisible(el.scrollTop > THRESHOLD)
    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [props.mode, scrollRoot])

  const scrollUp = useCallback(() => {
    if (props.mode === "window") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    props.scrollRoot?.scrollTo({ top: 0, behavior: "smooth" })
  }, [props])

  if (!visible) return null

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className={cn(
        "fixed z-[60] size-11 rounded-full border border-border bg-background/95 shadow-lg backdrop-blur-sm",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-24 sm:right-6"
      )}
      aria-label="Back to top"
      onClick={scrollUp}
    >
      <ArrowUp className="size-5" />
    </Button>
  )
}
