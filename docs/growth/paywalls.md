# Paywalls and upgrade prompts

One reusable sheet: `src/features/billing/UpgradeSheet.tsx`, opened from anywhere with
`openUpgrade(trigger, options)` (`src/features/billing/useUpgrade.ts`). Bottom sheet under 640px, dialog above.
Mounted in the studio (`StudioShell`) and the dashboard layout.

## The rule

Never before the aha moment. For Dossier the aha moment is the first preview of the person's own site.
Everything before it (upload, parse, picking a look) stays free of upgrade asks, including the anonymous
parse cap, which shows a plain "try again tomorrow, or sign in" message instead of a paywall.
Every trigger below happens in the studio or the dashboard, so the person has already seen their site.

Prompts appear only when the person asks for something their plan does not include. There are no timed or
"you have been here a while" popups.

## Trigger map

| Trigger | Where | When it fires | Never |
| --- | --- | --- | --- |
| `zip_export` | Studio, Share panel, Download ZIP | `/api/export-portfolio` returns 402 `plan_required` | Before preview; for signed-out users (they get the sign-in toast) |
| `shuffle_limit` | Studio, Shuffle buttons (top bar, Design panel) | `/api/regenerate-design` returns 429 `quota_exceeded`, kind `regenerate` | For `refine` or `parse` quotas (plain toast) |
| `remove_badge` | Studio, Share panel, "Remove the badge" (Free only) | Tap | For Starter or Pro |
| `portfolio_limit` | Studio publish (403 `portfolio_limit`); dashboard "New portfolio" at the limit | Error or tap | On Free with no portfolio yet |
| `pro_feature` | Studio, Share panel, "Use your own domain" (marked Soon) | Tap | For Pro (they see "on the way") |

## Screen anatomy

Headline (what they asked for) / one line of value / the one relevant plan, with price, cadence and what it
adds / primary CTA / note that checkout is not live / "Use a credit" when it applies / extra way out /
"Not now" (or "Keep this design" on the shuffle trigger).

- Primary CTA: signed in goes to `/dashboard/billing`; signed out goes to `/signup?next=/dashboard/billing`.
- Below it, always: "Checkout is not open yet, so nothing is charged today. The plans page shows what each
  one includes." Remove that line when billing ships, and point the CTA at checkout.
- Credits (signed in, effective plan Free, triggers `shuffle_limit` / `zip_export` / `remove_badge`):
  - `Use 1 credit: 20 more shuffles a day for 7 days` (shuffle trigger, balance at least 1). After success the
    studio retries the shuffle the person asked for.
  - `Use 3 credits: unlock Starter for good` (balance at least 3).
  - Balance 1 or 2 on a Starter trigger: a quiet line with a link to earn more.
- If the person already has the plan (Pro hitting 5 portfolios, Pro tapping a planned Pro feature), the sheet
  says so and drops the sales part.

## Copy per trigger

**zip_export**
- Headline: Download your site as a ZIP
- Value: Starter gives you the whole site as files you can host anywhere. You pay once and keep them.
- Plan: Starter, $9 one time.

**shuffle_limit**
- Headline: You have used today's 3 shuffles
- Value: Your current design stays as it is. Starter lets you shuffle as often as you like, or you get 3 more
  tomorrow.
- Plan: Starter. Dismiss label: Keep this design.

**remove_badge**
- Headline: Take the Dossier badge off your page
- Value: Starter removes the small "Made with Dossier" line at the bottom. Your link stays the same.
- Plan: Starter.

**portfolio_limit**
- Headline: Keep more than one portfolio
- Value: Your plan holds one published portfolio, and publishing again replaces it at the same link. Pro keeps
  up to 5 side by side.
- Plan: Pro, $39 per year. Dashboard adds "Build one to replace my site".
- Already Pro: "You have 5 portfolios published. That is the most Pro holds. Unpublish one from your dashboard
  to make room for a new one."

**pro_feature** (feature name passed in, e.g. "Your own domain")
- Headline: Your own domain is planned for Pro
- Value: It is not built yet, so we will not charge for it. Pro today gives you up to 5 portfolios, no badge
  and ZIP downloads.
- Already Pro: "Your own domain is on the way. It is planned for Pro and not built yet. It will turn on for
  your account when it ships."

## Plan structure rationale

- **Free**: enough to finish and publish one real site. The badge is the growth loop and the clearest reason
  to pay. 3 shuffles a day lets people explore without making shuffles free forever.
- **Starter, $9 once**: the job-seeker plan. Most people need one site for a few months. A one-time price
  matches that and removes the fear of a subscription they forget to cancel. It also equals 3 referral
  credits, which gives the referral program a concrete headline.
- **Pro, $39 a year**: for people who keep several portfolios (different roles, freelancers). Its planned
  extras (domain, visit counts, PDF) are marked "coming soon" everywhere, and never sold as if they exist.

## Frequency

Every trigger is a direct response to a tap, so the sheet shows each time the block happens. There is no
proactive upgrade popup to rate-limit. If proactive prompts are added later: one per session, 7-day cool
down after dismiss, never inside the parse or publish flow.

## Analytics hook points

`track()` (`src/lib/analytics/track.ts`) is a no-op until `window.dataLayer` exists.
Events: `upgrade_sheet_shown {trigger, plan}`, `upgrade_sheet_cta {trigger, plan, signedIn}`,
`upgrade_sheet_dismissed {trigger}`, `credits_spent {item, source}`.
Measure: shown to CTA rate per trigger, CTA to purchase once checkout exists, credit use share.
