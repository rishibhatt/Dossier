# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who has a resume and needs a personal website: freshers and students, developers and designers, accountants, teachers, freelancers, career switchers. Many are not technical and many work from a phone. The job: paste or upload a resume, get a finished portfolio site, change its look until it feels right, publish a link.

## Product Purpose

Dossier turns a resume (PDF upload, later pasted text) into a portfolio website. The user can regenerate the design, edit content, publish at a Dossier link, and (on paid plans) export the site as a ZIP. Success: a first-time visitor has a publishable site within minutes, on a phone, without writing code.

## Positioning

The design variation is a rules-based design engine (palette, type, layout, hero variants, seeded shuffle) running over the user's own resume data. Regeneration is instant and never breaks, because the AI only reads the resume and polishes copy. Competing site builders start from a blank template; Dossier starts from the user's career history.

## Operating Context

Free-tier LLMs (Groq, OpenRouter fallback) for resume extraction and copy edits. Supabase for auth and data. Netlify hosting, domain dossier-cv.com. One developer builds and runs it. Users sign in to save, publish and export. Anonymous visitors can preview a parse under a per-IP daily cap.

## Capabilities and Constraints

- Plans (confirmed): Free; Starter $9 one-time; Pro $39/year. Paid buttons route to signup until billing ships in Phase 2.
- Free: 1 portfolio, public link, "Made with Dossier" badge, 3 design regenerations a day, no ZIP export.
- Starter: badge removed, unlimited regeneration for that portfolio, ZIP export.
- Pro: 5 portfolios, custom domain or subdomain, analytics, PDF resume export (these Pro extras are planned, not shipped).
- Published portfolios are noindex by default; owners can opt in.
- Runtime LLM-written JSX is retired; design variation is config-driven.
- Billing provider undecided (merchant of record, individual seller, global).

## Brand Commitments

Name "Dossier", domain dossier-cv.com. The existing colour theme stays: warm paper background, ink text, violet accent (marketing `--mk-*` tokens, app tokens in `theme.css`). Components are free to change. Copy is plain and specific; no AI-slop phrasing.

## Evidence on Hand

No real customers, testimonials, user counts or press exist. Marketing demos use clearly labelled sample resumes and sample portfolios (synthetic people). Do not fabricate logos, reviews, or statistics.

## Product Principles

1. Show the resume becoming the site; do not describe it.
2. Phone first. Every step works one-handed on a small screen.
3. Non-technical language. Say what happens and what it costs.
4. Instant to change, safe to experiment: shuffling a design never loses content.
5. Honest about limits: plans, quotas and what is a sample are stated plainly.

## Accessibility & Inclusion

WCAG AA contrast, keyboard operable, visible focus, `prefers-reduced-motion` respected (animation must degrade to the final state, never hide content).
