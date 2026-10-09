"use client"

import { ChipsField, Field, ImageField, ItemList, SplitField } from "@/components/studio/editors/fields"
import { patchSection } from "@/features/studio/sectionOps"
import type {
  PortfolioCertificationsSection,
  PortfolioEducationSection,
  PortfolioExperienceSection,
  PortfolioHighlightsSection,
  PortfolioProjectsSection,
  PortfolioSkillsSection,
} from "@/types/dossier"

export function SkillsEditor({ s }: { s: PortfolioSkillsSection }) {
  return <ChipsField label="Skills" items={s.data.items} placeholder="Add a skill, e.g. Figma" onChange={(items) => patchSection(s.id, "skills", { items })} />
}

export function ExperienceEditor({ s }: { s: PortfolioExperienceSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "experience", { items })}
      make={() => ({ company: "", role: "", duration: "", description: "", highlights: [] })}
      title={(it) => [it.role, it.company].filter(Boolean).join(", ")}
      addLabel="Add a role"
      noun="role"
      render={(it, set) => (
        <>
          <Field label="Role" value={it.role} onChange={(role) => set({ role })} />
          <Field label="Company" value={it.company} onChange={(company) => set({ company })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dates" value={it.duration} placeholder="2021 to now" onChange={(duration) => set({ duration })} />
            <Field label="Location" value={it.location ?? ""} onChange={(location) => set({ location })} />
          </div>
          <Field label="Summary" multiline value={it.description} onChange={(description) => set({ description })} />
          <SplitField label="Bullet points" sep={"\n"} hint="One per line." values={it.highlights ?? []} onChange={(highlights) => set({ highlights })} />
        </>
      )}
    />
  )
}

export function ProjectsEditor({ s }: { s: PortfolioProjectsSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "projects", { items })}
      make={() => ({ name: "", description: "", tech: [], link: null })}
      title={(it) => it.name}
      addLabel="Add a project"
      noun="project"
      render={(it, set) => (
        <>
          <Field label="Name" value={it.name} onChange={(name) => set({ name })} />
          <Field label="What it is" multiline value={it.description} onChange={(description) => set({ description })} />
          <Field label="Link" type="url" placeholder="https://" value={it.link ?? ""} onChange={(v) => set({ link: v.trim() || null })} />
          <SplitField label="Tools" sep="," hint="Separate with commas." values={it.tech} onChange={(tech) => set({ tech })} />
          <ImageField label="Cover image" value={it.imageUrl} onChange={(imageUrl) => set({ imageUrl })} />
        </>
      )}
    />
  )
}

export function EducationEditor({ s }: { s: PortfolioEducationSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "education", { items })}
      make={() => ({ institution: "", degree: "", period: "", details: "" })}
      title={(it) => it.institution || it.degree}
      addLabel="Add a school"
      noun="entry"
      render={(it, set) => (
        <>
          <Field label="School" value={it.institution} onChange={(institution) => set({ institution })} />
          <Field label="Degree or course" value={it.degree} onChange={(degree) => set({ degree })} />
          <Field label="Years" value={it.period} placeholder="2018 to 2021" onChange={(period) => set({ period })} />
          <Field label="Details" multiline value={it.details} onChange={(details) => set({ details })} />
        </>
      )}
    />
  )
}

export function CertificationsEditor({ s }: { s: PortfolioCertificationsSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "certifications", { items })}
      make={() => ({ name: "", issuer: "", year: "" })}
      title={(it) => it.name}
      addLabel="Add a certificate"
      noun="certificate"
      render={(it, set) => (
        <>
          <Field label="Name" value={it.name} onChange={(name) => set({ name })} />
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
            <Field label="Issuer" value={it.issuer} onChange={(issuer) => set({ issuer })} />
            <Field label="Year" value={it.year} onChange={(year) => set({ year })} />
          </div>
        </>
      )}
    />
  )
}

export function HighlightsEditor({ s }: { s: PortfolioHighlightsSection }) {
  return (
    <>
      <p className="px-4 pt-4 text-sm text-[var(--site-ink-2)]">Use numbers that are in your resume. Each one needs what it measures.</p>
      <ItemList
        items={s.data.items}
        onChange={(items) => patchSection(s.id, "highlights", { items })}
        make={() => ({ value: "", label: "" })}
        title={(it) => [it.value, it.label].filter(Boolean).join(" ")}
        addLabel="Add a number"
        noun="number"
        render={(it, set) => (
          <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
            <Field label="Number" value={it.value} placeholder="40%" onChange={(value) => set({ value })} />
            <Field label="What it measures" value={it.label} placeholder="faster checkout" onChange={(label) => set({ label })} />
          </div>
        )}
      />
    </>
  )
}
