import type { StructuredResume } from "@/types/dossier"

const cap = (text: string, max: number) => {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

/**
 * Shrinks structured résumé JSON so layout/extract LLM calls stay under typical free-tier TPM limits.
 */
export function compactStructuredResumeForLlm(input: StructuredResume): StructuredResume {
  return {
    name: cap(input.name, 120),
    title: cap(input.title, 160),
    summary: cap(input.summary, 4500),
    skills: input.skills.slice(0, 24).map((s) => cap(s, 80)),
    experience: input.experience.slice(0, 10).map((e) => ({
      company: cap(e.company, 120),
      role: cap(e.role, 120),
      duration: cap(e.duration, 80),
      description: cap(e.description, 1400),
    })),
    projects: input.projects.slice(0, 10).map((p) => ({
      name: cap(p.name, 120),
      description: cap(p.description, 1000),
      tech: p.tech.slice(0, 16).map((t) => cap(t, 40)),
      imageUrl: p.imageUrl,
    })),
    education: (input.education ?? []).slice(0, 6).map((ed) => ({
      institution: cap(ed.institution, 120),
      degree: cap(ed.degree, 120),
      period: cap(ed.period, 80),
      details: cap(ed.details, 400),
    })),
    contact: {
      email: cap(input.contact.email, 120),
      phone: cap(input.contact.phone, 40),
      links: input.contact.links.slice(0, 12).map((l) => cap(l, 200)),
    },
  }
}
