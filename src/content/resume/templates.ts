import type { PresetId } from "@/lib/resume/schema"
import { RESUME_TEMPLATES, type ResumeTemplate } from "@/lib/resume/templates"

import { KIT_PAGES } from "./templatesKit"

/**
 * Marketing copy and directory facets for the shipped resume templates (src/lib/resume/templates.ts holds the
 * engine side). Every template has its own guidance and questions; if two pages would say the same thing,
 * merge them. Sample people are fictional and labelled wherever they appear.
 */

export const ROLE_FACETS = [
  { id: "engineering", label: "Engineering and IT" },
  { id: "finance", label: "Finance and accounting" },
  { id: "healthcare", label: "Healthcare" },
  { id: "marketing", label: "Marketing and sales" },
  { id: "business", label: "Business and operations" },
  { id: "education", label: "Education and research" },
  { id: "design", label: "Design and writing" },
  { id: "hospitality", label: "Hospitality" },
  { id: "retail", label: "Retail and customer service" },
  { id: "trades", label: "Trades and transport" },
  { id: "public", label: "Public sector and law" },
] as const

export const STAGE_FACETS = [
  { id: "student", label: "Student or fresher" },
  { id: "early", label: "Early career" },
  { id: "mid", label: "Mid-career" },
  { id: "senior", label: "Senior" },
  { id: "switcher", label: "Changing careers" },
] as const

export const STYLE_FACETS = [
  { id: "simple", label: "Simple" },
  { id: "one-page", label: "Dense one page" },
  { id: "two-column", label: "Two column" },
  { id: "modern", label: "Modern" },
  { id: "serif", label: "Serif" },
] as const

/** Country formats come from the editor's presets, shortened for a chip. */
export const FORMAT_FACETS: readonly { id: PresetId; label: string }[] = [
  { id: "us", label: "US / Canada" },
  { id: "uk", label: "UK / Ireland" },
  { id: "eu", label: "Europe" },
  { id: "de", label: "Germany" },
  { id: "in", label: "India" },
  { id: "gulf", label: "Gulf" },
  { id: "au", label: "Australia / NZ" },
]

export type RoleFacet = (typeof ROLE_FACETS)[number]["id"]
export type StageFacet = (typeof STAGE_FACETS)[number]["id"]
export type StyleFacet = (typeof STYLE_FACETS)[number]["id"]

export const FACET_GROUPS = [
  { key: "role", label: "Role", options: ROLE_FACETS },
  { key: "format", label: "Country format", options: FORMAT_FACETS },
  { key: "stage", label: "Career stage", options: STAGE_FACETS },
  { key: "style", label: "Style", options: STYLE_FACETS },
] as const

export type FacetKey = (typeof FACET_GROUPS)[number]["key"]

export type TemplatePage = {
  slug: string
  templateId: string
  /** The sample person shown first, and the role it is written for. */
  sample: string
  facets: { role: RoleFacet[]; format: PresetId[]; stage: StageFacet[]; style: StyleFacet[] }
  /** One line for cards. */
  tagline: string
  /** The page's answer, first paragraph. */
  answer: string
  guidance: { heading: string; body: string }[]
  faqs: { q: string; a: string }[]
  /** /resume-keywords/[role] pages that fit the people this template suits. */
  keywordRoles: string[]
  body: { face: string; size: string }
}

const ALL_FORMATS: PresetId[] = ["us", "uk", "eu", "de", "in", "gulf", "au"]

const CORE_PAGES: TemplatePage[] = [
  {
    slug: "ledger",
    templateId: "r001-ledger",
    sample: "meera",
    facets: {
      role: ["finance", "healthcare", "business", "engineering", "marketing", "education", "hospitality", "retail", "trades", "public"],
      format: ALL_FORMATS,
      stage: ["student", "early", "mid", "senior", "switcher"],
      style: ["simple"],
    },
    tagline: "One column of Inter with spaced capital headings. The safe default.",
    answer:
      "Ledger is a one-column resume template set in Inter, with spaced capital headings and dates on the right. Every line reads top to bottom in the order you wrote it, which is the layout applicant tracking systems read most reliably. Pick it when you are not sure which template to pick.",
    guidance: [
      {
        heading: "Why one column",
        body: "A parser reads a PDF as a stream of text. With one column, that stream is the same order a recruiter's eye follows: name, contact line, summary, then each job with its title, dates and employer. Nothing sits beside anything else, so nothing can be read out of turn.",
      },
      {
        heading: "How to fill it",
        body: "Keep the headline to your target job title, not a slogan. Put three to five bullets under your latest job and two under older ones; Ledger gives every bullet the same weight, so the order you choose is the order it is read. Group skills under two or three labels such as Accounting and Tools rather than one long list.",
      },
      {
        heading: "When to pick another",
        body: "If your skills list runs past ten tools, Column gives it a sidebar. If you are a student who needs projects and coursework on one page, Plain fits more lines.",
      },
    ],
    faqs: [
      {
        q: "Does Ledger fit on one page?",
        a: "With the sample's two jobs and one qualification, yes, at all three densities. A longer history flows onto a second page; the preview shows the page count as you type.",
      },
      {
        q: "Can I change the heading colour?",
        a: "Yes. Ledger takes any of the six accent colours in the Design tab, all at 4.5:1 contrast or better on white. Ink is the default.",
      },
      {
        q: "Is Ledger good for a CV in the UK or India?",
        a: "Yes. Choose the country format when you start and the document name, paper size, date style and personal details change to match. The layout stays the same.",
      },
    ],
    keywordRoles: ["business-analyst", "operations-manager", "project-manager"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "plain",
    templateId: "r002-plain",
    sample: "arjun",
    facets: {
      role: ["engineering"],
      format: ["us", "in"],
      stage: ["student", "early"],
      style: ["simple", "one-page", "serif"],
    },
    tagline: "Dense, serif and centred. Fits a student's projects and internships on one page.",
    answer:
      "Plain is a dense one-page resume template set in Source Serif 4, with a centred name, ruled section headings and dates aligned right. It follows the layout many engineering students already use, and fits education, internships and projects on a single page. Pick it for software and engineering roles early in your career.",
    guidance: [
      {
        heading: "Why it is dense",
        body: "Early-career engineering resumes in the US and India are expected to be one page, and the reader is scanning for three things: school, internships, projects. Plain sets the organisation in bold on one line and the role in italics under it, with location and dates on the right, so each entry takes two lines before its bullets.",
      },
      {
        heading: "How to fill it",
        body: "Put Education first while you are still studying; move it below Experience after your first full-time job. Give each project a link and one bullet that says what it does and who uses it, with a number if you have one. Keep skills to two lines: languages, then tools.",
      },
      {
        heading: "When to pick another",
        body: "Once you have five or more years of work, the density starts to hide the jobs that matter. Ledger gives each role more room. For roles where a two-page CV is normal, such as the UK or Australia, Ledger or Modern read more comfortably.",
      },
    ],
    faqs: [
      {
        q: "Is Plain the same as Jake's Resume?",
        a: "It follows the same pattern (centred name, ruled headings, organisation then role, dates on the right), which many students recognise. The Typst source is our own and it is set in Source Serif 4.",
      },
      {
        q: "Can I use Plain on US Letter paper?",
        a: "Yes. Switch paper in the Design tab or pick the US / Canada format when you start. Both sizes are tested.",
      },
      {
        q: "Should a student put GPA on the resume?",
        a: "If it is strong and the job asks for it, add it as the first bullet under your degree, as the sample does. Leave it off otherwise; nobody reads its absence as a gap.",
      },
    ],
    keywordRoles: ["software-engineer", "frontend-developer", "devops-engineer"],
    body: { face: "Source Serif 4", size: "10 pt" },
  },
  {
    slug: "column",
    templateId: "r003-column",
    sample: "lena",
    facets: {
      role: ["healthcare", "engineering", "finance"],
      format: ALL_FORMATS,
      stage: ["early", "mid", "senior"],
      style: ["two-column"],
    },
    tagline: "Experience on the left, certifications and skills in a sidebar.",
    answer:
      "Column is a two-column resume template: experience and education in a wide main column, with certifications, skills and languages in a narrow sidebar on the right. The main column comes first in the PDF's text, so a parser still reads your jobs before your sidebar. Pick it when you have a long list of skills, tools or registrations.",
    guidance: [
      {
        heading: "Why the sidebar comes second",
        body: "Two-column resumes break parsers when the sidebar is set first, or when both columns are read line by line across the page. Column writes the whole main column, then the whole sidebar, and our tests check that order on every run. There are no skill bars, icons or filled panels, which parsers turn into noise.",
      },
      {
        heading: "How to fill it",
        body: "Use the sidebar for things a recruiter checks off: registrations with their number and date, certifications, languages, and skills grouped under short labels. Keep the main column for what you did. If a certification is the reason you are hired, such as a nursing registration, list it first in the sidebar.",
      },
      {
        heading: "When to pick another",
        body: "If you have only four or five skills, the sidebar looks empty and Ledger is tidier. Some employers' portals still prefer a single column; if a job post says so, switch to Ledger in one click and nothing you typed is lost.",
      },
    ],
    faqs: [
      {
        q: "Are two-column resumes bad for ATS?",
        a: "They can be, when the text comes out of the PDF in the wrong order. Column sets the main column first in the file, and our parse-back test checks that each job's title, dates and bullets come out in order on every sample.",
      },
      {
        q: "What goes in the sidebar?",
        a: "Skills, languages, certifications and awards. Experience, education, projects and the summary stay in the main column.",
      },
      {
        q: "Can I move a section into the sidebar?",
        a: "Not yet. The sidebar takes skills, languages, certifications and awards automatically. You can reorder sections within each column.",
      },
    ],
    keywordRoles: ["data-analyst", "devops-engineer", "business-analyst"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "modern",
    templateId: "r006-modern",
    sample: "sofia",
    facets: {
      role: ["marketing", "business"],
      format: ALL_FORMATS,
      stage: ["mid", "senior", "switcher"],
      style: ["modern"],
    },
    tagline: "Section titles hang in the margin, under a short accent bar.",
    answer:
      "Modern is a one-column resume template with section titles hung in a left margin, a short accent bar over the name and generous spacing. It reads as one column to a parser while looking less like a form to a person. Pick it for marketing, product and business roles where how a document looks is part of the job.",
    guidance: [
      {
        heading: "Why the titles hang",
        body: "Setting Experience, Education and Skills in a margin column gives each section a clear start without large headings or rules. Each title sits on the same line as its first entry, so in the PDF's text it still comes right before what it labels.",
      },
      {
        heading: "How to fill it",
        body: "Write a two-line summary that names your field and the result you are known for; Modern gives it a full row. Lead each bullet with the outcome and a number where you have one, such as budget, pipeline or team size, the way the sample's first bullet does.",
      },
      {
        heading: "When to pick another",
        body: "The margin column takes width, so very long job titles wrap sooner than in Ledger. If you are applying to a conservative employer, such as a bank or a public body, Ledger is the quieter choice.",
      },
    ],
    faqs: [
      {
        q: "Is Modern ATS friendly?",
        a: "In our parse-back tests every field came out in order on all four samples, at three densities and two paper sizes. The dated results are on this page.",
      },
      {
        q: "Can I change the accent bar colour?",
        a: "Yes. The bar and section titles take the accent you pick in the Design tab. Ink, violet, navy, forest, oxblood and slate are all 4.5:1 or better on white.",
      },
      {
        q: "Does Modern work for a career change?",
        a: "Yes. Put a summary that names the move, then a Skills section before Experience, so the reader sees what carries over before the job titles.",
      },
    ],
    keywordRoles: ["digital-marketer", "product-manager", "content-writer"],
    body: { face: "Inter", size: "10 pt" },
  },
{
    slug: "scholar",
    templateId: "r004-scholar",
    sample: "mei",
    facets: { role: ["education", "healthcare", "engineering"], format: ALL_FORMATS, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "A serif academic CV with numbered publications. As long as the record needs.",
    answer:
      "Scholar is an academic CV template set in Source Serif 4, with bold section heads over a thin rule and publications as a numbered reference list. It runs to as many pages as your record needs and keeps one text flow, so grant portals and university HR systems read it in order. Pick it for research, teaching and medical posts.",
    guidance: [
      {
        heading: "Why it runs long",
        body: "An academic CV is a record, not a pitch. Search committees expect every paper, grant, talk and student you supervised, in reverse date order. Scholar keeps headings with the first entry under them, so a section never starts at the foot of a page.",
      },
      {
        heading: "How to fill it",
        body: "Lead with education (degree, institution, years, thesis title in the detail line), then appointments, then publications. Put authors in the detail line in the order printed, with your name as it appears in the paper. Use a Custom section for grants with amounts, and one for teaching.",
      },
      {
        heading: "When to pick another",
        body: "For an industry job, a two-page resume reads better: move to Ledger and keep the three papers that matter to that role. Clinical posts in the UK often want the NHS format; check the job pack.",
      },
    ],
    faqs: [
      { q: "How should publications be formatted?", a: "Title in bold, then the journal or venue in italics, the year, and the author list. Each one is numbered so a panel can refer to it. Use the Publications section, one entry per paper." },
      { q: "Can an academic CV be more than two pages?", a: "Yes. Committees expect the full record. Scholar is tested at three densities, and every page reads back in order." },
      { q: "Where do grants and teaching go?", a: "Add a Custom section for each, titled Grants and Teaching. Put the amount and funder in the subtitle." },
    ],
    keywordRoles: ["data-analyst", "business-analyst", "project-manager"],
    body: { face: "Source Serif 4", size: "10 pt" },
  },
  {
    slug: "compact",
    templateId: "r005-compact",
    sample: "robert",
    facets: { role: ["finance", "business", "engineering", "marketing"], format: ALL_FORMATS, stage: ["mid", "senior"], style: ["one-page", "simple"] },
    tagline: "One line per role and tight margins. Fifteen years on one page.",
    answer:
      "Compact is a one-page resume template for long careers: each role sits on one line as title, company and place, with the dates at the right edge and the bullets close beneath. Contact details stack top right. Pick it when you have more history than one page usually holds and the job asks for one page.",
    guidance: [
      {
        heading: "Why one line per role",
        body: "A two-line entry header costs about a line per job. Over six jobs that is half a section. Compact joins title and company on one line, so older roles can stay with one bullet each instead of being cut.",
      },
      {
        heading: "How to fill it",
        body: "Give the last two roles three or four bullets and older ones one, or none. Start each bullet with what changed and the number. Keep the summary to two lines; with a dense page, the reader decides from the first five lines.",
      },
      {
        heading: "When to pick another",
        body: "If two pages are allowed, Executive or Ledger give each role more air. Early in a career, the density looks empty rather than efficient; use Plain or Fresher.",
      },
    ],
    faqs: [
      { q: "Is a one-page resume better for senior roles?", a: "Not always. Many senior roles accept two pages. Use Compact when the posting or recruiter asks for one, or when your older roles add little." },
      { q: "Do the contact details on the right confuse parsers?", a: "In our tests the name, headline and every contact item came back before the summary, in order, on all samples." },
      { q: "How small does the text get?", a: "Body text is 9.5 to 10.5 pt by density. Nothing goes below 8.5 pt." },
    ],
    keywordRoles: ["operations-manager", "project-manager", "business-analyst"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "executive",
    templateId: "r007-executive",
    sample: "robert",
    facets: { role: ["finance", "business", "marketing", "hospitality"], format: ALL_FORMATS, stage: ["senior"], style: ["serif"] },
    tagline: "Centred serif name, summary as a lead, achievements before history.",
    answer:
      "Executive is a two-page resume template for directors and heads of function. The name is centred in Source Serif 4 over a double rule, the summary reads as a lead paragraph, and a Selected achievements section can sit before the job history. Pick it when the reader is a board, a search firm or a CEO.",
    guidance: [
      {
        heading: "Why achievements come first",
        body: "Executive search readers look for scale and outcomes: revenue, deals, teams, turnarounds. Three to five achievement lines at the top answer that before the reader reaches the dates. Add them as a Custom section titled Selected achievements and drag it above Experience.",
      },
      {
        heading: "How to fill it",
        body: "Write the summary as one sentence of scope (sector, size of business) and one of what you are known for. Under each role, lead with the remit (team size, budget, countries), then two or three results. Roles older than fifteen years can be a single line.",
      },
      {
        heading: "When to pick another",
        body: "If the employer asks for one page, use Compact. For non-executive roles in creative fields, Modern or Specimen look less formal.",
      },
    ],
    faqs: [
      { q: "Should an executive resume be two pages?", a: "Usually, yes. Two pages lets you show remit and results for each senior role without shrinking the type." },
      { q: "Where do board and advisory roles go?", a: "Add a Custom section called Board roles, with organisation, role and years." },
      { q: "Is the serif face a problem for ATS?", a: "No. Parsers read the text, not the face. Source Serif 4 is embedded with a full character map, and our tests read every field back." },
    ],
    keywordRoles: ["operations-manager", "project-manager", "product-manager"],
    body: { face: "Source Serif 4", size: "10 pt" },
  },
  {
    slug: "fresher",
    templateId: "r008-fresher",
    sample: "sneha",
    facets: { role: ["engineering", "finance", "business", "marketing"], format: ["us", "in", "uk", "au"], stage: ["student", "early"], style: ["simple", "one-page"] },
    tagline: "For a first job: education and projects up front, contact on the right.",
    answer:
      "Fresher is a one-page resume template for students, graduates and interns. The name sits left with contact details stacked on the right, headings carry a small accent square, and there is room for coursework, projects, certifications and activities. Put Education first in the form and it leads the page.",
    guidance: [
      {
        heading: "Why education leads",
        body: "With under a year of work, your degree, marks and coursework are the strongest evidence you have. Recruiters screening graduates look for the course, the year you finish, and something you built or ran. Fresher gives each of those its own section.",
      },
      {
        heading: "How to fill it",
        body: "Write a one-line objective that names the role and what you bring, such as Tally and GST returns for an accounts trainee. Give each project a number: users, money, time saved. Count internships, college societies and part-time work; they show you can turn up and deliver.",
      },
      {
        heading: "When to pick another",
        body: "For software roles in the US, Plain is the denser pattern many reviewers expect. After your first full-time year, move Experience above Education or switch to Ledger.",
      },
    ],
    faqs: [
      { q: "What should a fresher put on a resume with no experience?", a: "Education with marks and coursework, internships, projects with a result, certifications, and positions of responsibility. The sample shows each one." },
      { q: "Should I add my date of birth?", a: "Only where it is expected, such as India or the Gulf. Pick that country format and the field appears; otherwise it stays hidden." },
      { q: "Is an objective still useful?", a: "For a first job, one specific line helps: the role you want and the skills you bring. Skip generic lines about growth." },
    ],
    keywordRoles: ["software-engineer", "data-analyst", "business-analyst"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "switcher",
    templateId: "r009-switcher",
    sample: "maya",
    facets: { role: ["education", "design", "business", "engineering"], format: ALL_FORMATS, stage: ["switcher", "mid"], style: ["modern"] },
    tagline: "A profile panel and skills before history, for career changers.",
    answer:
      "Switcher is a hybrid resume template for people changing careers or returning after a gap. The profile sits in a shaded panel under the name, and skills are set two groups to a row, so a reader sees what transfers before the old job titles. It is still one text flow from top to bottom.",
    guidance: [
      {
        heading: "Why skills come first",
        body: "A recruiter scanning for an instructional designer sees Science Teacher and moves on. If the first thing they read is ADDIE, Storyline and a portfolio project with a result, the old title becomes background instead of a filter. Drag Skills and Projects above Experience in the form.",
      },
      {
        heading: "How to fill it",
        body: "Name the move in the profile: what you did, what you do now, and the proof. Add one or two projects in the new field with a link and a number. Under the old job, keep bullets that use the new field's words honestly, such as designed, trained, measured.",
      },
      {
        heading: "When to pick another",
        body: "Once you have a year in the new role, the hybrid order is no longer needed; Ledger or Modern put your new title first.",
      },
    ],
    faqs: [
      { q: "Do recruiters dislike skills-first resumes?", a: "Some distrust resumes that hide dates. Switcher keeps every job with its dates; it only changes what comes first." },
      { q: "How do I explain a career gap?", a: "One line in the profile is enough, such as caring for a parent, 2022 to 2024. Add courses or projects from that time if you did any." },
      { q: "Is the shaded panel a text box?", a: "No. It is a filled block in the same text flow, so parsers read the profile in place. Our tests check that on every sample." },
    ],
    keywordRoles: ["ux-designer", "project-manager", "customer-success-manager"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "europa",
    templateId: "r010-europa",
    sample: "tomas",
    facets: { role: ["engineering", "business", "marketing", "design", "finance"], format: ["eu", "de", "uk"], stage: ["early", "mid", "senior"], style: ["modern"] },
    tagline: "A4 European CV: grey label column, personal details line, CEFR languages.",
    answer:
      "Europa is a European CV template on A4: section labels sit in a right-aligned grey column with content beside them, personal details such as nationality appear under the name, and languages are listed with their CEFR level (A1 to C2). It follows the shape EU employers know from Europass without its long form.",
    guidance: [
      {
        heading: "Why a label column",
        body: "European CVs are often read by HR teams comparing many applicants across countries. A fixed label column makes the same section easy to find on every CV. Each label sits on the same row as its first entry, so the text still reads label, then content.",
      },
      {
        heading: "How to fill it",
        body: "Choose Europe or Germany as the format and the dates switch to 03/2024 style, with nationality and licence fields shown. Give every language a CEFR level, not Good or Fluent. In Germany, a photo and date of birth are optional; photos are not supported yet.",
      },
      {
        heading: "When to pick another",
        body: "For the UK and Ireland, personal details are not expected; Ledger or Modern with the UK format is the cleaner choice.",
      },
    ],
    faqs: [
      { q: "Is this the official Europass CV?", a: "No. Europa follows the same order and CEFR language levels in a shorter layout. If an employer asks for the Europass form itself, use the EU's own editor." },
      { q: "What are CEFR levels?", a: "The Common European Framework levels: A1 and A2 basic, B1 and B2 independent, C1 and C2 proficient. Use Native for your first language." },
      { q: "Should a German CV be signed and dated?", a: "It is still common in Germany. Add a Custom section at the end with the place and date." },
    ],
    keywordRoles: ["data-analyst", "customer-success-manager", "graphic-designer"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "gulf",
    templateId: "r011-gulf",
    sample: "omar",
    facets: { role: ["business", "marketing", "hospitality", "engineering", "finance"], format: ["gulf"], stage: ["early", "mid", "senior"], style: ["simple"] },
    tagline: "A Gulf CV with a personal details block: nationality, visa status, licence.",
    answer:
      "Gulf is a CV template for the UAE, Saudi Arabia, Qatar and Kuwait. The name is centred in capitals, a personal details block lists nationality, visa status, date of birth and driving licence in a two-column table, and section bars are shaded. Recruiters in the region check those details first, so they sit at the top.",
    guidance: [
      {
        heading: "Why personal details lead",
        body: "Gulf employers sponsor visas, so nationality and current visa status decide whether an application can move. A transferable residence visa or a local licence is often a deciding line. The block puts them where a recruiter looks first.",
      },
      {
        heading: "How to fill it",
        body: "Choose the Gulf format and fill nationality, visa status and licence; date of birth and marital status are optional. Write numbers in the currency of the role, such as AED or SAR. List languages, because Arabic and English levels are often screening questions.",
      },
      {
        heading: "When to pick another",
        body: "For multinational employers in the region applying through a global portal, Ledger with the Gulf format keeps the same details in a quieter layout. Photos are common in the Gulf but not supported yet.",
      },
    ],
    faqs: [
      { q: "What personal details go on a UAE CV?", a: "Nationality and visa status are standard. Date of birth, marital status and driving licence are common and optional. Leave out anything you prefer not to share." },
      { q: "Do I need a photo for a Gulf CV?", a: "Many applicants include one, and few employers require it. Dossier templates do not support photos yet." },
      { q: "Is a two or three page CV fine in the Gulf?", a: "Yes, two to three pages is normal for experienced hires." },
    ],
    keywordRoles: ["digital-marketer", "operations-manager", "sales-representative"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "specimen",
    templateId: "r012-specimen",
    sample: "noor",
    facets: { role: ["design", "marketing"], format: ALL_FORMATS, stage: ["early", "mid", "senior"], style: ["modern"] },
    tagline: "The name set large in Bricolage Grotesque, for designers and writers.",
    answer:
      "Specimen is a resume template for designers, writers and other creative roles: the name is set large in Bricolage Grotesque, section heads use the same face, and the body is Inter. The layout stays one column with one text flow, so it reads cleanly in an applicant tracking system while still looking chosen.",
    guidance: [
      {
        heading: "Why the character is in the type",
        body: "Creative hiring managers see the resume as a first sample of your taste, but the screening system sees only text. Specimen spends its personality on two typefaces and an accent rule, and none on columns, icons or skill bars that break parsing.",
      },
      {
        heading: "How to fill it",
        body: "Put your portfolio link first in the links, with a short label such as your domain. Write bullets about outcomes, not tools: completion rates, sales, awards, launches. Keep the summary to two lines; it sits large under the rule.",
      },
      {
        heading: "When to pick another",
        body: "For a conservative employer or a bank's design team, Modern is calmer. If your portfolio is the application, keep the resume to one page.",
      },
    ],
    faqs: [
      { q: "Should a designer's resume be creative?", a: "The portfolio carries the visual work. The resume should be clear and well set. Specimen does that with type alone, so it still passes a parser." },
      { q: "Can I change the accent colour?", a: "Yes, any of the six accents. The name stays ink for contrast; the rule and headings take the accent." },
      { q: "Is Bricolage Grotesque free to use?", a: "Yes. It is released under the SIL Open Font License, which allows embedding in PDFs." },
    ],
    keywordRoles: ["ux-designer", "graphic-designer", "content-writer"],
    body: { face: "Bricolage Grotesque + Inter", size: "10 pt" },
  },
]

/** Every template page: the first twelve, then the kit templates (R-013 on). */
export const TEMPLATE_PAGES: readonly TemplatePage[] = [...CORE_PAGES, ...KIT_PAGES]

export const TEMPLATES_UPDATED = "2026-10-23"

export type TemplateEntry = TemplatePage & { engine: ResumeTemplate }

export function templateEntries(): TemplateEntry[] {
  return TEMPLATE_PAGES.map((p) => ({ ...p, engine: RESUME_TEMPLATES.find((t) => t.id === p.templateId)! }))
    .filter((p) => p.engine)
    .sort((a, b) => a.engine.no.localeCompare(b.engine.no))
}

export function getTemplatePage(slug: string): TemplateEntry | undefined {
  return templateEntries().find((p) => p.slug === slug)
}
