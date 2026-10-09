# Dossier

<p align="center">
  <strong>Your resume, set as a website.</strong><br>
  An editorial-grade portfolio builder that turns any resume PDF into a live, publication-ready site in seconds.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ecf8e?style=flat&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/LLM-Groq%20%7C%20OpenRouter-orange" alt="LLM Engine" />
</p>

---

## Overview

Traditional resumes are static, lifeless PDF documents trapped in applicant tracking systems and recruiter inboxes. **Dossier** transforms any standard resume into an elegant, interactive personal website designed with the typographical rigor of an editorial foundry type specimen sheet.

Instead of generic website templates or unconstrained AI hallucinations that produce broken layouts, Dossier uses a **hybrid intelligence pipeline**:
1. **AI Copy & Profile Extractor**: Reads the resume PDF, extracts structured career milestones, and polishes copy within strict per-upload token budgets.
2. **Deterministic Design Engine**: Translates candidate data into curated typographic systems, harmonious color palettes, and balanced grid layouts tailored to their specific career discipline (Engineering, Design, Leadership, Writing, etc.).

---

## Key Features

### 📄 Instant PDF Ingestion & Parsing
- **Zero Manual Input**: Drop any standard resume PDF into the slot; the parser extracts contact details, career timeline, education, skill sets, and highlights.
- **Fail-Safe Processing**: Includes scanned PDF detection, token-budgeted LLM extraction (via Groq with OpenRouter fallbacks), and a 100% offline regex parsing fallback so no user ever encounters an unhandled extraction error.

### 🎨 Editorial Typography & Specimen Design
- **Type Foundry Aesthetics**: Designed around bespoke typographic pairings featuring *Bricolage Grotesque*, *Inter*, *Geist Mono*, and classic editorial serif accents.
- **Dynamic Design Shuffle**: Cycle through distinct design archetypes, palette pairings, surface contrasts, and visual densities with a single click.
- **Role-Aware Layouts**: Automatically identifies candidate profession clusters and applies visual hierarchies appropriate for engineers, creative directors, founders, or product leaders.

### 🛠️ Interactive Customization Studio
- **Live Visual Editing**: Refine layouts, reword content, and adjust typography in real time (`/build` and `/dev/studio`).
- **Drag-and-Drop Structure**: Reorder resume sections effortlessly using `@dnd-kit`.
- **Responsive Previews**: Inspect responsive device viewports (desktop, tablet, mobile) with real-time CSS variable cascading.

### 🌐 Publishing, Domains & Export
- **Instant Live URLs**: Publish your portfolio instantly to a unique personal slug (`/p/[slug]`).
- **Self-Contained Export**: Download a standalone, clean HTML/CSS ZIP archive (`jszip`) that can be hosted anywhere with zero framework dependencies.
- **One-Click Netlify Deployment**: Directly deploy the generated portfolio to Netlify using encrypted OAuth/PAT integration.

### 🧰 Built-in Career Tool Suite
A collection of lightweight, client-side tools designed for job seekers:
- **Resume Checker (`/tools/resume-checker`)**: 10 instant in-browser checks assessing impact metrics, contact info, length, and weak phrasing with zero data upload.
- **Headline Writer (`/tools/headline-writer`)**: Generates high-converting portfolio and LinkedIn headlines formatted within character limits.
- **LinkedIn About Builder (`/tools/linkedin-about`)**: Produces three narrative lengths (short, standard, story) tailored for recruiters.
- **Link-in-Bio Page (`/tools/link-in-bio`)**: A minimal, elegant personal landing link for social profiles and email signatures.

### 🔐 Auth, Credits & Billing
- **Authentication**: Powered by Supabase Auth with support for Magic Links, OAuth providers, and secure session cookies.
- **Credit & Referrals**: Built-in credit balance tracking, referral links (`/r/[code]`), and subscription tiers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), CSS Custom Properties (Theme Tokens) |
| **Interactivity & DnD** | [@dnd-kit/core](https://dndkit.com/), [@base-ui/react](https://base-ui.com/) |
| **Motion & Polish** | [GSAP](https://greensock.com/), [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) Smooth Scroll |
| **Backend & Auth** | [Supabase](https://supabase.com/) (`@supabase/ssr`, PostgreSQL) |
| **AI Inference** | [Groq SDK](https://groq.com/) (primary, high-throughput) & [OpenRouter](https://openrouter.ai/) (failover) |
| **PDF Processing** | `pdf-parse` + custom layout-preserving text extractor |
| **Archiving & Export** | [JSZip](https://stuk.github.io/jszip/) |

---

## Project Structure

```text
dossier/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/          # Landing, pricing, features, tools, how-it-works, FAQ
│   │   ├── (dashboard)/          # User dashboard, billing, referrals, settings
│   │   ├── api/                  # API endpoints (parse-pdf, publish, credits, export, etc.)
│   │   ├── build/                # Portfolio creation & live editing workflow
│   │   ├── p/[slug]/             # Live published portfolio view
│   │   └── tools/                # Free career utility pages
│   ├── components/               # Reusable UI & marketing components
│   │   ├── marketing/            # Landing page sections (Hero, Specimen, FinalCta, etc.)
│   │   └── ui/                   # Shared UI primitives (buttons, dialogs, inputs)
│   ├── features/                 # Modular feature domains
│   │   ├── auth/                 # Sign-in, sign-up, session hooks
│   │   ├── billing/              # Subscription & checkout logic
│   │   ├── design-intelligence/  # Design rules and scoring
│   │   ├── jsx-engine/           # Live preview & portfolio JSX generation
│   │   ├── studio/               # Customization studio controls
│   │   └── tools/                # Free career utilities catalog & runners
│   ├── lib/                      # Core libraries & engine
│   │   ├── ai/                   # Prompt builders, LLM schemas, copy polishers
│   │   ├── design/               # Typography, color tokens, layout systems, templates
│   │   ├── llm/                  # Multi-provider routing (Groq, OpenRouter), rate limiting
│   │   ├── pdf/                  # PDF extraction & section boundary detectors
│   │   ├── pipeline/             # PDF-to-Portfolio orchestrator
│   │   └── supabase/             # Server, client & admin Supabase helpers
│   ├── styles/                   # Global styles, fonts, and theme variables
│   └── types/                    # Core TypeScript definitions
├── public/                       # Static assets and specimen artwork
├── DESIGN.md                     # Design system tokens and typography specifications
└── package.json                  # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later recommended
- **Package Manager**: `npm` (or `pnpm`)
- **Supabase Project**: Free tier or self-hosted Supabase instance
- **Groq API Key**: (Optional but recommended) for fast LLM parsing

### 1. Clone & Install

```bash
git clone https://github.com/rishibhatt/Dossier.git
cd Dossier
npm install
```

### 2. Environment Configuration

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DOSSIER_URL=http://localhost:3000

# Supabase Authentication & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# LLM Providers (Server-side only)
GROQ_API_KEY=gsk_...
# Optional OpenRouter fallback:
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Dossier

# Security & Encryption (32+ character random string for Netlify PAT encryption)
NETLIFY_TOKEN_ENCRYPTION_KEY=your-32-char-encryption-key-here

# Debugging (optional, set to 1 to log LLM latency & routing)
LLM_DEBUG=0
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build & Deployment

### Production Build

To run a production build locally with Turbopack:

```bash
npm run build
```

To run the built application:

```bash
npm run start
```

### Deploying to Netlify

Dossier is configured for deployment on Netlify using `@netlify/plugin-nextjs`.

1. Connect your repository to Netlify.
2. In the Netlify dashboard under **Site Configuration > Build & deploy > Environment**:
   - Add all environment variables listed in `.env.example`.
3. Set the build command to:
   ```bash
   npm run build
   ```
4. Set publish directory to:
   ```bash
   .next
   ```

> **Note on Case Sensitivity**: If deploying to Linux-based CI environments (such as Netlify), ensure all component imports match the exact file casing on disk (e.g. `FinalCta.tsx`).

---

## License

Private repository. All rights reserved.
