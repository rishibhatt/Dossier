# Setup checklist: email, admin console, indexing

Do these in order. Each step says how to check it worked. The code for everything below is already in the repo; what is left is configuration in dashboards.

## 1. Database (Supabase, SQL editor)

Run `supabase/migrations/20261010120000_email_admin.sql`. Expect "Success. No rows returned".
Check: Table Editor shows `email_log`, `contact_messages`, `admin_audit`.

## 2. Environment variables (Netlify, Site configuration, Environment variables)

You already set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (`hello@dossier-cv.com`) and `BREVO_SENDER_NAME` (`Dossier`). Add:

| Name | Value | Secret? |
|---|---|---|
| `ADMIN_USER_IDS` | Your Supabase user UUID (Authentication, Users, copy the `UID`). Several ids separated by commas | Yes |
| `CONTACT_INBOX` | Optional. Where contact-form messages go. Defaults to `NEXT_PUBLIC_SUPPORT_EMAIL` | No |
| `EMAIL_SIGNIN_ALERTS` | Optional. Set `0` to stop the "new sign-in" email | No |

Redeploy after adding them.

## 3. Brevo

1. Brevo, Senders, Domains and IPs: `dossier-cv.com` shows **Authenticated**. If not, add the DKIM, DMARC and Brevo-code records it lists in the Hostinger DNS zone. Keep one SPF record only.
2. Check: send a test from the contact form (step 7). The mail arrives in the inbox, not spam.

## 4. Supabase sign-up and password emails (these come from Supabase, not our code)

1. Brevo, SMTP and API, SMTP tab: copy the **SMTP login** and create an **SMTP key**. The SMTP key is not the API key.
2. Supabase, Authentication, Emails, SMTP Settings: enable custom SMTP. Host `smtp-relay.brevo.com`, port `587`, username = the SMTP login, password = the SMTP key, sender `hello@dossier-cv.com`, sender name `Dossier`.
3. Supabase, Authentication, Emails, Templates: paste `docs/email-templates/confirm-signup.html` into **Confirm signup** and `docs/email-templates/reset-password.html` into **Reset password**. Set the subjects to "Confirm your email" and "Reset your Dossier password".
4. Supabase, Authentication, URL Configuration: Site URL `https://dossier-cv.com`. Redirect URLs `https://dossier-cv.com/**`.
5. Check: sign up with a new address and confirm the branded email arrives. Then use "Forgot password".

Emails our code sends (through the Brevo API): welcome (once, on a new account), sign-in notice (at most once a day, older accounts), password changed, credit earned, plan changed, contact-form copy to you and an auto-reply to the sender.

## 5. Admin console on its own subdomain

1. Netlify, Domain management, Add domain alias: `admin.dossier-cv.com`.
2. Hostinger DNS: add a `CNAME` record, name `admin`, value `<your-site>.netlify.app` (the same target as `www`). Wait for the HTTPS certificate to provision.
3. Supabase, Authentication, Sign In / Providers: make sure **MFA (TOTP)** is enabled (it is free).
4. Make sure your own account has a **password**. If you signed up with Google only, use "Forgot password" once to set one. The admin sign-in uses email and password.
5. Open `https://admin.dossier-cv.com`. Sign in, scan the QR code with an authenticator app (Google Authenticator, Authy, 1Password), enter the 6-digit code. From then on you sign in with password plus a code.
6. Check: a non-admin account gets a 404. `https://dossier-cv.com/admin` is a 404 in production (the console exists only on the subdomain).

What the console does: Overview (totals, sign-ups, publishes and builds per day, plan mix, funnel, referrals, usage, newest users, subscriptions), Users (search, filter by plan, detail page), per-user plan change with an end date and credit add or remove (reason required, optional email to the user), Messages from the contact form, and an Audit trail of every change.

## 6. Netlify default address redirect

`netlify.toml` and `src/proxy.ts` both send `dossier-cv.netlify.app` to `https://dossier-cv.com` with a 301, keeping the path. Deploy previews and branch deploys stay reachable.
Check: `curl -I https://dossier-cv.netlify.app/blog` shows `301` and `location: https://dossier-cv.com/blog`.

## 7. Check the email flows

- Contact form at `/contact`: you receive the message at `hello@dossier-cv.com`, the sender receives an auto-reply, and the row shows under Admin, Messages.
- Create a new account: welcome email.
- Change a plan in Admin, Users, with "Email the user" ticked: the user receives a plan email.

## 8. Get indexed

**Google** (no API can force it):
1. Search Console, add a **Domain** property for `dossier-cv.com` and verify with the DNS TXT record. (The meta tag from `NEXT_PUBLIC_GSC_VERIFICATION` also works for a URL-prefix property.)
2. Sitemaps, submit `https://dossier-cv.com/sitemap.xml`.
3. URL Inspection: paste each of these, press **Request indexing** (about 10 a day): `/`, `/tools/ats-checker`, `/blog`, `/blog/how-to-pass-ats-resume-scan`, `/resume-keywords`, `/pricing`.
4. Check Pages, Indexing after a few days.

**Bing, Yandex and others** (instant): `.github/workflows/indexnow.yml` runs after each push to `master` and submits every sitemap URL through IndexNow. The key file is `public/faf64ad717e6887e5fc3fcb5facfdea9.txt`. You can also run it by hand: `node scripts/indexnow.mjs`.
Also add the site in Bing Webmaster Tools (import from Search Console).

## 9. Pre-launch tests

- `curl -I https://dossier-cv.com` returns the security headers.
- `/build` while signed out goes to sign-up and your uploaded PDF is still there after you create the account.
- `/privacy`, `/terms`, `/contact` load. Have a lawyer read the privacy policy and terms before you take payments.
