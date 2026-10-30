"use client"

import { useEffect, useState } from "react"

/**
 * The phone action bar on template and example pages: fixed in the thumb zone, and out of the way once the
 * footer is on screen so it never covers the last links. Hidden from 1024px, where the action sits in the aside.
 */
export function ThumbBar({ children }: { children: React.ReactNode }) {
  const [atFooter, setAtFooter] = useState(false)

  useEffect(() => {
    const footer = document.querySelector("footer")
    if (!footer) return
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { rootMargin: "0px 0px 8% 0px" })
    io.observe(footer)
    return () => io.disconnect()
  }, [])

  return (
    <div
      data-hidden={atFooter}
      aria-hidden={atFooter || undefined}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--site-ink)] bg-[var(--site-paper)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 data-[hidden=true]:pointer-events-none data-[hidden=true]:translate-y-full motion-reduce:transition-none lg:hidden"
    >
      {children}
    </div>
  )
}
