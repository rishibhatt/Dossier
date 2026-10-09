type Props = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
  }
}

/** Sends one product event to every analytics tool that is loaded. Safe to call when none are. */
export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return
  try {
    window.gtag?.("event", event, props)
    window.clarity?.("event", event)
  } catch {
    // Analytics must never break the page.
  }
}
