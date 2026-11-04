# Portfolio for every profession — plan

Status: planned, nothing built. Decisions made 2026-11-04.

## Goal

Dossier portfolios today read as tech or new-grad sites. Widen them to interior designers, architects, actors, choreographers, doctors, CAs, lawyers, engineers, PMs and studios. Each profession should get a layout built for how it shows work: images for an architect, a showreel for an actor, trust and credentials for a doctor.

Keep token cost per portfolio low and the output reliable, responsive and award-level in taste.

## Decisions

| Topic | Decision |
|---|---|
| LLM provider | Keep the free Groq and OpenRouter chain in `src/lib/llm/registry.ts`. Add a daily health check (see Risks). |
| How designs are made | Hand-built templates made of section variants. The LLM returns small JSON only. No per-user code generation. |
| Media | Links and embeds only. No uploads. |
| No media yet | Placeholder art the user replaces. |
| Motion | User picks calm, expressive or awwwards per site. Each template sets the default. |
| Gating | All templates free. The awwwards motion tier is Pro. |
| Template count | 2–3 per group, 8–12 new in total. |
| Existing 21 presets | Merge the strong ones into the new groups. Retire weak ones. Published sites keep rendering. |
| Unsure profession | Show a profession picker with the AI guess preselected. |
| Socials | Core, creative, performer and professional sets (list below). |
| References | Study 3–5 award-level sites per group before designing. Designs stay original. |
| Order | Visual group end to end first, then performer, licensed, builder/leader. |

## Where things stand today

- `src/lib/design/inferType.ts` maps every user to one of four types: developer, designer, product, student.
- `src/lib/design/templates/specs.ts` holds 21 presets. They differ in fonts, colours and spacing, not in structure.
- Sections (`src/components/portfolio/sections/`) are resume-shaped only: hero, about, highlights, experience, projects, skills, education, certifications, contact.
- Section motion uses framer-motion (`src/lib/animations/presets.ts`). `gsap` and `@gsap/react` are installed.
- The LLM reads the resume and refines design from a prompt. It does not write site code.

## Profession groups

| Group | Who | What the page leads with |
|---|---|---|
| Visual | Interior designer, architect, photographer, studio | Large images, project galleries, before/after, process |
| Performer | Actor, choreographer, dancer, musician | Showreel, credits, headshots, agency contact |
| Licensed | Doctor, CA, lawyer | Trust: registration numbers, services, hours, location, booking link |
| Builder/leader | Engineer, PM, executive | Case studies, metrics, outcomes |

The type `PortfolioProfileKind` in `src/types/dossier.ts` and `DesignUserType` in `src/types/designEngine.ts` gain a `group` plus a finer `profession` string. Old values map to the builder/leader group so saved portfolios keep working.

## New section types

Add to `PortfolioSection` in `src/types/dossier.ts`, to `SECTION_CATALOG` in `src/features/studio/sectionCatalog.ts`, and to the section registry.

| Section | Data | Main users |
|---|---|---|
| `gallery` | items: image URL, caption, project link; layout: grid, masonry, full-bleed | Visual |
| `beforeAfter` | pairs of image URLs with labels | Interior, architect |
| `showreel` | video URL (YouTube, Vimeo), poster image | Performer, visual |
| `credits` | role, production, director/company, year | Performer |
| `services` | name, short description, optional price | Licensed, studio |
| `testimonials` | quote, name, role | All |
| `press` | outlet, title, link, date | Visual, performer |
| `licences` | body, registration number, region, year | Licensed |
| `publications` | title, venue, year, link | Licensed, academic |
| `practice` | address, hours, booking link, map link | Licensed |
| `socials` | platform, URL | All |

Each section ships 2–3 visual variants so templates can mix them.

## Media by link

- Images: any `https://` image URL. Check on add that it loads and is an image. Warn for Google Drive and Dropbox share links, which often stop loading, and show how to get a direct link.
- Video: YouTube and Vimeo embeds, loaded on click (poster first) to keep pages fast.
- Instagram: link card, not the official embed. The embed is heavy and often blocked.
- Use `next/image` with `remotePatterns` only for known hosts. Other hosts render with a plain `<img>` and `loading="lazy"`.
- Placeholder art: tasteful neutral images per group, marked as placeholders in the data.

Open question: when a site still has placeholders, should publish be blocked or should it warn? Recommendation: warn, and show a badge in the studio until every placeholder is replaced.

## Social platforms

- Core: Instagram, LinkedIn, X, YouTube, GitHub, website.
- Creative: Behance, Dribbble, Pinterest, Vimeo, Houzz, ArchDaily.
- Performer: IMDb, Spotify, SoundCloud, TikTok, Mandy, Backstage.
- Professional: Practo, Doctolib, ResearchGate, Google Scholar, Medium.

Detect the platform from the URL host. Extend `SocialIcon.tsx`. The suggested set changes by group; all platforms stay available.

## What the LLM returns

One call after resume parsing, JSON only:

```json
{
  "group": "visual",
  "profession": "interior designer",
  "confidence": 0.82,
  "template": "atelier-grid",
  "sections": ["hero", "gallery", "beforeAfter", "services", "testimonials", "socials", "contact"],
  "variants": { "hero": "split-image", "gallery": "masonry" },
  "copy": { "heroLine": "...", "about": "..." }
}
```

- Below a confidence threshold (start at 0.6), the studio shows the profession picker.
- Target about 2–4k tokens per portfolio, input plus output.
- Validate with zod. On bad output, fall back to the group's default template and section order.

## Templates

- 2–3 per group. Pilot: visual group.
- Each template is code: layout, section variants, type scale, palette, default motion tier.
- Build at design time with the taste-skill, impeccable, hallmark, gsap-react and gsap-scrolltrigger skills. These add no runtime tokens.
- Install taste-skill before the design work: `npx skills add Leonxlnx/taste-skill`.
- Must hold at 360, 768, 1024, 1440 and 1920 px wide. No horizontal scroll. Touch targets at least 44 px.

## Motion tiers

| Tier | What it does | Plan |
|---|---|---|
| Calm | Fades and short rises on reveal | Free |
| Expressive | Staggered reveals, image parallax, text split on headings | Free |
| Awwwards | Pinned sections, horizontal gallery scroll, scrubbed timelines, cursor effects | Pro |

- New templates use GSAP and ScrollTrigger through `useGSAP` with cleanup. Existing framer-motion templates stay as they are.
- `prefers-reduced-motion` drops every tier to calm.
- On small screens and touch devices, the awwwards tier turns off pinning and cursor effects.
- Lazy-load ScrollTrigger only for the expressive and awwwards tiers.
- Animate transforms and opacity only.

## Merging existing presets

Review the 21 presets in `specs.ts`. Map each one to a group or retire it. Keep each preset id resolvable so published sites render unchanged. Retired presets stop showing in the picker.

## Phases

1. **Foundation.** Profession groups and types, the profession picker, the new LLM JSON call, the `socials` section, placeholder support, motion tier setting and Pro gate.
   Built 2026-11-04. Changes from the plan above:
   - No new LLM call. The existing resume-reading call returns one more short field, `b.p` (profession in 1–3 words), about 10 extra tokens. Code checks it against the resume title in `guessProfession` (`src/lib/portfolio/professions.ts`). When they disagree, or neither names a profession, `portfolioMeta.professionAsk` is set and the studio asks.
   - No separate `socials` section. Profile links already live in the Contact section and show as the hero icon row. Instead, 14 platforms were added to `src/lib/portfolio/links.ts`, and the quick-add list leads with the group's platforms (`GROUP_SOCIALS`), with the rest behind More.
   - Placeholder art was built, then removed on 2026-11-05 at the owner's request. No stand-in images anywhere. Instead, visual and performer pages get an empty Gallery or Showreel section. An empty section stays off the page, shows in the Edit list as "0 pictures", and the publish checklist asks for "Pictures of your work" or "A video of your work".
   - Motion tier is `designConfig.motion.tier`. It is kept across look changes and clamped to expressive at publish for anyone below Pro. A site published on Pro keeps the award tier after a downgrade until it is published again.
2. **Visual pilot.** Reference study, then `gallery`, `beforeAfter`, `services`, `testimonials`, `press`, plus 2–3 visual templates. Test with sample interior designer and architect profiles.
3. **Performer.** `showreel`, `credits`, plus 2–3 templates.
4. **Licensed.** `licences`, `practice`, `publications`, plus 2–3 templates.
5. **Builder/leader.** Refresh with case studies, plus merge of the existing tech presets.
6. **Cleanup.** Retire weak presets and update the marketing pages and template gallery.

Each phase ends with a check at all five widths, a reduced-motion check, a Lighthouse run on a published sample, and existing published sites rendering unchanged.

## Risks

- **Free models get retired or rate-limited.** Add a daily health check that calls each model in the chain and alerts on failure. Swap models through `LLM_MODELS` without a deploy. Revisit Gemini on Vertex AI if outages grow; the router already supports adding a provider.
- **Free tiers may train on resume text.** Note this in the privacy page, or move to a paid provider later.
- **Broken image links.** Check on add and recheck on publish.
- **Heavy motion on phones.** Tier caps on touch devices and a performance budget per template.
- **Scope.** 11 new sections and up to 12 templates is large. The pilot proves the system before the rest.

### Phases 2–5, built 2026-11-05

- **Sections** (`src/components/portfolio/sections/`): `gallery` (grid, masonry, strip, compare), `showreel` (feature, grid), `credits` (list, table), `services` (list, cards), `testimonials` (quotes, cards), `press` and `publications` (list, outlets), `practice` (card, split). Certifications gained an optional registration number.
- **Changes from the plan.** Before/after is a Gallery layout ("compare") with an optional before picture per item, not its own section. Licences use the certification number field, not a new section.
- **Media by link.** Image fields take a pasted https link. Gallery pictures are links only, so the page stays under the 1 MB publish limit. Drive, Dropbox and Google Photos share links get an explanation. Videos are lazy iframes on youtube-nocookie.com and player.vimeo.com; both are allowed in the CSP `frame-src`.
- **Templates** (`src/lib/design/templates/professionSpecs.ts`):
  - Visual: Plan (architect), Salon (interior designer), Darkroom (photographer, studio, chef).
  - Performer: Marquee (actor), Stage (choreographer, musician).
  - Licensed: Practice (doctor, therapist), Counsel (lawyer, CA, researcher).
  - Builder: Casebook (PM, executive, marketer), Blueprint (engineer).
  - Every template, old and new, has a `group`. Templates made for the person's profession rank first (+60), then templates for their group (+24).
- **Studio.** Add a section lists the field's sections first, tagged "For your field". Long navs (more than 7 links) fold into the Menu on wide layouts.
- **Dev checks.** `/dev/studio?work` and `/dev/templates/<id>?sample=work` show every new section filled.

### Not done yet

- Reference study (awwwards) per group was skipped. The 9 templates are derived from existing layouts with new type, palette, order and variants. A design pass against references is still due.
- Phase 6 retirement: no preset was retired. All 21 originals are kept and tagged with a group. The owner should choose which to hide from the picker.
- Award motion tier not seen live on a Pro account.

## Open items

- Publish with placeholders: warn or block.
- Pro price and whether the awwwards tier is the only Pro design feature.
- Final reference list per group, gathered at the start of each phase.
