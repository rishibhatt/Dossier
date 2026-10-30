"use client"

import { useSyncExternalStore } from "react"

import { activeOffer, OFFERS, type Currency, type Offer } from "@/lib/billing/pricing"

const DAY_MS = 86_400_000
const noop = () => () => {}
const tick = (cb: () => void) => {
  const id = setInterval(cb, 1000)
  return () => clearInterval(id)
}
const second = () => Math.floor(Date.now() / 1000) * 1000

/** The visitor's own currency, from the time zone: India sees rupees, everyone else dollars. */
export function localCurrency(): Currency {
  try {
    return /Asia\/(Kolkata|Calcutta)/.test(Intl.DateTimeFormat().resolvedOptions().timeZone) ? "INR" : "USD"
  } catch {
    return "USD"
  }
}

/** Dev only: `?offer=<id>` shows that offer as running, to review the design before it starts. Prices charged never change. */
function previewId(): string {
  if (process.env.NODE_ENV === "production") return ""
  try {
    return new URLSearchParams(location.search).get("offer") ?? ""
  } catch {
    return ""
  }
}

/** The festival offer running now for this visitor (null before hydration and between offers), ticking every second. */
export function useOffer(): { now: number; currency: Currency | null; offer: Offer | null } {
  const now = useSyncExternalStore(tick, second, () => 0)
  const currency = useSyncExternalStore(noop, localCurrency, () => null)
  const preview = useSyncExternalStore(noop, previewId, () => "")
  if (!now) return { now, currency, offer: null }
  const forced = OFFERS.find((o) => o.id === preview)
  // A preview ends three days after today's midnight, so its countdown runs normally.
  const offer = forced ? { ...forced, ends: new Date(now - (now % DAY_MS) + 3 * DAY_MS).toISOString() } : activeOffer(currency, now)
  return { now, currency, offer }
}

/** "2d 14h 09m" for the time left; under a day, hours, minutes and seconds. */
export function timeLeft(ms: number): { d: number; h: number; m: number; s: number } {
  const t = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }
}
