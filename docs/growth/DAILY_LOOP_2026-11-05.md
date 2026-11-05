# Daily growth loop, 2026-11-05

Skills used: marketing-loops (catalog: weekly-marketing-review, community-engagement, content-repurposing, directory-submission, striking-distance push), with inputs from the 2026-11-03 analysis and proposals.

## 1. What the numbers say

| Signal | Value |
|---|---|
| Signups by day | 11-01: 2, 11-02: 15, 11-03: 5, 11-04: 2, 11-05: 0 so far |
| Total users | 24 (14 resumes saved by 10 people, 6 sites published, 0 paying) |
| GA4, last 7 days | 104 users; yesterday 8 |
| Clarity, last 7 days | 192 sessions, 2.36 pages/session, 1.3 min active; yesterday 21 sessions, 43 s active |
| GSC, last 7 days | 59 clicks, 592 impressions |
| Top queries | "dossier cv" 14, "dossier resume" 12, "career dossier" 5 (brand) |
| Top countries (clicks) | India 44%, UK 22%, US 7%, Canada 5%, Germany 5% |

### Diagnosis

1. **The 11-02 peak was an event, not a trend.** 15 signups in one day, then 5, 2, 0. That shape is a one-off spike (a mention, a share, a ChatGPT answer, or a burst of brand searches) decaying back to baseline. Nothing in the site changed on 11-03 that would explain the drop, so the drop is the absence of a new event.
2. **Conversion is not the bottleneck. Traffic is.** About 22 signups from about 104 visitors in the same window is roughly 20% visitor-to-signup. That is high for a free tool. 42% of users save a resume and 25% publish a site. The product converts the people who arrive.
3. **Search traffic is still mostly brand.** About half of the 59 GSC clicks are "dossier cv / dossier resume / career dossier". Brand searches only happen after someone heard the name elsewhere. Non-brand search sends a few clicks a day. The 44 blog posts are young; they compound over 4 to 12 weeks, not days.
4. **There is no daily distribution input.** Since 11-03, commits went to product (cover letters, link-in-bio, professions). No brand social profiles exist. Batch D (off-site: Quora, Product Hunt, AlternativeTo, directories, communities) was never approved. With no daily input, daily signups fall to whatever search gives.

### What "the same growth every day" requires

At about 20% conversion, 15 signups a day needs about 75 visitors a day. Today the baseline is about 8 to 15. The gap (about 60 visitors a day) cannot come from SEO alone this month. It has to come from things done every day, by hand, that each leave a permanent link behind.

Realistic targets:

| By | Visitors/day | Signups/day |
|---|---|---|
| 2026-11-19 (2 weeks) | 25-35 | 4-6 |
| 2026-12-05 (1 month) | 50-80 | 8-15 |

Only if the daily loop below runs every day. Spikes (a Reddit post that lands, a Product Hunt day) come on top.

## 2. The daily loop (45 to 60 minutes of owner time)

The owner does the posting. Claude drafts. Nothing is auto-posted: communities ban bots and the brand is anonymous, so every post must read like a person helping.

| Block | Time | What | Where | Leaves behind |
|---|---|---|---|---|
| 1. Answer | 20 min | 3 helpful answers to real resume/CV/portfolio questions. Link only when the link is the answer (a country CV post, the free ATS checker, a template). | Reddit (r/resumes, r/developersIndia, r/cscareerquestionsEU, r/UKJobs, r/germany, r/jobsearchhacks), Quora | Permanent answers that keep sending visits |
| 2. Post | 15 min | 1 post from the content bank (section 4) | X + LinkedIn page + Instagram (same idea, native format) | Brand profile that people find after a brand search |
| 3. List | 10 min | 1 directory or launch listing from the queue (section 5) | AI/tool directories, AlternativeTo, SaaSHub, Product Hunt (once) | Backlink + referral visits + Bing/ChatGPT signal |
| 4. Nudge | 5 min | Check new signups in /admin; reply personally to anyone who published, ask them to share their site | Email | Share-loop visits from published portfolios |
| 5. Log | 2 min | Write one line: what was posted, where, link | `docs/growth/daily-log.md` | Attribution for the weekly review |

Rules:
- At most 1 link per 3 answers. Disclose "I built this" when linking Dossier.
- Never post the same text twice. Never post in a sub that bans self-promotion; answer without a link there.
- Use UTM links: `?utm_source=reddit&utm_medium=answer&utm_campaign=daily` (and `quora`, `x`, `linkedin`, `instagram`, `directory`). First-touch source is already stored in `users.signup_source`.

## 3. The weekly loops

| Loop | When | What it does | Output |
|---|---|---|---|
| Weekly review | Monday 09:00 | Compare GSC, GA4, Clarity and signups by source against last week. Flag the best and worst channel. Drop the channel that sent nothing for 2 weeks. | Short digest in `docs/growth/weekly/` |
| Striking-distance push | Monday | Find pages at position 5 to 20 with impressions; rewrite title and meta, add internal links. | Edits for approval |
| Content refill | Wednesday | Draft next week's 7 social posts and 15 answer drafts from the blog posts and new questions found. | Content bank update |
| Repurpose | Friday | Turn 1 blog post into a carousel, a thread and a short video script. | Drafts for approval |

Claude can run the weekly review and content refill as scheduled tasks once the owner says yes. Daily answering stays manual because it needs the owner's logged-in accounts.

## 4. Content bank (first week)

Each idea is built from an existing post, so every post has a real page to link.

1. "UK CV vs US resume: 5 differences" (uk-cv-format)
2. "German CV: photo or no photo?" (german-cv-format)
3. "Your resume is already a website. Here is what that looks like" (resume-to-portfolio-website), with a real published example only if its owner agreed to the gallery
4. "6 weak resume phrases and what to write instead" (resume-bullet-points-weak-phrases)
5. "Gulf job CV: what recruiters expect" (cv-format-for-gulf-jobs)
6. "Fresher resume with no experience" (resume-format-for-freshers, internship-resume-no-experience)
7. "Tailor a resume in 20 minutes" (how-to-tailor-resume-to-job-description)

India and UK give 66% of clicks: write for them first.

## 5. One-time setup (this week, about 3 hours total)

1. Create brand profiles: X, LinkedIn company page, Instagram, Reddit (pseudonymous, discloses "I built Dossier"), Quora. One mailbox per the social playbook. Then add the URLs to Organization `sameAs`.
2. Bing Webmaster Tools: import from Search Console (ChatGPT and Copilot read Bing).
3. Directory queue, one per day: AlternativeTo (as alternative to Zety, Resume.io, Canva resume), SaaSHub, Product Hunt (prepare first, launch on a Tuesday), There's An AI For That only if a feature qualifies, BetaList, Indie Hackers product page, Uneed, Microlaunch.
4. Find what caused 11-02. Check GA4 Acquisition → Traffic acquisition for 11-02 (source/medium and referrer), and `users.signup_source` for those 15 users. If one source made the spike, repeat that source weekly.
5. Ask the 6 publishers to opt into the gallery and share their site (the share panel exists).

## 6. Owner decisions

- D1. Approve batch D (off-site) and the daily loop.
- D2. Brand handle for all profiles (for example `dossiercv`).
- D3. Product Hunt launch date.
- D4. Let Claude schedule the Monday review and Wednesday content refill.
- D5. Pause new product features for 2 weeks so the hour a day goes to distribution.
