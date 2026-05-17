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
  imageUrl: z.string().max(2048).optional().nullable(),
})

const heroSection = z.object({
  id: z.string(),
  type: z.literal("hero"),
  data: z.object({
    name: z.string(),
    title: z.string(),
    tagline: z.string(),
    imageUrl: z.string().max(2048).optional().nullable(),
  }),
})

const aboutSection = z.object({
  id: z.string(),
  type: z.literal("about"),
  data: z.object({
    body: z.string(),
  }),
})

const skillsSection = z.object({
  id: z.string(),
  type: z.literal("skills"),
  data: z.object({
    items: z.array(z.string()),
  }),
})

const experienceSection = z.object({
  id: z.string(),
  type: z.literal("experience"),
  data: z.object({
    items: z.array(experienceEntrySchema),
  }),
})

const projectsSection = z.object({
  id: z.string(),
  type: z.literal("projects"),
  data: z.object({
    items: z.array(projectEntrySchema),
  }),
})

const contactSection = z.object({
  id: z.string(),
  type: z.literal("contact"),
  data: z.object({
    email: z.string(),
    phone: z.string(),
    links: z.array(z.string()),
    headline: z.string().optional(),
  }),
})

const sectionSchema = z.discriminatedUnion("type", [
  heroSection,
  aboutSection,
  skillsSection,
  experienceSection,
  projectsSection,
  contactSection,
])

const portfolioMetaSchema = z
  .object({
    type: z.enum(["developer", "designer", "product", "student", "general"]).optional(),
    tone: z.string().optional(),
    emphasis: z.array(z.string()).optional(),
  })
  .optional()

export const portfolioDocumentSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
  portfolioMeta: portfolioMetaSchema,
  sections: z.array(sectionSchema),
})

export type PortfolioDocumentParsed = z.infer<typeof portfolioDocumentSchema>
