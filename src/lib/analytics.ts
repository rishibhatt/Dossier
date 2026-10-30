type Props = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
    posthog?: { capture: (event: string, props?: Props) => void }
  }
}

/** Sends one product event to every analytics tool that is loaded. Safe to call when none are. */
export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return
  try {
    window.gtag?.("event", event, props)
    window.clarity?.("event", event)
    window.posthog?.capture(event, props)
  } catch {
    // Analytics must never break the page.
  }
}

/** Bot and test filters shared by the analytics loader and the portfolio view counter (server and browser). */
export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|prerender|phantom|puppeteer|playwright|selenium|python-requests|curl|wget/i
// No "scroll": a script can scroll a page, but wheel, tap, pointer and key events come from a person (or a much smarter bot).
export const HUMAN_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const

/** Automated browsers: a bot user agent, WebDriver, or the blank language list and zero-size window of headless mode. */
export function looksAutomated(): boolean {
  return navigator.webdriver || BOT_UA.test(navigator.userAgent) || !navigator.languages?.length || window.outerWidth === 0
}
const TEST_HOST = /^(localhost|127\.|0\.0\.0\.0|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|\.local$|\.localhost$|^deploy-preview-|--/
const OPT_OUT_KEY = "dossier_notrack"

/** True when this visit must not reach any analytics tool. */
export function isTestVisit(): boolean {
  if (TEST_HOST.test(location.hostname)) return true
  try {
    const flag = new URLSearchParams(location.search).get("notrack")
    if (flag === "1") localStorage.setItem(OPT_OUT_KEY, "1")
    if (flag === "0") localStorage.removeItem(OPT_OUT_KEY)
    return localStorage.getItem(OPT_OUT_KEY) === "1"
  } catch {
    return false
  }
}
