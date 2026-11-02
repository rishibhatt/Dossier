# Pricing: why it converts nothing, and what to change (2026-11-03)

Data (GA4, 2 to 3 Nov): /pricing 15 users, 28 s average engagement, 6.7% bounce; 0 `checkout_started`; /dashboard/billing 1 visit.
Clarity: people read pricing closely and then stopped. Search clicks: India 20 of 41, then UK, Germany and the Gulf.
Signup was broken for most of the window, so the main reason is upstream. Most visitors could not create an account, and every paid button needs one.
The findings below are the problems that will still be there now that signup works.

## 1. What each plan includes today (from code)

| | Free | Starter | Pro |
|---|---|---|---|
| Price (`PRODUCTS`) | 0 | $9 / ₹399 once | $39 / ₹1,499 a year, or $7 / ₹299 a month (pass, no renewal) |
| Diwali (INR only, 1 to 11 Nov, 30% off) | | ₹279 | ₹1,049 a year / ₹209 a month |
| Portfolios / shuffles a day | 1 / 3 | 1 / 200 ("unlimited") | 5 / 500 |
| Badge, ZIP | badge, no ZIP | removed, ZIP | removed, ZIP |
| Resume builder | PDF free, 2 saved | 200 saved | 200 saved |
| Visit counts | weekly total | weekly total | day by day (already built) |
| Own domain | | | "planned" |

Credits: 3 invite credits unlock Starter for good. 1 credit adds 20 shuffles a day for 7 days.

**Paywall triggers** (`openUpgrade`): `zip_export` (studio Share panel, 402 from export), `shuffle_limit` (429 on regenerate),
`remove_badge` (Share panel, and the badge on the canvas), `portfolio_limit` (publish 403, dashboard "New portfolio"),
`pro_feature` (own domain, marked Soon). None of them fire in the resume builder. The sheet's CTA goes to `/dashboard/billing`,
not to checkout, and signed-out users go to signup first. Path from the pricing page: paid CTA → `/signup?plan=x` → billing → `PlanBuy` → Razorpay. That is 3 screens and an email confirmation before a payment form.

## 2. Diagnosis

1. **The path to pay is long and was broken.** Pricing → signup → confirm email → log back in → billing → buy. The 1 billing visit fits that.
   Even with signup fixed, the email-confirmation step sits between intent and payment. On the signup page, Google OAuth is the only fast route.
2. **Non-India visitors can't pay.** `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL=0` (local `.env`; check prod).
   With it off, `guessCurrency()` forces INR, and `/api/billing/checkout` rejects USD.
   A UK, German or Gulf visitor reads "$9" on /pricing (`PlanPrice` picks USD from the time zone) and then sees "Get Starter · ₹399" on billing.
   A Razorpay account without international payments usually declines foreign cards, so these visitors probably can't pay at all. That is about half the search audience.
3. **The prices don't match from screen to screen.** /pricing shows the live price with the Diwali strike-through. Billing cards show the static `PLAN_CARDS.price` ("$9", "$39 per year") and the `inr` line. The UpgradeSheet shows "$9 one time" to Indian users, with no offer.
   An Indian user sees ₹279, then $9, then ₹279 again. Mismatched prices cost trust right before payment.
4. **The value metric doesn't fit most of the traffic.** Most visitors come for the free resume builder and tools. On pricing, the only paid feature for resumes is "200 saved resumes", so a resume-builder visitor finds nothing to buy.
   The plans charge for portfolio *output* (badge, ZIP, count). That is fine for the portfolio product, but the page never says who each plan is for: job seekers, freelancers or students.
5. **Pro is hard to justify.** Most job seekers need one portfolio. Pro's case is 5 portfolios, daily visits and a domain that isn't built yet.
   Pro for a month (₹299) costs almost as much as Starter forever (₹399), and it gives more only while it lasts. That makes Starter the obvious pick, which is the intent. Pro will sell rarely, and that is fine.
6. **Trust signals are missing where the decision happens.** `/refund-policy` offers a full refund within 7 days, no questions asked, but the pricing page never mentions it. There are no testimonials, no count of published sites, and no example portfolio next to the plans.
   The FAQ on /pricing (ids 11, 10, 12, 9, 0) doesn't cover refunds, payment safety or "what happens when Pro ends".
7. **The page has no event to diagnose with.** There is no `pricing_cta_click` event, so "read for 28 s, then left" can't be split into people who left and people who clicked into signup.
8. **Stale copy.** The cancel flow says visit counts are "not built yet", but the dashboard shows them. The Pro card lists "Visit counts for each page" without a note, which is correct, so only the cancel flow copy is out of date.

## 3. Ranked fixes

| # | Issue | Impact | Fix | Priority | Effort |
|---|---|---|---|---|---|
| 1 | Foreign buyers can't pay, or see $ and then get charged ₹ | ~half of search visitors | Turn on Razorpay International payments (needs KYC approval), then set the flag. Until then, show non-India visitors the rupee price with "≈ $5" next to it and "Indian rupee checkout, international cards may not work", and offer a waitlist email for dollar checkout | P0 | S code + account approval |
| 2 | Pay path is 5 steps | Main funnel | Paid CTA on /pricing: if signed in, open `BuyButton` checkout right there. If signed out, use Google OAuth with `next=/dashboard/billing?buy=starter` and auto-open checkout on arrival. Have the UpgradeSheet CTA open checkout instead of linking to billing | P0 | M |
| 3 | Prices differ between pricing, billing and the sheet | Trust at the moment of payment | Render `PlanPrice` (live, local currency, with offer) on billing cards and in UpgradeSheet. Remove the static `price`/`inr` strings from the UI | P1 | S |
| 4 | No measurement | Can't tell what works | Track `pricing_cta_click {plan, currency, signedIn}`, `billing_view`, `checkout_opened`. Mark `checkout_started`/`checkout_paid` as GA4 key events | P1 | S |
| 5 | Refund policy and payment safety hidden | Hesitation | Line under the cards: "7-day full refund, no questions. Pay with UPI, card or net banking through Razorpay." Add FAQ items on refunds and "when Pro ends" | P1 | S |
| 6 | Resume visitors have nothing to buy | Low intent on pricing | Add a "Resume only?" line: "The resume builder and PDF are free. Pay only if you want a portfolio site without our badge." This sets expectations and avoids a dead end. Longer term: decide whether resume features belong in Starter | P2 | S |
| 7 | No proof | Conversion | Under the plans: 2 to 3 live paid-plan portfolios (no badge) with links, plus "N portfolios published" once N is respectable | P2 | S |
| 8 | Stale cancel copy | Credibility | Change the `missing_feature` body to "Planned for Pro: your own domain." | P3 | XS |

## 4. Pricing page copy changes

- H1 now: "Free to publish. Pay once to make it yours." Keep it. Change the lead to:
  "Make your resume and publish your portfolio for free. Pay once, ₹399 in India, to take the badge off and download your site."
  For non-India visitors, show the live currency. Don't hard-code it.
- Who each plan is for, one line under each name: Free, "Trying it, or one job hunt". Starter, "Job seekers who want a clean, badge-free site". Pro, "Freelancers and people with several roles to show".
- Starter summary: "One payment. No badge, and the code is yours." Change it to "One payment, ₹399. No badge, unlimited designs, and the site files are yours."
- Paid CTAs: "Get Starter" becomes "Get Starter for ₹399" (live price), with "No subscription" below the button.
- Below the cards: "7-day full refund, no questions asked. UPI, cards and net banking through Razorpay. Nothing renews."
- Diwali: the strike-through already shows. Add "Price for Indian rupee payments" so non-India visitors don't hunt for the offer.

## 5. Experiments (run after fixes 1 to 4; traffic is low, so judge on clicks into checkout, not on payments)

1. **Checkout on the pricing page vs. through billing.** For signed-in users, half get a direct checkout on /pricing and half go to billing. Metric: `checkout_started` / pricing visitors. Expect a large effect, so ~100 visitors per arm can tell.
2. **Lead with Starter vs. lead with Free.** Order the cards Starter, Free, Pro on mobile, or make Starter the first column, against the current order. Metric: Starter `pricing_cta_click` rate. Risk: fewer free signups. Watch `sign_up`.
3. **Price-anchor test (India only, after Diwali).** ₹399 vs. ₹499 for Starter, shown only to new visitors.
   Trade-off: ₹499 may lower conversion. Revenue per visitor is the deciding metric, and the sample needed is large, so treat it as a 4 to 6 week test. Run it only once there are ≥30 checkouts a month. Before then, the result is noise. Don't cut prices to "fix" zero conversions while the funnel itself is broken.

## 6. Churn and cancel flow gaps

There are no subscriptions, so involuntary churn (dunning) doesn't apply. The real churn is that Pro passes lapse and nobody renews them.
`CancelFlow.tsx` already has survey → matched offer → confirm, a visible way out and no dark patterns. Gaps:
- **No expiry reminder.** Pro buyers get no email 7 days and 1 day before the pass ends ("Your Pro pass ends on X. Renew for ₹1,499, or move to Starter for ₹399 and keep no-badge for good"). Without it, nobody renews. This is the biggest retention gap.
- **No win-back** after expiry or downgrade. Send one email 14 days later with the live offer, if one is running.
- "Too expensive" on Pro points to `/dashboard/billing` ("See Starter"). Open Starter checkout in place, and show the credit price in rupees (₹399) instead of "$9 (₹399 in India)".
- "Got the job" on Pro links "Download a ZIP first" to `/build`, the empty builder, not to the studio Share panel for their site. Link to the right portfolio.
- No reason to stay on Free or Starter after "got the job". Add "Keep your link live for the next search" and an opt-in "remind me in 6 months" email. Job seekers come back.
- Exit survey reasons are good. Add "Payment didn't work" now that foreign cards fail (fix 1) and route it to support.
- Track `cancel_flow_finished` outcomes per reason in the admin console once there are paid users. The save rate means nothing before that.
