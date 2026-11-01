# Double down: 6 users to 50, 2026-11-01

Builds on `PLAN_2026-10-30.md` (directories, SEO, pricing) and `referrals.md`, and does not repeat them. It covers only what changes now that 6 real people are building portfolios.

Constraint: the founder stays anonymous. Everything below speaks as "Dossier" or "the Dossier team".

## What already exists (no new code needed)

| Lever | Where | Status |
|---|---|---|
| "Made with Dossier" badge on free portfolios, with UTM `utm_source=portfolio&utm_medium=badge` | `src/components/portfolio/DossierCredit.tsx` | Live |
| Double-sided referral credit when the invited friend publishes | `src/lib/referrals/server.ts`, `/dashboard/referrals` | Live |
| Invite prompt right after publish ("you both get a credit") | `InvitePrompt` in `src/features/studio/PublishDialog.tsx` | Live |
| Lifecycle emails: activate, resume_to_site, published, invite, winback | `src/lib/email/templates.ts`, `runLifecycleEmails` | Check that it is scheduled and that `BREVO_API_KEY` is set in production |
| Activation cohort (joined, saved resume, published, paid) | `/admin` overview | Live |

The engine is built. What it lacks is people going through it and someone watching the result.

## The loop to feed

```
Visitor -> signs up -> builds resume -> PUBLISHES portfolio -> puts link on LinkedIn/CV/email signature
   ^                                                                   |
   +------------- recruiters, friends, classmates see badge <----------+
```

A published portfolio is the aha moment and also the ad. An unpublished draft does nothing for anyone. So the number to push is **published portfolios**, not signups.

## Week 1: the 6 users (highest return, costs only time)

### 1. Look at each of them in `/admin/users`
For each user, note: signed up when, saved a resume (y/n), published (y/n), plan, sign-in method. If they published, open the live portfolio. Check it on a phone too.

### 2. Send each one a personal email from hello@ (not a template blast)
Two versions. Edit the bracketed parts by hand for every user.

**A. Has not published yet**

> Subject: Your Dossier portfolio
>
> Hi [first name],
>
> Thanks for trying Dossier. We saw you started [a resume / a portfolio] and wanted to check whether anything got in the way of publishing it.
>
> If you reply with what you are applying for, we will look at your draft and send back three concrete suggestions. And if something broke or confused you, we want to hear it. You are one of our first users, so your answer changes what we build next.
>
> The Dossier team

**B. Has published**

> Subject: We looked at your portfolio
>
> Hi [first name],
>
> Your portfolio at [link] is live. We had a look, and here are three quick ideas: [specific idea 1], [specific idea 2], [specific idea 3].
>
> Two questions, if you have a minute:
> 1. How did you first hear about Dossier?
> 2. What almost stopped you from finishing?
>
> If it is useful to you, the best place for the link is your LinkedIn Featured section. Our guide: https://dossier-cv.com/blog/how-to-add-portfolio-to-linkedin
>
> The Dossier team

Why it works: question 1 fills the attribution gap (nothing records signup source yet). Question 2 tells you exactly what to fix first. The three suggestions are concierge help that no competitor offers at this size.

### 3. Thank-you offer for anyone who replies
Upgrade them to Starter for free (admin user page) with no strings. Then ask: "Would you be OK with us showing your portfolio as an example?" Only feature anyone with written permission.

### 4. Log the answers
Keep one row per user: source, job target, blocker, what they liked, OK to feature. After 6 replies, patterns appear (one channel, one blocker). Those decide weeks 2 to 4.

## Week 1: product nudges (small code)

| # | Change | Why |
|---|---|---|
| P1 | **Done 2026-11-01.** Record signup source: the proxy saves first-touch `utm_*`, `ref`, click id, referrer host and landing page in the `dx_src` cookie (90 days), and signup copies it to `users.signup_source`. Shown as a "Source" column in `/admin/users` and a line on each user page. Needs migration `20261103120000_signup_source.sql`. | Today you can only guess where users come from. Every other decision depends on this. |
| P2 | **After publish: a "Put it on LinkedIn" step** in the publish dialog, with a copy-link button and the 3-step guide inline. Track `linkedin_cta_click`. | Gets each portfolio seen. LinkedIn is where the target user's recruiters look. |
| P3 | **Confirm the lifecycle email job runs in production.** Check the email log in Supabase for `life:*` rows in the last week. | If it isn't running, users who stall get no nudge. |

## Weeks 2 to 4: get more people in (no ad spend)

Ranked by expected signups per hour of work, for this product and audience (job seekers, freshers, India gives the best click rate in Search Console).

1. **College placement cells and bootcamps (India first).** Email 5 a week offering free Starter for a whole batch: "Every student gets a resume and a live portfolio link before placements." One yes can bring 50 to 300 users. Use a batch-specific UTM (`utm_source=college&utm_campaign=<name>`) so P1 records it.
2. **Directory launches** from `PLAN_2026-10-30.md` section 2. Do them now if not done: Peerlist, Uneed, Microlaunch, SaaSHub, AlternativeTo (as an alternative to Read.cv and Zety), There's An AI For That. They give backlinks, which also fix the "Discovered, not indexed" problem.
3. **Reddit help, as the brand account.** Answer 3 questions a day in r/resumes, r/developersIndia, r/freshers_india, r/cscareerquestions. Help first. Link a free tool (ATS checker, LinkedIn About generator) only when it answers the question.
4. **Showcase posts on the LinkedIn Company Page.** With permission, a before/after: the resume PDF next to the live portfolio. One per week. Each featured user will likely reshare it to their own network, which is real reach for a page with few followers.
5. **Product Hunt, once there are 10 or more showcase portfolios** and P1 is live. Launching earlier wastes the one-time spike.

## What to stop or postpone

- More programmatic pages (examples, keywords): 106 pages are already waiting to be indexed.
- Paid ads: not until P1 shows which message converts and checkout works.
- Head terms like "ats resume" and "linkedin headline": position 60 to 98, months away.

## Numbers to watch every Monday

| Metric | Where | Now | Target by 2026-12-01 |
|---|---|---|---|
| Real signups (not test) | `/admin` | 6 | 50 |
| Published portfolios | `/admin` cohort | check | 25 |
| Signups with a known source | `/admin/users` after P1 | 0% | 90% |
| Referral credits earned | `/dashboard/referrals` totals, `credit_ledger` | check | 5 |
| Indexed pages | Search Console, Pages | 26 | 60 |
| Clicks from search | Search Console | 7 in 3 weeks | 50 a month |

## UTM tags for every link you post

Search, AI answers and social sites are recognised from the referrer without tags. Tag every link you control, because many apps (WhatsApp, LinkedIn mobile, email) send no referrer. Lowercase, no spaces.

| Where | Link |
|---|---|
| LinkedIn Company Page post | `https://dossier-cv.com/?utm_source=linkedin&utm_medium=social&utm_campaign=<post-topic>` |
| LinkedIn page "Visit website" button | `...?utm_source=linkedin&utm_medium=profile` |
| X / Instagram bio | `...?utm_source=x&utm_medium=profile` / `utm_source=instagram&utm_medium=profile` |
| Reddit answer | `...?utm_source=reddit&utm_medium=community&utm_campaign=<subreddit>` |
| Directory listing | `...?utm_source=<directory>&utm_medium=directory` (peerlist, uneed, alternativeto...) |
| College or bootcamp email | `...?utm_source=college&utm_medium=partner&utm_campaign=<college-name>` |
| Product Hunt | `...?utm_source=producthunt&utm_medium=launch` |
| Lifecycle and outreach email | `...?utm_source=email&utm_medium=<lifecycle or outreach>&utm_campaign=<email-kind>` |

Already tagged in code: the "Made with Dossier" badge (`utm_source=portfolio&utm_medium=badge`, plus `ref=<slug>`) and invite links (`/r/<code>`, shown as "invite").
