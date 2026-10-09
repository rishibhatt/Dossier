"use client"

import { useState } from "react"

import { track } from "@/lib/analytics"

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string }

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: "idle" })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setState({ kind: "sending" })
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), message: data.get("message"), website: data.get("website") }),
      })
      if (res.ok) {
        track("contact_sent")
        form.reset()
        setState({ kind: "sent" })
        return
      }
      const body = (await res.json().catch(() => null)) as { message?: string } | null
      setState({ kind: "error", message: body?.message ?? "Something went wrong. Please try again." })
    } catch {
      setState({ kind: "error", message: "The message did not go through. Check your connection and try again." })
    }
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="border border-[var(--site-ink)] bg-[var(--site-sheet)] p-6">
        <p className="site-h3">Message sent</p>
        <p className="site-body mt-2">Thanks. A person will reply, usually within two working days. A copy of your message is on its way to your inbox.</p>
      </div>
    )
  }

  const busy = state.kind === "sending"
  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate={false}>
      <div>
        <label htmlFor="c-name" className="sp-label">
          Your name
        </label>
        <input id="c-name" name="name" required maxLength={120} autoComplete="name" className="sp-field" disabled={busy} />
      </div>
      <div>
        <label htmlFor="c-email" className="sp-label">
          Email
        </label>
        <input id="c-email" name="email" type="email" required maxLength={254} autoComplete="email" className="sp-field" disabled={busy} />
      </div>
      <div>
        <label htmlFor="c-message" className="sp-label">
          How can we help?
        </label>
        <textarea id="c-message" name="message" required minLength={5} maxLength={4000} rows={7} className="sp-field min-h-40 resize-y" disabled={busy} />
      </div>
      {/* Honeypot: hidden from people and from assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.kind === "error" ? (
        <p role="alert" className="text-sm text-[var(--site-danger)]">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="site-btn site-btn-primary w-full sm:w-auto">
        <span className="site-btn-label">{busy ? "Sending" : "Send message"}</span>
      </button>
    </form>
  )
}
