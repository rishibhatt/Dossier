import { z } from "zod"

const experienceEntrySchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  description: z.string(),
})

const projectEntrySchema = z.object({
  name: z.string(),
  description: z.string(),
  tech: z.array(z.string()),
})

const educationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  period: z.string(),
  details: z.string(),
})

/** LLM extract output — mirrors `StructuredResume` for downstream parsers. */
export const extractResumeSchema = z.object({
  name: z.string(),
  title: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(experienceEntrySchema),
  projects: z.array(projectEntrySchema),
  education: z.array(educationEntrySchema).default([]),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    links: z.array(z.string()),
  }),
})

export type ExtractResume = z.infer<typeof extractResumeSchema>
