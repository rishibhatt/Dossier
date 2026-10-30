"use client"

import { useEffect } from "react"

import { HUMAN_EVENTS, isTestVisit, looksAutomated } from "@/lib/analytics"

/**
 * Loads Google Analytics 4, Microsoft Clarity and PostHog.
 * Preconfigured with GA (G-TVF4GDK6G0), Clarity (yv0n7udwvu) and PostHog, overridable via env vars.
 *
 * Bot filter: most fake pageviews come from scripted browsers that load a page and never touch it. So the
 * queues are set up at once (events tracked early are kept), but the scripts load only after a real
 * pointer, key, touch or wheel event (see `looksAutomated` and `HUMAN_EVENTS` in lib/analytics).
 * Trade-off: a visitor who leaves without any interaction is not counted.
 *
 * Test filter: nothing loads on localhost, LAN addresses or Netlify deploy previews. Visiting any page with
 * `?notrack=1` turns tracking off in that browser for good (`?notrack=0` turns it back on), so the owner's
 * own visits to the live site stay out of the numbers.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-TVF4GDK6G0"
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "yv0n7udwvu"
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || "phc_ozxTMDUExhWAqgt6NBPHwWCLkvnFKh5hTEaidLcuXuv5"
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

/** Only ids made of letters, digits and dashes reach the page. Anything else is dropped. */
const safe = (v: string | undefined) => (v && /^[\w-]+$/.test(v) ? v : undefined)


function addScript(src: string) {
  const s = document.createElement("script")
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

export function Analytics() {
  useEffect(() => {
    const ga = safe(GA_ID)
    const clarity = safe(CLARITY_ID)
    const posthog = safe(POSTHOG_KEY)
    if (!ga && !clarity && !posthog) return
    if (looksAutomated() || isTestVisit()) return

    type Queue = ((...args: unknown[]) => void) & { q?: unknown[][] }
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: Queue; clarity?: Queue; __dossierAnalytics?: boolean }
    if (w.__dossierAnalytics) return
    w.__dossierAnalytics = true

    // Queues first: anything tracked before the scripts arrive is replayed by them, in order.
    if (ga) {
      w.dataLayer = w.dataLayer || []
      w.gtag = function gtag() {
        // gtag.js reads the arguments object itself, so it is pushed as is.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments)
      }
      w.gtag("js", new Date())
      w.gtag("config", ga)
    }
    if (clarity) {
      // Same stub as Clarity's own snippet: calls wait in `clarity.q` until the tag loads.
      const q: Queue = function clarityQueue() {
        // eslint-disable-next-line prefer-rest-params
        ;(q.q = q.q || []).push(arguments as unknown as unknown[])
      }
      w.clarity = w.clarity || q
    }

    const load = () => {
      for (const e of HUMAN_EVENTS) window.removeEventListener(e, load)
      if (ga) addScript(`https://www.googletagmanager.com/gtag/js?id=${ga}`)
      if (clarity) addScript(`https://www.clarity.ms/tag/${clarity}`)
      if (posthog) {
        void import("posthog-js").then(({ default: ph }) => {
          ph.init(posthog, {
            api_host: POSTHOG_HOST,
            defaults: "2025-05-24",
            person_profiles: "identified_only",
          })
          ;(window as unknown as { posthog?: typeof ph }).posthog = ph
        })
      }
    }
    // Mounted once in the root layout and never unmounted, so the listeners need no cleanup (and a cleanup
    // would drop them in Strict Mode's second effect run, which the flag above skips).
    for (const e of HUMAN_EVENTS) window.addEventListener(e, load, { once: true, passive: true })
  }, [])

  return null
}
