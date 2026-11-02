# New traffic and signup ideas, 2026-11-03

Inputs: `ANALYSIS_2026-11-03.md` (~30 users/day, 58% Google, 14% Bing, 14% ChatGPT; India, UK, Germany, Gulf), `DOUBLE_DOWN_2026-11-01.md`, `PLAN_2026-10-30.md`, `free-tools.md`, `referrals.md`, memory notes. Skills used: marketing-ideas, free-tools, referrals.

**Left out because they are already covered or built:** the signup leak fixes, GA4 key events, `/how-it-works` and `/looks` titles, Organization schema and brand query, llms.txt and the AI-SEO pass, UK/IE/AU/CA format posts (`uk-cv-format` is live), directories, Product Hunt, Show HN, Reddit answers, college placement cell emails, LinkedIn page showcases, the founder-email outreach, the badge, `/r/` invites, ShareSteps, the gallery, the ATS job-description match (already in `atsScan.ts`), shareable score cards (T5), the summary and bullet tools, more programmatic role pages (paused), the Read.cv page, Pinterest (playbook says later), and new automated emails (owner declined).

**Score** = impact (1-5) × confidence (1-5) ÷ effort (S=1, M=2, L=3). Every link carries UTMs, so `users.signup_source` measures each idea.

| # | Idea | Group | I | C | E | Score | Owner decision or money |
|---|---|---|---|---|---|---|---|
| 1 | Migration-intent CV posts | Week | 4 | 4 | S | 16 | No |
| 2 | Bing Webmaster Tools + AI prompt log | Week | 3 | 4 | S | 12 | No |
| 3 | Quora answers as the brand | Week | 3 | 3 | S | 9 | Brand account setup |
| 4 | Share prompt after PDF download | Week | 3 | 3 | S | 9 | Yes (code, after signup fix) |
| 5 | Honest "free alternative to X" pages | Week | 4 | 4 | M | 8 | Yes (competitor naming) |
| 6 | Naukri resume headline mode | 30 days | 3 | 3 | S | 9 | Yes (verify India volume) |
| 7 | UK university careers resource-page outreach | 30 days | 4 | 2 | S | 8 | No |
| 8 | CV format by country tool | 30 days | 4 | 3 | M | 6 | Yes (new tool) |
| 9 | Telegram/WhatsApp job channel swaps | 30 days | 3 | 2 | S | 6 | No |
| 10 | GitHub README portfolio badge | 30 days | 2 | 3 | S | 6 | Yes (code) |
| 11 | Open-source the Typst templates | Bet | 3 | 3 | M | 4.5 | Yes (licence) |
| 12 | Campus ambassador program (India) | Bet | 4 | 2 | M | 4 | Yes (gives away Pro) |
| 13 | Career coach partner program | Bet | 3 | 2 | M | 3 | Yes (needs billing D1, commission) |
| 14 | German-language Lebenslauf landing | Bet | 4 | 2 | L | 2.7 | Yes (translation quality) |
| 15 | Chrome extension: tailor to this job | Bet | 3 | 2 | L | 2 | Yes (store fee $5) |

## Quick wins this week

**1. Migration-intent CV posts.** Write "German CV for Indians applying with the Opportunity Card (Chancenkarte)", "UK CV for Skilled Worker visa jobs (from India)", "CV for Gulf jobs from India: what to change". Each ends in `/resume/new` with the matching template.
- Why: the two biggest click sources (India 20, UK 8, Germany 3) meet in this search intent. `german-cv-format` gets 28.6% CTR from 7 impressions. Nothing in the repo mentions Chancenkarte. These are long-tail questions that big builders don't target and that ChatGPT answers with citations.
- First step: draft the Chancenkarte post in `src/content/blog/job-search-posts.ts` following `german-cv-format`, and run it through `/no-ai-slop`. Check the visa facts against make-it-in-germany.com before publishing.
- Metric: GSC impressions and clicks per post at 4 weeks; signups with landing page = the post.

**2. Bing Webmaster Tools and an AI prompt log.** Bing sends 14% and is the index behind ChatGPT search, which sends another 14%.
- Why: the earlier docs cover IndexNow but not Bing's own console, where you can see Bing queries and indexing problems.
- First step: sign in at bing.com/webmasters and choose "Import from Google Search Console" (5 minutes). Then write 15 prompts real users would type ("free resume builder India no payment", "make portfolio website from resume", "CV format Germany"). Run them in ChatGPT, Perplexity and Gemini once a month, and note whether Dossier is named and which URL is cited.
- Metric: Bing indexed pages, Bing clicks, and how many of the 15 prompts mention Dossier (start at 0 and track monthly).

**3. Quora answers as the brand.** Quora is heavily used in India, ranks in Google for resume questions, and is a common LLM citation source. A brand profile works without revealing the founder.
- Why: Reddit is covered, Quora is not, and Quora's audience leans more toward India and freshers.
- First step: create a "Dossier" profile with the hello@ mailbox. Answer 2 questions a day about fresher resumes, CV formats for Germany or the Gulf, and portfolio links. Link a blog post or free tool only when it answers the question, using `utm_source=quora&utm_medium=community`.
- Metric: Quora referral users in GA4; signups with source `quora`.

**4. Share prompt after the PDF download.** Today the invite only appears after a portfolio is published. More people finish a resume than a portfolio (12 starts versus 3 builds).
- Why: the referrals skill says to ask at the aha moment, and for most users that moment is the downloaded PDF. Add one line under the download confirmation: "Know someone job hunting? Send them this template", with WhatsApp and copy buttons and the user's `/r/<code>` link. No email, no popup.
- First step: once the signup fix ships, add the line to `DownloadDialog.tsx` using the existing ShareSteps and referral code. Track `download_share_click`.
- Metric: share clicks per PDF download, and signups with source `invite`.

**5. Honest "free alternative to X" pages.** Pages for `/zety-alternative`, `/resume-io-alternative`, `/novoresume-alternative` and `/canva-resume-alternative`, built from one comparison template. Lead with "PDF download free, no trial that turns into a subscription", and state fairly where the other tool is better.
- Why: people who hit a paywall at download time search for this exact thing. ChatGPT cites comparison pages for "free alternative" prompts. The `competitors` skill fits.
- First step: owner decides whether to name competitors. Then check each competitor's current pricing by hand and write the Zety page first.
- Metric: impressions and clicks for "[competitor] alternative free", and signups that land on these pages.

## Next 30 days

**6. Naukri resume headline mode.** Naukri profiles have a separate "resume headline" field (250 characters). Add a Naukri mode to the headline writer and a page `/tools/naukri-resume-headline`.
- Why: it targets India, the largest click source, and reuses `HeadlineWriter.tsx`. The Semrush notes cover the US only, so India volume is not verified.
- First step: owner checks Semrush with the database set to India for "resume headline for naukri" and "resume headline for fresher". Build only if the result is above about 500 a month.
- Metric: tool runs, upload-slot clicks, GSC position.

**7. UK university careers resource-page outreach.** Many `.ac.uk` careers services keep "useful CV tools" pages. Ask to be listed as a free CV builder with free PDF and no paywall.
- Why: UK users click at 40%, and one `.ac.uk` link is worth more than ten directory links. This is a link request, so it differs from the India placement-cell batch offer.
- First step: search `site:ac.uk "CV builder" careers` and `site:ac.uk "useful links" CV`. List 20 pages and send 5 short emails a week from hello@.
- Metric: links won (check in GSC under Links), referral users from `.ac.uk`.

**8. CV format by country tool.** `/tools/cv-format-by-country`: pick a country to see page length, photo, date of birth, personal details, paper size and spelling, then open the matching template with one click.
- Why: it turns the country posts that already work into a single linkable, interactive page that suits the multi-country mix. The data is already in the posts. Score with the skill's scorecard: demand 3, match 5, unique 4, path 5, feasibility 5, maintenance 4, links 4, share 3 = 33.
- First step: put the rows for 8 countries (IN, UK, IE, DE, AE, SA, AU, CA) into a typed data file and add an entry to `catalog.ts`.
- Metric: runs, template-open clicks, links earned.

**9. Telegram and WhatsApp job channel swaps.** Indian fresher job-alert channels on Telegram reach thousands of members each, and `attribution.ts` already detects `t.me`.
- First step: find 10 channels for freshers and off-campus jobs and offer the admin a free resource for their pinned post: the fresher resume template and ATS checker, tagged `utm_source=telegram&utm_campaign=<channel>`. No payment.
- Metric: signups with source `telegram`.

**10. GitHub README portfolio badge.** Add a "Portfolio" shields-style badge snippet to ShareSteps for developers, linking to the portfolio with `ref=<slug>`.
- Why: developer READMEs stay up for years and get seen by other developers who are job hunting. It extends the badge loop without adding emails.
- Metric: badge-copy clicks, then visits with `utm_source=github`.

## Bets (only after signups and billing work)

**11. Open-source the Typst templates.** The resume templates in `public/typst/a/templates` (42 `r0*` files) could be published as a GitHub repo and submitted to Typst Universe and awesome-typst lists, each README linking to "edit this online at Dossier".
- Why: it earns developer backlinks and a listing that keeps working without upkeep. Owner decision: the templates are a product asset, so pick a licence, or release 3 of them only.

**12. Campus ambassador program (India).** One student per college gets Pro for free plus a leaderboard, and the existing `/r/` credit stays the same. Ambassadors share in their batch WhatsApp groups.
- Why: this grows one placement-cell yes into a repeatable channel. Abuse risk: reward published portfolios, not signups, as `referrals.md` already does.

**13. Career coach and resume writer partner program.** Coaches on LinkedIn and YouTube use Dossier with their clients and earn 30% of paid upgrades.
- Needs: billing (D1) and payouts. The referrals skill's affiliate playbook applies. Money: commission only, nothing paid up front.

**14. German-language landing and Lebenslauf template.** `/de/lebenslauf-erstellen` with a tabular German template (photo, signature line).
- Why: German searches are large and Germany already converts. Risk: poor German loses trust, so a native speaker review is needed (small cost, or a user volunteer).

**15. Chrome extension that tailors your resume to the job you are viewing.** On a LinkedIn, Naukri or Indeed job page, it runs the ATS job-description match against the saved resume.
- Why: the Chrome Web Store becomes a discovery channel. Effort is large and it needs upkeep when job sites change their HTML. Money: $5 developer fee.

## Review on 2026-12-01
Signups by source for quora, telegram, invite (download), alternative pages and country posts. Prompts that mention Dossier (out of 15). Bing clicks. `.ac.uk` links won.
