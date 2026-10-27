"use client"

import { ArrowDown, ArrowUp, Check, ChevronDown, Eye, EyeOff, Plus, Trash2, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { PERSONAL_LABELS, PRESETS, SECTION_LABELS, formatMonth, formatRange } from "@/lib/resume/presets"
import {
  SECTION_TYPES,
  newId,
  type EducationItem,
  type EntryItem,
  type ExperienceItem,
  type LanguageItem,
  type ProjectItem,
  type ResumeDocument,
  type ResumeSection,
  type SectionType,
  type SkillGroup,
} from "@/lib/resume/schema"

import { SAMPLE_RESUMES } from "@/lib/resume/samples"

import { useResumeEditor } from "../lib/store"
import { guessLinkLabel } from "@/lib/resume/links"
import { AreaField, BulletsField, CheckField, MonthField, TextField } from "./fields"

type AnyItem = ResumeSection["items"][number]

const ADD_LABEL: Record<SectionType, string> = {
  experience: "Add a job",
  volunteering: "Add a role",
  education: "Add a school",
  projects: "Add a project",
  skills: "Add a skill group",
  certifications: "Add a certification",
  awards: "Add an award",
  publications: "Add a publication",
  languages: "Add a language",
  custom: "Add an entry",
}

function newItem(type: SectionType): AnyItem {
  const id = newId("i")
  switch (type) {
    case "experience":
    case "volunteering":
      return { id, role: "", org: "", location: "", start: "", end: "", current: false, bullets: [] } satisfies ExperienceItem
    case "education":
      return { id, school: "", degree: "", location: "", start: "", end: "", current: false, bullets: [] } satisfies EducationItem
    case "projects":
      return { id, name: "", role: "", link: "", linkLabel: "", start: "", end: "", current: false, bullets: [] } satisfies ProjectItem
    case "skills":
      return { id, group: "", items: [] } satisfies SkillGroup
    case "languages":
      return { id, language: "", level: "" } satisfies LanguageItem
    default:
      return { id, title: "", subtitle: "", date: "", link: "", linkLabel: "", detail: "" } satisfies EntryItem
  }
}

function itemSummary(type: SectionType, item: AnyItem): { title: string; meta: string } {
  const empty = "Not filled in yet"
  switch (type) {
    case "experience":
    case "volunteering": {
      const i = item as ExperienceItem
      return { title: [i.role, i.org].filter(Boolean).join(", ") || empty, meta: formatRange(i.start, i.end, i.current, "short-month") }
    }
    case "education": {
      const i = item as EducationItem
      return { title: [i.degree, i.school].filter(Boolean).join(", ") || empty, meta: formatRange(i.start, i.end, i.current, "short-month") }
    }
    case "projects": {
      const i = item as ProjectItem
      return { title: i.name || empty, meta: i.role }
    }
    case "skills": {
      const i = item as SkillGroup
      return { title: i.group || (i.items.length ? i.items.slice(0, 4).join(", ") : empty), meta: i.items.length ? `${i.items.length} skills` : "" }
    }
    case "languages": {
      const i = item as LanguageItem
      return { title: i.language || empty, meta: i.level }
    }
    default: {
      const i = item as EntryItem
      return { title: i.title || empty, meta: [i.subtitle, formatMonth(i.date, "short-month")].filter(Boolean).join(" · ") }
    }
  }
}

/* -------------------------------------------------------------------------------------------- */

const STEPS_KEY = "dossier:resume:v1:steps-dismissed"

function Checklist({
  doc,
  sample,
  templateChosen,
  downloaded,
  onDownload,
  onOpenDesign,
}: {
  doc: ResumeDocument
  sample: ResumeDocument | null
  templateChosen: boolean
  downloaded: boolean
  onDownload: () => void
  onOpenDesign: () => void
}) {
  // This panel only renders on the client, after the draft has loaded, so storage can be read up front.
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(STEPS_KEY) === "1"
    } catch {
      return false
    }
  })
  if (hidden) return null

  // When the draft began as a sample, only lines that differ from the sample count as the person's own.
  const sampleTitles = new Set(sample ? sample.sections.flatMap((s) => s.items.map((i) => itemSummary(s.type, i).title)) : [])
  const ownName = Boolean(doc.basics.name.trim() && doc.basics.email.trim()) && (!sample || (doc.basics.name !== sample.basics.name && doc.basics.email !== sample.basics.email))
  const ownEntry = doc.sections.some((s) =>
    s.items.some((i) => {
      const t = itemSummary(s.type, i).title
      return t !== "Not filled in yet" && !sampleTitles.has(t)
    }),
  )
  const steps = [
    { id: "start", text: "Start your resume", done: true },
    { id: "template", text: "Choose a template", done: templateChosen, action: { label: "Open Design", run: onOpenDesign } },
    { id: "basics", text: "Add your name and email", done: ownName, go: "rz-basics" },
    { id: "entry", text: sample ? "Replace one sample entry with your own" : "Add one job, school or project", done: ownEntry, go: "rz-sections" },
    { id: "download", text: "Download your PDF", done: downloaded, action: { label: "Download", run: onDownload } },
  ]
  const done = steps.filter((s) => s.done).length
  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem(STEPS_KEY, "1")
    } catch {
      /* storage blocked */
    }
  }

  return (
    <section className="rz-steps" aria-label="Steps to a finished resume">
      <div className="rz-steps-head">
        <strong>{done === steps.length ? "Your resume is ready." : "Steps to a finished PDF"}</strong>
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span className="rz-mono">
            {done} of {steps.length}
          </span>
          <button type="button" className="rz-icon-btn" aria-label="Hide these steps" onClick={dismiss}>
            <X />
          </button>
        </span>
      </div>
      <div className="rz-steps-meter" aria-hidden>
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol>
        {steps.map((s) => (
          <li key={s.id} className="rz-step" data-done={s.done}>
            <span className="rz-step-mark" aria-hidden>
              {s.done ? <Check /> : null}
            </span>
            <span className="rz-step-text">
              {s.text}
              <span className="sr-only">{s.done ? " (done)" : ""}</span>
            </span>
            {!s.done && s.go ? (
              <button type="button" onClick={() => document.getElementById(s.go!)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                Go there
              </button>
            ) : null}
            {!s.done && s.action ? (
              <button type="button" onClick={s.action.run}>
                {s.action.label}
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

/* -------------------------------------------------------------------------------------------- */

function ItemEditor({ type, item, onChange }: { type: SectionType; item: AnyItem; onChange: (patch: Partial<AnyItem>) => void }) {
  const set = <K extends string>(key: K) => (v: unknown) => onChange({ [key]: v } as Partial<AnyItem>)
  switch (type) {
    case "experience":
    case "volunteering": {
      const i = item as ExperienceItem
      return (
        <div className="rz-grid">
          <TextField label="Job title" value={i.role} onChange={set("role")} placeholder="Senior Accountant" maxLength={120} />
          <TextField label="Company or organisation" value={i.org} onChange={set("org")} placeholder="Kulkarni & Rao LLP" maxLength={120} />
          <TextField label="Location" value={i.location} onChange={set("location")} placeholder="City, or Remote" maxLength={120} wide />
          <MonthField label="Start" value={i.start} onChange={set("start")} />
          <MonthField label="End" value={i.end} onChange={set("end")} disabled={i.current} />
          <div className="rz-wide">
            <CheckField label="I work here now" checked={i.current} onChange={(v) => onChange({ current: v, ...(v ? { end: "" } : {}) } as Partial<AnyItem>)} />
          </div>
          <BulletsField bullets={i.bullets} onChange={set("bullets")} placeholder="What you did, and what changed because of it. Numbers help." />
        </div>
      )
    }
    case "education": {
      const i = item as EducationItem
      return (
        <div className="rz-grid">
          <TextField label="Degree or qualification" value={i.degree} onChange={set("degree")} placeholder="B.Com, Accounting" maxLength={160} />
          <TextField label="School, college or university" value={i.school} onChange={set("school")} maxLength={160} />
          <TextField label="Location" value={i.location} onChange={set("location")} maxLength={120} wide />
          <MonthField label="Start" value={i.start} onChange={set("start")} />
          <MonthField label="End" value={i.end} onChange={set("end")} disabled={i.current} />
          <div className="rz-wide">
            <CheckField label="I study here now" checked={i.current} onChange={(v) => onChange({ current: v, ...(v ? { end: "" } : {}) } as Partial<AnyItem>)} />
          </div>
          <BulletsField label="Details (optional)" bullets={i.bullets} onChange={set("bullets")} placeholder="Grade, thesis, awards, relevant courses" max={12} />
        </div>
      )
    }
    case "projects": {
      const i = item as ProjectItem
      return (
        <div className="rz-grid">
          <TextField label="Project name" value={i.name} onChange={set("name")} maxLength={120} />
          <TextField label="Your role" value={i.role} onChange={set("role")} placeholder="Creator, Lead, Contributor" maxLength={120} />
          <TextField
            label="Link"
            value={i.link}
            onChange={(url) => {
              const guessed = !i.linkLabel?.trim() ? guessLinkLabel(url) : i.linkLabel
              onChange({ link: url, linkLabel: guessed } as Partial<AnyItem>)
            }}
            placeholder="https://"
            type="url"
            inputMode="url"
            maxLength={300}
          />
          <TextField
            label="Link text (optional)"
            value={i.linkLabel ?? ""}
            onChange={set("linkLabel")}
            placeholder="e.g. GitHub, Live Demo"
            maxLength={60}
          />
          <MonthField label="Start" value={i.start} onChange={set("start")} />
          <MonthField label="End" value={i.end} onChange={set("end")} />
          <BulletsField bullets={i.bullets} onChange={set("bullets")} placeholder="What it does and who uses it" max={12} />
        </div>
      )
    }
    case "skills": {
      const i = item as SkillGroup
      return (
        <div className="rz-grid">
          <TextField label="Group name (optional)" value={i.group} onChange={set("group")} placeholder="Tools, Languages, Clinical" wide maxLength={80} />
          <SkillsInput items={i.items} onChange={set("items")} />
        </div>
      )
    }
    case "languages": {
      const i = item as LanguageItem
      return (
        <div className="rz-grid">
          <TextField label="Language" value={i.language} onChange={set("language")} maxLength={60} />
          <LevelInput value={i.level} onChange={set("level")} />
        </div>
      )
    }
    default: {
      const i = item as EntryItem
      const titleLabel = type === "publications" ? "Title" : type === "certifications" ? "Certification" : type === "awards" ? "Award" : "Title"
      const subLabel = type === "publications" ? "Journal, venue or publisher" : type === "custom" ? "Subtitle (optional)" : "Issued by"
      return (
        <div className="rz-grid">
          <TextField label={titleLabel} value={i.title} onChange={set("title")} wide maxLength={200} />
          <TextField label={subLabel} value={i.subtitle} onChange={set("subtitle")} maxLength={200} />
          <MonthField label="Date" value={i.date} onChange={set("date")} />
          <TextField
            label="Link (optional)"
            value={i.link}
            onChange={(url) => {
              const guessed = !i.linkLabel?.trim() ? guessLinkLabel(url) : i.linkLabel
              onChange({ link: url, linkLabel: guessed } as Partial<AnyItem>)
            }}
            placeholder="https://"
            type="url"
            inputMode="url"
            maxLength={300}
          />
          <TextField
            label="Link text (optional)"
            value={i.linkLabel ?? ""}
            onChange={set("linkLabel")}
            placeholder="e.g. Credential, Publication"
            maxLength={60}
          />
          <AreaField label="Note (optional)" value={i.detail} onChange={set("detail")} maxLength={400} rows={2} />
        </div>
      )
    }
  }
}

/** Comma-separated skills. Kept as typed text while focused so a trailing comma or space isn't eaten. */
function SkillsInput({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  const [text, setText] = useState(items.join(", "))
  const [focused, setFocused] = useState(false)
  const shown = focused ? text : items.join(", ")
  return (
    <div className="rz-field rz-wide">
      <label className="rz-label">
        <span>Skills</span>
        <span className="rz-mono">Separate with commas</span>
      </label>
      <textarea
        className="rz-textarea"
        rows={2}
        value={shown}
        maxLength={2000}
        placeholder="Excel, Tally Prime, GST filing"
        onFocus={() => {
          setText(items.join(", "))
          setFocused(true)
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setText(e.target.value)
          onChange(
            e.target.value
              .split(/[,\n]/)
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 40)
              .map((s) => s.slice(0, 60)),
          )
        }}
      />
    </div>
  )
}

const LEVELS = ["Native", "Fluent", "C2", "C1", "B2", "B1", "A2", "A1", "Basic"]

function LevelInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rz-field">
      <label className="rz-label">
        <span>Level</span>
        <span className="rz-mono">CEFR A1–C2</span>
      </label>
      <select className="rz-select" value={LEVELS.includes(value) || !value ? value : "__custom"} onChange={(e) => onChange(e.target.value === "__custom" ? value : e.target.value)}>
        <option value="">Choose a level</option>
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
        {value && !LEVELS.includes(value) ? <option value="__custom">{value}</option> : null}
      </select>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------- */

function SectionEditor({ section, index, count }: { section: ResumeSection; index: number; count: number }) {
  const edit = useResumeEditor((s) => s.edit)
  const undo = useResumeEditor((s) => s.undo)
  const [open, setOpen] = useState<Set<string>>(() => {
    const first = section.items[0]
    return new Set(first && itemSummary(section.type, first).title === "Not filled in yet" ? [first.id] : [])
  })

  const mutate = (key: string, fn: (s: ResumeSection) => void) =>
    edit(`${section.id}:${key}`, (doc) => {
      const s = doc.sections.find((x) => x.id === section.id)
      if (s) fn(s)
    })

  const toggle = (id: string) =>
    setOpen((o) => {
      const n = new Set(o)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const addItem = () => {
    const item = newItem(section.type)
    mutate("add", (s) => (s.items as AnyItem[]).push(item))
    setOpen((o) => new Set(o).add(item.id))
  }

  const moveSection = (d: -1 | 1) =>
    edit("move-section", (doc) => {
      const i = doc.sections.findIndex((x) => x.id === section.id)
      const j = i + d
      if (i < 0 || j < 0 || j >= doc.sections.length) return
      ;[doc.sections[i], doc.sections[j]] = [doc.sections[j], doc.sections[i]]
    })

  const removeSection = () => {
    edit("remove-section", (doc) => {
      doc.sections = doc.sections.filter((x) => x.id !== section.id)
    })
    toast(`${section.title || SECTION_LABELS[section.type]} removed`, { action: { label: "Undo", onClick: () => undo() } })
  }

  const label = SECTION_LABELS[section.type]

  return (
    <section className="rz-block" aria-label={section.title || label}>
      <div className="rz-block-head">
        <input
          className="rz-h-input"
          aria-label={`${label} section heading`}
          value={section.title}
          placeholder={label}
          maxLength={60}
          onChange={(e) => mutate("title", (s) => (s.title = e.target.value))}
        />
        <span style={{ display: "flex" }}>
          <button type="button" className="rz-icon-btn" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => moveSection(-1)}>
            <ArrowUp />
          </button>
          <button type="button" className="rz-icon-btn" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => moveSection(1)}>
            <ArrowDown />
          </button>
          <button
            type="button"
            className="rz-icon-btn"
            aria-label={section.hidden ? `Show ${label} on the resume` : `Hide ${label} from the resume`}
            aria-pressed={section.hidden}
            onClick={() => mutate("hidden", (s) => (s.hidden = !s.hidden))}
          >
            {section.hidden ? <EyeOff /> : <Eye />}
          </button>
          <button type="button" className="rz-icon-btn" aria-label={`Remove ${label}`} onClick={removeSection}>
            <Trash2 />
          </button>
        </span>
      </div>
      {section.hidden ? <p className="rz-hint" style={{ marginBottom: "0.75rem" }}>Hidden from the resume. Your entries are kept.</p> : null}

      {section.items.length > 0 ? (
        <div className="rz-items">
          {(section.items as AnyItem[]).map((item, i) => {
            const sum = itemSummary(section.type, item)
            const isOpen = open.has(item.id)
            const bodyId = `rz-item-${item.id}`
            return (
              <div className="rz-item" key={item.id}>
                <div className="rz-item-row">
                  <button type="button" className="rz-item-toggle" aria-expanded={isOpen} aria-controls={bodyId} onClick={() => toggle(item.id)}>
                    <strong>{sum.title}</strong>
                    {sum.meta ? <span className="rz-mono">{sum.meta}</span> : null}
                  </button>
                  <button
                    type="button"
                    className="rz-icon-btn rz-hide-phone"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() =>
                      mutate("move-item", (s) => {
                        const arr = s.items as AnyItem[]
                        ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
                      })
                    }
                  >
                    <ArrowUp />
                  </button>
                  <button
                    type="button"
                    className="rz-icon-btn rz-hide-phone"
                    aria-label="Move down"
                    disabled={i === section.items.length - 1}
                    onClick={() =>
                      mutate("move-item", (s) => {
                        const arr = s.items as AnyItem[]
                        ;[arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]
                      })
                    }
                  >
                    <ArrowDown />
                  </button>
                  <button
                    type="button"
                    className="rz-icon-btn"
                    aria-label={`Remove ${sum.title}`}
                    onClick={() => {
                      mutate("remove-item", (s) => {
                        ;(s as { items: AnyItem[] }).items = (s.items as AnyItem[]).filter((x) => x.id !== item.id)
                      })
                      toast("Entry removed", { action: { label: "Undo", onClick: () => undo() } })
                    }}
                  >
                    <Trash2 />
                  </button>
                  <button type="button" className="rz-icon-btn" aria-hidden tabIndex={-1} onClick={() => toggle(item.id)}>
                    <ChevronDown style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 200ms var(--site-ease)" }} />
                  </button>
                </div>
                {isOpen ? (
                  <div className="rz-item-body" id={bodyId}>
                    <ItemEditor
                      type={section.type}
                      item={item}
                      onChange={(patch) =>
                        mutate(`item:${item.id}:${Object.keys(patch).join(",")}`, (s) => {
                          const arr = s.items as AnyItem[]
                          const k = arr.findIndex((x) => x.id === item.id)
                          if (k >= 0) arr[k] = { ...arr[k], ...patch } as AnyItem
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="rz-hint" style={{ marginBottom: "0.75rem" }}>
          Nothing here yet.
        </p>
      )}
      <div style={{ marginTop: "0.875rem" }}>
        <button type="button" className="rz-add" onClick={addItem}>
          <Plus aria-hidden /> {ADD_LABEL[section.type]}
        </button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------------------------- */

function Block({ id, title, hint, children }: { id?: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rz-block" id={id} aria-label={title} style={{ scrollMarginTop: "1rem" }}>
      <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
        <h2 className="rz-h">{title}</h2>
        {hint ? <p className="rz-hint">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function ContentPanel({ downloaded, onDownload, onOpenDesign }: { downloaded: boolean; onDownload: () => void; onOpenDesign: () => void }) {
  const draft = useResumeEditor((s) => s.draft)
  const edit = useResumeEditor((s) => s.edit)
  if (!draft) return null
  const { doc, design } = draft
  const b = doc.basics
  const preset = PRESETS[design.preset]
  const setBasic = (key: keyof typeof b) => (v: string) =>
    edit(`basics:${key}`, (d) => {
      ;(d.basics as Record<string, unknown>)[key] = v
    })
  const sample = draft.sampleId ? (SAMPLE_RESUMES.find((x) => x.id === draft.sampleId) ?? null) : null
  const used = new Set(doc.sections.map((s) => s.type))
  const addable = SECTION_TYPES.filter((t) => t === "custom" || !used.has(t))

  return (
    <>
      {sample && doc.basics.name === sample.doc.basics.name ? (
        <p className="rz-notice" role="note">
          This is a sample for a made-up person, {sample.doc.basics.name}. Replace each line with your own before you download.
        </p>
      ) : null}
      <Checklist
        doc={doc}
        sample={sample?.doc ?? null}
        templateChosen={Boolean(draft.templateChosen)}
        downloaded={downloaded}
        onDownload={onDownload}
        onOpenDesign={onOpenDesign}
      />

      <Block id="rz-basics" title="Your details" hint="Shown at the top of the page. Recruiters and ATS software look for these first.">
        <div className="rz-grid">
          <TextField label="Full name" value={b.name} onChange={setBasic("name")} autoComplete="name" maxLength={100} />
          <TextField label="Headline" value={b.headline} onChange={setBasic("headline")} placeholder="The job you want next" maxLength={140} />
          <TextField label="Email" value={b.email} onChange={setBasic("email")} type="email" inputMode="email" autoComplete="email" maxLength={160} />
          <TextField label="Phone" value={b.phone} onChange={setBasic("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={40} />
          <TextField label="City and country" value={b.location} onChange={setBasic("location")} autoComplete="address-level2" wide maxLength={120} />
          <LinksEditor />
          <AreaField
            label="Summary (optional)"
            value={b.summary}
            onChange={setBasic("summary")}
            maxLength={1200}
            placeholder="Two or three sentences: what you do, for how long, and what you're good at."
          />
        </div>
      </Block>

      {preset.personal.length > 0 ? (
        <Block title="Personal details" hint={`Shown because ${preset.label} resumes usually include them. Leave any blank to keep it off the page.`}>
          <div className="rz-grid">
            {preset.personal.map((key) => (
              <TextField
                key={key}
                label={PERSONAL_LABELS[key]}
                value={doc.personal[key]}
                maxLength={80}
                onChange={(v) =>
                  edit(`personal:${key}`, (d) => {
                    d.personal[key] = v
                  })
                }
              />
            ))}
          </div>
        </Block>
      ) : null}

      <div id="rz-sections" style={{ scrollMarginTop: "1rem" }}>
        {doc.sections.map((s, i) => (
          <SectionEditor key={s.id} section={s} index={i} count={doc.sections.length} />
        ))}
      </div>

      <Block title="Add a section">
        <div className="rz-chips">
          {addable.map((t) => (
            <button
              key={t}
              type="button"
              className="rz-chip"
              onClick={() =>
                edit("add-section", (d) => {
                  d.sections.push({ id: newId("s"), type: t, title: "", hidden: false, items: [newItem(t)] } as ResumeSection)
                })
              }
            >
              <Plus aria-hidden /> {SECTION_LABELS[t]}
            </button>
          ))}
        </div>
      </Block>
    </>
  )
}

function LinksEditor() {
  const links = useResumeEditor((s) => s.draft?.doc.basics.links ?? [])
  const edit = useResumeEditor((s) => s.edit)
  const set = (fn: (l: ResumeDocument["basics"]["links"]) => ResumeDocument["basics"]["links"], key = "links") =>
    edit(key, (d) => {
      d.basics.links = fn(d.basics.links)
    })
  return (
    <div className="rz-field rz-wide">
      <span className="rz-label">
        <span>Links</span>
        <span className="rz-mono">Text &amp; URL (e.g. GitHub, LinkedIn)</span>
      </span>
      <div className="rz-bullets">
        {links.map((l, i) => {
          const bad = l.url !== "" && !/^(https:\/\/|mailto:|tel:)/i.test(l.url) && !/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(l.url)
          return (
            <div key={l.id} className="rz-link-row">
              <input
                className="rz-input"
                aria-label={`Link ${i + 1} text`}
                placeholder="Text (e.g. GitHub)"
                value={l.label}
                maxLength={40}
                onChange={(e) =>
                  set(
                    (ls) => ls.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)),
                    `link-label:${l.id}`,
                  )
                }
              />
              <div style={{ minWidth: 0 }}>
                <input
                  className="rz-input"
                  aria-label={`Link ${i + 1} URL`}
                  inputMode="url"
                  placeholder="https://..."
                  value={l.url}
                  maxLength={300}
                  aria-invalid={bad || undefined}
                  onChange={(e) => {
                    const nextUrl = e.target.value
                    const guessed = !l.label.trim() ? guessLinkLabel(nextUrl) : l.label
                    set(
                      (ls) => ls.map((x) => (x.id === l.id ? { ...x, url: nextUrl.trim(), label: guessed } : x)),
                      `link:${l.id}`,
                    )
                  }}
                />
                {bad ? <span className="rz-field-error">Use a web address, like linkedin.com/in/your-name.</span> : null}
              </div>
              <button
                type="button"
                className="rz-icon-btn"
                aria-label={`Remove link ${i + 1}`}
                onClick={() => set((ls) => ls.filter((x) => x.id !== l.id))}
              >
                <X />
              </button>
            </div>
          )
        })}
        {links.length < 6 ? (
          <div>
            <button
              type="button"
              className="rz-add"
              onClick={() => set((ls) => [...ls, { id: newId("l"), label: "", url: "" }])}
            >
              <Plus aria-hidden /> Add a link
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
