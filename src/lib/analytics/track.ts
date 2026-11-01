/**
 * Older import path for product events. It forwards to `track` in lib/analytics, which sends each event to
 * GA4, Clarity and PostHog. (It used to push GTM-style `{ event }` objects into `dataLayer`, which gtag.js
 * ignores, so these events reached no tool.)
 *
 * Event names in use: upgrade_sheet_shown, upgrade_sheet_cta, upgrade_sheet_credit, upgrade_sheet_dismissed,
 * referral_link_copied, referral_link_shared, credits_spent, cancel_flow_step, cancel_flow_finished, nudge_shown,
 * nudge_dismissed, nudge_clicked, share_click, heard_from_answered, gallery_opt_in.
 */
import { track as send } from "@/lib/analytics"

export type TrackProps = Record<string, string | number | boolean | null | undefined>

export function track(event: string, props: TrackProps = {}): void {
  send(event, props)
}
