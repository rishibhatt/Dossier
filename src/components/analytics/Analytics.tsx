"use client"

import { useEffect } from "react"

/**
 * Loads Google Analytics 4 and Microsoft Clarity.
 * Preconfigured with GA (G-TVF4GDK6G0) and Clarity (yv0n7udwvu), overridable via env vars.
 *
 * Bot filter: most fake pageviews come from scripted browsers that load a page and never touch it. So the
 * queues are set up at once (events tracked early are kept), but the two scripts load only after a real
 * pointer, key, touch or scroll, and never for automated browsers (`navigator.webdriver`) or bot user agents.
 * Trade-off: a visitor who leaves without any interaction is not counted.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-TVF4GDK6G0"
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "yv0n7udwvu"

/** Only ids made of letters, digits and dashes reach the page. Anything else is dropped. */
const safe = (v: string | undefined) => (v && /^[\w-]+$/.test(v) ? v : undefined)

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|prerender|phantom|puppeteer|playwright|selenium|python-requests|curl|wget/i
const HUMAN_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const

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
    if (!ga && !clarity) return
    if (navigator.webdriver || BOT_UA.test(navigator.userAgent)) return

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
    }
    // Mounted once in the root layout and never unmounted, so the listeners need no cleanup (and a cleanup
    // would drop them in Strict Mode's second effect run, which the flag above skips).
    for (const e of HUMAN_EVENTS) window.addEventListener(e, load, { once: true, passive: true })
  }, [])

  return null
}
