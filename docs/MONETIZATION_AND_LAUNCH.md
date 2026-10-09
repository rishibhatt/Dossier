# Dossier: pricing, payments, organic growth and launch plan

Status: proposal. Nothing here is built except the free tools, blog and role pages. Prices and fees are hypotheses to test, and provider fees and availability change, so check each provider's current pricing page before you commit.

## 1. Where the money comes from

The free tools bring in people with a job to do this week: pass an ATS, fix a resume. Dossier's paid value is what comes next: a portfolio site, and help applying faster.

Today's plans (`src/lib/billing/pricing.ts`): Free, Starter $9 one time, Pro $39 a year. Problems:

- **$9 is the "false traction" price.** It attracts people who would never pay a real price, and it is hard to raise later.
- **Starter is one payment, so revenue never recurs.** Job seekers leave when they are hired, so recurring revenue needs a reason to stay (several portfolios, freelancers, career switchers).
- **There is no metered product.** Your biggest cost is LLM calls, and nothing charges for them except plan caps.

### Proposed packaging (test it, do not trust it)

| Plan | Price | For |
|---|---|---|
| Free | $0 | Unlimited ATS scans, 1 portfolio with the badge, 3 shuffles a day |
| Starter | $19 one time | No badge, unlimited shuffles, ZIP export. The "get hired" plan |
| Pro | $12 a month or $79 a year | 5 portfolios, custom domain, visit counts, PDF resume, AI tailoring included |
| Tailor packs | 5 for $7, 20 for $19 | AI rewrites your resume bullets and a cover letter for one specific job |

Why this shape:

- The ATS scan stays free and deterministic (zero cost per use), so it can draw unlimited traffic.
- **Tailor packs** are the natural paid upgrade from the scan. The scan says "you are missing 7 keywords", and the pack fixes the resume for that job. The metric (one job application) matches the value, and it covers LLM cost.
- A monthly Pro plan with a pause option suits people who only need it for 2 to 3 months. The annual price is about 45% below twelve months of monthly, which makes annual the visible deal.
- Offer local-currency prices, for example INR, rather than only converting USD. A lower price in India is common and converts better. Decide the numbers from your first 100 checkouts.

## 2. Psychology to use, and how (ethically)

| Principle | Where to apply it |
|---|---|
| Reciprocity, zero-price effect | Free ATS scan and role pages give value first, with no sign-up |
| Endowment, IKEA effect | Show their own resume as a site before sign-up. They have already built it |
| Goal-gradient | After the scan: "63 to 90 if you fix these 3". Re-scan shows the new score |
| Commitment and consistency | Scan, then save report, then publish, then upgrade. Ask for one small step each time |
| Anchoring, decoy, default | Show Pro first, Starter marked "Most picked", annual pre-selected |
| Mental accounting | "$19 once, about the price of one lunch" next to "one interview can pay your rent" |
| Regret aversion | 7-day refund, stated on the pricing page and checkout |
| Loss aversion | "Your report is saved for 7 days" only if it is true |
| Social proof | Real counts only ("1,240 resumes scanned"), shown once they are real |

Do not use fake scarcity, fake countdowns or invented testimonials. They break trust and can breach consumer law.

## 3. Payment provider options

Pick based on where your legal entity and bank account are, and how much tax admin you want.

| Option | Cards (global) | UPI / India | Tax handling | Effort | Watch out for |
|---|---|---|---|---|---|
| **A. Razorpay only** | Yes, but international cards must be enabled on the account | Best in class: UPI, netbanking, wallets, UPI autopay | You handle GST and export paperwork | Medium | International acceptance and approval can be slow |
| **B. Stripe only** | Best developer tools, Apple and Google Pay | Limited for new India accounts. Check current eligibility | You handle VAT and sales tax, or add Stripe Tax | Low | Account availability depends on your country and entity |
| **C. Merchant of record only** (Paddle, Lemon Squeezy, Polar, Dodo Payments) | Yes | Varies by provider. Check UPI support | The provider is the seller and handles global VAT, GST and sales tax | Lowest | Higher fee per sale, payouts follow their schedule |
| **D. Hybrid: Razorpay for India, merchant of record or Stripe for the rest** | Yes | Yes, through Razorpay | Mixed | Highest | Two integrations, so hide them behind one interface |

My recommendation: **D**, with a merchant of record for non-India buyers, because you are targeting global buyers and want UPI. A merchant of record removes the tax work for a solo builder. If you want one provider to start, choose **C** if it supports UPI for you, otherwise **A**.

Questions that decide it: Where is your legal entity and bank? Are you GST-registered? Do you prefer subscriptions or one-time sales? Do you want to handle tax yourself?

## 4. Payment flow to build (provider-neutral)

Reuses what exists: `users.plan`, `users.plan_expires_at`, `resolveEffectivePlan`, the credit ledger.

**Tables**
- `orders` (id, user_id, product, amount, currency, provider, provider_order_id, status, created_at, paid_at). Status: `created`, `pending`, `paid`, `failed`, `canceled`, `refunded`.
- `subscriptions` (user_id, provider, provider_subscription_id, status, current_period_end, cancel_at_period_end).
- `webhook_events` (provider, event_id unique, payload, processed_at). This gives idempotency.

**Rules**
1. **The server sets the price.** The client sends a product id only. The server looks up the amount and creates the order with the provider.
2. **A redirect is not proof of payment.** The success page shows "confirming..." and polls `orders.status`. Only a verified webhook marks an order `paid`.
3. **Verify every webhook.** Check the signature on the raw body, reject old timestamps, and insert the event id before acting so a repeat does nothing.
4. **Grant access in one database transaction:** mark the order paid, set `plan` and `plan_expires_at` (or add Tailor credits to the ledger), and record the event. Make it safe to run twice.
5. **Failure paths:** declined card or UPI timeout sets `failed` and shows a retry button with a different method. A closed checkout sets `canceled`. Neither grants anything.
6. **UPI is asynchronous.** The payment can stay pending for minutes (collect request) or complete in a UPI app and return later (intent). Treat `pending` as normal, time out after the provider's expiry, and always finalize from the webhook.
7. **Subscriptions:** on renewal, extend `plan_expires_at`. On a failed renewal, keep access for a 3 to 7 day grace period while the provider retries and you email the user, then fall back to Free. On cancel, keep access until the period ends. `resolveEffectivePlan` already handles the expiry.
8. **Refunds and chargebacks:** a refund webhook sets `refunded` and removes the plan or credits.
9. **Reconciliation:** a daily job lists provider payments from the last 48 hours and fixes any order whose webhook never arrived.
10. **Receipts and invoices:** email a receipt for every payment. For India, a GST-compliant invoice if you are registered.
11. **Test:** use the provider's sandbox for success, decline, UPI timeout, duplicate webhook, out-of-order webhook, refund and failed renewal.

## 5. Organic growth and automatic indexing

What exists: the ATS scanner, 6 guides, 14 role pages, sitemap, structured data.

1. **Google:** verify in Search Console (env var added) and submit `/sitemap.xml`. Google's Indexing API is only for job posts and live streams, so do not use it for these pages. Index speed comes from the sitemap, internal links and fresh content.
2. **IndexNow (Bing, Yandex and others):** add a key file and ping on every deploy for new and changed URLs. I can build this: a key in `public/`, plus a Netlify post-deploy step that submits the URL list.
3. **Sitemap hygiene:** add real `lastModified` dates instead of omitting them, so crawlers know what changed.
4. **More programmatic pages, only with unique data:** "[role] resume summary examples", "[role] resume skills", "ATS-friendly resume for [role]". Do not add city pages, because they would be thin.
5. **Link magnets:** the ATS scanner is the asset people link to. Pitch it to career-services pages, bootcamps and resume subreddits' resource lists.
6. **Close the loop:** end every scan with "save this report" (email capture), which builds an owned list.

## 6. Launch plan

**Readiness gate (Simple, Lovable, Complete).** One clear job: "see your resume as a site and fix it for an ATS". Before a full public launch you need: checkout working end to end, privacy and terms pages, a refund policy, analytics live, and the `quota_unavailable` production error resolved.

| Phase | When | What |
|---|---|---|
| Internal | week 0 | 10 to 20 people you know run the scan and build a site. Fix what breaks |
| Alpha | week 1 | Email-capture waitlist. Invite 50 from LinkedIn and friends. Offer lifetime Starter free in exchange for feedback |
| Beta | week 2 | Open the free tools. Post your own story on LinkedIn and X ("I built a free ATS scanner"). Share in communities where it is allowed, helpfully and not as an ad |
| Early access | week 3 | Switch on payments for a first batch with a founder price. Collect testimonials and screenshots |
| Full launch | week 4 | Product Hunt (Tuesday to Thursday), Show HN for the ATS scanner, Indie Hackers, BetaList. All-day replies |

**Channels (ORB).** Owned: blog, email list from scan reports, referral program. Rented: LinkedIn (strongest for job seekers), X, Reddit. Borrowed: career YouTubers, college placement cells and bootcamps, newsletters on job hunting.

**North star and funnel:** resumes scanned, then portfolios started, then published, then paid. Review weekly. Start with these targets and adjust: 3 to 5% of scanners start a portfolio, 5 to 10% of published users pay.

**After launch:** onboarding emails, comparison pages ("Dossier vs [resume builder]"), a changelog page, and a monthly new tool or feature.
