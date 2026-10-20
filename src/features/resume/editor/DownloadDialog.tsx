"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

import { siteBtnClass } from "@/components/marketing/primitives"

export type DownloadDialogState = { kind: "closed" } | { kind: "signin"; next: string } | { kind: "done"; fileName: string }

/**
 * Sign-in step before the first download, and the "what next" sheet after it. A native <dialog>: it traps
 * focus, closes on Escape and returns focus to the button that opened it.
 */
export function DownloadDialog({
  state,
  onClose,
  onMakeWebsite,
  makingWebsite,
}: {
  state: DownloadDialogState
  onClose: () => void
  onMakeWebsite: () => void
  makingWebsite: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (state.kind !== "closed" && !d.open) d.showModal()
    if (state.kind === "closed" && d.open) d.close()
  }, [state.kind])

  return (
    <dialog
      ref={ref}
      className="rz-dialog"
      aria-labelledby="rz-dl-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {state.kind === "signin" ? (
        <div className="rz-dialog-body">
          <h2 id="rz-dl-title">Download is free</h2>
          <p>Sign in or create an account so we can save your resume. It downloads as soon as you’re back.</p>
          <p className="rz-mono">Your work is already saved on this device. Nothing is lost if you leave.</p>
          <div className="rz-dialog-actions">
            <Link className={siteBtnClass({ variant: "primary" })} href={`/signup?next=${encodeURIComponent(state.next)}`}>
              <span className="site-btn-label">Create a free account</span>
            </Link>
            <Link className={siteBtnClass({ variant: "secondary" })} href={`/login?next=${encodeURIComponent(state.next)}`}>
              <span className="site-btn-label">I have an account</span>
            </Link>
          </div>
          <button type="button" className={siteBtnClass({ variant: "quiet", size: "sm" })} onClick={onClose} style={{ alignSelf: "flex-start" }}>
            <span className="site-btn-label">Keep editing</span>
          </button>
        </div>
      ) : state.kind === "done" ? (
        <div className="rz-dialog-body">
          <h2 id="rz-dl-title">Your PDF is downloading</h2>
          <p className="rz-mono" style={{ wordBreak: "break-all" }}>
            {state.fileName}
          </p>
          <p>The same content can also be a website with its own link, for the places a PDF doesn’t fit: your email signature, LinkedIn, a DM.</p>
          <div className="rz-dialog-actions">
            <button type="button" className={siteBtnClass({ variant: "primary" })} onClick={onMakeWebsite} data-loading={makingWebsite || undefined} disabled={makingWebsite}>
              <span className="site-btn-label">{makingWebsite ? "Opening the builder…" : "Turn it into a website"}</span>
            </button>
            <button type="button" className={siteBtnClass({ variant: "secondary" })} onClick={onClose}>
              <span className="site-btn-label">Back to editing</span>
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
