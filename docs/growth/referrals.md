# Referral program

Owner decision: rewards are credits. 1 credit = a shuffle pack, 3 credits = Starter unlocked for good.
Double-sided: the person who shares and the person who joins each get 1 credit.

## Why this shape

- Dossier output is public by nature (a link people put on CVs and LinkedIn), and Free pages already carry the
  "Made with Dossier" badge. The referral program adds a deliberate ask on top of that passive loop.
- The reward is paid at the aha moment for the new person (their first publish), not at signup. Signups alone
  are cheap to fake; a published portfolio is real use.
- Credits cost us almost nothing (shuffles are rules-based, not LLM calls) but feel valuable: 3 credits equal
  the $9 Starter purchase, so "invite 3 friends, get Starter" is the headline number.

## Rules

| Rule | Value | Where enforced |
| --- | --- | --- |
| What counts | Referee signs up through the link and publishes their first portfolio | `publish-portfolio` route calls `qualify_referral` |
| Reward | +1 credit referrer, +1 credit referee, once per referral | `qualify_referral` + unique index `(referral_id, reason)` |
| Link lifetime | 30 days from first click, first click wins | `/r/[code]` cookie `dx_ref` (httpOnly, lax, 30 days) |
| New accounts only | Account `created_at` after the click (2 min skew allowed) and within 30 days | `captureReferralAfterAuth` |
| One per referee | `referrals.referee_id` is unique; an existing row (any status) wins | table constraint + check |
| No self-referral | Same user id is not recorded (DB check forbids it); same normalised email is rejected | `rejectReason` |
| Disposable email | Hardcoded list in `src/lib/referrals/server.ts` | `rejectReason` |
| Same network | Referee signup IP hash equals referrer signup IP hash | `users.signup_ip_hash` |
| Referrer cap | 20 qualified per rolling 30 days, extra ones rejected | `qualify_referral` (advisory lock per referrer) |

Email normalisation: lowercase, strip `+tag`, strip dots for gmail.com / googlemail.com.
IPs are never stored raw: salted SHA-256 (`RATE_LIMIT_SALT`), same as the anonymous quota subject.

Reject reasons (stored in `referrals.reject_reason`, shown to the referrer in plain words, never with the
other person's details): `same_email`, `existing_account`, `expired`, `disposable_email`, `same_network`,
`referrer_monthly_limit`.

## Spending

| Item | Cost | Effect |
| --- | --- | --- |
| Shuffle pack | 1 | +20 regenerations a day on top of the plan cap, for 7 days from purchase. Packs stack. |
| Starter unlock | 3 | `users.plan = 'starter'`, `plan_expires_at = null`, `starter_unlocked_via_credits = true` |

- Endpoint: `POST /api/credits/spend { item: 'shuffle_pack' | 'starter_unlock' }`.
- The balance check, the debit and the effect run inside `spend_credits` (Postgres, security definer,
  advisory lock per user). Two taps at once cannot spend the same credit twice.
- Paid plans (Starter, active Pro) are refused with `already_included` so nobody burns credits for nothing.
- The quota bonus lives in `consumeQuota` (`src/lib/api/guard.ts`): only looked up once the base cap is hit.

## Data model

- `referral_codes (user_id pk, code unique [a-z2-9]{8}, created_at)`. Created lazily on first visit to the
  Invite page or the post-publish prompt.
- `referrals (id, referrer_id, referee_id unique, code, status signed_up|qualified|rejected, reject_reason,
  clicked_at, referee_ip_hash, created_at, qualified_at)`.
- `credit_ledger (id, user_id, delta, reason, referral_id, created_at)`. Append only. Reasons:
  `referral_referrer`, `referral_referee`, `spend_shuffle_pack`, `spend_starter_unlock`, `admin_adjustment`.
- View `credit_balances (user_id, balance)` with `security_invoker`.
- `users.signup_ip_hash`, `users.starter_unlocked_via_credits`.
- RLS: select own rows only. No client insert/update policies. Functions are revoked from anon/authenticated.

## Flow

1. Referrer shares `https://dossier-cv.com/r/<code>` (from `/dashboard/referrals` or the post-publish dialog).
2. `/r/<code>` sets `dx_ref = <code>.<click ms>` and redirects to `/invite?code=<code>` (marketing page).
3. Sign up by email (server action), OAuth or the email-confirmation callback runs
   `captureReferralAfterAuth`: records the signup IP hash for new accounts, applies the rules, inserts the
   `referrals` row, clears the cookie. Sign in also runs it, for people who confirmed email in another tab.
4. First publish: `qualify_referral(referee)` marks it qualified and writes both ledger rows.

## Copy

Voice: plain, specific, no exclamation marks.

**Post-publish prompt (studio, Publish dialog, signed-in only)**

> Know someone job hunting? Send them your invite link: you both get a credit when they publish.
> [Copy my invite link] [How invites work]

**Dashboard banner (one-at-a-time nudge, after the person has published)**

> Know someone job hunting? Send them your invite link. You both get a credit when they publish.
> [Get my invite link]

**Share text (WhatsApp, email, native share)**

> I turned my resume into a portfolio site with Dossier. It took a few minutes. If you sign up with my link
> and publish yours, we both get a credit. <link>

**Referee welcome email** (send after signup when a `referrals` row exists with status `signed_up`)

Subject: Your portfolio is a few minutes away

> Hi,
>
> A friend sent you their Dossier link, so here is what happens next.
>
> Upload your resume as a PDF. Dossier turns it into a portfolio website you can restyle and edit. When you
> publish it, you get 1 credit, and so does the friend who invited you.
>
> 1 credit gives you 20 extra design shuffles a day for a week. 3 credits unlock Starter, which removes the
> badge and lets you download your site as a ZIP.
>
> Build my portfolio: <link to /build>
>
> The Dossier team

**"You earned a credit" email** (send to the referrer when `qualify_referral` returns `qualified`)

Subject: You earned a credit

> Hi,
>
> Someone you invited just published their portfolio, so you both got 1 credit. You now have <balance>.
>
> <if balance < 3> <3 - balance> more and you can unlock Starter for good.</if>
> <if balance >= 3> You have enough to unlock Starter. It removes the badge and turns on ZIP downloads.</if>
>
> See your credits: <link to /dashboard/referrals>
>
> The Dossier team

Neither email exists in code yet: there is no sending infrastructure. Hook points are noted above.

## Metrics to watch

Active referrers (shared in last 30 days), clicks to signup, signup to first publish (qualification rate),
rejected share by reason (spikes in `same_network` or `disposable_email` mean abuse), credits earned vs spent,
Starter unlocks via credits vs paid. Events are pushed through `track()` once a tag manager exists:
`referral_link_copied`, `referral_link_shared`, `credits_spent`.
