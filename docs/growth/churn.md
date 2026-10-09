# Churn prevention

Billing is not live. The cancel flow works today (feedback is stored, Pro to Free is real) and the dunning and
win-back sequences below are written so they can be wired to a billing provider and an email service later.

Context that shapes all of this: many people use Dossier for one job search. "I got the job" is a success, not
a failure. The goal is to keep their link alive on Free (the badge keeps working for us) and to be the obvious
choice next time they look for work.

## Cancellation flow

Route: `/dashboard/billing` -> "Cancel or change plan" -> `/dashboard/billing/cancel`
(`src/app/(dashboard)/dashboard/billing/cancel/CancelFlow.tsx`). Storage: `cancellation_feedback` via
`POST /api/billing/cancel-feedback` (service role).

1. **Exit survey**: one single-choice question plus optional text. Options, in order: I got the job / It costs
   too much / It is missing something I need / It was hard to use / I only needed it once / Something else.
   "Never mind, keep <plan>" is always visible.
2. **Reason-matched offer**: one primary offer and at most one fallback. "No thanks, continue" is always
   visible.

   | Reason | Pro | Starter / Free |
   | --- | --- | --- |
   | Got the job | Keep the site live on Free with the badge; download the ZIP first | Congratulations, site stays live |
   | Too expensive | Move to Starter ($9 once, never renews), or pause Pro 3 months (both recorded as `accepted_offer`) | Starter: nothing renews. Free: invites earn credits |
   | Missing feature | "Which feature?" text, roadmap note (domain, visit counts, PDF are planned, not built) | Same |
   | Hard to use | Help email (`siteConfig.supportEmail`) | Same |
   | Only once | Free keeps the link live | Link stays live |
   | Other | Email us | Same |

3. **Confirm**: Pro sees what they keep and lose, then "Switch to Free" (the only plan change, sets
   `plan = 'free'` by service role, `outcome = 'downgraded'`). Starter and Free send their answer only
   (`feedback_only`): Starter is one-time and Free never charges.

Outcomes stored: `kept_plan`, `accepted_offer` (with `offer` = `switch_starter` | `pause_3_months`),
`downgraded`, `feedback_only`. Starter switch and pause are requests only until checkout exists: the page says
so plainly.

When billing ships: replace the immediate downgrade with "cancel at period end" at the provider, keep the
confirm copy ("You keep Pro until <date>"), and turn the pause and Starter requests into real provider calls.

## Dunning (failed payment, Pro yearly renewal)

Pre-dunning: email 7 days before the yearly renewal with the amount and date, and a link to update the card.

Retries: day 1, 3, 5, 7 after the failure (or the provider's smart retries). Hard declines skip retries and go
straight to "update your card". After day 14 with no payment, move the account to Free. Never unpublish.

Plain-text emails, one link each, no blame.

**Day 0** - Subject: Your Dossier payment did not go through

> Hi,
>
> We tried to renew your Pro plan ($39 for the year) and the payment did not go through. This happens when a
> card expires or a bank blocks the charge.
>
> Update your card: <link>
>
> Your portfolios stay live while we try again. Reply to this email if something looks wrong.

**Day 3** - Subject: A reminder about your Dossier payment

> Hi,
>
> Your Pro renewal is still waiting on a working card. It takes a minute to fix: <link>
>
> Nothing has changed on your account yet.

**Day 7** - Subject: Your Pro plan moves to Free in 7 days

> Hi,
>
> We still could not renew Pro. If the card is not updated by <date>, your account moves to Free.
>
> On Free your pages stay live at the same links. You would lose ZIP downloads, unlimited shuffles and room
> for 5 portfolios, and the small Dossier badge comes back.
>
> Update your card: <link>

**Day 14** - Subject: Your account is on Free now

> Hi,
>
> We could not renew Pro, so your account is on Free from today. Your pages are still live at the same links.
>
> If you want Pro back, it takes one step: <link>

## Win-back (after a cancellation or a downgrade to Free)

Send only to people who cancelled or downgraded, stop the moment they upgrade, and skip anyone whose survey
answer was "Got the job" for the first two emails (send them only the day 90 one).

**Day 7** - Subject: Your page is still live

> Hi,
>
> Your portfolio is still at <link>, on the Free plan. If you change jobs or roles, you can upload a new resume
> and keep the same link.
>
> If something made you leave that we could fix, reply and tell us.

**Day 30** - Subject: What changed in Dossier this month

> Hi,
>
> A short list of what is new: <2-3 real changes, e.g. new templates>. Your page is at <link>.
>
> Starter is $9 once if you want the badge off and the ZIP download. Nothing renews.

Only send if there is something real to list. Skip the month otherwise.

**Day 90** - Subject: Looking again?

> Hi,
>
> If you are job hunting again, upload your newest resume and your page updates at the same link: <link to /build>.
>
> It takes a few minutes.

## In-product nudges (built)

Dashboard home (`src/app/(dashboard)/dashboard/DashboardNudges.tsx`). One card at most, dismissible, stored on
the device (localStorage, `dx_nudges_v1`, `dx_seen_templates_v1`). Priority order:

1. **Stale site**: newest published portfolio not updated for 90 days.
   "Your site still shows <role at company>. Upload your newest resume to refresh it." Dismissed for 30 days;
   a new publish resets it.
2. **New template**: any id in `NEW_TEMPLATE_IDS` (`src/config/newTemplates.ts`) not yet seen.
   "New looks to try: <names>. Open your portfolio and pick one under Design. Your text stays as it is."
   Dismissing or clicking marks them seen for good.
3. **Invite**: after the person has published. Dismissed for 60 days.

Ideas for later (need data we do not collect yet): yearly renewal recap 30 days before renewal (portfolios,
publishes), an "export your site" reminder for Pro users who never downloaded a ZIP, a check-in email 14 days
after signup for people who parsed but never published.

## Metrics

Cancel flow save rate (kept_plan + accepted_offer over all finished flows), reasons by month, offer acceptance
by reason, dunning recovery rate, win-back reactivation by email. Events: `cancel_flow_step`,
`cancel_flow_finished`, `nudge_shown`, `nudge_clicked`, `nudge_dismissed`.
