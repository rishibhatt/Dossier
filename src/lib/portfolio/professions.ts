/**
 * Profession groups: how a person shows their work decides the page, not their industry.
 * visual (images lead), performer (video and credits lead), licensed (trust and credentials lead),
 * builder (outcomes and case studies lead). Pure; shared by the pipeline, the studio and the renderer.
 */
import type { SocialPlatform } from "@/lib/portfolio/links"
import type { PortfolioSectionType } from "@/types/dossier"

export type ProfessionGroup = "visual" | "performer" | "licensed" | "builder"

export type Profession = {
  id: string
  label: string
  group: ProfessionGroup
  /** Template cluster key fed to recommendTemplates (see CATEGORY_ALIASES in lib/design/templates/recommend.ts). */
  category: string
  /** Matched against a job title or the model's one-to-three-word profession. */
  match: RegExp
}

export const PROFESSION_GROUPS: { id: ProfessionGroup; label: string; blurb: string }[] = [
  { id: "visual", label: "Visual work", blurb: "Your work is seen: spaces, buildings, photos, objects." },
  { id: "performer", label: "Performing", blurb: "Your work is watched: stage, screen, dance, music." },
  { id: "licensed", label: "Licensed practice", blurb: "Clients trust your credentials: health, law, finance." },
  { id: "builder", label: "Building and leading", blurb: "Your work is outcomes: products, systems, teams." },
]

/** Order matters: the first match wins, so specific titles come before broad ones. */
export const PROFESSIONS: readonly Profession[] = [
  { id: "interior-designer", label: "Interior designer", group: "visual", category: "design", match: /\binterior|\bspace planner|\bset designer|\bstylist\b|\bdecorator/i },
  { id: "architect", label: "Architect", group: "visual", category: "design", match: /^(?!.*\b(software|solutions?|cloud|data|enterprise|systems?|technical|security|network|it|salesforce)\b).*\barchitect|\blandscape design|\burban (design|plann)/i },
  { id: "photographer", label: "Photographer", group: "visual", category: "creative", match: /\bphotograph|\bcinematograph|\bvideograph|\bfilm ?maker/i },
  { id: "studio", label: "Studio or agency", group: "visual", category: "creative", match: /\bstudio\b|\bagency\b|\batelier/i },
  { id: "chef", label: "Chef", group: "visual", category: "culinary", match: /\bchef\b|\bpastry|\bbaker\b|\bculinary|\bcook\b/i },
  { id: "actor", label: "Actor", group: "performer", category: "creative", match: /\bact(or|ress)\b|\bperformer\b|\bvoice ?over|\bcomedian/i },
  { id: "choreographer", label: "Choreographer", group: "performer", category: "creative", match: /\bchoreograph|\bdancer?\b|\bballet|\bdance (teacher|instructor)/i },
  { id: "musician", label: "Musician", group: "performer", category: "creative", match: /\bmusician|\bsinger|\bcomposer|\bproducer\b.*\bmusic|\bdj\b|\bvocalist|\bguitarist|\bpianist|\bdrummer/i },
  { id: "visual-designer", label: "Designer", group: "visual", category: "design", match: /\b(graphic|visual|product|ux|ui|industrial|fashion|brand|motion|furniture|jewel+ery)\b.*\bdesign|\bdesigner\b|\billustrat|\b(art|creative) director|\bartist\b/i },
  { id: "doctor", label: "Doctor", group: "licensed", category: "healthcare", match: /\bdoctor|\bphysician|\bsurgeon|\bmbbs|\bdentist|\bdental|\bpaediatric|\bpediatric|\bcardiolog|\bdermatolog|\borthop(a)?edic|\bpsychiatr|\bradiolog|\bgyn(a)?ecolog/i },
  { id: "therapist", label: "Therapist", group: "licensed", category: "healthcare", match: /\btherapist|\bpsycholog|\bcounsel+or|\bphysio|\bnutrition|\bdietitian|\bnurse\b|\bnursing|\bpharmacist|\bveterinar/i },
  { id: "chartered-accountant", label: "Chartered accountant", group: "licensed", category: "finance", match: /\bchartered accountant|^c\.?a\.?$|\bca (final|inter)|\bicai\b|\bcpa\b|\bacca\b|\bauditor|\btax (consultant|advis)|\baccountant/i },
  { id: "lawyer", label: "Lawyer", group: "licensed", category: "legal", match: /\blawyer|\badvocate\b|\battorney|\bsolicitor|\bbarrister|\bcounsel\b|\blegal|\blaw\b|\bnotary|\bparalegal/i },
  { id: "researcher", label: "Researcher", group: "licensed", category: "academic", match: /\bresearch(er)?\b|\bprofessor|\blecturer|\bphd\b|(?<!data )\bscientist|\bpostdoc/i },
  { id: "product-manager", label: "Product manager", group: "builder", category: "executive", match: /\bproduct (manager|owner|lead)|\bprogram(me)? manager|\bproject manager|\bscrum master|\bpm\b/i },
  { id: "executive", label: "Executive or founder", group: "builder", category: "executive", match: /\b(ceo|cto|cfo|coo|cmo|vp|vice president|founder|co-?founder|director|head of|general manager|managing partner)\b/i },
  { id: "software-engineer", label: "Software engineer", group: "builder", category: "software", match: /\bsoftware|\bdeveloper|\bprogrammer|\bfront ?end|\bback ?end|\bfull ?stack|\bdevops|\bsre\b|\bdata (scientist|engineer|analyst)|\bml engineer|\bmachine learning|\bsolutions? architect|\bcloud architect|\barchitect\b.*\b(aws|azure|gcp|cloud|software|data|platform)\b/i },
  { id: "engineer", label: "Engineer", group: "builder", category: "engineering", match: /\bengineer|\bengineering|\btechnician/i },
  { id: "marketer", label: "Marketing or sales", group: "builder", category: "marketing", match: /\bmarketing|\bmarketer|\bgrowth|\bsales\b|\baccount (manager|executive)|\bbusiness development|\bseo\b|\bcontent (writer|strateg)|\bcopywriter|\bbrand manager/i },
  { id: "teacher", label: "Teacher", group: "builder", category: "education", match: /\bteacher|\btutor|\beducator|\binstructor|\btrainer\b/i },
  { id: "student", label: "Student or graduate", group: "builder", category: "student", match: /\bstudent|\bintern\b|\bfresher|\bgraduate\b|\bundergrad/i },
]

const BY_ID = new Map(PROFESSIONS.map((p) => [p.id, p]))

export function getProfession(id: string | undefined | null): Profession | undefined {
  return id ? BY_ID.get(id) : undefined
}

export function matchProfession(text: string | undefined | null): Profession | undefined {
  const t = text?.trim()
  if (!t) return undefined
  return PROFESSIONS.find((p) => p.match.test(t))
}

export type ProfessionGuess = { profession: Profession | undefined; sure: boolean }

/**
 * The model's word and the resume title, checked against each other. Sure when both point at the same group,
 * or when only one of them names a profession at all. Two different groups, or nothing, means ask the person.
 */
export function guessProfession(modelWord: string | undefined | null, title: string | undefined | null): ProfessionGuess {
  const fromModel = matchProfession(modelWord)
  const fromTitle = matchProfession(title)
  if (fromModel && fromTitle) return { profession: fromTitle, sure: fromModel.group === fromTitle.group }
  const one = fromModel ?? fromTitle
  return { profession: one, sure: Boolean(one) }
}

/** Old four-type documents still read: everyone they described builds or leads, except designers. */
export function groupFromLegacyType(type: string | undefined): ProfessionGroup {
  return type === "designer" ? "visual" : "builder"
}

/** The group a document's page is built for: the one picked or detected, else read from the old profile type. */
export function portfolioGroup(meta: { type?: string; profession?: string; group?: ProfessionGroup } | undefined): ProfessionGroup {
  return meta?.group ?? getProfession(meta?.profession)?.group ?? groupFromLegacyType(meta?.type)
}

/** Profile platforms in the order each group reaches for them. The studio shows these first and the rest behind More. */
export const GROUP_SOCIALS: Record<ProfessionGroup, SocialPlatform[]> = {
  visual: ["instagram", "behance", "pinterest", "houzz", "archdaily", "dribbble", "linkedin", "website"],
  performer: ["instagram", "youtube", "imdb", "tiktok", "spotify", "vimeo", "backstage", "website"],
  licensed: ["linkedin", "practo", "doctolib", "scholar", "researchgate", "x", "medium", "website"],
  builder: ["linkedin", "github", "x", "medium", "dribbble", "youtube", "instagram", "website"],
}

/** Groups whose pages lead with pictures or video. */
export const MEDIA_LED: ReadonlySet<ProfessionGroup> = new Set(["visual", "performer"])

/**
 * The media section each media-led group needs. It is added empty (no stand-in pictures), so it stays off the
 * public page until the person adds a link, while the Edit list and the publish checklist ask for it.
 */
export const GROUP_MEDIA_SECTION: Partial<Record<ProfessionGroup, PortfolioSectionType>> = { visual: "gallery", performer: "showreel" }

/** Sections offered first in Add a section, per group. */
export const GROUP_SECTIONS: Record<ProfessionGroup, PortfolioSectionType[]> = {
  visual: ["gallery", "services", "testimonials", "press"],
  performer: ["showreel", "credits", "gallery", "press"],
  licensed: ["services", "practice", "publications", "testimonials"],
  builder: ["highlights", "testimonials", "press", "publications"],
}
