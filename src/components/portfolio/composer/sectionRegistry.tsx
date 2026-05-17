import type { ComponentType, ReactNode } from "react"
import { Diamond } from "lucide-react"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { AbstractAiPlaceholder } from "@/components/portfolio/ui/AbstractAiPlaceholder"
import { PortfolioCard } from "@/components/portfolio/ui/PortfolioCard"
import { PortfolioEmblaCarousel, PortfolioEmblaSlide } from "@/components/portfolio/ui/PortfolioEmblaCarousel"
import { SkillsMarqueeStrip } from "@/components/portfolio/sections/skills/SkillsMarqueeStrip"
import { portfolioTypo, SectionTitleFromConfig } from "@/components/portfolio/ui/PortfolioTypography"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { messages } from "@/config/messages"
import { getDirectionOverrides, resolvePortfolioCardVariant, sectionTitleClassName } from "@/lib/portfolio/directionOverrides"
import { cn } from "@/lib/utils"
import type { DesignConfig } from "@/types/designEngine"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import { HeroAurora } from "@/components/portfolio/sections/hero/HeroAurora"
import { HeroCenteredMinimal } from "@/components/portfolio/sections/hero/HeroCenteredMinimal"
import { HeroEditorial } from "@/components/portfolio/sections/hero/HeroEditorial"
import { HeroSplitBold } from "@/components/portfolio/sections/hero/HeroSplitBold"
import { HeroShowcaseEditorial } from "@/components/portfolio/sections/hero/HeroShowcaseEditorial"
import { HeroSplitEditorial } from "@/components/portfolio/sections/hero/HeroSplitEditorial"
import { HeroSplitMedia } from "@/components/portfolio/sections/hero/HeroSplitMedia"
import { TerminalHero } from "@/components/portfolio/sections/hero/TerminalHero"
import { ProjectsAtmosphericGrid } from "@/components/portfolio/sections/projects/ProjectsAtmosphericGrid"
import { ProjectsGlassMosaic, ProjectsSpotlight } from "@/components/portfolio/sections/profiles"
import { BentoGrid } from "@/components/ui/BentoGrid"
import type { PortfolioHeroSection, PortfolioProjectsSection, PortfolioSection } from "@/types/dossier"

function skillBadgeFaceClass(config: DesignConfig) {
  return config.components.badge === "square-mono"
    ? "de-font-mono text-xs uppercase tracking-wider"
    : "de-font-body text-sm font-medium"
}

function renderSectionTitle(config: DesignConfig, label: string, sectionIndex: number) {
  const o = getDirectionOverrides(config)
  return (
    <SectionTitleFromConfig config={config}>
      {o.showSectionNumbers ? (
        <span className="de-font-display mr-3 inline-block min-w-[2.25ch] text-left text-sm font-bold tabular-nums text-[var(--color-text-muted,var(--de-muted))]">
          {String(sectionIndex + 1).padStart(2, "0")}
        </span>
      ) : null}
      {label}
    </SectionTitleFromConfig>
  )
}

const HERO_REGISTRY: Record<string, ComponentType<{ section: PortfolioHeroSection }>> = {
  "centered-minimal": HeroCenteredMinimal,
  "split-bold": HeroSplitBold,
  editorial: HeroEditorial,
  aurora: HeroAurora,
  "split-media": HeroSplitMedia,
  "split-editorial": HeroSplitEditorial,
  "showcase-editorial": HeroShowcaseEditorial,
  terminal: TerminalHero,
}

function normalizeHeroKey(
  variant: string,
  section: PortfolioHeroSection,
  direction: DesignDirectionId
): keyof typeof HERO_REGISTRY {
  const s = variant.toLowerCase()
  const hasImg = Boolean(section.data.imageUrl?.trim())
  if (s.includes("terminal")) return "terminal"
  if (s.includes("showcase") || s.includes("marquee")) return "showcase-editorial"
  if (s.includes("split-editorial") || s.includes("editorial-split")) return "split-editorial"
  if (s.includes("editorial") && (s.includes("pull") || s.includes("quote") || s.includes("typography")))
    return "editorial"
  if (direction === "EDITORIAL_MONO" && (s.includes("editorial-hero") || s.includes("editorial-hero-v2"))) return "editorial"
  if (s.includes("chaos") || s.includes("kinetic")) return "split-bold"
  if (s.includes("brutalist")) return "split-bold"
  if (s.includes("enterprise") || s.includes("liquid")) return "centered-minimal"
  if (s.includes("organic")) return "aurora"
  if (s.includes("aurora") || s.includes("mesh") || s.includes("gradient-hero")) return "aurora"
  if (s.includes("split-media") || (s.includes("media") && s.includes("hero"))) return hasImg ? "split-media" : "split-bold"
  if (s.includes("split") && s.includes("bold")) return "split-bold"
  if (s.includes("editorial")) return "editorial"
  if (direction === "EDITORIAL_MONO") return "split-editorial"
  if (hasImg) return "split-media"
  return "centered-minimal"
}

function renderHero(
  variant: string,
  section: Extract<PortfolioSection, { type: "hero" }>,
  direction: DesignDirectionId
) {
  const key = normalizeHeroKey(variant, section, direction)
  const Comp = HERO_REGISTRY[key] ?? HERO_REGISTRY["centered-minimal"]
  return <Comp section={section} />
}

function renderAbout(
  section: Extract<PortfolioSection, { type: "about" }>,
  variant: string,
  config: DesignConfig,
  sectionIndex: number
): ReactNode {
  const v = variant.toLowerCase()
  const label = getPortfolioSectionLabel("about")
  if (v.includes("two") || v.includes("column")) {
    return (
      <section id="portfolio-section-about" className="grid gap-10 border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)] md:grid-cols-2">
        {renderSectionTitle(config, label, sectionIndex)}
        <CanvasText
          as="p"
          sectionType="about"
          field="body"
          value={section.data.body}
          className={cn("de-body-text whitespace-pre-line", portfolioTypo.bodyForeground())}
        />
      </section>
    )
  }
  if (v.includes("pull") || v.includes("editorial")) {
    return (
      <section id="portfolio-section-about" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <CanvasText
          as="p"
          sectionType="about"
          field="body"
          value={section.data.body}
          className={cn("mx-auto max-w-4xl text-2xl font-medium leading-snug sm:text-3xl", portfolioTypo.bodyForeground())}
        />
        <p className={cn(portfolioTypo.label(), "mt-6")}>{label}</p>
      </section>
    )
  }
  if (v.includes("card")) {
    return (
      <section id="portfolio-section-about" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--de-border)] bg-[var(--de-elevated)] p-8">
          {renderSectionTitle(config, label, sectionIndex)}
          <CanvasText
            as="p"
            sectionType="about"
            field="body"
            value={section.data.body}
            className="de-body-text mt-4 whitespace-pre-line"
          />
        </div>
      </section>
    )
  }
  if (v.includes("mono") || v.includes("rail")) {
    return (
      <section id="portfolio-section-about" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <h2 className={cn(portfolioTypo.label(), "text-[var(--color-heading,var(--color-text))]")}># {label}</h2>
        <CanvasText
          as="p"
          sectionType="about"
          field="body"
          value={section.data.body}
          className="de-body-text de-font-body mt-6 max-w-2xl whitespace-pre-line text-[var(--color-text,var(--de-fg))]"
        />
      </section>
    )
  }
  return (
    <section id="portfolio-section-about" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      {renderSectionTitle(config, label, sectionIndex)}
      <CanvasText
        as="p"
        sectionType="about"
        field="body"
        value={section.data.body}
        className="de-body-text mt-4 max-w-2xl whitespace-pre-line"
      />
    </section>
  )
}

function renderSkills(
  section: Extract<PortfolioSection, { type: "skills" }>,
  variant: string,
  config: DesignConfig,
  sectionIndex: number
): ReactNode {
  const items = section.data.items.filter(Boolean)
  const v = variant.toLowerCase()
  const label = getPortfolioSectionLabel("skills")
  if (v.includes("marquee-infinite") || v.includes("skills-marquee")) {
    return <SkillsMarqueeStrip section={section} config={config} sectionIndex={sectionIndex} />
  }
  if (v.includes("terminal") || v.includes("tag")) {
    return (
      <section id="portfolio-section-skills" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <h2 className={cn(portfolioTypo.label(), "text-[var(--color-primary,var(--de-accent))]")}>{`// ${label}`}</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {items.map((t, i) => (
            <li
              key={`${t}-${i}`}
              className={cn(
                "rounded border border-[var(--color-border,var(--de-border))] bg-[var(--color-surface,var(--de-elevated))] px-2 py-1 text-[var(--color-text,var(--de-fg))]",
                skillBadgeFaceClass(config)
              )}
            >
              <CanvasText as="span" sectionType="skills" field="item" value={t} skillIndex={i} />
            </li>
          ))}
        </ul>
      </section>
    )
  }
  if (v.includes("constellation") || v.includes("tools-cloud") || v.includes("orbit") || v.includes("pill")) {
    return (
      <section id="portfolio-section-skills" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <h2 className={portfolioTypo.label()}>{label}</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {items.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="rounded-full border border-[var(--de-border)] px-5 py-2 text-sm font-medium text-[var(--de-fg)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <CanvasText as="span" sectionType="skills" field="item" value={t} skillIndex={i} />
            </span>
          ))}
        </div>
      </section>
    )
  }
  if (v.includes("finance-category") || v.includes("grouped-badges")) {
    return (
      <section id="portfolio-section-skills" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 text-sm text-[var(--de-fg)]">
          {items.map((t, i) => (
            <li key={`${t}-${i}`}>
              <CanvasText as="span" sectionType="skills" field="item" value={t} skillIndex={i} />
            </li>
          ))}
        </ul>
      </section>
    )
  }
  if (v.includes("tech-strip") || v.includes("strip")) {
    return (
      <section id="portfolio-section-skills" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <h2 className={cn(portfolioTypo.label(), "text-[var(--color-primary,var(--de-accent))]")}>{`$ skills --tree`}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className={cn(
                "rounded-md border border-[var(--color-border,var(--de-border))] bg-[var(--color-surface,var(--de-elevated))] px-4 py-2 text-[var(--color-text,var(--de-fg))]",
                skillBadgeFaceClass(config)
              )}
            >
              <CanvasText as="span" sectionType="skills" field="item" value={t} skillIndex={i} />
            </span>
          ))}
        </div>
      </section>
    )
  }
  if (v.includes("split")) {
    const mid = Math.ceil(items.length / 2)
    const left = items.slice(0, mid)
    const right = items.slice(mid)
    return (
      <section id="portfolio-section-skills" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <div className="mt-8 grid max-w-4xl gap-8 sm:grid-cols-2">
          <ul className="space-y-2 border-l-2 border-[var(--color-primary,var(--de-accent))] pl-4 text-sm text-[var(--de-fg)]">
            {left.map((s, i) => (
              <li key={`${s}-l-${i}`}>
                <CanvasText as="span" sectionType="skills" field="item" value={s} skillIndex={i} />
              </li>
            ))}
          </ul>
          <ul className="space-y-2 border-l-2 border-[var(--de-muted)] pl-4 text-sm text-[var(--de-fg)]">
            {right.map((s, i) => (
              <li key={`${s}-r-${i}`}>
                <CanvasText
                  as="span"
                  sectionType="skills"
                  field="item"
                  value={s}
                  skillIndex={i + mid}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }
  return (
    <section id="portfolio-section-skills" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      {renderSectionTitle(config, label, sectionIndex)}
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={cn(
              "rounded-full border border-[var(--color-border,var(--de-border))] px-3 py-1 text-[var(--color-text-muted,var(--de-muted))]",
              skillBadgeFaceClass(config)
            )}
          >
            <CanvasText as="span" sectionType="skills" field="item" value={t} skillIndex={i} />
          </span>
        ))}
      </div>
    </section>
  )
}

function renderExperience(
  section: Extract<PortfolioSection, { type: "experience" }>,
  variant: string,
  config: DesignConfig,
  sectionIndex: number
): ReactNode {
  const items = section.data.items
  const v = variant.toLowerCase()
  const label = getPortfolioSectionLabel("experience")
  const cardV = resolvePortfolioCardVariant(config)
  if (v.includes("horizontal") && v.includes("carousel")) {
    return (
      <section id="portfolio-section-experience" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <p className="de-font-body mt-2 max-w-xl text-xs text-[var(--de-muted)]">{messages.dossier.studio.experienceCarouselHint}</p>
        <PortfolioEmblaCarousel className="mt-10">
          {items.map((it, i) => (
            <PortfolioEmblaSlide key={`${it.company}-${i}`}>
              <PortfolioCard variant={cardV} className="flex h-full min-h-[12rem] flex-col overflow-hidden p-0" hoverEffect>
                <div className="flex items-center gap-2 border-b border-[var(--de-border)] bg-[color-mix(in_oklab,var(--de-accent)_10%,transparent)] px-4 py-3">
                  <Diamond className="size-4 shrink-0 text-[var(--color-primary,var(--de-accent))]" strokeWidth={2} aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--de-muted)]">
                    <CanvasText as="span" sectionType="experience" field="duration" value={it.duration} experienceIndex={i} />
                  </span>
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-semibold text-[var(--de-fg)]">
                    <CanvasText as="span" sectionType="experience" field="role" value={it.role} experienceIndex={i} />
                  </h3>
                  <p className="text-sm text-[var(--de-muted)]">
                    <CanvasText as="span" sectionType="experience" field="company" value={it.company} experienceIndex={i} />
                  </p>
                  <p className="de-body-text text-sm leading-relaxed">
                    <CanvasText as="span" sectionType="experience" field="description" value={it.description} experienceIndex={i} />
                  </p>
                </div>
              </PortfolioCard>
            </PortfolioEmblaSlide>
          ))}
        </PortfolioEmblaCarousel>
      </section>
    )
  }
  if (v.includes("numbered")) {
    return (
      <section id="portfolio-section-experience" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <ol className="mt-6 list-decimal space-y-5 pl-5 marker:text-[var(--color-primary,var(--de-accent))]">
          {items.map((it, i) => (
            <li key={`${it.company}-${i}`} className="pl-2 text-sm text-[var(--de-fg)]">
              <span className="font-semibold">
                <CanvasText as="span" sectionType="experience" field="role" value={it.role} experienceIndex={i} />
              </span>
              <span className="text-[var(--de-muted)]">
                {" "}
                —{" "}
                <CanvasText as="span" sectionType="experience" field="company" value={it.company} experienceIndex={i} />
              </span>
              <p className="mt-1 text-xs text-[var(--de-muted)]">
                <CanvasText as="span" sectionType="experience" field="duration" value={it.duration} experienceIndex={i} />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--de-muted)]">
                <CanvasText as="span" sectionType="experience" field="description" value={it.description} experienceIndex={i} />
              </p>
            </li>
          ))}
        </ol>
      </section>
    )
  }
  if (v.includes("stagger") || v.includes("card")) {
    return (
      <section id="portfolio-section-experience" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <h2 className={portfolioTypo.label()}>{label}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <PortfolioCard key={`${it.company}-${i}`} variant={cardV} className="p-6" hoverEffect>
              <p className="text-xs font-semibold text-[var(--color-primary,var(--de-accent))]">
                <CanvasText as="span" sectionType="experience" field="duration" value={it.duration} experienceIndex={i} />
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--de-fg)]">
                <CanvasText as="span" sectionType="experience" field="role" value={it.role} experienceIndex={i} />
              </h3>
              <p className="text-sm text-[var(--de-muted)]">
                <CanvasText as="span" sectionType="experience" field="company" value={it.company} experienceIndex={i} />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--de-fg)]">
                <CanvasText as="span" sectionType="experience" field="description" value={it.description} experienceIndex={i} />
              </p>
            </PortfolioCard>
          ))}
        </div>
      </section>
    )
  }
  if (v.includes("branch") || v.includes("finance-timeline") || v.includes("metrics")) {
    return (
      <section id="portfolio-section-experience" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <div className="relative mx-auto mt-8 max-w-3xl">
          <div
            className="absolute bottom-3 left-[0.8rem] top-3 w-px bg-[var(--de-border)]"
            aria-hidden
          />
          <ul className="relative space-y-10">
            {items.map((it, i) => (
              <li key={`${it.company}-${i}`} className="relative flex gap-4 pl-0 sm:gap-5">
                <div className="flex w-7 shrink-0 flex-col items-center sm:w-8">
                  <span className="flex size-7 items-center justify-center rounded-full border border-[var(--de-border)] bg-[var(--color-bg,var(--de-bg))] text-[var(--color-primary,var(--de-accent))] shadow-sm sm:size-8">
                    <Diamond className="size-3.5 sm:size-4" strokeWidth={2.25} aria-hidden />
                  </span>
                </div>
                <article className="min-w-0 flex-1 border-b border-[var(--de-border)] pb-10 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-[var(--de-fg)] sm:text-xl">
                    <CanvasText as="span" sectionType="experience" field="role" value={it.role} experienceIndex={i} />
                  </h3>
                  <p className="mt-1 text-sm text-[var(--de-muted)]">
                    <CanvasText as="span" sectionType="experience" field="company" value={it.company} experienceIndex={i} />{" "}
                    <span className="text-[var(--de-border)]">·</span>{" "}
                    <CanvasText as="span" sectionType="experience" field="duration" value={it.duration} experienceIndex={i} />
                  </p>
                  <p className="de-body-text mt-3 text-sm leading-relaxed sm:text-[0.9375rem]">
                    <CanvasText as="span" sectionType="experience" field="description" value={it.description} experienceIndex={i} />
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }
  if (v.includes("design-process")) {
    return renderExperience(section, "case-rows", config, sectionIndex)
  }
  if (v.includes("case") || v.includes("row")) {
    return (
      <section id="portfolio-section-experience" className="border-t border-[var(--de-border)] bg-[var(--de-elevated)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <div className="mt-10 space-y-6">
          {items.map((it, i) => (
            <PortfolioCard
              key={`${it.company}-${i}`}
              variant={cardV}
              className="grid gap-4 p-6 md:grid-cols-[1fr_2fr]"
              shellStyle={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
              hoverEffect
            >
              <div>
                <p className="text-xs font-medium text-[var(--color-primary,var(--de-accent))]">
                  <CanvasText as="span" sectionType="experience" field="duration" value={it.duration} experienceIndex={i} />
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--de-fg)]">
                  <CanvasText as="span" sectionType="experience" field="role" value={it.role} experienceIndex={i} />
                </h3>
                <p className="text-sm text-[var(--de-muted)]">
                  <CanvasText as="span" sectionType="experience" field="company" value={it.company} experienceIndex={i} />
                </p>
              </div>
              <p className="text-sm leading-relaxed text-[var(--de-fg)]">
                <CanvasText as="span" sectionType="experience" field="description" value={it.description} experienceIndex={i} />
              </p>
            </PortfolioCard>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section id="portfolio-section-experience" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      {renderSectionTitle(config, label, sectionIndex)}
      <div className="mt-8 space-y-8">
        {items.map((it, i) => (
          <div key={`${it.company}-${i}`} className="flex gap-4">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-primary,var(--de-accent))]" aria-hidden />
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-[var(--de-fg)]">
                  <CanvasText as="span" sectionType="experience" field="role" value={it.role} experienceIndex={i} />
                </h3>
                <span className="text-xs text-[var(--de-muted)]">
                  <CanvasText as="span" sectionType="experience" field="duration" value={it.duration} experienceIndex={i} />
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-muted,var(--de-muted))]">
                <CanvasText as="span" sectionType="experience" field="company" value={it.company} experienceIndex={i} />
              </p>
              <p className="de-body-text mt-2">
                <CanvasText as="span" sectionType="experience" field="description" value={it.description} experienceIndex={i} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function normalizeProjectsKey(
  variant: string,
  section: PortfolioProjectsSection
): "bento" | "stack" | "spotlight" | "glass-mosaic" | "default-grid" | "atmospheric" | "carousel" {
  const v = variant.toLowerCase()
  const anyImg = section.data.items.some((it) => Boolean(it.imageUrl?.trim()))
  if (v.includes("carousel") || v.includes("slider")) return "carousel"
  if (v.includes("atmospheric") || v.includes("selected-work") || v.includes("elevated")) return "atmospheric"
  if (v.includes("glass") || v.includes("mosaic")) return "glass-mosaic"
  if (v.includes("horizontal-project") || v.includes("spotlight") || v.includes("horizontal") || v.includes("snap"))
    return "spotlight"
  if (v.includes("masonry")) return "glass-mosaic"
  if (v.includes("bento")) return "bento"
  if (v.includes("stack")) return "stack"
  if (anyImg) return "glass-mosaic"
  return "atmospheric"
}

function renderProjects(
  section: Extract<PortfolioSection, { type: "projects" }>,
  variant: string,
  config: DesignConfig,
  sectionIndex: number
): ReactNode {
  const items = section.data.items
  const mode = normalizeProjectsKey(variant, section)
  const cardV = resolvePortfolioCardVariant(config)
  if (mode === "atmospheric") {
    return <ProjectsAtmosphericGrid section={section} sectionIndex={sectionIndex} />
  }
  if (mode === "spotlight") {
    return <ProjectsSpotlight section={section} sectionIndex={sectionIndex} />
  }
  if (mode === "glass-mosaic") {
    return <ProjectsGlassMosaic section={section} sectionIndex={sectionIndex} />
  }
  if (mode === "carousel") {
    const label = getPortfolioSectionLabel("projects")
    const studio = messages.dossier.studio
    return (
      <section id="portfolio-section-projects" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={cn(portfolioTypo.label(), "text-[var(--de-muted)]")}>{studio.projectsEyebrow}</p>
              <div className="mt-1">{renderSectionTitle(config, label, sectionIndex)}</div>
            </div>
          </div>
          <p className="de-font-body mt-3 max-w-xl text-xs text-[var(--de-muted)]">{studio.projectsCarouselHint}</p>
          <PortfolioEmblaCarousel className="mt-8">
            {items.map((p, i) => (
              <PortfolioEmblaSlide key={`${p.name}-${i}`}>
                <PortfolioCard variant={cardV} className="flex h-full min-h-[14rem] flex-col overflow-hidden p-0" hoverEffect>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {p.imageUrl?.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl.trim()} alt="" className="size-full object-cover" />
                    ) : (
                      <AbstractAiPlaceholder seed={`carousel-${p.name}-${i}`} />
                    )}
                  </div>
                  <div className="space-y-2 p-5">
                    <CanvasText
                      as="h3"
                      sectionType="projects"
                      field="name"
                      value={p.name}
                      projectIndex={i}
                      className="text-lg font-semibold text-[var(--de-fg)]"
                    />
                    <CanvasText
                      as="p"
                      sectionType="projects"
                      field="description"
                      value={p.description}
                      projectIndex={i}
                      className="de-body-text line-clamp-4 text-sm"
                    />
                    <CanvasText
                      as="p"
                      sectionType="projects"
                      field="tech"
                      value={p.tech.join(" · ")}
                      projectIndex={i}
                      className="text-xs font-medium text-[var(--color-primary,var(--de-accent))]"
                    />
                  </div>
                </PortfolioCard>
              </PortfolioEmblaSlide>
            ))}
          </PortfolioEmblaCarousel>
        </div>
      </section>
    )
  }
  const v = variant.toLowerCase()
  const label = getPortfolioSectionLabel("projects")
  const studio = messages.dossier.studio
  if (mode === "bento" || v.includes("bento")) {
    return (
      <section id="portfolio-section-projects" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={portfolioTypo.label()}>{label}</h2>
            <span className="text-xs font-medium uppercase tracking-widest text-[var(--de-fg)]">{studio.projectsViewAll}</span>
          </div>
          <BentoGrid className="mt-12">
            {items.map((p, i) => (
              <PortfolioCard
                key={`${p.name}-${i}`}
                variant={cardV}
                className={cn("overflow-hidden", i === 0 ? "md:col-span-2" : "")}
                hoverEffect
              >
                <div className={`${i === 0 ? "aspect-[21/9]" : "aspect-[4/3]"} relative overflow-hidden`}>
                  {p.imageUrl?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl.trim()} alt="" className="size-full object-cover" />
                  ) : (
                    <AbstractAiPlaceholder seed={`bento-${p.name}-${i}`} />
                  )}
                </div>
                <div className="p-6">
                  <CanvasText
                    as="h3"
                    sectionType="projects"
                    field="name"
                    value={p.name}
                    projectIndex={i}
                    className="text-xl font-semibold text-[var(--de-fg)]"
                  />
                  <CanvasText
                    as="p"
                    sectionType="projects"
                    field="description"
                    value={p.description}
                    projectIndex={i}
                    className="de-body-text mt-2"
                  />
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--de-accent)]">
                    <CanvasText
                      as="span"
                      sectionType="projects"
                      field="tech"
                      value={p.tech.join(", ")}
                      projectIndex={i}
                    />
                  </div>
                </div>
              </PortfolioCard>
            ))}
          </BentoGrid>
        </div>
      </section>
    )
  }
  if (mode === "stack" || v.includes("stack")) {
    return (
      <section id="portfolio-section-projects" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        {renderSectionTitle(config, label, sectionIndex)}
        <div className="mt-6 space-y-4">
          {items.map((p, i) => (
            <PortfolioCard key={`${p.name}-${i}`} variant={cardV} className="p-5" hoverEffect>
              <CanvasText
                as="h3"
                sectionType="projects"
                field="name"
                value={p.name}
                projectIndex={i}
                className="font-semibold text-[var(--de-fg)]"
              />
              <CanvasText
                as="p"
                sectionType="projects"
                field="description"
                value={p.description}
                projectIndex={i}
                className="de-body-text mt-2"
              />
              <CanvasText
                as="p"
                sectionType="projects"
                field="tech"
                value={p.tech.join(" · ")}
                projectIndex={i}
                className="mt-3 text-xs text-[var(--color-primary,var(--de-accent))]"
              />
            </PortfolioCard>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section id="portfolio-section-projects" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--de-muted)]">{studio.projectsEyebrow}</p>
            <div className="mt-1">{renderSectionTitle(config, label, sectionIndex)}</div>
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {items.map((p, i) => (
            <PortfolioCard key={`${p.name}-${i}`} variant={cardV} className="space-y-3 p-4" hoverEffect>
              <div className="aspect-[4/5] rounded-lg border border-[var(--de-border)] bg-[color-mix(in_oklab,var(--de-accent)_12%,transparent)]" aria-hidden />
              <CanvasText
                as="h3"
                sectionType="projects"
                field="name"
                value={p.name}
                projectIndex={i}
                className="text-lg font-semibold text-[var(--de-fg)]"
              />
              <CanvasText
                as="p"
                sectionType="projects"
                field="description"
                value={p.description}
                projectIndex={i}
                className="de-body-text"
              />
            </PortfolioCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function linkHref(raw: string) {
  const t = raw.trim()
  if (!t) return null
  if (/^mailto:/i.test(t)) return t
  if (t.includes("@") && !/\s/.test(t) && !t.includes("://")) return `mailto:${t}`
  if (/^https?:\/\//i.test(t)) return t
  if (/^www\./i.test(t)) return `https://${t}`
  return `https://${t}`
}

function renderContact(
  section: Extract<PortfolioSection, { type: "contact" }>,
  variant: string,
  config: DesignConfig,
  _sectionIndex: number
): ReactNode {
  const { email, phone, links, headline } = section.data
  const v = variant.toLowerCase()
  const h = headline?.trim() || getPortfolioSectionLabel("contact")
  const headlineCanvasValue = headline?.trim() || h
  const studio = messages.dossier.studio
  if (v.includes("dramatic") || v.includes("studio-footer")) {
    return (
      <section
        id="portfolio-section-contact"
        className="relative overflow-hidden px-[var(--de-pad-x)] py-[calc(var(--de-pad-y)*1.35)] text-[var(--color-bg,var(--de-bg))]"
        style={{
          backgroundColor: "color-mix(in oklab, var(--color-text, var(--de-fg)) 92%, black)",
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vw,520px)] w-[min(80vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--color-primary, var(--de-accent)) 70%, transparent), transparent 65%)",
          }}
          aria-hidden
        />
        <div className="relative z-[1] mx-auto max-w-4xl text-center">
          <CanvasText
            as="h2"
            sectionType="contact"
            field="headline"
            value={headlineCanvasValue}
            className="de-font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight"
          />
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="group flex items-center justify-between rounded-xl border border-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_28%,transparent)] bg-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_6%,transparent)] px-4 py-3 text-left text-sm font-medium transition hover:border-[var(--color-primary,var(--de-accent))]"
              >
                <CanvasText as="span" sectionType="contact" field="email" value={email} />
                <span className="text-xs text-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_55%,transparent)] transition group-hover:text-[var(--color-primary,var(--de-accent))]">
                  →
                </span>
              </a>
            ) : null}
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="group flex items-center justify-between rounded-xl border border-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_28%,transparent)] bg-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_6%,transparent)] px-4 py-3 text-left text-sm font-medium transition hover:border-[var(--color-primary,var(--de-accent))]"
              >
                <CanvasText as="span" sectionType="contact" field="phone" value={phone} />
                <span className="text-xs text-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_55%,transparent)] transition group-hover:text-[var(--color-primary,var(--de-accent))]">
                  →
                </span>
              </a>
            ) : null}
            {links.map((link, i) => {
              const href = linkHref(link)
              if (!href) return null
              return (
                <a
                  key={`${link}-${i}`}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_28%,transparent)] bg-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_6%,transparent)] px-4 py-3 text-left text-sm font-medium transition hover:border-[var(--color-primary,var(--de-accent))]"
                >
                  <span className="truncate">{link.trim()}</span>
                  <span className="text-xs text-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_55%,transparent)] transition group-hover:text-[var(--color-primary,var(--de-accent))]">
                    ↗
                  </span>
                </a>
              )
            })}
          </div>
          {!email && !phone && links.length === 0 ? (
            <p className="de-font-body mt-8 text-sm text-[color-mix(in_oklab,var(--color-bg,var(--de-bg))_65%,transparent)]">{studio.contactEmpty}</p>
          ) : null}
        </div>
      </section>
    )
  }
  if (v.includes("statement") || v.includes("cta")) {
    return (
      <section id="portfolio-section-contact" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)] text-center">
        <CanvasText
          as="h2"
          sectionType="contact"
          field="headline"
          value={headlineCanvasValue}
          className={portfolioTypo.label()}
        />
        {email ? (
          <a
            className="mt-8 inline-block text-3xl font-semibold tracking-tight text-[var(--de-fg)] underline decoration-[var(--de-accent)] decoration-2 underline-offset-8"
            href={`mailto:${email}`}
          >
            <CanvasText as="span" sectionType="contact" field="email" value={email} />
          </a>
        ) : null}
      </section>
    )
  }
  if (v.includes("friendly") || v.includes("card")) {
    return (
      <section id="portfolio-section-contact" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--de-border)] bg-[var(--de-elevated)] p-8">
          <CanvasText
            as="h2"
            sectionType="contact"
            field="headline"
            value={headlineCanvasValue}
            className={sectionTitleClassName(config)}
          />
          <div className="de-body-text mt-4 space-y-2">
            {email ? (
              <p>
                <a className="font-medium text-[var(--de-accent)] hover:underline" href={`mailto:${email}`}>
                  <CanvasText as="span" sectionType="contact" field="email" value={email} />
                </a>
              </p>
            ) : null}
            {phone ? (
              <p>
                <CanvasText as="span" sectionType="contact" field="phone" value={phone} />
              </p>
            ) : null}
            {links.map((link, i) => {
              const href = linkHref(link)
              if (!href) return null
              return (
                <p key={`${link}-${i}`}>
                  <a className="text-[var(--de-accent)] hover:underline" href={href} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                </p>
              )
            })}
          </div>
        </div>
      </section>
    )
  }
  if (v.includes("terminal") || v.includes("link")) {
    return (
      <section id="portfolio-section-contact" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <div className="de-font-body text-sm font-semibold text-[var(--color-primary,var(--de-accent))]">
          <span className="text-[var(--de-muted)]">// </span>
          <CanvasText as="span" sectionType="contact" field="headline" value={headlineCanvasValue} />
        </div>
        <ul className="de-font-body mt-6 space-y-2 text-sm text-[var(--de-fg)]">
          {email ? (
            <li>
              <span className="text-[var(--de-muted)]">EMAIL </span>
              <a className="text-[var(--de-accent)] hover:underline" href={`mailto:${email}`}>
                <CanvasText as="span" sectionType="contact" field="email" value={email} />
              </a>
            </li>
          ) : null}
          {links.map((link, i) => {
            const href = linkHref(link)
            if (!href) return null
            return (
              <li key={`${link}-${i}`}>
                <a className="text-[var(--de-accent)] hover:underline" href={href} target="_blank" rel="noreferrer">
                  {link.trim()}
                </a>
              </li>
            )
          })}
        </ul>
      </section>
    )
  }
  return (
    <section id="portfolio-section-contact" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      <CanvasText
        as="h2"
        sectionType="contact"
        field="headline"
        value={headlineCanvasValue}
        className={sectionTitleClassName(config)}
      />
      <ul className="mt-6 space-y-2 text-sm">
        {email ? (
          <li>
            <a className="text-[var(--de-accent)] hover:underline" href={`mailto:${email}`}>
              <CanvasText as="span" sectionType="contact" field="email" value={email} />
            </a>
          </li>
        ) : null}
        {phone ? (
          <li className="text-[var(--de-muted)]">
            <CanvasText as="span" sectionType="contact" field="phone" value={phone} />
          </li>
        ) : null}
        {links.map((link, i) => {
          const href = linkHref(link)
          if (!href) return null
          return (
            <li key={`${link}-${i}`}>
              <a className="text-[var(--de-accent)] hover:underline" href={href} target="_blank" rel="noreferrer">
                {link.trim()}
              </a>
            </li>
          )
        })}
      </ul>
      {!email && !phone && links.length === 0 ? <p className="de-body-text mt-4">{studio.contactEmpty}</p> : null}
    </section>
  )
}

export function renderComposerSection(
  section: PortfolioSection,
  variant: string,
  designConfig: DesignConfig,
  sectionIndex = 0
): ReactNode {
  switch (section.type) {
    case "hero":
      return renderHero(variant, section, designConfig.meta.direction)
    case "about":
      return renderAbout(section, variant, designConfig, sectionIndex)
    case "skills":
      return renderSkills(section, variant, designConfig, sectionIndex)
    case "experience":
      return renderExperience(section, variant, designConfig, sectionIndex)
    case "projects":
      return renderProjects(section, variant, designConfig, sectionIndex)
    case "contact":
      return renderContact(section, variant, designConfig, sectionIndex)
  }
}
