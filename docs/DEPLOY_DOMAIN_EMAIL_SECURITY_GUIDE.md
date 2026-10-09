# Dossier: env vars, domain, email, security, ads

Status: guide plus audit. Nothing in this file is implemented yet. Check provider screens for exact values, since dashboards and limits change.

## Decisions made and what is now built

Chosen: Netlify stays the host, Brevo for email, `/u/username` links, hard login gate with the upload kept.

Built in code (not yet committed or deployed):
- `src/proxy.ts` (moved from the project root, where Next.js ignored it): refreshes the session and sends visitors to sign up (`/build`) or log in (`/dashboard`) with a `?next=` return path.
- Build APIs return 401 without a session. The uploaded PDF is kept in this browser for one hour (IndexedDB) and restored after sign-up or Google sign-in.
- `/u/<username>` serves a published portfolio. Publish returns that link when a username is set, otherwise `/p/<id>`.
- Security headers (CSP in report-only mode), `scripts/check-env.mjs` (runs before `npm run build`, stops a production deploy on bad env), a salt fallback with no public default, `netlify.toml`, CI (type check, lint, build, audit, gitleaks), Dependabot, and a pre-commit secret scan.

Still to do, after you answer: Brevo setup and email code (welcome, contact form, sequences, cron), payments, ads.

## 1. Environment variables

Rule: only names starting with `NEXT_PUBLIC_` reach the browser, and they are baked in at build time. Everything else stays on the server. After changing any value, redeploy.

### Required in production

| Name | Secret? | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No | `https://dossier-cv.com` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase, Project Settings, API, Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (safe because Row Level Security is on) | Same page, `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes. Bypasses all security rules** | Same page, `service_role` key. Server only |
| `RATE_LIMIT_SALT` | **Yes** | Random string. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GROQ_API_KEY` or `GROQ_API_KEYS` | **Yes** | console.groq.com, API Keys. `GROQ_API_KEYS` takes several keys separated by commas |
| `OPENROUTER_API_KEY` | **Yes** | openrouter.ai, Keys |

### Optional

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `hello@dossier-cv.com` |
| `OPENROUTER_APP_NAME`, `LLM_MODELS`, `LLM_MODELS_RESUME` | Model routing overrides |
| `LLM_DEBUG` | Leave unset in production |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GSC_VERIFICATION` | Analytics and Search Console. All are public values |

### Needed later (when each feature is built)

`RESEND_API_KEY` or `BREVO_API_KEY` (email), `CRON_SECRET` (protects scheduled jobs), `INDEXNOW_KEY`, payment keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, or the Stripe or merchant-of-record equivalents), `NEXT_PUBLIC_ADSENSE_CLIENT`.

### How to provide them

- **Local:** copy `.env.example` to `.env.local` and fill it in. `.gitignore` already blocks `.env*`. I checked: no env file is tracked, none appears in git history, and no key-shaped strings are in tracked files.
- **Netlify (UI):** Site configuration, Environment variables, Add a variable. Tick "Contains secret values" for every secret. Scope: Production, plus Deploy Previews if you use them.
- **Netlify (CLI):**
  ```bash
  netlify env:set SUPABASE_SERVICE_ROLE_KEY "<value>" --secret --context production
  ```
- Never paste a secret into chat, a commit, an issue or a screenshot. If one leaks, rotate it in its provider dashboard first, then update Netlify.

## 2. Domain: Hostinger domain, Netlify hosting

Hostinger cannot run this app on shared hosting, because Next.js needs a Node server. The simple pipeline keeps **Netlify as the host** and points your domain at it. Hostinger stays the registrar and the home of the `hello@` mailbox. (Decision pending: see questions.)

1. **Netlify:** Domain management, Add a domain, `dossier-cv.com`. Set it as the primary domain. Netlify then redirects the old `*.netlify.app` address to it. You cannot delete the default address, but you can rename the site.
2. **Hostinger DNS** (hPanel, Domains, DNS / Nameservers, DNS Zone). Keep Hostinger's nameservers so the mailbox records stay.
   - Apex `@`: an `A` record to the value Netlify shows (historically `75.2.60.5`).
   - `www`: a `CNAME` to `<your-site>.netlify.app`.
   - Do not remove the existing `MX` records. They deliver your mail.
   - Delete any default parking `A` or `CNAME` records on `@` and `www` that conflict.
3. **Netlify HTTPS:** Domain management, HTTPS, Verify DNS, then Provision certificate. Turn on Force HTTPS.
4. **Env:** set `NEXT_PUBLIC_SITE_URL=https://dossier-cv.com` and redeploy (it is baked in at build).
5. **Supabase:** Authentication, URL Configuration. Site URL `https://dossier-cv.com`. Redirect URLs: `https://dossier-cv.com/**` and `http://localhost:3000/**`.
6. **Google sign-in (if enabled):** keep the Supabase callback as the authorized redirect URI. Add `https://dossier-cv.com` as an authorized JavaScript origin.
7. **Search Console:** add a **Domain** property and verify with the DNS TXT record Google gives you. Submit `https://dossier-cv.com/sitemap.xml`. Add the new domain in Clarity, PostHog and GA4 settings.
8. **Pipeline:** Netlify, Site configuration, Build and deploy, link the GitHub repo, production branch `master`. Every push to `master` deploys to `dossier-cv.com`. Pull requests get deploy previews. I can add `netlify.toml` and a GitHub Actions check (type check, lint, build, secret scan, dependency audit).

### How to check it worked

```bash
nslookup dossier-cv.com
curl -I https://dossier-cv.com
curl -I http://dossier-cv.com        # expect 301 to https
curl -I https://www.dossier-cv.com   # expect 301 to the apex
curl https://dossier-cv.com/api/health
```

Also check: the padlock in the browser, a login and a logout, the old `netlify.app` address redirecting, `/sitemap.xml` loading, and the SSL grade at ssllabs.com.

## 3. Mailbox and automated email

**Mailbox (`hello@dossier-cv.com`, Hostinger):** use it for human mail. Hostinger's usual settings: IMAP `imap.hostinger.com` 993 SSL, SMTP `smtp.hostinger.com` 465 SSL (or 587 TLS), username is the full address. Confirm in hPanel, Emails.

**Automated mail: yes, free.** Do not send app mail through the Hostinger mailbox. It has low sending limits and weaker deliverability. Use a sending service on the same domain.

| Service | Free tier (verify) | Good for |
|---|---|---|
| Resend | 3,000 emails a month, 100 a day | Transactional mail, simple API |
| Brevo | 300 emails a day, contacts, automation, newsletters | Transactional plus newsletters and sequences in one tool |
| MailerLite or Buttondown | Free for small lists | Newsletters only |

**Auth emails (signup confirmation, password reset, magic link):** Supabase sends these. Its built-in mail is rate limited and not meant for production. In Supabase, Authentication, SMTP Settings, plug in Brevo or Resend SMTP with sender `hello@dossier-cv.com`. Then edit the templates under Email Templates.

**DNS for deliverability** (add in the Hostinger DNS zone, using the values your sending service shows):
- **SPF:** one TXT record on `@` that includes every sender. Only one SPF record may exist, so merge them.
- **DKIM:** the TXT or CNAME records from the service.
- **DMARC:** TXT `_dmarc` with `v=DMARC1; p=none; rua=mailto:hello@dossier-cv.com`, then tighten to `quarantine` after a few weeks.
- Test with mail-tester.com and MXToolbox.

**What to automate:**
- Instant: welcome email, password reset, publish confirmation, payment receipt and failed-payment notice.
- Contact form: save to a Supabase table, email you, send the sender an auto-reply. Add a honeypot field and rate limiting.
- Sequences: onboarding (day 1 "upload your resume", day 3 "publish your site", day 7 check-in), ATS-report follow-up for people who saved a report, re-engagement after 30 days of silence.
- Newsletter: monthly, double opt-in, an unsubscribe link in every email and a postal address in the footer.

**Scheduling for free:** GitHub Actions scheduled workflows or Netlify Scheduled Functions call a protected `/api/cron/...` route (header `Authorization: Bearer $CRON_SECRET`). Supabase `pg_cron` also works for database-driven jobs.

## 4. Security audit (current code)

No critical findings.

**Good:**
- No env file or secret is committed. Only the anon key is exposed to the browser.
- Row Level Security is on for every table. Users cannot change their own `plan`, because only three columns are writable. Credit and referral writes are service-role only.
- Publish, export and AI routes check the session and a per-plan quota. Quota fails closed in production.
- Redirects after login are restricted to same-site paths. The dev LLM route returns 404 in production. The old JSX engine route returns 410.

**To fix:**
| Severity | Where | Issue | Fix |
|---|---|---|---|
| Medium | `next.config.ts` | No security headers (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `nosniff`) | Add them, with CSP in report-only mode first so analytics scripts keep working |
| Medium | `proxy.ts`, `/api/parse-pdf`, `/api/build-design` | Anonymous users can run the builder and spend LLM quota | Gate `/build` and the build APIs behind login (the change you asked for) |
| Low | `src/lib/api/guard.ts:73` | `hashIp` falls back to a public default salt if `RATE_LIMIT_SALT` is unset | Fail in production when it is missing |
| Low | `src/lib/api/guard.ts:62` | IP comes from `x-forwarded-for`, which a client can spoof outside a trusted proxy | Trust only the host's header (`x-nf-client-connection-ip` on Netlify) |
| Low | `src/features/jsx-engine`, `/live-preview` | Dead code that runs `new Function` | Delete it |

**To keep env safe every time (proposed):**
1. `src/lib/env.ts`: validates required variables with zod at build, fails the production build if one is missing, and rejects any `NEXT_PUBLIC_` name that looks like a secret.
2. A pre-commit secret scan (gitleaks) and the same scan in GitHub Actions.
3. `npm audit` and Dependabot weekly.
4. Mark every secret "Contains secret values" in Netlify, and rotate the service-role key on any suspicion.

## 5. Build behind login

- Add `/build` to the protected paths in `proxy.ts`, so a visitor is sent to `/login?next=/build` (or signup from marketing buttons).
- Make `parse-pdf`, `build-design`, `regenerate-design` and `portfolio-refine-design` return 401 without a session.
- **Keep the uploaded resume through sign-up.** Save the file in the browser (IndexedDB) before the redirect, and resume the build right after login or Google sign-in. Without this, people lose their upload and leave.
- Copy for the gate: "Create a free account to build your site. 20 seconds, no card." Offer Google sign-in first. Keep the free tools open as the value-first step.
- Trade-off: a hard gate lowers builder traffic and raises account creation. It protects your LLM cost.

## 6. Publishing

Publishing already requires login and works on your domain: a published site lives at `https://dossier-cv.com/p/<10-character id>`. Free keeps one portfolio with the Dossier badge. Options for nicer links: `dossier-cv.com/u/<username>` (easy, `username` already exists in settings) or `<username>.dossier-cv.com` (needs wildcard DNS and Netlify's DNS).

## 7. Ads (Google AdSense) and money

**My advice: do not add ads yet.** Reasons:
- AdSense needs an approved site with enough original pages, a privacy policy, an About and a Contact page. New domains are often rejected at first.
- Ads on a product page lower trust and speed. Your paid plans sell a clean, badge-free experience.
- Revenue is small until you have real traffic. Ten thousand monthly page views earn very little.
- EU and UK visitors need a Google-certified consent banner.

**If you add them later:**
- Show ads only on `/blog` and `/resume-keywords` pages. Never on `/build`, the dashboard or user portfolios. Hide them for paying users.
- Integration: `NEXT_PUBLIC_ADSENSE_CLIENT`, the AdSense script loaded with `next/script` after consent, `public/ads.txt`, fixed ad slot heights to avoid layout shift.
- Payment: Google pays by bank transfer once earnings pass its payout threshold (currently $100). You need tax details and an address PIN verification.

**Earlier money than ads:** Starter and Tailor packs from the pricing plan (see `docs/MONETIZATION_AND_LAUNCH.md`). The quickest way to take UPI money is Razorpay, with a verified webhook that grants the plan. A tip jar link (Ko-fi, Buy Me a Coffee) is a stopgap.
