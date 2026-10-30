# Going live: environment and accounts

Paste these in **Netlify → Site configuration → Environment variables** (scope: Production; "Contains secret values" on for everything not starting with `NEXT_PUBLIC_`). After changing any of them, trigger a new deploy: Next.js bakes `NEXT_PUBLIC_*` values in at build time.

## 1. Environment variables

| Name | Where you get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Type it | `https://dossier-cv.com` (no trailing slash). |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Type it | `hello@dossier-cv.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → `anon` `public` key | Public by design. |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → `service_role` key | Secret. Never in a `NEXT_PUBLIC_` name. |
| `RATE_LIMIT_SALT` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Secret. Never change it later (it would reset everyone's daily limits). |
| `ADMIN_USER_IDS` | Supabase → Authentication → Users → your row → User UID | Comma-separated if several. |
| `GROQ_API_KEY` (or `GROQ_API_KEYS`) | https://console.groq.com → API Keys | `OPENROUTER_API_KEY` from https://openrouter.ai/keys is the fallback. |
| `BREVO_API_KEY` | Brevo → top-right menu → SMTP & API → API Keys → Generate | Secret. |
| `BREVO_SENDER_EMAIL` | Brevo → Senders, Domains → a verified sender | `hello@dossier-cv.com` |
| `BREVO_SENDER_NAME` | Type it | `Dossier` |
| `CONTACT_INBOX` | Type it | Where contact-form messages go, e.g. `hello@dossier-cv.com`. |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard in **Live mode** → Account & Settings → API Keys → Generate Key | Starts with `rzp_live_`. |
| `RAZORPAY_KEY_SECRET` | Shown once next to the key id | Secret. Copy it immediately; regenerate if lost. |
| `RAZORPAY_WEBHOOK_SECRET` | You make it up (use the generate command above) and type the same value in the webhook form (section 3) | Secret. |
| `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL` | Set to `1` only after Razorpay approves International payments | Unset: everyone pays in rupees (UPI, Indian cards, net banking). |
| `CRON_SECRET` | Generate (command above) | Secret. The daily email job sends it. |
| `NEXT_PUBLIC_GA_ID` | Google Analytics → Admin → Data streams → Measurement ID | Optional; the code defaults to `G-TVF4GDK6G0`. |
| `NEXT_PUBLIC_CLARITY_ID` | Clarity → Settings → Overview → Project ID | Optional; defaults to `yv0n7udwvu`. |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project settings → Project API key (`phc_…`) | Optional; defaults to your current key. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Same page | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console → Settings → Ownership verification → HTML tag → the `content` value | Only if you verify with the meta tag. |

**Never set in production:** `DEV_UNLIMITED`, `LLM_DEBUG`. The build (`scripts/check-env.mjs`) stops a production deploy if required values are missing or the site URL points at localhost.

## 2. Supabase

1. SQL editor: run `supabase/migrations/20261030120000_admin_segments.sql`, then `20261031120000_billing_views_email.sql`, then `20261101120000_portfolio_writes_server_only.sql` (once each, in that order, before the deploy).
2. Authentication → URL Configuration: Site URL `https://dossier-cv.com`; Redirect URLs `https://dossier-cv.com/**`, plus `http://localhost:3000/**` and `http://localhost:3001/**` for local testing.
3. Authentication → Providers → Google: the client id/secret from Google Cloud Console → APIs & Services → Credentials (OAuth client). Its authorized redirect URI is the one Supabase shows on that page.
4. Authentication → Emails → SMTP settings: use Brevo SMTP (Brevo → SMTP & API → SMTP tab: server, port 587, login, SMTP key) with sender `hello@dossier-cv.com`, so signup and reset emails come from your domain. Paste `docs/email-templates/*.html` into the matching templates.

## 3. Razorpay (live)

1. **Activate the account:** Dashboard → Account & Settings → Business settings / KYC. Unregistered individual: PAN, Aadhaar, bank account; website `https://dossier-cv.com`, which must show pricing, terms, privacy, refund policy (`/refund-policy`) and contact details.
2. **Live keys:** switch the dashboard to Live mode → API Keys → Generate → paste into Netlify (section 1).
3. **Webhook (live mode):** Account & Settings → Webhooks → Add new webhook:
   - URL: `https://dossier-cv.com/api/billing/webhook` (the real domain, not netlify.app)
   - Secret: your `RAZORPAY_WEBHOOK_SECRET`
   - Events: `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`, `payment.dispute.lost`
   - Test-mode webhooks are configured separately; add the same one in Test mode if you test on the live site with test keys.
4. **International cards (optional):** Account & Settings → International payments → Request activation (Razorpay may ask for more documents). After approval set `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL=1` and redeploy. Until then foreign visitors see dollar prices on the marketing page but checkout charges rupees, and foreign cards are declined.
5. **Payment methods:** Account & Settings → Payment methods: make sure UPI, cards and net banking are on.

## 4. Netlify

1. Environment variables from section 1 → Deploys → **Trigger deploy → Clear cache and deploy site**.
2. Functions → `daily-emails` appears as a scheduled function (runs 04:30 UTC).
3. Domain management: `dossier-cv.com` primary, `www` redirects (already in `netlify.toml`).

## 5. Before taking real money

1. The three security items from the review are fixed (webhook duplicate check, unsubscribe confirm page, server-only portfolio writes).
2. Check `https://dossier-cv.com/refund-policy` loads (Razorpay checks for it; linked in the footer).
3. Run `docs/TESTING_2026-10-31.md` section 4 on the live site with **test keys** first, then swap to live keys and make one real ₹399 purchase with your own UPI, then refund it from the dashboard and confirm the plan goes back to Free.

## 6. Go-live order (one sitting, about an hour)

1. Supabase SQL editor: run the three migrations in order (section 2.1). Each must say "Success".
2. Netlify: paste every variable from section 1 with **live** Razorpay keys, `NEXT_PUBLIC_SITE_URL=https://dossier-cv.com`, and leave `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL` unset until Razorpay approves international payments.
3. Netlify → Deploys → **Trigger deploy → Clear cache and deploy site**. The deploy log must pass `check-env` (it fails the build if a required value is missing).
4. Razorpay (Live mode) → Webhooks → add the webhook (section 3.3).
5. Run section 7 top to bottom. Do not announce the launch until every box is ticked.

## 7. Verify on the live site

Use a normal browser window for the checks, plus one private window for "visitor" checks.

**Basics**
- [ ] https://dossier-cv.com loads; https://www.dossier-cv.com and https://dossier-cv.netlify.app redirect to it.
- [ ] https://dossier-cv.com/robots.txt and /sitemap.xml load.
- [ ] Sign up with a new email: the confirmation email arrives from `hello@dossier-cv.com`, the link opens dossier-cv.com (not localhost), you land on the dashboard.
- [ ] Google sign-in returns to dossier-cv.com.
- [ ] Forgot password: the email arrives, the link works.

**Product**
- [ ] Build: upload a resume PDF (under 4 MB), the site appears, Publish works, the dashboard shows the site with its link.
- [ ] Open the link in the private window and tap once; reload the dashboard after a minute: "Visits, 7 days" shows 1. Opening it while signed in as the owner does not add a visit.
- [ ] Resume builder: make a resume, download the PDF, it appears under Resumes on the dashboard.
- [ ] Settings → Emails: untick, save, reload: stays unticked.

**Payments (live, real money, your own UPI or card)**
- [ ] Dashboard → Plan & billing → **Get Starter · ₹399** → the Razorpay popup opens and shows UPI (QR and UPI apps), cards and net banking.
- [ ] Pay ₹399 with your own UPI app (scan the QR on a computer, or tap a UPI app on the phone).
- [ ] Toast "Starter is on"; the dashboard header says **Starter plan**; the "Made with Dossier" badge is gone from your site; a receipt email arrives from `hello@dossier-cv.com`.
- [ ] Razorpay Dashboard (Live) → Transactions → Payments: the payment shows `captured`.
- [ ] Razorpay → Webhooks → your webhook → recent deliveries show `200` for `order.paid` and `payment.captured`.
- [ ] Supabase → Table editor → `subscriptions`: one row, `product = starter`, `status = active`. `payment_events`: rows with `processed_at` filled.
- [ ] Refund it: Razorpay → the payment → **Issue refund** → full amount. Within a few minutes the dashboard says **Free plan** again and the badge returns. `subscriptions.status` becomes `refunded`.
- [ ] Repeat once with **Pro for a month · ₹299** to see "until <date>" in the dashboard header, then refund.

**Email and jobs**
- [ ] Admin console (admin.dossier-cv.com) → "Email me one copy of every app email": all arrive; Gmail → Show original → SPF, DKIM, DMARC all PASS.
- [ ] Next morning: Netlify → Functions → `daily-emails` → the 04:30 UTC run logged `200` with `{"picked":…,"sent":…}`.

**Analytics**
- [ ] In the private window (not opted out), click around: PostHog → Activity shows the pageview; GA4 → Realtime shows a user; Clarity shows a session within ~30 minutes.
- [ ] Visit https://dossier-cv.com/?notrack=1 in your own browsers so your visits stop counting.

**If something fails**
- Checkout says "Payments are not set up correctly on our side": the live key pair is wrong or from Test mode. Regenerate in Live mode, paste both values, redeploy.
- Paid but the plan did not switch: check Razorpay → Webhooks deliveries. A non-200 response is retried automatically; fix the cause (usually a missing `RAZORPAY_WEBHOOK_SECRET` or wrong URL) and the next retry grants the plan.
- "International cards are not supported": expected until Razorpay approves international payments.

## Testing international cards in test mode

Set `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL=1` in `.env.local` (done), restart, choose "Pay in US dollars", and use an international test card: Visa `4012 8888 8888 1881` or Mastercard `5555 5555 5555 4444`, any future expiry, any CVV. `4100 2800 0000 1007` is an Indian card and fails on dollar orders. Card numbers: https://razorpay.com/docs/payments/payments/test-card-details/

## 8. International payments (customers outside India)

**What the code does already (no code change needed):**
- Visitors outside India see dollar prices on the landing page, `/pricing` and billing (from their time zone). India sees rupees.
- With `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL=1`, checkout creates a **USD** order for them: Starter $9, Pro $7/month or $39/year, festival discounts applied. The server checks the amount again before granting the plan, so USD orders grant exactly like INR ones.
- Without the flag, the server refuses USD orders and everyone is charged in rupees, which foreign cards cannot pay until Razorpay approves international payments.
- A person can switch currency on the billing page ("Pay in rupees instead" / "Pay in US dollars instead").

**Steps to switch it on:**
1. Razorpay Dashboard (Live mode) → **Account & Settings → International payments** (or Payment methods → Cards → International) → **Request activation**. Razorpay reviews the website (pricing, refund policy, terms, privacy and contact pages must be live) and may ask for more documents. Approval usually takes a few working days.
2. After approval, check **Payment methods**: International cards on. Optional: **PayPal** (Payment methods → Wallets → PayPal, link a PayPal Business account). It then appears automatically in the checkout popup for dollar orders and converts better abroad than cards alone.
3. Netlify → Environment variables → add `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL` = `1` → **Clear cache and deploy** (it is baked in at build time).
4. Do the same request in **Test mode** if you want to test dollar payments there; until then test mode also declines international cards.

**Money and paperwork:**
- Razorpay settles dollar payments to your Indian bank in rupees, after conversion and fees (international card fees are higher than domestic; see Razorpay's pricing page).
- Sales to foreign customers are an export of services. Keep the payment reports Razorpay gives for each settlement for your income tax filing; ask a CA about GST registration and an LUT once yearly turnover nears ₹20 lakh.

**Verify (after approval and deploy):**
1. Set your computer's time zone to a non-Indian one (e.g. New York) and reload, or on the billing page press "Pay in US dollars instead".
2. Pricing shows `$9` / `$39`; Plan & billing buttons show `$`.
3. Pay with a real foreign card (or in Test mode: Visa `4012 8888 8888 1881`, Mastercard `5555 5555 5555 4444`).
4. Razorpay → Payments shows the payment in USD, `captured`; the plan switches on; Supabase `subscriptions.currency = USD`.
5. Refund it from Razorpay and confirm the plan goes back.
