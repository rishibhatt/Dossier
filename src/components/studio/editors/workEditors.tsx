"use client"

import { EditorStack, Field, ImageField, ItemList, SplitField } from "@/components/studio/editors/fields"
import { patchSection } from "@/features/studio/sectionOps"
import { videoEmbed } from "@/lib/portfolio/media"
import type {
  MentionEntry,
  PortfolioCreditsSection,
  PortfolioGallerySection,
  PortfolioPracticeSection,
  PortfolioPressSection,
  PortfolioPublicationsSection,
  PortfolioServicesSection,
  PortfolioShowreelSection,
  PortfolioTestimonialsSection,
} from "@/types/dossier"

/** Editors for the profession sections: pictures, video, credits, services, quotes, mentions, and where to visit. */

export function GalleryEditor({ s }: { s: PortfolioGallerySection }) {
  return (
    <>
      <p className="px-4 pt-4 text-sm text-[var(--site-ink-2)]">Paste links to your pictures, for example from Instagram, Behance, Pinterest or your own site. Only pictures with a link show on your page.</p>
      <ItemList
        items={s.data.items}
        onChange={(items) => patchSection(s.id, "gallery", { items })}
        make={() => ({ imageUrl: "", caption: "", link: null })}
        title={(it) => it.caption || (it.imageUrl ? "Picture" : "New picture")}
        addLabel="Add a picture"
        noun="picture"
        render={(it, set) => (
          <>
            <ImageField label="Picture" upload={false} value={it.imageUrl} onChange={(v) => set({ imageUrl: v ?? "" })} />
            <Field label="Caption" value={it.caption} placeholder="Living room, Bandra apartment, 2024" onChange={(caption) => set({ caption })} />
            <Field label="Project link (optional)" type="url" placeholder="https://" value={it.link ?? ""} onChange={(v) => set({ link: v.trim() || null })} />
            <ImageField label="Before picture (optional, for the before and after layout)" upload={false} value={it.beforeUrl} onChange={(beforeUrl) => set({ beforeUrl })} />
          </>
        )}
      />
    </>
  )
}

export function ShowreelEditor({ s }: { s: PortfolioShowreelSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "showreel", { items })}
      make={() => ({ videoUrl: "", title: "", note: "" })}
      title={(it) => it.title || "Video"}
      addLabel="Add a video"
      noun="video"
      render={(it, set) => (
        <>
          <Field label="Video link" type="url" placeholder="YouTube or Vimeo link" value={it.videoUrl} onChange={(videoUrl) => set({ videoUrl: videoUrl.trim() })} />
          {it.videoUrl.trim() && !videoEmbed(it.videoUrl) ? <p className="text-sm text-[var(--site-ink-2)]">This link shows as a Watch link. YouTube and Vimeo links play on your page.</p> : null}
          <Field label="Title" value={it.title} placeholder="Showreel 2025" onChange={(title) => set({ title })} />
          <Field label="Note" value={it.note} placeholder="Lead, short film, dir. A. Rao" onChange={(note) => set({ note })} />
        </>
      )}
    />
  )
}

export function CreditsEditor({ s }: { s: PortfolioCreditsSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "credits", { items })}
      make={() => ({ title: "", role: "", company: "", year: "" })}
      title={(it) => [it.title, it.role].filter(Boolean).join(", ")}
      addLabel="Add a credit"
      noun="credit"
      render={(it, set) => (
        <>
          <Field label="Production" value={it.title} onChange={(title) => set({ title })} />
          <Field label="Your part" value={it.role} onChange={(role) => set({ role })} />
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
            <Field label="Director, company or venue" value={it.company} onChange={(company) => set({ company })} />
            <Field label="Year" value={it.year} onChange={(year) => set({ year })} />
          </div>
        </>
      )}
    />
  )
}

export function ServicesEditor({ s }: { s: PortfolioServicesSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "services", { items })}
      make={() => ({ name: "", description: "", price: "" })}
      title={(it) => it.name}
      addLabel="Add a service"
      noun="service"
      render={(it, set) => (
        <>
          <Field label="Service" value={it.name} onChange={(name) => set({ name })} />
          <Field label="What it includes" multiline value={it.description} onChange={(description) => set({ description })} />
          <Field label="Price (optional)" value={it.price} placeholder="From ₹2,000" onChange={(price) => set({ price })} />
        </>
      )}
    />
  )
}

export function TestimonialsEditor({ s }: { s: PortfolioTestimonialsSection }) {
  return (
    <>
      <p className="px-4 pt-4 text-sm text-[var(--site-ink-2)]">Use real words someone wrote or said about your work, and ask them first.</p>
      <ItemList
        items={s.data.items}
        onChange={(items) => patchSection(s.id, "testimonials", { items })}
        make={() => ({ quote: "", name: "", role: "" })}
        title={(it) => it.name || "Quote"}
        addLabel="Add a quote"
        noun="quote"
        render={(it, set) => (
          <>
            <Field label="Quote" multiline value={it.quote} onChange={(quote) => set({ quote })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={it.name} onChange={(name) => set({ name })} />
              <Field label="Role or company" value={it.role} onChange={(role) => set({ role })} />
            </div>
          </>
        )}
      />
    </>
  )
}

function MentionFields({ it, set, outletLabel }: { it: MentionEntry; set: (p: Partial<MentionEntry>) => void; outletLabel: string }) {
  return (
    <>
      <Field label="Title" value={it.title} onChange={(title) => set({ title })} />
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
        <Field label={outletLabel} value={it.outlet} onChange={(outlet) => set({ outlet })} />
        <Field label="Year" value={it.year} onChange={(year) => set({ year })} />
      </div>
      <Field label="Link (optional)" type="url" placeholder="https://" value={it.link ?? ""} onChange={(v) => set({ link: v.trim() || null })} />
    </>
  )
}

const blankMention = (): MentionEntry => ({ title: "", outlet: "", year: "", link: null })

export function PressEditor({ s }: { s: PortfolioPressSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "press", { items })}
      make={blankMention}
      title={(it) => it.outlet || it.title}
      addLabel="Add a mention"
      noun="mention"
      render={(it, set) => <MentionFields it={it} set={set} outletLabel="Magazine, site or award" />}
    />
  )
}

export function PublicationsEditor({ s }: { s: PortfolioPublicationsSection }) {
  return (
    <ItemList
      items={s.data.items}
      onChange={(items) => patchSection(s.id, "publications", { items })}
      make={blankMention}
      title={(it) => it.title}
      addLabel="Add a publication"
      noun="publication"
      render={(it, set) => <MentionFields it={it} set={set} outletLabel="Journal, book or event" />}
    />
  )
}

export function PracticeEditor({ s }: { s: PortfolioPracticeSection }) {
  const set = (p: Partial<PortfolioPracticeSection["data"]>) => patchSection(s.id, "practice", p)
  return (
    <EditorStack>
      <Field label="Name" value={s.data.name} placeholder="Clinic, chambers or studio" onChange={(name) => set({ name })} />
      <Field label="Address" multiline rows={3} value={s.data.address} onChange={(address) => set({ address })} />
      <SplitField label="Hours" sep={"\n"} hint="One line each, for example: Mon to Fri, 10:00 to 18:00" values={s.data.hours} onChange={(hours) => set({ hours })} />
      <Field label="Booking link (optional)" type="url" placeholder="Practo, Calendly or your booking page" value={s.data.bookingUrl} onChange={(bookingUrl) => set({ bookingUrl: bookingUrl.trim() })} />
      <Field label="Map link (optional)" type="url" placeholder="Google Maps link" value={s.data.mapUrl} onChange={(mapUrl) => set({ mapUrl: mapUrl.trim() })} />
    </EditorStack>
  )
}
