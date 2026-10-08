/**
 * Free tools: small, ungated, run in the browser (no AI calls, no cost per use).
 * Each one solves a job a job seeker searches for, then hands off to the builder.
 */
export type FreeToolSlug = "resume-to-website" | "resume-checker" | "headline-writer" | "linkedin-about" | "link-in-bio"

export type FreeTool = {
  slug: FreeToolSlug
  no: string
  name: string
  /** Page <title>, written for the search query. */
  title: string
  description: string
  /** The phrase people type into a search box. */
  query: string
  h1: string
  intro: string
  /** What the visitor walks away with, in one line. */
  output: string
  cta: string
}

export const FREE_TOOLS: readonly FreeTool[] = [
  {
    slug: "resume-checker",
    no: "001",
    name: "Resume checker",
    title: "Free resume checker: 10 checks in your browser | Dossier",
    description:
      "Paste your resume and get a plain-language report: contact details, numbers in your bullets, weak phrases, length and missing sections. Free, nothing is uploaded.",
    query: "free resume checker",
    h1: "Check your resume before anyone else reads it.",
    intro: "Paste the text of your resume. Ten checks run in your browser and tell you what to fix first. Nothing is sent anywhere.",
    output: "A score out of 100 and a fix list, most important first",
    cta: "See this resume as a website",
  },
  {
    slug: "headline-writer",
    no: "002",
    name: "Headline writer",
    title: "Portfolio and LinkedIn headline generator, free | Dossier",
    description:
      "Answer four short questions and get six headlines for your portfolio, LinkedIn or resume, each in a different shape. Free, no sign-up.",
    query: "linkedin headline generator",
    h1: "Write the one line under your name.",
    intro: "Four questions, six headlines. Each one follows a pattern that works for recruiters skimming a page, and each fits LinkedIn's 220-character limit.",
    output: "Six headlines you can copy, with character counts",
    cta: "Put your headline on a site",
  },
  {
    slug: "linkedin-about",
    no: "003",
    name: "LinkedIn About builder",
    title: "LinkedIn About section builder, free | Dossier",
    description:
      "Build a LinkedIn About section from five plain answers. Three versions: short, standard and story. Free and private, it runs in your browser.",
    query: "linkedin about section generator",
    h1: "An About section that sounds like you on a good day.",
    intro: "Five answers in your own words. The builder puts them in the order people read and gives you three lengths to choose from.",
    output: "Three About sections, under LinkedIn's 2,600-character limit",
    cta: "Use it as your portfolio intro",
  },
  {
    slug: "link-in-bio",
    no: "004",
    name: "Link-in-bio page",
    title: "Free link-in-bio page for your resume | Dossier",
    description:
      "Lay out a simple link page for your Instagram, X or email signature: name, role and up to five links. Preview it free, then publish it as part of your Dossier site.",
    query: "link in bio for resume",
    h1: "One link for your bio, with your work behind it.",
    intro: "Add your name, role and the links you want people to open. The preview updates as you type.",
    output: "A live preview and a tidy text version to copy",
    cta: "Publish it with your portfolio",
  },
  {
    slug: "resume-to-website",
    no: "005",
    name: "Resume to website",
    title: "Turn your resume into a website, free | Dossier",
    description:
      "Upload a resume PDF and see it as a portfolio website before you sign up. Try different looks, then publish a link. Free to start.",
    query: "resume to website",
    h1: "See your resume as a website before you sign up.",
    intro: "This one is the whole product, free to try. Upload a PDF, pick a look, and you will see your own site before you are asked to sign up.",
    output: "Your resume as a live portfolio preview",
    cta: "Upload my resume",
  },
] as const

export function getFreeTool(slug: string): FreeTool | undefined {
  return FREE_TOOLS.find((t) => t.slug === slug)
}
