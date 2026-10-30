/**
 * Free tools: small, ungated, run in the browser (no cost per use). The two writing generators add an optional,
 * capped AI polish on top of their rule-based drafts. Each one solves a job a job seeker searches for, then hands off to a builder.
 */
export type FreeToolSlug =
  | "ats-checker"
  | "resume-to-website"
  | "headline-writer"
  | "linkedin-about"
  | "link-in-bio"
  | "resume-summary-generator"
  | "resume-bullet-point-generator"

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
  /** Questions people also search. Rendered under the tool and as FAQPage JSON-LD. */
  faq?: { q: string; a: string }[]
  /** Before and after pairs shown as a worked example. */
  examples?: { label: string; before: string; after: string }[]
}

export const FREE_TOOLS: readonly FreeTool[] = [
  {
    slug: "ats-checker",
    no: "001",
    name: "ATS resume scanner",
    title: "Free ATS resume checker with job keyword match | Dossier",
    description:
      "Paste your resume and a job post. See missing keywords, what an ATS cannot parse and which bullets to rewrite. Free, runs in your browser.",
    query: "free ats resume checker",
    h1: "See your resume the way an ATS does.",
    intro: "Paste your resume and the job post. The scan matches the job's keywords, checks that the text would parse, and rewrites your weakest bullets. Nothing leaves this tab.",
    output: "A score, the missing keywords and a fix list, most important first",
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
      "Upload a resume PDF and turn it into a portfolio website. Try different looks, then publish a link. Free account, no card.",
    query: "resume to website",
    h1: "Turn your resume into a website in minutes.",
    intro: "This one is the whole product, free to start. Create a free account, upload a PDF and pick a look. Your resume is kept in this browser while you sign up.",
    output: "Your resume as a live portfolio preview",
    cta: "Upload my resume",
  },
  {
    slug: "resume-summary-generator",
    no: "006",
    name: "Resume summary generator",
    title: "Free resume summary generator, no sign-up | Dossier",
    description:
      "Answer five short questions and get four resume summaries: result first, skills first, one for your career stage, and a one-liner. Free, private, no sign-up.",
    query: "resume summary generator",
    h1: "A resume summary that says what you do and proves it.",
    intro: "Five short answers, four summaries. Each one puts who you are, one result and your tools in the order a recruiter reads. Your answers stay in this browser tab.",
    output: "Four summaries for your career stage, with character counts",
    cta: "Put it in a free resume",
    examples: [
      { label: "Mid-career", before: "Results-driven professional with a passion for data and a proven track record of success.", after: "Data Analyst with 5 years of experience in retail pricing. Built a pricing dashboard that cut markdown losses by 12%. Skilled in SQL, Python and Tableau." },
      { label: "Fresher", before: "Hard-working graduate seeking a challenging role to grow my skills.", after: "Final-year B.Tech student at VIT looking for a Software Engineer role in backend systems. Built a timetable API used by 400 students. Skilled in Node.js and PostgreSQL." },
      { label: "Career change", before: "Teacher looking to transition into a new career in instructional design.", after: "Instructional Designer with a background in teaching. In teaching, wrote a reading programme now used in four sections. Brings curriculum design and Articulate 360 to corporate training." },
    ],
    faq: [
      { q: "What should a resume summary say?", a: "Three things in two or three sentences: the job you do or want, one result with a number, and the skills the job post asks for. Leave out adjectives like passionate or hard-working, which every applicant uses." },
      { q: "How long should a resume summary be?", a: "Two or three sentences, roughly 40 to 80 words. A recruiter reads the top of the page first, so it has to be quick to scan." },
      { q: "Is this summary generator really free?", a: "Yes. The four drafts are written in your browser, free and unlimited, with no sign-up. The optional AI polish has a small daily limit." },
      { q: "Should I use a resume summary or an objective?", a: "A summary. An objective says what you want; a summary says what you offer. Students can write a summary too, using a project in place of a work result." },
    ],
  },
  {
    slug: "resume-bullet-point-generator",
    no: "007",
    name: "Resume bullet point generator",
    title: "Free resume bullet point generator, no sign-up | Dossier",
    description:
      "Turn what you did into resume bullets that start with a strong verb and end with a number. Paste a weak bullet or build one from parts. Free, private, no sign-up.",
    query: "resume bullet point generator",
    h1: "Turn a duty into a resume bullet with a result.",
    intro: "Paste a weak bullet, or say what you did, what changed and by how much. You get the same achievement written up to four ways. Nothing leaves this tab unless you ask for an AI polish.",
    output: "Up to four rewrites of one bullet, with weak openers removed",
    cta: "Put it in a free resume",
    examples: [
      { label: "Marketing", before: "Responsible for managing the onboarding emails.", after: "Managed the onboarding email sequence, raising trial-to-paid conversion by 34%." },
      { label: "Operations", before: "Worked on the warehouse picking process.", after: "Rebuilt the warehouse picking process, cutting order errors from 40 a week to 6." },
      { label: "Data", before: "Helped with the weekly sales report.", after: "Wrote SQL queries for the weekly sales report, saving the analysts about 3 hours a week." },
    ],
    faq: [
      { q: "What makes a good resume bullet point?", a: "It starts with a past-tense verb for what you did, names the tool if the job post asks for it, and ends with what changed, ideally with a number. One line, under about 200 characters." },
      { q: "What is the XYZ formula for resume bullets?", a: "Accomplished X, as measured by Y, by doing Z. The Result first version in this tool follows it: the outcome and number come first, then what you did." },
      { q: "What if I do not have numbers?", a: "Estimate honestly and say so: about 30 tickets a day, roughly 5 hours a week. You can also count people, sites, clients or documents. A bullet with a fair estimate beats one with none." },
      { q: "Does the AI make up numbers?", a: "No. The rule-based drafts only use your words. The optional AI polish rejects any rewrite that adds a number you did not type." },
    ],
  },
] as const

export function getFreeTool(slug: string): FreeTool | undefined {
  return FREE_TOOLS.find((t) => t.slug === slug)
}
