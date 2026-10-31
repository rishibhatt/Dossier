# Security, env and SEO audit (2026-11-01)

Code-level audit of the repo at `2e5de3a` (clean tree). Report only: no code changed. Severity: **High** = exploitable now or hurts the core loop, **Medium** = real weakness, needs a condition, **Low** = hygiene.

## Summary

| # | Sev | Area | Finding |
|---|---|---|---|
| S1 | High | Security | Open redirect: `safeNextPath` lets `/\t/evil.com` through |
| S2 | High | Security | Anyone can dump every published portfolio with the public anon key |
| E1 | Medium | Env | `check-env` would not catch `NEXT_PUBLIC_*_API_KEY` or `*_KEY` names |
| S3 | Medium | Security | CSP is report-only, has `'unsafe-eval'` and no report endpoint |
| S4 | Medium | Security | Quota check is count-then-insert: parallel requests get past it |
| S5 | Medium | Security | Retired JSX engine still ships (`/live-preview`, `new Function`) |
| S6 | Medium (verify) | Security | Password sign-in runs from the server, so Supabase's per-IP limit sees Netlify's IP |
| G1 | High | SEO | Shared portfolio links show the Dossier home card, not the person |
| G2 | Medium | SEO | "Show in Google" for portfolios cannot be turned on, and `/p` duplicates `/u` |
| G3 | Medium | SEO | `/build` is indexable but redirects visitors to `/signup` |
| others | Low | all | See each section |

No secret is reachable by the browser. Every `NEXT_PUBLIC_*` value is public by design.

## Fix status (2026-11-01, not yet deployed)

**Deploy order matters:**
1. Deploy the app code.
2. Then apply `supabase/migrations/20261102120000_security_hardening.sql`.

Why this order:
- The code works before the migration. Quotas fall back to the old count-then-insert, and throttles fail open.
- The code currently in production reads portfolios with the anon key. Applying the migration first would make every `/p` page return 404.

| # | Status | Change |
|---|---|---|
| S1 | Fixed | `safeNextPath` rejects control characters and `\`, resolves the path, and returns only same-origin path, query and hash |
| S2 | Fixed | Migration drops the public select policy and adds owner-only select. `/p` reads one row by slug with the service role |
| S3 | Partly | JS `'unsafe-eval'` is now dev only. Google Fonts were added (portfolios need them). `/api/csp-report` logs `[csp]`. Set `CSP_ENFORCE=1` after a week with no reports from our own pages |
| S4 | Fixed | `consume_quota` RPC takes an advisory lock, counts and inserts in one step |
| S5 | Fixed | Deleted `src/features/jsx-engine`, `/live-preview`, `/api/jsx-engine` and `designSpecAdapter.ts` |
| S6 | Fixed (own throttle) | Sign-in: 20 per IP and 10 per email per 15 min. Sign-up and reset: per hour. Uses a new `rate_events` table. Supabase CAPTCHA is still recommended |
| S7 | Fixed | Username column grant revoked; the API writes it with the service role after the reserved-name check |
| S8 | Fixed | `resumes_size_cap` check constraint |
| S9 | Fixed | One counted view per IP per site per day |
| S10 | Fixed | The acknowledgement email no longer includes anything the sender typed |
| S11 | Fixed | Publish, username and refine routes return fixed messages and log the details |
| S12 | Fixed | The admin host comes from `request.nextUrl.hostname` |
| S13 | Open | `designConfig` validation is still shallow |
| E1 | Fixed | The name regex now covers `KEY` and `API`, and values that look like keys are rejected |
| E2 | Fixed | `BILLING_LIVE=1` makes missing Razorpay keys a build error. Warns on a `rzp_test_` key in production |
| E3 | Fixed | `.env.example` rewritten with every variable and un-ignored |
| E4 | Fixed | LLM modules import `server-only` |
| E5 | Fixed | Site URL falls back to Netlify's `URL` |
| G1 | Fixed | `/p` and `/u` set their own title, canonical, OG and Twitter tags. New card at `/og/site/<slug>` |
| G2 | Fixed | "Show in Google" toggle in the dashboard and the Share panel. Canonical prefers `/u/<name>` for a single site. Opted-in sites go into the sitemap (hourly) |
| G3 | Fixed | `/build` is noindex |
| G4, G6 | Open | Content work: real `lastmod` dates; JSON-LD on the hub pages |
| G5, G7 | Fixed | Orphan tool OG route deleted; robots.txt no longer names `/live-preview` |

---

## 1. Security

### S1 (High): open redirect through a tab or newline in `next`

- **Where:** `src/lib/auth/safeNext.ts:8`. Used at `src/proxy.ts:81`, `src/app/auth/callback/route.ts:15` and `:51`, `src/features/auth/components/OAuthSection.tsx:47`, `src/features/auth/actions/auth.actions.ts:82` and `:117`.
- **Problem:** the check only rejects `//` and `/\`. The URL parser deletes tab and newline characters anywhere in the string, so `"/\t/evil.com"` passes the check and then becomes `//evil.com`. Verified with Node: `new URL("/\t/evil.com", "https://dossier-cv.com")` gives `https://evil.com/`.
- **Scenario:** an attacker sends `https://dossier-cv.com/login?next=%2F%09%2Fevil.com`.
  - A visitor who is already signed in is redirected to evil.com at once by `proxy.ts:81`.
  - A visitor who signs in with Google lands on evil.com after `auth/callback`.
  - evil.com shows a fake "session expired, sign in again" page and collects passwords.
- **Fix:**
  - Reject any character in `\x00`–`\x1f` and any `\`.
  - Then resolve the path, `new URL(raw, "https://x.invalid")`, and require that the origin is unchanged.
  - Return `pathname + search + hash` from the resolved URL, not the raw string.

### S2 (High): `published_portfolios` can be read in bulk with the anon key

- **Where:** `supabase/migrations/20260427120000_published_portfolios.sql:13-15`. The policy is `published_portfolios_select_public ... using (true)`, and no later migration drops it (`20261007120000_phase0_foundation.sql:66` keeps it on purpose).
- **Problem:** the anon key ships in every page. PostgREST accepts `select=*` with no filter.
- **Scenario:** one request, `GET https://<project>.supabase.co/rest/v1/published_portfolios?select=slug,user_id,payload` with header `apikey: <anon key>`, returns every portfolio:
  - unlisted `/p/` slugs that were meant to be private by link;
  - owner `user_id`s;
  - the full payload, including the email, phone and location from each resume.
  This is a bulk scrape of personal data, and it bypasses the noindex.
- **Fix:**
  - Add a new migration: drop `published_portfolios_select_public`, and create `published_portfolios_select_own` (`to authenticated using (auth.uid() = user_id)`). The dashboard needs this.
  - Make `loadPublishedBySlug` (`src/lib/portfolio/published.ts:10-18`) read with `createAdminSupabaseClient()` and `.eq("slug", slug)`, the same way `loadPublishedByUsername` already does.
  - `portfolio_views_select_own` still works, because its subquery runs as the owner.

### S3 (Medium): the CSP does not protect anything yet

- **Where:** `next.config.ts:9-24` and `:31`.
- **Problems:**
  - The header is `Content-Security-Policy-Report-Only`.
  - `script-src` includes `'unsafe-eval'`. Only the retired JSX engine needs it (see S5).
  - There is no `report-to` or `report-uri`, so violations reach nobody.
- **Scenario:** any future HTML injection runs script, because nothing is blocked. With `'unsafe-eval'` added, it can also use `eval`.
- **Fix:**
  - Remove `'unsafe-eval'`. Keep `'wasm-unsafe-eval'`, which Typst needs.
  - Add `report-uri` pointing at a small `/api/csp-report` endpoint, or at PostHog.
  - Run it for a week, then rename the header to `Content-Security-Policy`.
  - Later, move to nonces (proxy.ts can set them; see `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`) so `'unsafe-inline'` can go.

### S4 (Medium): parallel requests get past the quota check

- **Where:** `src/lib/api/guard.ts:111-131`. It counts `usage_events`, then inserts a row, in two separate requests.
- **Problem:** the count and the insert are not atomic.
- **Scenario:** an anonymous visitor fires 30 `POST /api/tools-polish` requests at once. All of them read `count = 0` before any insert lands, so all 30 LLM calls run against a cap of 5 a day. The same works for signed-in `parse`, `regenerate` and `publish`. It burns Groq and OpenRouter free-tier quota.
- **Fix:**
  - Move the check into one `security definer` RPC, `consume_quota(subject, kind, limit)`. It takes `pg_advisory_xact_lock(hashtext(subject||kind))`, counts, then inserts, and returns allowed or blocked.
  - Revoke execute from anon and authenticated, as the other RPCs do.

### S5 (Medium): the retired JSX engine still ships

- **Where:**
  - `src/app/live-preview/*` (public, not gated);
  - `src/features/jsx-engine/jsxRenderer.tsx:20`, which uses `new Function`;
  - `src/app/api/jsx-engine/generate/route.ts`, which already returns 410.
- **Problem:** dead code that evaluates strings keeps an eval sink in the bundle and is the only reason `'unsafe-eval'` is in the CSP.
- **Scenario:** a future bug that writes attacker data into the live-preview session (`?s=`) becomes code execution on dossier-cv.com.
- **Fix:**
  - Delete `src/app/live-preview`, `src/features/jsx-engine` and the 410 route.
  - Remove `/live-preview` from `robots.ts` and from `ROUTES`.
  - Then remove `'unsafe-eval'` (S3).

### S6 (Medium, verify in Supabase): sign-in rate limits see the server's IP

- **Where:** `src/features/auth/actions/auth.actions.ts:76-104`. Sign-in and sign-up call Supabase Auth from the Netlify function. The admin login form does the same.
- **Problem:** Supabase applies its per-IP auth limits to the Netlify egress IP, not the visitor's.
- **Scenario:**
  - An attacker can guess passwords for one account from many IPs, and only the shared server limit applies.
  - Or one abuser trips that shared limit, and every real user sees "too many requests".
- **Fix:**
  - Turn on CAPTCHA protection in Supabase Auth (Turnstile or hCaptcha) and pass the token in `signInWithPassword` and `signUp`.
  - Add your own per-IP throttle in the action, using `usage_events` with kind `login` and `hashIp`.

### Low

| # | Where | Problem and scenario | Fix |
|---|---|---|---|
| S7 | `20261007120000_phase0_foundation.sql:28` (`grant update (username)`), `api/profile/username/route.ts:30` | The reserved-name check runs only in the API. `PATCH /rest/v1/users?id=eq.<me>` with `{"username":"admin"}` and the user's own JWT skips it, which gives `/u/admin`, `/u/support` or `/u/dossier` for impersonation. | Enforce the reserved list in the DB (a check trigger), or revoke the `username` column grant and write through the admin client in the route. |
| S8 | `20261020120000_resumes.sql:24-26` | Users can insert and update `resumes` directly over REST. That skips `parseResumeBody`'s size and shape checks, so a user can store multi-MB JSON blobs. Only the row count is limited. | Add a `check (pg_column_size(data) + pg_column_size(design) < 300000)` constraint, or make writes server-only like portfolios. |
| S9 | `api/views/route.ts:14` | No per-IP cap, so a script can inflate the view counts that lifecycle emails report (already noted in the code). | Add a per-`ip_hash` daily cap through `usage_events`. |
| S10 | `api/contact/route.ts:56-60` | Sends an acknowledgement email to any address, with a name the sender chose. It is limited to 3 an hour per IP and 5 a day per address, but a botnet could still use the Brevo sender for spam, which hurts deliverability. | Drop the acknowledgement, or leave the sender's name and message out of it. |
| S11 | `api/portfolio-refine-design/route.ts:62`, `api/profile/username/route.ts:37`, `api/publish-portfolio/route.ts:81,94,111` | Raw Postgres or LLM error text goes back to the client, which leaks schema and provider details. | Log it server-side and return a fixed message. |
| S12 | `src/proxy.ts:19-21` | The admin host is detected from `x-forwarded-host`, which the client can set. That bypasses the "hide /admin with a 404" step on the main domain. Login, the ID list and aal2 MFA still protect the console. | Use `request.nextUrl.hostname`, or trust only `host`. |
| S13 | `api/build-design`, `api/publish-portfolio` (`designConfigSchema` is `z.custom`, `src/lib/validations/designConfig.ts:17`) | Only a shallow shape check runs, so arbitrary nested JSON (up to 1 MB) is stored in a public payload. React renders it safely (style props, CSS vars), so this is a robustness issue. | Write a real zod schema for tokens, or strip to known keys before storing. |

### Checked and fine

- **Razorpay:**
  - Webhook: HMAC over the raw body, constant-time compare, idempotent `payment_events`, retries on failure.
  - Verify: signature checked, `notes.user_id` must equal the caller, amount checked against the price table, grant through a definer RPC.
  - Checkout: the amount comes from the server.
- **Cron:** `CRON_SECRET` compared in constant time; fails closed when unset.
- **Admin:** every page and action goes through `getAdminState`, which checks the ID list (server env) and aal2 MFA. Actions are zod-validated and audited. `serverActions.allowedOrigins` is set.
- **RLS:**
  - Users can update only harmless columns (the `plan` takeover is closed).
  - Every definer function revokes execute from anon and authenticated and pins `search_path`.
  - Tables with no policy (payment, email, contact, audit) deny all clients.
  - Portfolio writes are server-only (`20261101120000`).
- **Portfolio XSS:**
  - `linkHref` (`src/lib/portfolio/links.ts:3`) turns `javascript:` into `https://javascript:...`.
  - Text goes through React. The CSS is static, and theme values are CSS variables.
  - There is no `dangerouslySetInnerHTML` on user data. JSON-LD is built from repo content only.
- **Uploads:** PDF only, 4 MB cap, sign-in required (anonymous `parse` is 0), parsed in memory. No URL fetching, so no SSRF.
- **Other routes:** `/dev/*` and `/api/dev/llm` return 404 in production. Unsubscribe needs a uuid token, and GET changes nothing. The referral cookie is httpOnly.
- **Headers:** HSTS, nosniff, `X-Frame-Options`, Referrer-Policy and Permissions-Policy are set, and `poweredByHeader` is off.
- **Quota store:** fails closed in production when the service key is missing.

---

## 2. Environment variables

**No leak found.**
- Every secret is read only in server code, and no `"use client"` file reads a non-public variable.
- `.env*` is gitignored, and no env file is tracked.
- A pattern scan of tracked files found no Groq, OpenRouter, Razorpay, Brevo or JWT keys.

### Public by design (fine)

| Variable | Why it is fine |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | RLS is the boundary. S2 is the exception that has to be fixed. |
| `NEXT_PUBLIC_POSTHOG_KEY`, `_PROJECT_TOKEN`, `_HOST`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` | Analytics and verification IDs; ingest-only. |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL` | Config flags. |
| `RAZORPAY_KEY_ID` (returned by `api/billing/checkout/route.ts:25`) | Razorpay's public key ID. Checkout needs it. |

### Server-only (correct)

`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `GROQ_API_KEY(S)`, `OPENROUTER_API_KEY`, `BREVO_API_KEY`, `CRON_SECRET`, `RATE_LIMIT_SALT`, `ADMIN_USER_IDS`, `CONTACT_INBOX`.

### Findings

| # | Sev | Where | Problem and scenario | Fix |
|---|---|---|---|---|
| E1 | Medium | `scripts/check-env.mjs:19-23` | The guard regex is `SECRET\|SERVICE_ROLE\|PRIVATE\|PASSWORD\|TOKEN`. `NEXT_PUBLIC_GROQ_API_KEY`, `NEXT_PUBLIC_BREVO_KEY` or `NEXT_PUBLIC_RAZORPAY_KEY_SECRET_X`-style names (anything ending in `KEY`) pass. One wrong prefix ships a paid key to every browser. | Add `KEY\|API` to the regex, and keep the allowlist (`ANON_KEY`, `POSTHOG_KEY`, `POSTHOG_PROJECT_TOKEN`). Also fail if any `NEXT_PUBLIC_*` value starts with `gsk_`, `sk-`, `rzp_live_`, `xkeysib-` or `eyJ` (except the anon key). |
| E2 | Low | `scripts/check-env.mjs:37` | Missing Razorpay keys are only a warning, even in production. After launch, a deploy without them silently turns checkout off. Nothing flags `rzp_test_` keys in production either. | Once billing is live: under `enforce`, make missing keys an error, and warn when `RAZORPAY_KEY_ID` starts with `rzp_test_`. |
| E3 | Low | `.gitignore:34` (`.env*`) | This also ignores `.env.example`, so it is not committed, and it is stale. It lists unused `NEXT_PUBLIC_DOSSIER_URL` and `NETLIFY_TOKEN_ENCRYPTION_KEY` and lacks about 20 variables in use (Razorpay, Brevo, `CRON_SECRET`, `RATE_LIMIT_SALT`, `ADMIN_USER_IDS`, `CONTACT_INBOX`, `EMAIL_SIGNIN_ALERTS`, `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL`, the PostHog, GA and Clarity IDs, `INDEXNOW_KEY`). | Add `!.env.example`. Regenerate it with empty values and commit it. |
| E4 | Low | `src/lib/llm/providers/groq.ts`, `openrouter.ts`, `src/lib/llm/registry.ts`, `src/lib/ai/groqClient.ts` | These read API keys but lack `import "server-only"`. Not a leak, because Next inlines only `NEXT_PUBLIC_*`, but a client import would fail at runtime instead of at build. | Add `import "server-only"`. |
| E5 | Low | `src/config/site.ts:3-4` | `siteConfig.url` falls back to `http://localhost:3000`. A deploy preview built without `NEXT_PUBLIC_SITE_URL` emits localhost canonicals, sitemap and OG URLs. Production is protected by check-env. | Fall back to `process.env.URL` (Netlify) before localhost. |

`DEV_UNLIMITED` is safe: `src/lib/billing/plans.ts:49` ignores it when `NODE_ENV=production`.

---

## 3. SEO

The 2026-10-24 audit's code fixes are in place: `llms.txt`, no root canonical, home title, one-hop www redirect, computed template count. robots.txt allows all public paths, names the sitemap and does not block AI crawlers. Every marketing page goes through `buildPageMetadata`, which sets an absolute self-canonical, OG and Twitter tags. Account, auth, resume editor, admin, preview and 404 pages are noindex. Only new issues follow.

### G1 (High): portfolio links share the Dossier home card

- **Where:** `src/app/p/[slug]/page.tsx:10-20` and `src/app/u/[username]/page.tsx:11-22`. These set `title`, `description` and `robots`, but no `openGraph` or `twitter`.
- **Problem:** Next merges metadata shallowly (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`, "Overwriting fields"). Both pages therefore inherit the root layout's `og:url = https://dossier-cv.com/`, `og:title` = the site default, and the site image.
- **Scenario:** a user posts `dossier-cv.com/u/priya` on LinkedIn or WhatsApp. The preview says "Free Resume Builder and Portfolio Website…" with the Dossier card, and its link points at the home page, not Priya. Sharing a portfolio is the main way new users find the product, and this weakens it.
- **Fix:**
  - In both `generateMetadata` functions, set `openGraph: { type: "profile", url, title: doc.meta.title, description: doc.meta.description, images: [...] }` and a matching `twitter`.
  - Add a share-card route, for example `/og/p/[slug]` built with `ImageResponse`: name, role, and the theme color.

### G2 (Medium): portfolios can never be indexed, and `/p` duplicates `/u`

- **Where:**
  - `indexable` is only ever read (`src/app/(dashboard)/dashboard/page.tsx:225` shows "Hidden from Google").
  - No route or UI sets it, and since `20261101120000` clients cannot update the table.
  - `/p/[slug]` has no canonical, while `/u/[username]` serves the same row.
- **Scenario:**
  - A user who wants their portfolio found under their own name has no switch, so every portfolio is noindex forever.
  - If one is ever made indexable, `/p/<slug>` and `/u/<name>` index as duplicates.
  - The opt-in portfolio pages that were planned as a long-tail SEO source can never exist.
- **Fix:**
  - Add a `PATCH /api/portfolio-visibility` route (owner check, admin client) and a toggle in the dashboard.
  - In `/p/[slug]`, when the owner has a username, set `alternates.canonical` to `/u/<username>`.
  - Optionally add indexable `/u/*` pages to the sitemap.

### G3 (Medium): `/build` is indexable but visitors cannot reach it

- **Where:** `src/app/(marketing)/build/page.tsx:12` uses the default `indexable: true`. `src/proxy.ts:7` puts `/build` behind login, so a signed-out visitor gets a 307 to `/signup`.
- **Scenario:** Google already lists `/build` (2026-10-24 audit). Searchers who click it land on a signup wall, and Google sees an indexable canonical that redirects.
- **Fix:** set `indexable: false` and add `/build` to the `robots.ts` disallow list, or make `/build` a public landing page.

### Low

| # | Where | Problem | Fix |
|---|---|---|---|
| G4 | `src/app/sitemap.ts:12` | `SITE_UPDATED = "2026-10-20"` is the `lastmod` for home, tools, keywords, FAQ and others, regardless of later edits. Google learns to ignore a `lastmod` that is wrong. | Give tools and roles real `updated` dates like posts and templates have, or omit `lastModified` where unknown. |
| G5 | `src/app/(marketing)/tools/[slug]/opengraph-image.tsx` | Dead route: the page points its image at `/og/tools/<slug>` (`page.tsx:34`), so this file only builds an unused hashed URL. | Delete it. |
| G6 | `/pricing`, `/tools`, `/resume-keywords`, `/blog` | Still no JSON-LD (open item 7 from the 2026-10-24 audit; confirmed by grep). | SoftwareApplication with Offers on `/pricing`; ItemList on the hubs; Blog on `/blog`. |
| G7 | `src/app/robots.ts:7` | It still names `/live-preview`. Once S5 deletes the route, remove it there too. `/r/` invite redirects are crawlable but land on the noindexed `/invite`, which is fine. | Update when S5 lands. |

---

## Suggested order

1. **S1 and S2.** Small changes that close real exposure. S2 needs a migration applied in Supabase.
2. **G1.** Portfolio share cards.
3. **E1.** Tighten the `check-env` regex before more keys are added.
4. **S5, then S3.** Delete the JSX engine, drop `'unsafe-eval'`, add a CSP report endpoint, then enforce.
5. **S4 and S6.** Atomic quota RPC; Supabase CAPTCHA and a login throttle.
6. **G2 and G3**, then the Low items.
