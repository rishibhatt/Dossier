import { nanoid } from "nanoid"

import type { ExperienceConfig, Scene } from "@/features/creative-mode/types/experienceConfig"
import type { PortfolioDocument } from "@/types/dossier"

export type CreativeExperienceVariant = "cinematic" | "editorial" | "focused"

/**
 * Builds a default cinematic experience from portfolio content (not design-config sections).
 */
export function buildDefaultExperienceFromDocument(
  doc: PortfolioDocument,
  variant: CreativeExperienceVariant = "cinematic"
): ExperienceConfig {
  const hero = doc.sections.find((s) => s.type === "hero")
  const about = doc.sections.find((s) => s.type === "about")
  const skills = doc.sections.find((s) => s.type === "skills")
  const projects = doc.sections.find((s) => s.type === "projects")
  const experience = doc.sections.find((s) => s.type === "experience")
  const contact = doc.sections.find((s) => s.type === "contact")

  const scenes: Scene[] = []

  scenes.push({
    id: nanoid(10),
    type: "hero",
    props: {
      variant: variant === "editorial" ? "centered" : variant === "focused" ? "overlay" : "split",
      name: hero && hero.type === "hero" ? hero.data.name : doc.meta.title,
      title: hero && hero.type === "hero" ? hero.data.title : "",
      tagline: hero && hero.type === "hero" ? hero.data.tagline : doc.meta.description,
      imageUrl: hero && hero.type === "hero" ? hero.data.imageUrl : undefined,
    },
    motion: { preset: variant === "focused" ? "fadeUp" : "staggerReveal", stagger: 0.1, duration: 0.7 },
  })

  if (about && about.type === "about" && about.data.body?.trim()) {
    scenes.push({
      id: nanoid(10),
      type: "text-reveal",
      props: { text: about.data.body, label: "About" },
      motion: { preset: "fadeUp", stagger: 0.04 },
    })
  }

  const skillItems = skills && skills.type === "skills" ? skills.data.items.filter(Boolean) : []
  if (skillItems.length) {
    if (variant !== "focused") {
      scenes.push({
        id: nanoid(10),
        type: "marquee",
        props: { items: skillItems, rows: variant === "editorial" ? 1 : 2, speed: variant === "editorial" ? 0.8 : 1.1 },
        motion: { preset: "parallaxSoft" },
      })
    }
    scenes.push({
      id: nanoid(10),
      type: "skills-cloud",
      props: { items: skillItems.slice(0, 24) },
      motion: { preset: "magneticHover", stagger: 0.05 },
    })
  }

  const projectItems = projects && projects.type === "projects" ? projects.data.items : []
  if (projectItems.length && variant !== "focused") {
    scenes.push({
      id: nanoid(10),
      type: "projects-carousel",
      props: {
        items: projectItems.map((p) => ({
          name: p.name,
          description: p.description,
          tech: p.tech,
          imageUrl: p.imageUrl ?? undefined,
        })),
        autoplay: true,
        centerScale: true,
      },
      motion: { preset: "scaleIn", stagger: 0.06 },
    })
  }

  if (experience && experience.type === "experience" && experience.data.items.length) {
    scenes.push({
      id: nanoid(10),
      type: "horizontal-scroll",
      props: {
        title: "Experience",
        items: experience.data.items.map((e) => ({
          role: e.role,
          company: e.company,
          duration: e.duration,
          blurb: e.description.slice(0, 160),
        })),
      },
      motion: { preset: "parallaxSoft" },
    })
  }

  if (variant !== "focused") {
    scenes.push({
      id: nanoid(10),
      type: "sticky-stack",
      props: {
        title: variant === "editorial" ? "Selected themes" : "Highlights",
        lines: [
          skillItems[0] ?? "Craft",
          projectItems[0]?.name ?? "Shipped work",
          experience && experience.type === "experience" && experience.data.items[0]
            ? experience.data.items[0]!.role
            : "Impact",
        ],
      },
      motion: { preset: "fadeUp", stagger: 0.12 },
    })
  } else if (projectItems.length) {
    scenes.push({
      id: nanoid(10),
      type: "projects-carousel",
      props: {
        items: projectItems.slice(0, 3).map((p) => ({
          name: p.name,
          description: p.description,
          tech: p.tech,
          imageUrl: p.imageUrl ?? undefined,
        })),
        autoplay: false,
        centerScale: false,
      },
      motion: { preset: "fadeUp", stagger: 0.04 },
    })
  }

  if (contact && contact.type === "contact") {
    scenes.push({
      id: nanoid(10),
      type: "split-scroll",
      props: {
        headline: contact.data.headline ?? "Let's connect",
        email: contact.data.email,
        links: contact.data.links,
      },
      motion: { preset: "staggerReveal" },
    })
  }

  return {
    meta: {
      style: variant,
      motionIntensity: variant === "focused" ? 0.35 : variant === "editorial" ? 0.55 : 0.72,
      density: Math.min(1, (variant === "focused" ? 0.36 : 0.45) + scenes.length * 0.04),
    },
    scenes,
    global: {
      nav: { sticky: true, style: variant === "editorial" ? "floating" : "glass" },
    },
  }
}
