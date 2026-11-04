"use client"

import { AboutEditor, ContactEditor, HeroEditor } from "@/components/studio/editors/blockEditors"
import { CertificationsEditor, EducationEditor, ExperienceEditor, HighlightsEditor, ProjectsEditor, SkillsEditor } from "@/components/studio/editors/listEditors"
import {
  CreditsEditor,
  GalleryEditor,
  PracticeEditor,
  PressEditor,
  PublicationsEditor,
  ServicesEditor,
  ShowreelEditor,
  TestimonialsEditor,
} from "@/components/studio/editors/workEditors"
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
    case "gallery":
      return <GalleryEditor s={section} />
    case "showreel":
      return <ShowreelEditor s={section} />
    case "credits":
      return <CreditsEditor s={section} />
    case "services":
      return <ServicesEditor s={section} />
    case "testimonials":
      return <TestimonialsEditor s={section} />
    case "press":
      return <PressEditor s={section} />
    case "publications":
      return <PublicationsEditor s={section} />
    case "practice":
      return <PracticeEditor s={section} />
  }
}
