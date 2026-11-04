import { z } from "zod"

/** Mirrors src/types/dossier.ts. Optional fields are kept (zod strips unknown keys, so every field must be listed). */

const str = z.string()
const url = z.string().max(2048)
const s = <T extends string, D extends z.ZodRawShape>(type: T, data: D) =>
  z.object({ id: z.string(), type: z.literal(type), data: z.object(data) })

const experienceEntrySchema = z.object({
  company: str,
  role: str,
  duration: str,
  description: str,
  highlights: z.array(str).max(40).optional(),
  location: str.optional(),
})

const projectEntrySchema = z.object({
  name: str,
  description: str,
  tech: z.array(str),
  imageUrl: url.optional().nullable(),
  link: url.optional().nullable(),
})

const mentionSchema = z.object({ title: str, outlet: str, year: str, link: url.optional().nullable() })

const sectionSchema = z.discriminatedUnion("type", [
  s("hero", { name: str, title: str, tagline: str, imageUrl: url.optional().nullable() }),
  s("about", { body: str }),
  s("skills", { items: z.array(str) }),
  s("experience", { items: z.array(experienceEntrySchema) }),
  s("projects", { items: z.array(projectEntrySchema) }),
  s("contact", { email: str, phone: str, links: z.array(str), headline: str.optional(), location: str.optional(), showSocialInHero: z.boolean().optional() }),
  s("education", { items: z.array(z.object({ institution: str, degree: str, period: str, details: str })) }),
  s("highlights", { items: z.array(z.object({ value: str, label: str })).max(12) }),
  s("certifications", { items: z.array(z.object({ name: str, issuer: str, year: str, number: str.max(60).optional() })) }),
  s("gallery", { items: z.array(z.object({ imageUrl: url, caption: str.max(300), link: url.optional().nullable(), beforeUrl: url.optional().nullable() })).max(40) }),
  s("showreel", { items: z.array(z.object({ videoUrl: url, title: str.max(200), note: str.max(300) })).max(12) }),
  s("credits", { items: z.array(z.object({ title: str, role: str, company: str, year: str })).max(80) }),
  s("services", { items: z.array(z.object({ name: str, description: str, price: str.max(80) })).max(24) }),
  s("testimonials", { items: z.array(z.object({ quote: str.max(1200), name: str, role: str })).max(16) }),
  s("press", { items: z.array(mentionSchema).max(40) }),
  s("publications", { items: z.array(mentionSchema).max(80) }),
  s("practice", { name: str, address: str.max(400), hours: z.array(str.max(120)).max(14), bookingUrl: url, mapUrl: url }),
])

const portfolioMetaSchema = z
  .object({
    type: z.enum(["developer", "designer", "product", "student", "general"]).optional(),
    tone: z.string().optional(),
    emphasis: z.array(z.string()).optional(),
    profession: z.string().max(40).optional(),
    group: z.enum(["visual", "performer", "licensed", "builder"]).optional(),
    professionAsk: z.boolean().optional(),
  })
  .optional()

export const portfolioDocumentSchema = z.object({
  meta: z.object({ title: str, description: str }),
  portfolioMeta: portfolioMetaSchema,
  sections: z.array(sectionSchema),
})

export type PortfolioDocumentParsed = z.infer<typeof portfolioDocumentSchema>

/** Owner view settings sent with publish / preview / export. Size-capped. */
export const portfolioViewSchema = z.object({
  hiddenSectionIds: z.array(z.string().max(80)).max(64).optional(),
  sectionSurfaceOverrides: z
    .record(
      z.string().max(80),
      z.object({ bg: z.string().max(40).regex(/^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\)|transparent)$/).optional() })
    )
    .refine((r) => Object.keys(r).length <= 64, "too_many_overrides")
    .optional(),
})

export type PortfolioViewParsed = z.infer<typeof portfolioViewSchema>
