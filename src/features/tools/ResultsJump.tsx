"use client"

import { useEffect, useState } from "react"
import { ArrowDown } from "lucide-react"

/**
 * Phones stack the results under the form, out of sight while people type. Once there are results and they are
 * off screen, a bar at the bottom says how many are ready and jumps to them. Screen readers hear the count once
 * per change instead of every result on every keystroke.
 */
export function ResultsJump({ targetId, count, noun }: { targetId: string; count: number; noun: [one: string, many: string] }) {
  const [visible, setVisible] = useState(true)
  const has = count > 0

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return
    // In view once its top is above the lowest 15% of the screen (where the bar itself sits).
    const check = () => setVisible(el.getBoundingClientRect().top < window.innerHeight * 0.85)
    check()
    window.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check)
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [targetId, has])

  const label = `${count} ${count === 1 ? noun[0] : noun[1]} ready`
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {has ? label : ""}
      </p>
      {has && !visible ? (
        <a
          href={`#${targetId}`}
          className="site-btn site-btn-primary fixed inset-x-4 bottom-4 z-30 justify-center lg:hidden"
        >
          <span className="site-btn-label">See {label.replace(" ready", "")}</span>
          <ArrowDown className="size-4" aria-hidden />
        </a>
      ) : null}
    </>
  )
}
