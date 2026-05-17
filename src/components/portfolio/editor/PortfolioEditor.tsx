"use client"

import { EditableField } from "@/components/portfolio/editor/EditableField"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { messages } from "@/config/messages"
import { findSectionByType } from "@/lib/portfolio/findSection"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"

type PortfolioEditorProps = {
  className?: string
}

export function PortfolioEditor({ className }: PortfolioEditorProps) {
  const portfolioDocument = usePortfolioStore((s) => s.document)
  const updateSection = usePortfolioStore((s) => s.updateSection)
  const updateMeta = usePortfolioStore((s) => s.updateMeta)
  const setSkillItems = usePortfolioStore((s) => s.setSkillItems)
  const updateExperienceItem = usePortfolioStore((s) => s.updateExperienceItem)
  const updateProjectItem = usePortfolioStore((s) => s.updateProjectItem)

  const copy = messages.dossier
  const studio = copy.studio

  if (!portfolioDocument) return null

  const hero = findSectionByType(portfolioDocument.sections, "hero")
  const about = findSectionByType(portfolioDocument.sections, "about")
  const skills = findSectionByType(portfolioDocument.sections, "skills")
  const experience = findSectionByType(portfolioDocument.sections, "experience")
  const projects = findSectionByType(portfolioDocument.sections, "projects")
  const contact = findSectionByType(portfolioDocument.sections, "contact")

  return (
    <div className={cn("space-y-8 pb-4", className)}>
      <div>
        <p className="typo-h3 text-foreground">{studio.editorPanelTitle}</p>
        <p className="typo-body-md text-muted-foreground">{copy.regenerateHint}</p>
      </div>

      <section className="space-y-4">
        <p className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {studio.seoSectionLabel}
        </p>
        <EditableField
          id="edit-meta-title"
          label={studio.metaTitleLabel}
          value={portfolioDocument.meta.title}
          onSave={(v) => updateMeta({ title: v })}
        />
        <EditableField
          id="edit-meta-desc"
          label={studio.metaDescriptionLabel}
          value={portfolioDocument.meta.description}
          onSave={(v) => updateMeta({ description: v })}
          multiline
        />
      </section>

      <Separator />

      {hero?.type === "hero" ? (
        <section className="space-y-4">
          <p className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {getPortfolioSectionLabel("hero")}
          </p>
          <EditableField
            id={`edit-hero-name-${hero.id}`}
            label={copy.fieldName}
            value={hero.data.name}
            onSave={(v) => updateSection("hero", { name: v })}
          />
          <EditableField
            id={`edit-hero-title-${hero.id}`}
            label={copy.fieldTitle}
            value={hero.data.title}
            onSave={(v) => updateSection("hero", { title: v })}
          />
          <EditableField
            id={`edit-hero-tagline-${hero.id}`}
            label={copy.fieldTagline}
            value={hero.data.tagline}
            onSave={(v) => updateSection("hero", { tagline: v })}
            multiline
          />
          <EditableField
            id={`edit-hero-image-${hero.id}`}
            label={studio.fieldHeroImageUrl}
            value={hero.data.imageUrl ?? ""}
            onSave={(v) => updateSection("hero", { imageUrl: v.trim() || null })}
          />
        </section>
      ) : null}

      {about?.type === "about" ? (
        <section className="space-y-4">
          <p className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {getPortfolioSectionLabel("about")}
          </p>
          <EditableField
            id={`edit-about-${about.id}`}
            label={copy.fieldBody}
            value={about.data.body}
            onSave={(v) => updateSection("about", { body: v })}
            multiline
          />
        </section>
      ) : null}

      {skills?.type === "skills" ? (
        <section className="space-y-2">
          <Label className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {getPortfolioSectionLabel("skills")}
          </Label>
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
            aria-describedby={`skills-hint-${skills.id}`}
          />
          <p id={`skills-hint-${skills.id}`} className="typo-label-sm text-muted-foreground">
            {studio.skillsHint}
          </p>
        </section>
      ) : null}

      {experience?.type === "experience" ? (
        <section className="space-y-6">
          <p className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {getPortfolioSectionLabel("experience")}
          </p>
          {experience.data.items.map((item, index) => (
            <div key={`${item.company}-${index}`} className="space-y-3 rounded-lg border border-border p-3">
              <EditableField
                id={`edit-exp-${index}-company`}
                label={studio.fieldCompany}
                value={item.company}
                onSave={(v) => updateExperienceItem(index, { company: v })}
              />
              <EditableField
                id={`edit-exp-${index}-role`}
                label={studio.fieldRole}
                value={item.role}
                onSave={(v) => updateExperienceItem(index, { role: v })}
              />
              <EditableField
                id={`edit-exp-${index}-duration`}
                label={studio.fieldDuration}
                value={item.duration}
                onSave={(v) => updateExperienceItem(index, { duration: v })}
              />
              <EditableField
                id={`edit-exp-${index}-desc`}
                label={studio.fieldDescription}
                value={item.description}
                onSave={(v) => updateExperienceItem(index, { description: v })}
                multiline
              />
            </div>
          ))}
        </section>
      ) : null}

      {projects?.type === "projects" ? (
        <section className="space-y-6">
          <p className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {getPortfolioSectionLabel("projects")}
          </p>
          {projects.data.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="space-y-3 rounded-lg border border-border p-3">
              <EditableField
                id={`edit-proj-${index}-name`}
                label={studio.fieldProjectName}
                value={item.name}
                onSave={(v) => updateProjectItem(index, { name: v })}
              />
              <EditableField
                id={`edit-proj-${index}-body`}
                label={studio.fieldProjectBody}
                value={item.description}
                onSave={(v) => updateProjectItem(index, { description: v })}
                multiline
              />
              <EditableField
                id={`edit-proj-${index}-tech`}
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
                id={`edit-proj-${index}-img`}
                label={studio.fieldProjectImageUrl}
                value={item.imageUrl ?? ""}
                onSave={(v) => updateProjectItem(index, { imageUrl: v.trim() || null })}
              />
            </div>
          ))}
        </section>
      ) : null}

      {contact?.type === "contact" ? (
        <section className="space-y-4">
          <p className="typo-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {getPortfolioSectionLabel("contact")}
          </p>
          <EditableField
            id={`edit-contact-headline-${contact.id}`}
            label={studio.fieldContactHeadline}
            value={contact.data.headline ?? ""}
            onSave={(v) => updateSection("contact", { headline: v })}
          />
          <EditableField
            id={`edit-contact-email-${contact.id}`}
            label={copy.contactEmailLabel}
            value={contact.data.email}
            onSave={(v) => updateSection("contact", { email: v })}
          />
          <EditableField
            id={`edit-contact-phone-${contact.id}`}
            label={copy.contactPhoneLabel}
            value={contact.data.phone}
            onSave={(v) => updateSection("contact", { phone: v })}
          />
          <div className="space-y-2">
            <Label className="typo-label-sm text-muted-foreground" htmlFor={`edit-contact-links-${contact.id}`}>
              {copy.contactLinksLabel}
            </Label>
            <Textarea
              id={`edit-contact-links-${contact.id}`}
              className="min-h-24 font-mono text-sm"
              value={contact.data.links.join("\n")}
              onChange={(e) => {
                const links = e.target.value
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                updateSection("contact", { links })
              }}
              aria-describedby={`contact-links-hint-${contact.id}`}
            />
            <p id={`contact-links-hint-${contact.id}`} className="typo-label-sm text-muted-foreground">
              {studio.fieldLinksHint}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
