import { z } from "zod"

/**
 * ResumeDocument v1: the one data contract every resume template reads.
 * Kept close to JSON Resume so import and export stay easy. Every item and bullet has a stable id,
 * which tailoring, click-to-edit and AI suggestions use to address a single line.
 * Strings are length-capped and URLs are allow-listed because Typst writes links into the PDF.
 */

const text = (max: number) => z.string().max(max)
const id = z.string().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/)

/** "2024", "2024-03" or "" (unknown). Presets format these for display. */
export const monthSchema = z.string().regex(/^$|^\d{4}(-(0[1-9]|1[0-2]))?$/)

const SAFE_URL = /^(https:\/\/|mailto:|tel:)/i

/** Empty, or an https / mailto / tel link. Bare domains are accepted and stored with https://. */
export const urlSchema = z
  .string()
  .max(300)
  .transform((v) => v.trim())
  .transform((v) => (v && !SAFE_URL.test(v) && /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v) ? `https://${v}` : v))
  .refine((v) => v === "" || SAFE_URL.test(v), { message: "Links must start with https://, mailto: or tel:" })

export const bulletSchema = z.object({ id, text: text(600) })
export type Bullet = z.infer<typeof bulletSchema>

const dated = {
  start: monthSchema.default(""),
  end: monthSchema.default(""),
  current: z.boolean().default(false),
}

export const experienceItemSchema = z.object({
  id,
  role: text(120),
  org: text(120),
  location: text(120).default(""),
  ...dated,
  bullets: z.array(bulletSchema).max(20).default([]),
})

export const educationItemSchema = z.object({
  id,
  school: text(160),
  degree: text(160),
  location: text(120).default(""),
  ...dated,
  bullets: z.array(bulletSchema).max(12).default([]),
})

export const projectItemSchema = z.object({
  id,
  name: text(120),
  role: text(120).default(""),
  link: urlSchema.default(""),
  linkLabel: text(60).default(""),
  ...dated,
  bullets: z.array(bulletSchema).max(12).default([]),
})

export const skillGroupSchema = z.object({
  id,
  group: text(80).default(""),
  items: z.array(text(60)).max(40).default([]),
})

export const entryItemSchema = z.object({
  id,
  title: text(200),
  subtitle: text(200).default(""),
  date: monthSchema.default(""),
  link: urlSchema.default(""),
  linkLabel: text(60).default(""),
  detail: text(400).default(""),
})

export const languageItemSchema = z.object({
  id,
  language: text(60),
  /** CEFR (A1–C2), "Native", or free text such as "Fluent". */
  level: text(40).default(""),
})

export const SECTION_TYPES = [
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "awards",
  "publications",
  "languages",
  "volunteering",
  "custom",
] as const
export type SectionType = (typeof SECTION_TYPES)[number]

const base = { id, title: text(60).default(""), hidden: z.boolean().default(false) }

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("experience"), items: z.array(experienceItemSchema).max(30) }),
  z.object({ ...base, type: z.literal("volunteering"), items: z.array(experienceItemSchema).max(20) }),
  z.object({ ...base, type: z.literal("education"), items: z.array(educationItemSchema).max(12) }),
  z.object({ ...base, type: z.literal("projects"), items: z.array(projectItemSchema).max(20) }),
  z.object({ ...base, type: z.literal("skills"), items: z.array(skillGroupSchema).max(12) }),
  z.object({ ...base, type: z.literal("certifications"), items: z.array(entryItemSchema).max(30) }),
  z.object({ ...base, type: z.literal("awards"), items: z.array(entryItemSchema).max(30) }),
  z.object({ ...base, type: z.literal("publications"), items: z.array(entryItemSchema).max(80) }),
  z.object({ ...base, type: z.literal("languages"), items: z.array(languageItemSchema).max(12) }),
  z.object({ ...base, type: z.literal("custom"), items: z.array(entryItemSchema).max(30) }),
])
export type ResumeSection = z.infer<typeof sectionSchema>
export type ExperienceItem = z.infer<typeof experienceItemSchema>
export type EducationItem = z.infer<typeof educationItemSchema>
export type ProjectItem = z.infer<typeof projectItemSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type EntryItem = z.infer<typeof entryItemSchema>
export type LanguageItem = z.infer<typeof languageItemSchema>

export const linkSchema = z.object({ id, label: text(40).default(""), url: urlSchema })

export const resumeDocumentSchema = z.object({
  version: z.literal(1),
  basics: z.object({
    name: text(100),
    headline: text(140).default(""),
    email: text(160).default(""),
    phone: text(40).default(""),
    location: text(120).default(""),
    summary: text(1200).default(""),
    links: z.array(linkSchema).max(6).default([]),
  }),
  /** Only rendered when the country preset expects it (see presets.ts). Off by default. */
  personal: z
    .object({
      dateOfBirth: text(40).default(""),
      nationality: text(60).default(""),
      visaStatus: text(80).default(""),
      maritalStatus: text(40).default(""),
      drivingLicence: text(40).default(""),
    })
    .default({ dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" }),
  sections: z.array(sectionSchema).max(14),
})
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>

export const DENSITIES = ["comfortable", "standard", "compact"] as const
export type Density = (typeof DENSITIES)[number]

export const ACCENTS = ["ink", "violet", "navy", "forest", "oxblood", "slate"] as const
export type Accent = (typeof ACCENTS)[number]

export const PRESET_IDS = ["us", "uk", "eu", "de", "in", "gulf", "au"] as const
export type PresetId = (typeof PRESET_IDS)[number]

export const resumeDesignSchema = z.object({
  templateId: z.string().regex(/^r\d{3}-[a-z]+$/),
  preset: z.enum(PRESET_IDS).default("us"),
  /** null follows the preset (Letter for US, A4 elsewhere). */
  paper: z.enum(["a4", "us-letter"]).nullable().default(null),
  density: z.enum(DENSITIES).default("standard"),
  accent: z.enum(ACCENTS).default("ink"),
})
export type ResumeDesign = z.infer<typeof resumeDesignSchema>

/** Hard caps that match the `resumes` table checks. */
export const RESUME_LIMITS = { dataBytes: 256 * 1024, titleChars: 120 } as const

export function newId(prefix = "i") {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12)
  return `${prefix}${rand}`
}
