"use client"

import { EditorStack, Field, ImageField, RowsField } from "@/components/studio/editors/fields"
import { patchSection } from "@/features/studio/sectionOps"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { PortfolioAboutSection, PortfolioContactSection, PortfolioHeroSection } from "@/types/dossier"

export function HeroEditor({ s }: { s: PortfolioHeroSection }) {
  const set = (p: Partial<PortfolioHeroSection["data"]>) => patchSection(s.id, "hero", p)
  return (
    <EditorStack>
      <Field label="Name" value={s.data.name} onChange={(name) => set({ name })} />
      <Field label="Role" value={s.data.title} onChange={(title) => set({ title })} />
      <Field label="One line about you" multiline rows={2} value={s.data.tagline} onChange={(tagline) => set({ tagline })} />
      <ImageField label="Photo (optional)" value={s.data.imageUrl} onChange={(imageUrl) => set({ imageUrl })} />
    </EditorStack>
  )
}

export function AboutEditor({ s }: { s: PortfolioAboutSection }) {
  return (
    <EditorStack>
      <Field label="About you" multiline rows={7} value={s.data.body} onChange={(body) => patchSection(s.id, "about", { body })} />
    </EditorStack>
  )
}

export function ContactEditor({ s }: { s: PortfolioContactSection }) {
  const set = (p: Partial<PortfolioContactSection["data"]>) => patchSection(s.id, "contact", p)
  return (
    <EditorStack>
      <Field label="Heading" value={s.data.headline ?? ""} placeholder="Get in touch" onChange={(headline) => set({ headline })} />
      <Field label="Email" type="email" value={s.data.email} onChange={(email) => set({ email })} />
      <Field label="Phone" type="tel" value={s.data.phone} onChange={(phone) => set({ phone })} />
      <Field label="City or region" value={s.data.location ?? ""} onChange={(location) => set({ location })} />
      <RowsField label="Links" rows={s.data.links} placeholder="https://linkedin.com/in/you" addLabel="Add a link" onChange={(links) => set({ links })} />
    </EditorStack>
  )
}

/** Page title and description, used by search results and link previews. */
export function MetaEditor() {
  const meta = usePortfolioStore((s) => s.document?.meta)
  const updateMeta = usePortfolioStore((s) => s.updateMeta)
  if (!meta) return null
  return (
    <EditorStack>
      <Field label="Page title" value={meta.title} onChange={(title) => updateMeta({ title })} />
      <Field label="Description for link previews" multiline rows={3} value={meta.description} onChange={(description) => updateMeta({ description })} />
    </EditorStack>
  )
}
