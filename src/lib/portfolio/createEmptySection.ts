import { nanoid } from "nanoid"

import type { PortfolioSection, PortfolioSectionType } from "@/types/dossier"

function id(prefix: string) {
  return `${prefix}-${nanoid(8)}`
}

export function createEmptySection(type: PortfolioSectionType): PortfolioSection {
  switch (type) {
    case "hero":
      return {
        id: id("hero"),
        type: "hero",
        data: { name: "Name", title: "Role", tagline: "One-line value proposition." },
      }
    case "about":
      return { id: id("about"), type: "about", data: { body: "Short bio — edit in the canvas." } }
    case "skills":
      return { id: id("skills"), type: "skills", data: { items: ["Skill A", "Skill B", "Skill C"] } }
    case "experience":
      return {
        id: id("experience"),
        type: "experience",
        data: {
          items: [
            {
              company: "Company",
              role: "Role",
              duration: "20xx — Present",
              description: "Impact and responsibilities.",
            },
          ],
        },
      }
    case "projects":
      return {
        id: id("projects"),
        type: "projects",
        data: {
          items: [
            {
              name: "Project title",
              description: "What you shipped and the outcome.",
              tech: ["TypeScript", "Next.js"],
            },
          ],
        },
      }
    case "contact":
      return {
        id: id("contact"),
        type: "contact",
        data: { email: "", phone: "", links: [], headline: "Get in touch" },
      }
  }
}
