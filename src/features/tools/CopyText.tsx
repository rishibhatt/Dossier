"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

/** Copies `text`; the label confirms for two seconds. Silent success, no toast. */
export function CopyText({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          window.setTimeout(() => setDone(false), 2000)
        } catch {
          /* clipboard blocked: the text is still selectable on the page */
        }
      }}
      className="site-btn site-btn-ghost site-btn-sm shrink-0"
      aria-live="polite"
    >
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span className="site-btn-label">{done ? "Copied" : label}</span>
    </button>
  )
}
