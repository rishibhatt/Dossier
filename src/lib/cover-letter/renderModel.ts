import { autoLabel } from "../resume/links"
import { PRESETS } from "../resume/presets"
import { ACCENT_HEX, DENSITY, safeUrl } from "../resume/renderModel"
import type { Density, PresetId } from "../resume/schema"

import { letterLook, type LetterLook } from "./looks"
import type { CoverLetterDesign, CoverLetterDocument } from "./schema"

/**
 * The view model handed to src/resume/typst/letter.typ through `sys.inputs.data`.
 * Like the resume model, every decision (dates, greeting, sign-off, subject, links, sizes) is made here in
 * TypeScript, and every piece of user text reaches Typst as a JSON string, which Typst sets as literal text.
 * Nothing the person types can become Typst markup.
 *
 * `doc.name/headline/contact/personal` and `style` have the same shape as the resume model, because kit.typ's
 * `masthead()` reads them for both.
 */

export type LetterRenderModel = {
  doc: {
    name: string
    headline: string
    contact: { text: string; url: string }[]
    /** Always empty: personal details belong on the CV, not the letter. Kept so masthead() reads one shape. */
    personal: { label: string; value: string }[]
    date: string
    /** Recipient block, one string per line (name, title, company, address lines). May be empty. */
    recipient: string[]
    subject: string
    greeting: string
    /** Each paragraph's lines; a single line break the person typed is kept. */
    paragraphs: { id: string; lines: string[] }[]
    signOff: string
    signature: string
  }
  layout: {
    /** "before": date above the recipient (US). "after": recipient, then the date (DIN 5008 style). */
    date: "before" | "after"
    dateAlign: "left" | "right"
  }
  style: {
    paper: "a4" | "us-letter"
    docName: string
    accent: string
    density: Density
    size: number
    leading: number
    margin: number
    gap: number
  }
  /** Masthead options for kit.typ, keyed the way kit.typ names them. */
  look: {
    font: string
    "head-font": string | null
    "name-font": string | null
    "name-scale": number
    "name-weight": number
    "name-upper": boolean
    /** em */
    "name-tracking": number
    header: LetterLook["header"]
    "contact-sep": LetterLook["contactSep"]
    "accent-name": boolean
  }
  meta: { title: string; author: string; keywords: string[] }
}

/** Letter conventions per country preset. */
export type LetterConvention = {
  /** Sign-off when the recipient is named, and when not. */
  signOff: { named: string; unnamed: string }
  /** An automatic subject line ("Application for ...") when the person leaves it empty. */
  autoSubject: boolean
  date: LetterRenderModel["layout"]["date"]
  dateAlign: LetterRenderModel["layout"]["dateAlign"]
  /** How the date is written. */
  dateFormat: "mdy" | "dmy" | "dotted"
}

export const LETTER_CONVENTIONS: Record<PresetId, LetterConvention> = {
  us: { signOff: { named: "Sincerely,", unnamed: "Sincerely," }, autoSubject: false, date: "before", dateAlign: "left", dateFormat: "mdy" },
  uk: { signOff: { named: "Yours sincerely,", unnamed: "Yours faithfully," }, autoSubject: false, date: "before", dateAlign: "right", dateFormat: "dmy" },
  eu: { signOff: { named: "Kind regards,", unnamed: "Kind regards," }, autoSubject: true, date: "after", dateAlign: "right", dateFormat: "dmy" },
  de: { signOff: { named: "Kind regards,", unnamed: "Kind regards," }, autoSubject: true, date: "after", dateAlign: "right", dateFormat: "dotted" },
  in: { signOff: { named: "Sincerely,", unnamed: "Sincerely," }, autoSubject: false, date: "before", dateAlign: "left", dateFormat: "dmy" },
  gulf: { signOff: { named: "Sincerely,", unnamed: "Sincerely," }, autoSubject: false, date: "before", dateAlign: "left", dateFormat: "dmy" },
  au: { signOff: { named: "Kind regards,", unnamed: "Kind regards," }, autoSubject: false, date: "before", dateAlign: "left", dateFormat: "dmy" },
}

/** Letters run a little larger than resumes, with wider margins. Derived from the resume density scale. */
const LETTER_DENSITY = (d: Density) => {
  const r = DENSITY[d] ?? DENSITY.standard
  return { size: r.size + 0.5, leading: r.leading + 0.04, margin: r.margin + 4, gap: r.gap }
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const clean = (s: string) => s.replace(/\s+/g, " ").trim()
const conv = (preset: PresetId) => LETTER_CONVENTIONS[preset] ?? LETTER_CONVENTIONS.us

/** "November 3, 2026" (US), "3 November 2026", or "03.11.2026" (DE). `iso` is YYYY-MM-DD; "" uses `today`. */
export function formatLetterDate(iso: string, preset: PresetId, today: Date = new Date()): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const [y, mo, d] = m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [today.getFullYear(), today.getMonth() + 1, today.getDate()]
  if (mo < 1 || mo > 12) return ""
  const f = conv(preset).dateFormat
  if (f === "dotted") return `${String(d).padStart(2, "0")}.${String(mo).padStart(2, "0")}.${y}`
  if (f === "mdy") return `${MONTHS[mo - 1]} ${d}, ${y}`
  return `${d} ${MONTHS[mo - 1]} ${y}`
}

/** True when the letter is addressed to a person (a typed greeting counts unless it is a generic one). */
export function isNamedRecipient(doc: Pick<CoverLetterDocument, "greeting" | "recipient">): boolean {
  const g = clean(doc.greeting)
  if (g) return !/hiring|sir or madam|madam or sir|to whom|team|recruit|colleague/i.test(g)
  return clean(doc.recipient.name) !== ""
}

/** "Dear Ms Doe," or "Dear Hiring Manager,". */
export function defaultGreeting(recipientName: string): string {
  const n = clean(recipientName)
  return n ? `Dear ${n},` : "Dear Hiring Manager,"
}

/** The preset's sign-off. UK: "Yours sincerely," to a named person, "Yours faithfully," otherwise. */
export function defaultSignOff(preset: PresetId, named: boolean): string {
  const s = conv(preset).signOff
  return named ? s.named : s.unnamed
}

/** "Application for Data Analyst (ref. 4471)" when the preset expects a subject line; otherwise "". */
export function defaultSubject(doc: Pick<CoverLetterDocument, "job">, preset: PresetId): string {
  if (!conv(preset).autoSubject) return ""
  const role = clean(doc.job.role)
  const ref = clean(doc.job.reference)
  if (!role) return ref ? `Application, ref. ${ref}` : ""
  return `Application for ${role}${ref ? ` (ref. ${ref})` : ""}`
}

export function toLetterRenderModel(doc: CoverLetterDocument, design: CoverLetterDesign, today: Date = new Date()): LetterRenderModel {
  const preset = PRESETS[design.preset] ?? PRESETS.us
  const c = conv(design.preset)
  const s = doc.sender

  const contact: LetterRenderModel["doc"]["contact"] = []
  if (clean(s.email))
    contact.push({ text: clean(s.email), url: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(clean(s.email)) ? `mailto:${clean(s.email)}` : "" })
  if (clean(s.phone)) contact.push({ text: clean(s.phone), url: `tel:${clean(s.phone).replace(/[^\d+]/g, "")}` })
  if (clean(s.location)) contact.push({ text: clean(s.location), url: "" })
  for (const l of s.links) {
    const url = safeUrl(l.url)
    if (url) contact.push({ text: autoLabel(url, l.label), url })
  }

  const r = doc.recipient
  const recipient = [clean(r.name), clean(r.title), clean(r.company), ...r.address.split(/\r?\n/).map(clean)].filter(Boolean)

  const named = isNamedRecipient(doc)
  const name = clean(s.name)
  const subject = clean(doc.subject) || defaultSubject(doc, design.preset)

  const paragraphs = doc.paragraphs
    .map((p) => ({ id: p.id, lines: p.text.split(/\r?\n/).map(clean).filter(Boolean) }))
    .filter((p) => p.lines.length > 0)

  const lk = letterLook(design.templateId)
  const role = clean(doc.job.role)
  const company = clean(r.company)

  return {
    doc: {
      name: name || "Your name",
      headline: clean(s.headline),
      contact,
      personal: [],
      date: formatLetterDate(doc.date, design.preset, today),
      recipient,
      subject,
      greeting: clean(doc.greeting) || defaultGreeting(r.name),
      paragraphs,
      signOff: clean(doc.signOff) || defaultSignOff(design.preset, named),
      signature: clean(doc.signature) || name,
    },
    layout: { date: c.date, dateAlign: c.dateAlign },
    style: {
      paper: design.paper ?? preset.paper,
      docName: "Cover letter",
      accent: ACCENT_HEX[design.accent] ?? ACCENT_HEX.ink,
      density: design.density,
      ...LETTER_DENSITY(design.density),
    },
    look: {
      font: lk.font,
      "head-font": lk.headFont,
      "name-font": lk.nameFont,
      "name-scale": lk.nameScale,
      "name-weight": lk.nameWeight,
      "name-upper": lk.nameUpper,
      "name-tracking": lk.nameTracking,
      header: lk.header,
      "contact-sep": lk.contactSep,
      "accent-name": lk.accentName,
    },
    meta: {
      title: [name, "Cover letter", [role, company].filter(Boolean).join(", ")].filter(Boolean).join(" – "),
      author: name,
      keywords: [],
    },
  }
}

/** "Jane-Doe-Cover-Letter.pdf". */
export function letterFileName(doc: CoverLetterDocument) {
  const n = doc.sender.name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")
  return n ? `${n}-Cover-Letter.pdf` : "Cover-Letter.pdf"
}
