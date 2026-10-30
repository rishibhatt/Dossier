"use client"

/* Hallmark · component: banner · genre: editorial · theme: Dossier DESIGN.md (locked)
 * states: default · hover · focus · active (button, dismiss) · dismissed · ended (unmounts)
 */

import { ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useState, useSyncExternalStore } from "react"

import { timeLeft, useOffer } from "@/features/billing/useOffer"
import { ROUTES } from "@/lib/constants/routes"

const noop = () => () => {}
const pad = (n: number) => String(n).padStart(2, "0")

/**
 * The festival sale strip: one compact ink band (about 48px on desktop, two tight rows on a phone). The discount
 * carries the violet mark, a live d/h/m/s countdown sits in ruled mono cells, and one paper button claims it.
 * Hidden once dismissed (per offer, in this browser). `cta={false}` drops the button where buy buttons are already on screen.
 */
export function OfferBar({ cta = true }: { cta?: boolean }) {
  const { now, offer } = useOffer()
  const key = offer ? `dossier_offer_${offer.id}` : ""
  const dismissed = useSyncExternalStore(
    noop,
    () => {
      try {
        return key ? localStorage.getItem(key) === "1" : false
      } catch {
        return false
      }
    },
    () => true
  )
  const [hidden, setHidden] = useState<string | null>(null)
  if (!offer || dismissed || hidden === offer.id) return null

  const t = timeLeft(Date.parse(offer.ends) - now)
  const cells = (t.d > 0 ? [[t.d, "d"], [t.h, "h"], [t.m, "m"], [t.s, "s"]] : [[t.h, "h"], [t.m, "m"], [t.s, "s"]]) as [number, string][]
  const spoken = t.d > 0 ? `${t.d} days ${t.h} hours` : `${t.h} hours ${t.m} minutes`

  return (
    <aside aria-label={`${offer.name}: ${offer.percent}% off`} className="bg-[var(--site-ink)] text-[var(--site-paper)]">
      <div className="site-wrap flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 sm:flex-nowrap sm:py-1.5">
        <p className="flex min-w-0 flex-1 items-baseline gap-2 text-sm sm:flex-none">
          <span
            className="whitespace-nowrap text-base font-bold tracking-[-0.02em] underline decoration-[var(--site-accent)] decoration-2 underline-offset-4"
            style={{ fontFamily: "var(--site-display)" }}
          >
            {offer.percent}% off
          </span>
          <span className="truncate text-white/75">
            <strong className="font-semibold text-[var(--site-paper)]">{offer.name}</strong>
            <span className="hidden md:inline"> on Starter and Pro</span>
          </span>
        </p>

        <button
          type="button"
          aria-label="Hide this offer"
          onClick={() => {
            try {
              localStorage.setItem(key, "1")
            } catch {
              /* hides for this page view only */
            }
            setHidden(offer.id)
          }}
          className="order-2 -mr-3 grid size-11 shrink-0 place-items-center text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--site-paper)] sm:order-last"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="order-3 flex w-full items-center justify-between gap-3 sm:order-2 sm:ml-auto sm:w-auto sm:justify-end">
          <span role="timer" aria-label={`Ends in ${spoken}`} className="flex gap-px border border-white/20 bg-white/20">
            {cells.map(([n, unit]) => (
              <span key={unit} aria-hidden className="bg-[var(--site-ink)] px-1.5 py-0.5 font-mono text-sm tabular-nums">
                {pad(n)}
                <span className="text-xs text-white/55">{unit}</span>
              </span>
            ))}
          </span>

          {cta ? (
            <Link
              href={ROUTES.pricing}
              className="relative inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-[4px] before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] bg-[var(--site-paper)] px-3 text-sm font-semibold text-[var(--site-ink)] transition-colors hover:bg-[var(--site-accent)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-paper)] active:translate-y-px active:bg-[var(--site-ink)] active:text-[var(--site-paper)] active:outline active:outline-1 active:outline-[var(--site-paper)]"
            >
              <span className="sm:hidden">Claim</span>
              <span className="hidden sm:inline">Claim {offer.percent}% off</span>
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
