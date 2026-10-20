import type { PresetId, SectionType } from "./schema"

/**
 * Country presets: paper size, document name, date style, which personal fields belong, and section labels.
 * Sources are general career-service guidance; the country SEO pages link the specific source for each.
 */
export type Preset = {
  id: PresetId
  label: string
  /** What the document is called there. */
  docName: "Resume" | "CV"
  paper: "a4" | "us-letter"
  /** How a month renders: "Mar 2024" or "03/2024". */
  dateStyle: "short-month" | "numeric"
  /** Personal fields this region expects. Everything else stays hidden even if filled in. */
  personal: readonly ("dateOfBirth" | "nationality" | "visaStatus" | "maritalStatus" | "drivingLicence")[]
  photo: boolean
  note: string
}

export const PRESETS: Record<PresetId, Preset> = {
  us: {
    id: "us",
    label: "United States / Canada",
    docName: "Resume",
    paper: "us-letter",
    dateStyle: "short-month",
    personal: [],
    photo: false,
    note: "One page early in a career, two at most. No photo, date of birth or marital status.",
  },
  uk: {
    id: "uk",
    label: "United Kingdom / Ireland",
    docName: "CV",
    paper: "a4",
    dateStyle: "short-month",
    personal: [],
    photo: false,
    note: "Usually two pages. No photo or date of birth.",
  },
  eu: {
    id: "eu",
    label: "Europe (Europass style)",
    docName: "CV",
    paper: "a4",
    dateStyle: "numeric",
    personal: ["nationality", "drivingLicence"],
    photo: true,
    note: "Two pages is common. Languages with CEFR levels (A1–C2) are expected. Photo optional.",
  },
  de: {
    id: "de",
    label: "Germany",
    docName: "CV",
    paper: "a4",
    dateStyle: "numeric",
    personal: ["dateOfBirth", "nationality"],
    photo: true,
    note: "One to two pages, newest first. Photo and date of birth are optional and still common.",
  },
  in: {
    id: "in",
    label: "India",
    docName: "Resume",
    paper: "a4",
    dateStyle: "short-month",
    personal: ["dateOfBirth"],
    photo: false,
    note: "One to two pages. Date of birth is often included; a photo is optional.",
  },
  gulf: {
    id: "gulf",
    label: "Gulf (UAE, Saudi Arabia, Qatar)",
    docName: "CV",
    paper: "a4",
    dateStyle: "short-month",
    personal: ["nationality", "visaStatus", "dateOfBirth", "drivingLicence"],
    photo: true,
    note: "Two to three pages. Nationality and visa status are usually listed; a photo is common.",
  },
  au: {
    id: "au",
    label: "Australia / New Zealand",
    docName: "Resume",
    paper: "a4",
    dateStyle: "short-month",
    personal: [],
    photo: false,
    note: "Two to three pages is normal. No photo or date of birth.",
  },
}

export const SECTION_LABELS: Record<SectionType, string> = {
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  awards: "Awards",
  publications: "Publications",
  languages: "Languages",
  volunteering: "Volunteering",
  custom: "Additional",
}

export const PERSONAL_LABELS = {
  dateOfBirth: "Date of birth",
  nationality: "Nationality",
  visaStatus: "Visa status",
  maritalStatus: "Marital status",
  drivingLicence: "Driving licence",
} as const

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatMonth(value: string, style: Preset["dateStyle"]) {
  if (!value) return ""
  const [y, m] = value.split("-")
  if (!m) return y
  return style === "numeric" ? `${m}/${y}` : `${MONTHS[Number(m) - 1]} ${y}`
}

/** "Mar 2022 – Present", "2019 – 2021", "Mar 2022" or "". Uses an en dash, which every ATS reads. */
export function formatRange(start: string, end: string, current: boolean, style: Preset["dateStyle"]) {
  const a = formatMonth(start, style)
  const b = current ? "Present" : formatMonth(end, style)
  if (a && b) return a === b ? a : `${a} – ${b}`
  return a || b
}
