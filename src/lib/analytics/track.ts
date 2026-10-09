/**
 * Analytics hook point. A no-op until a tag manager is installed: when `window.dataLayer` exists,
 * events are pushed there as `{ event, ...props }`. Never logs to the console and never throws.
 *
 * Event names in use: upgrade_sheet_shown, upgrade_sheet_cta, upgrade_sheet_credit, upgrade_sheet_dismissed,
 * referral_link_copied, referral_link_shared, credits_spent, cancel_flow_step, cancel_flow_finished, nudge_shown,
 * nudge_dismissed, nudge_clicked.
 */
export type TrackProps = Record<string, string | number | boolean | null | undefined>

export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return
  try {
    const w = window as unknown as { dataLayer?: unknown[] }
    if (!Array.isArray(w.dataLayer)) return
    w.dataLayer.push({ event, ...props })
  } catch {
    /* Analytics must never break the page. */
  }
}
