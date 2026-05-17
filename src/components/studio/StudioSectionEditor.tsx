"use client"

import { useState } from "react"

import { EditableField } from "@/components/portfolio/editor/EditableField"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { messages } from "@/config/messages"
import { findSectionByType } from "@/lib/portfolio/findSection"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"

type StudioSectionEditorProps = {
  activeId: string
  className?: string
}

export function StudioSectionEditor({ activeId, className }: StudioSectionEditorProps) {
  const portfolioDocument = usePortfolioStore((s) => s.document)
  const updateSection = usePortfolioStore((s) => s.updateSection)
  const updateMeta = usePortfolioStore((s) => s.updateMeta)
  const setSkillItems = usePortfolioStore((s) => s.setSkillItems)
  const updateExperienceItem = usePortfolioStore((s) => s.updateExperienceItem)
  const updateProjectItem = usePortfolioStore((s) => s.updateProjectItem)
  const setEditMode = usePortfolioStore((s) => s.setEditMode)

  const copy = messages.dossier
  const studio = copy.studio
  const [mode, setMode] = useState<"simple" | "advanced">("simple")

  if (!portfolioDocument) {
    return (
      <div className={cn("p-4 text-sm text-muted-foreground", className)}>
        <p className="font-medium text-foreground">Loading content…</p>
        <p className="mt-1 text-xs">If this stays empty, return home and run the PDF flow again so your portfolio document can load.</p>
      </div>
    )
  }

  const hero = findSectionByType(portfolioDocument.sections, "hero")
  const about = findSectionByType(portfolioDocument.sections, "about")
  const skills = findSectionByType(portfolioDocument.sections, "skills")
  const experience = findSectionByType(portfolioDocument.sections, "experience")
  const projects = findSectionByType(portfolioDocument.sections, "projects")
  const contact = findSectionByType(portfolioDocument.sections, "contact")

  if (activeId === "site-seo") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <h3 className="text-sm font-semibold">Site & SEO</h3>
        <EditableField
          id="studio-meta-title"
          label={studio.metaTitleLabel}
          value={portfolioDocument.meta.title}
          onSave={(v) => updateMeta({ title: v })}
        />
        <EditableField
          id="studio-meta-desc"
          label={studio.metaDescriptionLabel}
          value={portfolioDocument.meta.description}
          onSave={(v) => updateMeta({ description: v })}
          multiline
        />
      </div>
    )
  }

  if (activeId === "hero" && hero?.type === "hero") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Hero</h3>
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              className={cn("px-3 py-1 text-xs", mode === "simple" && "bg-primary text-primary-foreground")}
              onClick={() => setMode("simple")}
            >
              Simple
            </button>
            <button
              type="button"
              className={cn("px-3 py-1 text-xs", mode === "advanced" && "bg-primary text-primary-foreground")}
              onClick={() => setMode("advanced")}
            >
              Advanced
            </button>
          </div>
        </div>
        <EditableField
          id={`studio-hero-name-${hero.id}`}
          label={copy.fieldName}
          value={hero.data.name}
          onSave={(v) => updateSection("hero", { name: v })}
        />
        <EditableField
          id={`studio-hero-title-${hero.id}`}
          label={copy.fieldTitle}
          value={hero.data.title}
          onSave={(v) => updateSection("hero", { title: v })}
        />
        <EditableField
          id={`studio-hero-tagline-${hero.id}`}
          label={copy.fieldTagline}
          value={hero.data.tagline}
          onSave={(v) => updateSection("hero", { tagline: v })}
          multiline
        />
        {mode === "advanced" ? (
          <EditableField
            id={`studio-hero-image-${hero.id}`}
            label={studio.fieldHeroImageUrl}
            value={hero.data.imageUrl ?? ""}
            onSave={(v) => updateSection("hero", { imageUrl: v.trim() || null })}
          />
        ) : null}
      </div>
    )
  }

  if (activeId === "about" && about?.type === "about") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <h3 className="text-sm font-semibold">{getPortfolioSectionLabel("about")}</h3>
        <EditableField
          id={`studio-about-${about.id}`}
          label={copy.fieldBody}
          value={about.data.body}
          onSave={(v) => updateSection("about", { body: v })}
          multiline
        />
      </div>
    )
  }

  if (activeId === "skills" && skills?.type === "skills") {
    return (
      <div className={cn("space-y-3 p-4", className)}>
        <Label className="text-sm font-semibold">{getPortfolioSectionLabel("skills")}</Label>
        <Textarea
          className="min-h-32 font-mono text-sm"
          value={skills.data.items.join("\n")}
          onChange={(e) => {
            const items = e.target.value
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
            setSkillItems(items)
          }}
        />
        <p className="text-xs text-muted-foreground">{studio.skillsHint}</p>
      </div>
    )
  }

  if (activeId === "experience" && experience?.type === "experience") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <h3 className="text-sm font-semibold">{getPortfolioSectionLabel("experience")}</h3>
        {experience.data.items.map((item, index) => (
          <div key={`${item.company}-${index}`} className="space-y-2 rounded-lg border border-border p-3">
            <EditableField
              id={`studio-exp-${index}-role`}
              label={studio.fieldRole}
              value={item.role}
              onSave={(v) => updateExperienceItem(index, { role: v })}
            />
            <EditableField
              id={`studio-exp-${index}-company`}
              label={studio.fieldCompany}
              value={item.company}
              onSave={(v) => updateExperienceItem(index, { company: v })}
            />
            <EditableField
              id={`studio-exp-${index}-duration`}
              label={studio.fieldDuration}
              value={item.duration}
              onSave={(v) => updateExperienceItem(index, { duration: v })}
            />
            <EditableField
              id={`studio-exp-${index}-desc`}
              label={studio.fieldDescription}
              value={item.description}
              onSave={(v) => updateExperienceItem(index, { description: v })}
              multiline
            />
          </div>
        ))}
      </div>
    )
  }

  if (activeId === "projects" && projects?.type === "projects") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <h3 className="text-sm font-semibold">{getPortfolioSectionLabel("projects")}</h3>
        {projects.data.items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="space-y-2 rounded-lg border border-border p-3">
            <EditableField
              id={`studio-proj-${index}-name`}
              label={studio.fieldProjectName}
              value={item.name}
              onSave={(v) => updateProjectItem(index, { name: v })}
            />
            <EditableField
              id={`studio-proj-${index}-body`}
              label={studio.fieldProjectBody}
              value={item.description}
              onSave={(v) => updateProjectItem(index, { description: v })}
              multiline
            />
            <EditableField
              id={`studio-proj-${index}-tech`}
              label={studio.fieldTechStack}
              value={item.tech.join(", ")}
              onSave={(v) =>
                updateProjectItem(index, {
                  tech: v
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
            <EditableField
              id={`studio-proj-${index}-img`}
              label={studio.fieldProjectImageUrl}
              value={item.imageUrl ?? ""}
              onSave={(v) => updateProjectItem(index, { imageUrl: v.trim() || null })}
            />
          </div>
        ))}
      </div>
    )
  }

  if (activeId === "contact" && contact?.type === "contact") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <h3 className="text-sm font-semibold">{getPortfolioSectionLabel("contact")}</h3>
        <EditableField
          id="studio-contact-headline"
          label={studio.fieldContactHeadline}
          value={contact.data.headline ?? ""}
          onSave={(v) => updateSection("contact", { headline: v })}
        />
        <EditableField
          id="studio-contact-email"
          label={copy.contactEmailLabel}
          value={contact.data.email}
          onSave={(v) => updateSection("contact", { email: v })}
        />
        <EditableField
          id="studio-contact-phone"
          label={copy.contactPhoneLabel}
          value={contact.data.phone}
          onSave={(v) => updateSection("contact", { phone: v })}
        />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{copy.contactLinksLabel}</Label>
          <Textarea
            className="min-h-24 font-mono text-sm"
            value={contact.data.links.join("\n")}
            onChange={(e) => {
              const links = e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean)
              updateSection("contact", { links })
            }}
          />
        </div>
      </div>
    )
  }

  if (activeId === "education") {
    return (
      <div className={cn("p-4 text-sm text-muted-foreground", className)}>
        Education entries are folded into your parsed resume. Refine copy in{" "}
        <span className="font-medium text-foreground">Experience</span> or regenerate design from the right panel.
      </div>
    )
  }

  if (activeId === "sections") {
    return (
      <div className={cn("space-y-3 p-4", className)}>
        <p className="text-sm text-muted-foreground">
          Reorder sections with{" "}
          <button type="button" className="font-medium text-primary underline-offset-2 hover:underline" onClick={() => setEditMode(true)}>
            Canvas mode
          </button>{" "}
          (bottom of the preview).
        </p>
      </div>
    )
  }

  if (activeId === "settings") {
    return (
      <div className={cn("space-y-2 p-4 text-sm text-muted-foreground", className)}>
        <p>Workspace reset is available from the home flow. Style notes and variation live in the Design Direction panel.</p>
      </div>
    )
  }

  return <div className={cn("p-4 text-sm text-muted-foreground", className)}>Select a section to edit.</div>
}
