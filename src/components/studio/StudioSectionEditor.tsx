"use client"

import { AboutEditor, ContactEditor, HeroEditor } from "@/components/studio/editors/blockEditors"
import { CertificationsEditor, EducationEditor, ExperienceEditor, HighlightsEditor, ProjectsEditor, SkillsEditor } from "@/components/studio/editors/listEditors"
import type { PortfolioSection } from "@/types/dossier"

/** The editor for one section, picked by type. Every edit is written live to the canvas. */
export function StudioSectionEditor({ section }: { section: PortfolioSection }) {
  switch (section.type) {
    case "hero":
      return <HeroEditor s={section} />
    case "about":
      return <AboutEditor s={section} />
    case "skills":
      return <SkillsEditor s={section} />
    case "experience":
      return <ExperienceEditor s={section} />
    case "projects":
      return <ProjectsEditor s={section} />
    case "education":
      return <EducationEditor s={section} />
    case "certifications":
      return <CertificationsEditor s={section} />
    case "highlights":
      return <HighlightsEditor s={section} />
    case "contact":
      return <ContactEditor s={section} />
  }
}
