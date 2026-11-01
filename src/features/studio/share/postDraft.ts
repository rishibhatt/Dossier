import type { PortfolioDocument } from "@/types/dossier"

/** What the ready-made posts and the email signature know about the person, read from their portfolio. */
export type ShareFacts = { name: string; role: string; tagline: string; company: string; projects: number; skills: string[] }

/** Defensive on purpose: the dashboard passes payloads straight from the database, which may predate today's shape. */
export function shareFacts(doc: PortfolioDocument | null): ShareFacts {
  const find = <T extends PortfolioDocument["sections"][number]["type"]>(type: T) =>
    doc?.sections?.find((s): s is Extract<PortfolioDocument["sections"][number], { type: T }> => s.type === type)
  const hero = find("hero")?.data
  return {
    name: hero?.name?.trim() || doc?.meta?.title?.trim() || "",
    role: hero?.title?.trim() || "",
    tagline: hero?.tagline?.trim() || "",
    company: find("experience")?.data?.items?.[0]?.company?.trim() || "",
    projects: find("projects")?.data?.items?.length ?? 0,
    skills: (find("skills")?.data?.items ?? []).filter((s): s is string => typeof s === "string").map((s) => s.trim()).filter(Boolean).slice(0, 3),
  }
}

export type PostTone = "open" | "share"

const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`)
/** "Programme Lead" -> "#ProgrammeLead"; empty when the role has no letters. */
const roleTag = (role: string) => {
  const tag = role.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean).map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")
  return tag ? `#${tag}` : ""
}

/**
 * The LinkedIn post we draft for them, in their own words where we have them (tagline, role, latest employer,
 * project count, top skills). Plain first person, short paragraphs, a few hashtags at the end. They edit it
 * before posting.
 */
export function postDraft(url: string, f: ShareFacts, tone: PostTone): string {
  const at = f.company ? ` at ${f.company}` : ""
  const projects = f.projects > 0 ? `${f.projects} ${f.projects === 1 ? "project" : "projects"}` : ""
  const tags = [tone === "open" ? "#OpenToWork" : "", "#Portfolio", roleTag(f.role)].filter(Boolean).join(" ")
  const lines =
    tone === "open"
      ? [
          `My portfolio is live: ${url}`,
          f.tagline,
          `It has my experience${at}${projects ? `, ${projects} with the story behind each one` : ""}, and the quickest way to reach me.`,
          f.role
            ? `I'm looking for my next ${f.role} role. If your team is hiring, or you know someone who is, I'd be grateful for a message or an intro.`
            : "I'm looking for my next role. If your team is hiring, or you know someone who is, I'd be grateful for a message or an intro.",
          tags,
        ]
      : [
          `I put my work in one place: ${url}`,
          f.tagline,
          `It covers my experience${at}${projects ? `, ${projects}` : ""}${f.skills.length ? ` and the skills I use most: ${list(f.skills)}` : ""}.`,
          f.role ? `Feedback is welcome, especially from people who hire for ${f.role} roles.` : "Feedback is welcome.",
          tags,
        ]
  return lines.filter(Boolean).join("\n\n")
}

/** Opens LinkedIn's post composer with the text filled in (the link inside it becomes the preview card). */
export const linkedInComposeUrl = (text: string) => `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`

export const LINKEDIN_POST_LIMIT = 3000

export const signature = (url: string, f: ShareFacts) => [f.name && f.role ? `${f.name} · ${f.role}` : f.name || f.role, `Portfolio: ${url}`].filter(Boolean).join("\n")
