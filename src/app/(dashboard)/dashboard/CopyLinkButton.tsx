"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard blocked: the visible link can still be selected by hand. */
    }
  }

  return (
    <button type="button" className="dx-btn dx-btn-outline dx-btn-sm" onClick={() => void copy()} aria-live="polite">
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Copied" : "Copy link"}
    </button>
  )
}
