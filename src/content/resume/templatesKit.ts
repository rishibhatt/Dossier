import type { PresetId } from "@/lib/resume/schema"

import type { TemplatePage } from "./templates"

/**
 * Page copy for templates R-013 to R-042 (the kit templates in src/resume/typst/kit.typ). Each one names the
 * pattern it comes from, who it suits, and when to pick another. Claims stay within what the template does and
 * what the verification files show; sample people are fictional.
 */

const ALL: PresetId[] = ["us", "uk", "eu", "de", "in", "gulf", "au"]
const g = (why: [string, string], how: string, when: string) => [
  { heading: why[0], body: why[1] },
  { heading: "How to fill it", body: how },
  { heading: "When to pick another", body: when },
]

export const KIT_PAGES: TemplatePage[] = [
  {
    slug: "margin",
    templateId: "r013-margin",
    sample: "lukas",
    facets: { role: ["engineering", "education"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "Dates in a narrow left column, set in PT Serif. The European CV pattern.",
    answer:
      "Margin is a resume template with the dates in a narrow left column and each role, employer and bullet to the right, set in PT Serif. It follows the CurVe and moderncv pattern common in European and engineering CVs, built so the role still comes before its dates in the PDF's text. Pick it when a timeline view helps the reader.",
    guidance: g(
      ["Why the dates sit left", "A left date column lets a reader run down your timeline in one glance and spot gaps or overlaps at once. Typical CurVe-style CVs set the date first in the text, which can attach it to the wrong job; Margin writes the role first and only draws the date on the left."],
      "Keep date ranges short (Mar 2022 to Present) so they fit the column on two lines at most. Give each role two to four bullets with a number. Put degree and institution in Education the same way, so the timeline continues.",
      "If your history has many overlapping roles, a right-aligned date (Ledger) reads more clearly. For a dense US-style one-pager, use Plain.",
    ),
    faqs: [
      { q: "Do parsers read a left date column correctly?", a: "In our tests every role came out of the PDF before its employer and dates, on all samples, densities and paper sizes. The results and date are on this page." },
      { q: "Is this the moderncv layout?", a: "It follows the same idea of a date column on the left. The Typst code is our own, and the reading order is different on purpose." },
      { q: "Can I use it for a US job?", a: "Yes. Pick the US format and it switches to Letter paper and US date style. The layout stays the same." },
    ],
    keywordRoles: ["software-engineer", "data-analyst", "project-manager"],
    body: { face: "PT Serif", size: "10 pt" },
  },
  {
    slug: "harbor",
    templateId: "r014-harbor",
    sample: "priya",
    facets: { role: ["engineering", "marketing", "design"], format: ALL, stage: ["early", "mid"], style: ["two-column", "modern"] },
    tagline: "A sidebar for skills and languages beside the main column, read second.",
    answer:
      "Harbor is a two-column resume template: your experience in a wide main column, with skills, languages and certifications in a sidebar beside it. It takes the idea of AltaCV and Simple Hipster CV, the sidebar CVs Overleaf's staff pick, and fixes their weak point: the main column comes first in the PDF's text, so a parser reads your jobs before the sidebar.",
    guidance: g(
      ["Why the sidebar reads second", "Sidebar CVs fail in applicant tracking systems when the sidebar is written first or both columns are read across. Harbor sets the main column first and the sidebar after it, and our tests check that order on every sample. We tried a left-hand sidebar too; Typst writes it to the PDF first, so it failed our reading-order test and we kept the sidebar on the right."],
      "Put things a recruiter ticks off in the sidebar: skills grouped under short labels, languages with levels, certifications with dates. Keep experience to the main column. Contact details stack on the right of the header.",
      "With fewer than six skills the sidebar looks thin; Ledger is tidier. If a job portal asks for a single-column file, switch to Ledger in one click.",
    ),
    faqs: [
      { q: "Are sidebar resumes ATS friendly?", a: "They can be when the text order is right. Harbor writes the main column first; our parse-back test checks that each job comes out before the sidebar." },
      { q: "What goes in the sidebar?", a: "Skills, languages, certifications and awards. Everything else stays in the main column." },
      { q: "Does it support a photo?", a: "Not yet. Photos are planned for the formats that expect one." },
    ],
    keywordRoles: ["frontend-developer", "data-analyst", "digital-marketer"],
    body: { face: "Lato", size: "10 pt" },
  },
  {
    slug: "bedside",
    templateId: "r015-bedside",
    sample: "lena",
    facets: { role: ["healthcare"], format: ALL, stage: ["early", "mid", "senior"], style: ["simple"] },
    tagline: "Shaded section bars and an accent rule. Built for nursing and allied health.",
    answer:
      "Bedside is a resume template for nurses and allied health staff: shaded section bars, an accent rule under the name, and Lato for easy reading. Registrations and certifications get their own section, so a hiring manager can check them in seconds. It is one column and one text flow.",
    guidance: g(
      ["Why registrations stand out", "Healthcare hiring starts with a check: registration, life support certificates, specialty. Shaded bars make Certifications easy to find without making it a box a parser might skip."],
      "List your registration with the body and date (NMC, state board, nursing council). Under each post, give the unit, bed count or patient load, and one quality result such as an audit or incident rate. Keep clinical skills to one or two groups.",
      "For a medical CV with publications and audits, Clinic or Scholar handle the length better. For non-clinical healthcare roles, Ledger is plainer.",
    ),
    faqs: [
      { q: "What should a nursing resume include?", a: "Registration and number where appropriate, specialty, units and patient loads, certifications such as BLS or ALS with dates, and a clinical skills list." },
      { q: "Should certifications go before experience?", a: "For a newly qualified nurse, yes. Drag Certifications above Experience in the form." },
      { q: "Is two pages fine?", a: "Yes for experienced nurses in most countries. The preview shows the page count as you type." },
    ],
    keywordRoles: ["project-manager", "operations-manager", "customer-success-manager"],
    body: { face: "Lato", size: "10 pt" },
  },
  {
    slug: "counter",
    templateId: "r016-counter",
    sample: "marcus",
    facets: { role: ["marketing", "hospitality", "business", "retail"], format: ALL, stage: ["student", "early", "mid"], style: ["simple", "one-page"] },
    tagline: "Centred header, skills on one line. For retail and customer service.",
    answer:
      "Counter is a one-column resume template for retail, customer service and front-of-house jobs: a centred header, capital section heads over a hairline, and skills run together on one line so the page stays short. Set in PT Sans, it fits a first job or ten years on the shop floor on one page.",
    guidance: g(
      ["Why skills run on one line", "Retail and service resumes are read fast, often on a phone by a store manager. One line of skills (tills, stock, languages, opening and closing) saves room for the results that get you hired: sales, ratings, shifts covered."],
      "Lead each job with what you were trusted with: keys, cash, a team, a department. Add numbers where they are honest, such as average basket, customer score or hours a week. Put availability in the summary if it matters, such as weekends.",
      "For a supervisory role with a long history, Ledger gives each job more room. For hospitality jobs with many short contracts, try Shift.",
    ),
    faqs: [
      { q: "What skills go on a retail resume?", a: "Point of sale, cash handling, stock and merchandising, customer service, opening and closing, and any languages. Use the words from the job ad where they are true." },
      { q: "Is one page enough?", a: "Usually, yes. Counter is tested on one and two pages, so a longer history still reads in order." },
      { q: "Should I include availability?", a: "If the ad mentions shifts, a short line in the summary helps, such as available weekends and evenings." },
    ],
    keywordRoles: ["sales-representative", "customer-success-manager", "operations-manager"],
    body: { face: "PT Sans", size: "10 pt" },
  },
  {
    slug: "shift",
    templateId: "r017-shift",
    sample: "andre",
    facets: { role: ["hospitality", "business", "retail", "trades"], format: ALL, stage: ["early", "mid", "senior"], style: ["one-page"] },
    tagline: "One line per role and rules to the margin. Many short jobs, one page.",
    answer:
      "Shift is a one-page resume template for hospitality, warehouse and logistics work: each job sits on one line as role, employer and place with the dates on the right, and section heads run a rule to the margin. Set in Fira Sans, it keeps several short contracts readable without cutting any.",
    guidance: g(
      ["Why one line per role", "Hourly and seasonal roles often mean six jobs in four years. A two-line entry for each pushes the page to two. One line keeps every job, so a reader sees steady work rather than gaps."],
      "Give your latest two roles two or three bullets each: volume (covers, pallets, orders a shift), safety record, and anything you trained others on. Older roles can be a single line. Put forklift, food hygiene and first aid in Certifications.",
      "For a management role, Transit or Ledger read as more senior. For front-of-house in hotels, Crew is close and a little warmer.",
    ),
    faqs: [
      { q: "How do I list many short jobs?", a: "One line each, newest first, with the dates. Group very short agency work under one agency entry." },
      { q: "Where do licences go?", a: "In Certifications, with the issuing body and date, such as a forklift licence or food hygiene level 2." },
      { q: "Is it ATS friendly?", a: "Our parse-back test read every role, employer and date in order on all samples. The dated results are on this page." },
    ],
    keywordRoles: ["operations-manager", "project-manager", "customer-success-manager"],
    body: { face: "Fira Sans", size: "10 pt" },
  },
  {
    slug: "brief",
    templateId: "r018-brief",
    sample: "aoife",
    facets: { role: ["business", "finance", "public"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "Centred capitals, double-ruled heads, the firm before the role.",
    answer:
      "Brief is a legal CV template: the name in centred capitals, double-ruled section heads, and each entry led by the firm or chambers before the role, as legal recruiters read them. Set in Crimson Text, it suits solicitors, lawyers, paralegals and compliance staff.",
    guidance: g(
      ["Why the firm comes first", "In law, where you trained and practised carries weight. Leading with the firm lets a partner scan the names first. The text still keeps firm, role and dates together for parsers."],
      "Name practice areas in the headline. Under each role, give matter types and values where you may, client sectors, and anything you led. Add admissions in Certifications with year and jurisdiction.",
      "For in-house legal roles at tech companies, Ledger reads less formal. For academic law posts, Scholar handles publications.",
    ),
    faqs: [
      { q: "How should a lawyer's CV be ordered?", a: "Admissions and current role first, then previous roles, education, and publications or talks. Keep matters anonymous unless public." },
      { q: "Can I list deal values?", a: "Only where public or permitted by your firm. Ranges or sizes such as mid-market work as an alternative." },
      { q: "Is a serif face fine for ATS?", a: "Yes. Parsers read the text, and Crimson Text is embedded with a full character map. Our tests read every field back." },
    ],
    keywordRoles: ["business-analyst", "project-manager", "operations-manager"],
    body: { face: "Crimson Text", size: "10 pt" },
  },
  {
    slug: "folio",
    templateId: "r019-folio",
    sample: "ananya",
    facets: { role: ["finance", "business"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif", "modern"] },
    tagline: "IBM Plex Serif with short accent underlines. For finance and consulting.",
    answer:
      "Folio is a resume template for finance, accounting and consulting: IBM Plex Serif, a short accent rule under each section head, and contact details stacked to the right of the name. It reads precise and modern without columns, so analysts and auditors can put numbers first.",
    guidance: g(
      ["Why a serif for finance", "Finance recruiters see hundreds of near-identical resumes. A well-set serif with one accent mark looks considered while staying conservative, and leaves the reader's attention for the numbers."],
      "Lead bullets with the size of what you handled (budget, portfolio, entities) and the result (forecast error, close days, savings). Put qualifications such as CFA or CA in Certifications with the level and year.",
      "For investment banking applications that expect one dense page, Compact or Plain fit more. For senior finance leaders, Executive leads with achievements.",
    ),
    faqs: [
      { q: "Should I list CFA levels in progress?", a: "Yes, as CFA Level II candidate with the exam date. Passed levels go in Certifications." },
      { q: "How long should a finance resume be?", a: "One page early in a career, two for experienced hires. The preview shows the page count as you type." },
      { q: "Can I change the accent colour?", a: "Yes, any of six. Navy and ink are the usual choices in finance." },
    ],
    keywordRoles: ["business-analyst", "data-analyst", "project-manager"],
    body: { face: "IBM Plex Serif", size: "10 pt" },
  },
  {
    slug: "transit",
    templateId: "r020-transit",
    sample: "rahul",
    facets: { role: ["business", "engineering"], format: ALL, stage: ["mid", "senior"], style: ["modern"] },
    tagline: "Section labels in a side column, accent rule under the name.",
    answer:
      "Transit is a resume template for operations, supply chain and project roles: section labels sit in a side column with the content beside them, and an accent rule runs under the name. Each label is on the same row as its first entry, so the text still reads label then content.",
    guidance: g(
      ["Why side labels", "Operations readers jump between sections: scale of sites, systems used, certifications. A label column makes each one easy to find, the way a good report is laid out."],
      "Open each role with its scope (sites, headcount, volume), then two or three results with numbers. Put Lean, Six Sigma, PMP or NEBOSH in Certifications. Keep systems such as SAP or WMS in Skills.",
      "If you have a long skills list, Column puts it in a sidebar. For a one-page limit, Compact fits more roles.",
    ),
    faqs: [
      { q: "What should an operations resume show?", a: "Scale (sites, staff, volume), cost and safety results, systems used, and improvement methods with outcomes." },
      { q: "Are side labels a two-column layout?", a: "No. Each section is one row with its label beside it, so the page still reads top to bottom." },
      { q: "Does Transit work for project managers?", a: "Yes. Put delivery figures (budget, schedule, team) in the first bullet of each role." },
    ],
    keywordRoles: ["operations-manager", "project-manager", "business-analyst"],
    body: { face: "Fira Sans", size: "10 pt" },
  },
  {
    slug: "lecture",
    templateId: "r021-lecture",
    sample: "emily",
    facets: { role: ["education"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "Crimson Text, dates in a left column, the profile set as a lead.",
    answer:
      "Lecture is a resume template for teachers, lecturers and trainers: Crimson Text, dates in a left column, and your profile set as a lead paragraph without a heading. It reads like a calm, well-edited page, which suits schools and colleges reading for care and clarity.",
    guidance: g(
      ["Why the profile leads", "School leaders read the first lines to decide whether the rest fits their department. A short lead paragraph that names your subject, key stages and one result does that better than a Summary label."],
      "Name subjects, age ranges and exam boards. Give one result per role (pass rates, attendance, a club you started). Add QTS, PGCE or state certification in Certifications with dates, and safeguarding checks if relevant.",
      "For a university post with publications, Scholar fits better. For corporate training roles, Cadence or Ledger read more business-like.",
    ),
    faqs: [
      { q: "What goes on a teacher's resume?", a: "Subject and phase, schools and roles, results such as grade improvements, responsibilities like coordinator posts, and qualifications such as QTS or a teaching licence." },
      { q: "Should I include a personal statement?", a: "Many school applications ask for a separate statement. Keep the resume profile to two or three lines." },
      { q: "Is it one page or two?", a: "Two pages is normal for experienced teachers. The template is tested at both." },
    ],
    keywordRoles: ["project-manager", "content-writer", "business-analyst"],
    body: { face: "Crimson Text", size: "10 pt" },
  },
  {
    slug: "atelier",
    templateId: "r022-atelier",
    sample: "noor",
    facets: { role: ["design"], format: ALL, stage: ["early", "mid", "senior"], style: ["two-column", "modern"] },
    tagline: "Display name in the accent, sidebar for tools. For designers.",
    answer:
      "Atelier is a resume template for designers, architects and creative leads: the name in Bricolage Grotesque set in your accent colour, sentence-case heads, and a right sidebar for tools, skills and awards. The main column comes first in the PDF's text, so the work history is read before the sidebar.",
    guidance: g(
      ["Why the name carries the colour", "A creative resume is a first sample of judgement. One accent on the name and nothing else shows restraint, and keeps the page parseable: no icons, bars or images."],
      "Put your portfolio link first in links. Write bullets as outcomes: completion rates, launches, awards, sales. Keep tools to the sidebar under labels such as Design and Prototyping.",
      "If you apply through a strict corporate portal, Ledger or Modern are safer. If type is the point, Specimen keeps one column.",
    ),
    faqs: [
      { q: "Should a designer's resume be colourful?", a: "One accent is enough. Let the portfolio show range; the resume should show clarity." },
      { q: "Where does the portfolio link go?", a: "First in your links, with a short label such as your domain. It appears in the header as a clickable link." },
      { q: "Is the sidebar read correctly?", a: "In our tests the main column came out before the sidebar on every sample. The dated results are on this page." },
    ],
    keywordRoles: ["ux-designer", "graphic-designer", "content-writer"],
    body: { face: "Bricolage Grotesque + Inter", size: "10 pt" },
  },
  {
    slug: "signal",
    templateId: "r023-signal",
    sample: "vikram",
    facets: { role: ["engineering"], format: ALL, stage: ["early", "mid", "senior"], style: ["modern", "simple"] },
    tagline: "Rules to the margin, dash bullets, skills two to a row. For data and IT.",
    answer:
      "Signal is a resume template for data, IT and analytics roles: section heads followed by a rule to the margin, dash bullets, and skill groups two to a row so a long stack stays compact. Set in Inter, one column, one text flow.",
    guidance: g(
      ["Why skills two to a row", "Technical resumes carry long tool lists. Two groups to a row (Languages and Tools, Cloud and Data) halves the height of the Skills section without a sidebar, and the groups still read in order."],
      "Name the stack in each bullet, not only in Skills: what you built, with what, and the result in time, cost or accuracy. Link your GitHub or portfolio. Keep certifications such as AWS or CKA with dates.",
      "For a student software resume, Plain or Kernel are the patterns reviewers expect. For a data scientist with papers, Scholar lists publications.",
    ),
    faqs: [
      { q: "How many skills should I list?", a: "Enough to match the job post honestly, grouped. Ten to twenty specific tools is common for data and IT roles." },
      { q: "Do dash bullets parse?", a: "Yes. They are plain text characters, and our tests read every bullet back in order." },
      { q: "Should I add projects?", a: "If they show skills your jobs don't, yes, with a link and a result." },
    ],
    keywordRoles: ["data-analyst", "devops-engineer", "software-engineer"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "docket",
    templateId: "r024-docket",
    sample: "olivia",
    facets: { role: ["business", "public"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "Serif labels in a side column, organisation first. For office and admin roles.",
    answer:
      "Docket is a resume template for administration, government and office roles: PT Serif, section labels in a side column, and each entry led by the organisation. It reads orderly and formal, the way an application to a public body or a large office is expected to look.",
    guidance: g(
      ["Why the organisation leads", "For administrative roles, where you worked signals the systems and standards you know: a hospital trust, a law firm, a ministry. Leading with the organisation puts that first."],
      "Under each role, list what you ran: diaries, budgets, records, events, with volumes. Name systems such as SAP, Workday or case management tools. Add typing speed or certifications only if the ad asks.",
      "For a personal assistant to an executive, Ledger reads lighter. For civil service applications with competency statements, Civic is closer.",
    ),
    faqs: [
      { q: "What skills matter on an admin resume?", a: "Calendar and travel management, record keeping, minute taking, budgets, and the specific software in the job ad." },
      { q: "Is the side label layout ATS friendly?", a: "Each label shares a row with its content, so the page reads top to bottom. Our tests confirm the order on every sample." },
      { q: "Should I include references?", a: "In the UK and Australia, a line saying references are available on request is common. Add a Custom section if you want it." },
    ],
    keywordRoles: ["operations-manager", "project-manager", "business-analyst"],
    body: { face: "PT Serif", size: "10 pt" },
  },
  {
    slug: "ward",
    templateId: "r025-ward",
    sample: "rosa",
    facets: { role: ["healthcare"], format: ALL, stage: ["student", "early", "mid"], style: ["simple"] },
    tagline: "A shaded header band and shaded section bars. Calm and easy to scan.",
    answer:
      "Ward is a resume template for pharmacy, medical assistants and clinic staff: a shaded band behind the header, shaded section bars, and PT Sans for easy reading. It is one column and one text flow, so registrations and clinical skills read cleanly in an applicant tracking system.",
    guidance: g(
      ["Why the shaded band", "Clinic managers screen quickly between patients. A shaded header and bars mark where each section starts at a glance, without boxes or columns that a parser might misread."],
      "Lead with registration or certification where your role needs one. Under each job, give patient volume, the procedures you assist with, and systems such as EHR or dispensing software. Keep soft skills to the summary.",
      "For a registered nurse with specialties, Bedside is built around certifications. For a doctor's CV, use Clinic.",
    ),
    faqs: [
      { q: "What should a medical assistant resume include?", a: "Clinical tasks (vitals, phlebotomy, injections), admin tasks (scheduling, billing), EHR software, and certifications with dates." },
      { q: "Is shading safe for ATS?", a: "Yes. The bars are background fills behind real text, and our tests read every heading and field back." },
      { q: "Does it print well?", a: "Yes. The shading is light and the text stays black for printing and photocopying." },
    ],
    keywordRoles: ["customer-success-manager", "operations-manager", "project-manager"],
    body: { face: "PT Sans", size: "10 pt" },
  },
  {
    slug: "site",
    templateId: "r026-site",
    sample: "ben",
    facets: { role: ["engineering", "business", "trades"], format: ALL, stage: ["early", "mid", "senior"], style: ["one-page"] },
    tagline: "One line per job and square markers. For construction and the trades.",
    answer:
      "Site is a resume template for construction, trades and electricians: one line per job with dates on the right, square heading markers, and an accent rule under the name. Set in Fira Sans, it keeps many contracts and certifications on one readable page.",
    guidance: g(
      ["Why one line per job", "Trades careers are often a run of contracts. One line each (role, contractor, site) keeps the list complete and short, which is what a site manager wants to see."],
      "Under recent jobs, name the type of work, project size, and safety record. Put licences, cards and tickets (CSCS, OSHA, electrical licence) in Certifications with numbers where expected and dates.",
      "For a construction manager running large projects, Transit gives scope more room. For engineering graduates, Margin or Plain fit better.",
    ),
    faqs: [
      { q: "What certifications go on a trades resume?", a: "Trade licence, safety cards (OSHA, CSCS), first aid, and plant or equipment tickets, each with the issuing body and date." },
      { q: "Should I list every contract?", a: "Recent ten years, yes, one line each. Group older work under one line such as Various contracts, 2008 to 2014." },
      { q: "Is it fine on a phone?", a: "The PDF is a normal page; recruiters can zoom. One line per job keeps it readable." },
    ],
    keywordRoles: ["project-manager", "operations-manager", "devops-engineer"],
    body: { face: "Fira Sans", size: "10 pt" },
  },
  {
    slug: "quarter",
    templateId: "r027-quarter",
    sample: "robert",
    facets: { role: ["finance"], format: ALL, stage: ["mid", "senior"], style: ["serif"] },
    tagline: "Centred serif header, dates in a left column. For banking and audit.",
    answer:
      "Quarter is a resume template for banking, audit and insurance: IBM Plex Serif, a centred header, and dates in a left column so a long tenure reads as a clean timeline. Conservative by design, it puts the firms, roles and numbers in front of the reader.",
    guidance: g(
      ["Why conservative", "Banks and audit firms screen for risk. A quiet, symmetrical page signals care, and a date column makes tenure and progression obvious without the reader counting."],
      "Show progression inside one employer as separate entries with their own dates. Lead bullets with portfolios, client sizes or audit scope. Qualifications such as ACA, CPA or CFA go in Certifications.",
      "For a junior analyst one-pager, Folio or Compact fit more. For a finance director, Executive leads with achievements.",
    ),
    faqs: [
      { q: "How do I show a promotion at the same bank?", a: "Add each title as its own entry with its own dates, newest first, under the same employer name." },
      { q: "Do dates in a left column parse correctly?", a: "Yes. The role is written first in the text and the date is drawn on the left. Our tests check that order." },
      { q: "Which accent suits banking?", a: "Ink or navy. Both are 4.5:1 or better on white." },
    ],
    keywordRoles: ["business-analyst", "data-analyst", "project-manager"],
    body: { face: "IBM Plex Serif", size: "10 pt" },
  },
  {
    slug: "pitch",
    templateId: "r028-pitch",
    sample: "jessica",
    facets: { role: ["marketing", "business"], format: ALL, stage: ["early", "mid", "senior"], style: ["modern"] },
    tagline: "A header band and accent underlines. Results first, for sales.",
    answer:
      "Pitch is a resume template for sales and business development: a shaded header band, short accent underlines on sentence-case heads, and skills kept to one line so quota, pipeline and revenue lead the page. Set in Lato, one column, one text flow.",
    guidance: g(
      ["Why results lead", "Sales managers look for three numbers: quota attainment, deal size, and pipeline you created. Keeping skills to one line leaves the space for those."],
      "Open each role with attainment (percent of quota, rank on the team) and the segment you sold to. Add sales cycle or pipeline figures. Name your CRM and methodology (Salesforce, MEDDIC) in Skills.",
      "For a sales leader with teams, Executive puts achievements first. For an account manager role, Cadence reads a little calmer.",
    ),
    faqs: [
      { q: "What numbers go on a sales resume?", a: "Quota attainment by year, revenue or new ARR closed, average deal size, rank on the team, and pipeline sourced." },
      { q: "Should I include President's Club?", a: "Yes, in Awards with the year. It is one of the clearest signals in sales hiring." },
      { q: "Is a header band ATS friendly?", a: "Yes. It is a background fill behind real text. Our tests read the name and contact details first." },
    ],
    keywordRoles: ["sales-representative", "customer-success-manager", "digital-marketer"],
    body: { face: "Lato", size: "10 pt" },
  },
  {
    slug: "campus",
    templateId: "r029-campus",
    sample: "sneha",
    facets: { role: ["engineering", "finance", "business", "marketing", "retail"], format: ALL, stage: ["student"], style: ["simple", "one-page"] },
    tagline: "A header band and rules to the margin. For students and graduates.",
    answer:
      "Campus is a one-page resume template for students, graduates and interns: a shaded header band, section heads that rule off to the margin, and room for education, projects and activities. Put Education first in the form and it leads the page.",
    guidance: g(
      ["Why a student layout", "Graduate recruiters screen hundreds of resumes for course, year, grades and something you did. A clear header and ruled sections let them find those in seconds."],
      "Lead with your degree, expected graduation and grade if strong. Add projects and positions of responsibility with a result each. Internships and part-time jobs count: they show reliability.",
      "For engineering students in the US, Plain or Kernel are the expected pattern. After your first job, move to Ledger.",
    ),
    faqs: [
      { q: "What should a student resume include?", a: "Education with grades, internships, projects with results, leadership roles, certifications, and skills that match the role." },
      { q: "Should I put my GPA?", a: "If it is strong or the employer asks. Otherwise leave it off." },
      { q: "One page or two?", a: "One page for students and graduates in most countries." },
    ],
    keywordRoles: ["software-engineer", "data-analyst", "business-analyst"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "clinic",
    templateId: "r030-clinic",
    sample: "mei",
    facets: { role: ["healthcare", "education"], format: ALL, stage: ["mid", "senior"], style: ["serif"] },
    tagline: "Serif labels in a side column. For doctors and clinical researchers.",
    answer:
      "Clinic is a CV template for doctors, dentists and clinical researchers: Source Serif 4 with section labels in a side column, so a long record of posts, audits, publications and teaching stays easy to navigate. One text flow, any number of pages.",
    guidance: g(
      ["Why side labels for a medical CV", "Medical CVs run long and are read by panels looking for specific sections: registration, posts, audit, teaching, publications. A label column makes each one easy to find on every page."],
      "Keep posts in reverse order with grade, specialty and hospital. Add audits and quality projects as a Custom section with the outcome. Put registrations and life support certificates in Certifications.",
      "For nurses and allied health staff, Bedside and Ward are shorter. For a research-only academic CV, Scholar numbers publications.",
    ),
    faqs: [
      { q: "How long should a medical CV be?", a: "As long as the record needs. Two to four pages is common for doctors in training." },
      { q: "Where do audits go?", a: "Add a Custom section called Audit and quality improvement, with the topic, your role, the result and the year." },
      { q: "Do I need a photo?", a: "Not in the UK, US or Australia. Photos are not supported yet." },
    ],
    keywordRoles: ["data-analyst", "project-manager", "business-analyst"],
    body: { face: "Source Serif 4", size: "10 pt" },
  },
  {
    slug: "tally",
    templateId: "r031-tally",
    sample: "meera",
    facets: { role: ["finance", "retail"], format: ALL, stage: ["student", "early", "mid"], style: ["one-page", "simple"] },
    tagline: "One line per role, capital heads. For bookkeepers and accounts staff.",
    answer:
      "Tally is a one-page resume template for bookkeepers, accounts clerks and payroll staff: PT Sans, capital heads over a hairline, and each role on one line with its dates on the right. Dense and orderly, the way an accounts manager likes a page.",
    guidance: g(
      ["Why dense", "Accounts roles are judged on accuracy and the systems you know. A compact page with every role and tool listed shows both, and leaves no doubt about dates."],
      "Name the systems (Tally, QuickBooks, Xero, SAP) in Skills and in bullets. Give volumes: invoices a month, entities, payroll headcount, close days. Put qualifications in Certifications with the level.",
      "For senior accountants and controllers, Folio or Ledger give each role more room. For a first job, Campus or Fresher lead with education.",
    ),
    faqs: [
      { q: "What should a bookkeeper resume include?", a: "Systems used, reconciliations, payables and receivables volumes, payroll, VAT or GST returns, and accuracy or speed results." },
      { q: "Is one page enough?", a: "For most bookkeeping and clerk roles, yes." },
      { q: "How do I show software skills?", a: "In Skills under Tools, and inside bullets where you used them, such as reconciled 12 bank accounts monthly in Xero." },
    ],
    keywordRoles: ["business-analyst", "data-analyst", "operations-manager"],
    body: { face: "PT Sans", size: "10 pt" },
  },
  {
    slug: "field",
    templateId: "r032-field",
    sample: "kwame",
    facets: { role: ["engineering", "marketing", "trades"], format: ALL, stage: ["early", "mid", "senior"], style: ["two-column"] },
    tagline: "A sidebar for certifications and skills. For field engineers and technicians.",
    answer:
      "Field is a two-column resume template for field engineers, technicians and field sales: a right sidebar holds certifications, skills and languages, and the main column holds your jobs. The main column is first in the PDF's text, so a parser reads your history before the sidebar.",
    guidance: g(
      ["Why certifications sit to the side", "Field roles are often filtered on tickets and vendor certifications. A sidebar keeps them visible on every glance while the main column tells the story of the work."],
      "Under each role, give the territory or site count, equipment or systems you maintained, uptime or response times, and travel. Put certifications with the issuer and date in the sidebar.",
      "For an office-based engineering role, Margin or Ledger are quieter. If a portal asks for a single column, switch to Ledger in one click.",
    ),
    faqs: [
      { q: "What goes in the sidebar?", a: "Certifications, skills, languages and awards. Experience, education and projects stay in the main column." },
      { q: "Should I mention a driving licence?", a: "If the job needs travel, yes. In formats that show it, it appears in personal details; otherwise add it to Skills." },
      { q: "Is the sidebar read correctly?", a: "Yes. Our tests check that the main column comes out first on every sample." },
    ],
    keywordRoles: ["devops-engineer", "sales-representative", "operations-manager"],
    body: { face: "Fira Sans", size: "10 pt" },
  },
  {
    slug: "atlas",
    templateId: "r033-atlas",
    sample: "nina",
    facets: { role: ["business", "marketing", "hospitality"], format: ALL, stage: ["mid", "senior"], style: ["two-column"] },
    tagline: "Centred header, languages in a right sidebar. For consultants and multilingual roles.",
    answer:
      "Atlas is a two-column resume template for consultants and multilingual roles: a centred header, your experience in the main column, and a right sidebar that keeps languages, certifications and skills beside the history. Set in Lato; the main column is first in the text.",
    guidance: g(
      ["Why languages sit alongside", "For international roles, languages are often the deciding filter. Keeping them in a sidebar means they are seen on the first scan, next to the experience they support."],
      "Give each language a level (CEFR A1 to C2, or Native). Under each role, name the markets or regions and the result. Keep certifications in the sidebar with dates.",
      "For a single-country role, Ledger keeps everything in one column. For EU public applications, Europa follows the Europass order.",
    ),
    faqs: [
      { q: "How should I list language levels?", a: "Use CEFR levels (A1 to C2) or Native. Avoid words like good or fluent, which mean different things to different readers." },
      { q: "Is Atlas good for consulting?", a: "Yes. Lead each role with the client sector and the outcome, and keep tools in the sidebar." },
      { q: "Does the sidebar break parsing?", a: "No. The main column is written first, and our tests check that order on every sample." },
    ],
    keywordRoles: ["customer-success-manager", "business-analyst", "project-manager"],
    body: { face: "Lato", size: "10 pt" },
  },
  {
    slug: "notebook",
    templateId: "r034-notebook",
    sample: "grace",
    facets: { role: ["design"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "Crimson Text, sentence-case heads, dash bullets. For writers and editors.",
    answer:
      "Notebook is a resume template for writers, journalists and editors: Crimson Text, sentence-case section heads and dash bullets, so the page reads like a well-edited article. One column and one text flow, with room for bylines, publications and clips.",
    guidance: g(
      ["Why it reads like a page", "Editors judge writers on sentences. A resume set like good print, with no decoration, puts the attention on how you write each bullet."],
      "Link your clips or portfolio first. Under each role, give beats, formats and readership or traffic figures. Add notable pieces in a Custom section called Selected work, with the outlet and year.",
      "For content marketing roles in tech, Signal or Ledger read more business-like. For academic writing, Scholar numbers publications.",
    ),
    faqs: [
      { q: "Should a writer's resume list publications?", a: "Yes, the best five to ten, with outlet and year, in a Custom section. Link the full portfolio." },
      { q: "Are dash bullets OK for ATS?", a: "Yes. They are plain text, and our tests read every bullet back in order." },
      { q: "Can I write in the first person?", a: "In the summary, yes. Bullets read better starting with a verb." },
    ],
    keywordRoles: ["content-writer", "digital-marketer", "ux-designer"],
    body: { face: "Crimson Text", size: "10 pt" },
  },
  {
    slug: "kernel",
    templateId: "r035-kernel",
    sample: "daniel",
    facets: { role: ["engineering"], format: ["us", "in", "uk", "au"], stage: ["student", "early", "mid"], style: ["simple", "one-page"] },
    tagline: "The one-page engineering pattern in Fira Sans, organisation first.",
    answer:
      "Kernel is a one-page resume template for software engineers and computer science students: a centred header with contact items separated by bars, ruled section heads, and each entry led by the company or school. It is the single-page engineering pattern reviewers expect, set in Fira Sans instead of a serif.",
    guidance: g(
      ["Why this pattern", "Engineering reviewers have read thousands of resumes in this shape and know where to look: company, role, dates, then bullets with tech and results. Following it removes friction."],
      "Each bullet: what you built, the stack, and a number (latency, users, time saved). Link GitHub and one project. Keep skills to languages, frameworks and tools.",
      "If you prefer a serif, Plain is the same pattern in Source Serif. For senior engineers with long histories, Compact or Ledger.",
    ),
    faqs: [
      { q: "Is this like Jake's Resume?", a: "It follows the same single-page pattern: centred header, ruled heads, organisation then role. The Typst code is our own and the face is Fira Sans." },
      { q: "Should I put projects before experience?", a: "As a student, yes, if your projects are stronger. Drag Projects above Experience in the form." },
      { q: "How many bullets per role?", a: "Two to four, each with a result. Fewer strong bullets beat many weak ones." },
    ],
    keywordRoles: ["software-engineer", "frontend-developer", "devops-engineer"],
    body: { face: "Fira Sans", size: "10 pt" },
  },
  {
    slug: "cadence",
    templateId: "r036-cadence",
    sample: "hannah",
    facets: { role: ["engineering", "business", "marketing"], format: ALL, stage: ["mid", "senior"], style: ["modern"] },
    tagline: "An accent rule under the name, accent underlines. For product and project managers.",
    answer:
      "Cadence is a resume template for product and project managers: an accent rule under the name, short accent underlines on sentence-case heads, and Inter throughout. It keeps outcomes in front: what shipped, what moved, and for how many people.",
    guidance: g(
      ["Why outcomes lead", "Product and project roles are judged on results that other people delivered with you. Each role opening with a launch and a metric answers the first question a hiring manager asks."],
      "Open each role with scope (product area, team size, users) and one result. Then two bullets on how: discovery, prioritisation, delivery. Put frameworks and tools in Skills.",
      "For a technical PM with engineering depth, Signal shows more stack. For senior leaders, Executive puts achievements first.",
    ),
    faqs: [
      { q: "What metrics go on a product manager resume?", a: "Adoption, revenue, retention, conversion, and delivery speed, each tied to something you launched or changed." },
      { q: "Should I list certifications like PMP or CSPO?", a: "Yes, in Certifications with the year, especially for project and delivery roles." },
      { q: "How long should it be?", a: "One to two pages. The preview shows the page count as you type." },
    ],
    keywordRoles: ["product-manager", "project-manager", "business-analyst"],
    body: { face: "Inter", size: "10 pt" },
  },
  {
    slug: "mercy",
    templateId: "r037-mercy",
    sample: "rachel",
    facets: { role: ["healthcare", "education", "business", "public"], format: ALL, stage: ["early", "mid", "switcher"], style: ["serif", "simple"] },
    tagline: "Centred serif header, shaded section bars. For social work and charities.",
    answer:
      "Mercy is a resume template for social work, charities and community roles: PT Serif, a centred header and shaded section bars. Warm without decoration, it gives room to caseloads, programmes and the people you served, in one text flow.",
    guidance: g(
      ["Why warm but plain", "Charity and public service panels look for care and judgement. A calm serif page with clear sections says both, and keeps every detail readable by the recruitment system."],
      "Give caseload sizes, programmes run, funding raised or volunteers led. Add registrations (social work, safeguarding) and checks in Certifications. A Volunteering section counts as experience.",
      "For a fundraising or marketing role at a charity, Pitch or Modern lead with numbers. For public sector applications, Civic is closer to the expected format.",
    ),
    faqs: [
      { q: "Should volunteering go on my resume?", a: "Yes, as its own section or under Experience if it was substantial. It counts, especially in charities." },
      { q: "How do I show impact without sales numbers?", a: "Caseloads, outcomes (housing secured, attendance up), funding won, and people trained." },
      { q: "Is shading ATS safe?", a: "Yes. The bars are fills behind real text, and our tests read every heading back." },
    ],
    keywordRoles: ["project-manager", "customer-success-manager", "content-writer"],
    body: { face: "PT Serif", size: "10 pt" },
  },
  {
    slug: "bench",
    templateId: "r038-bench",
    sample: "mei",
    facets: { role: ["education", "engineering", "healthcare"], format: ALL, stage: ["early", "mid", "senior"], style: ["serif"] },
    tagline: "Dates in a left column, rules to the margin. For lab scientists and QA.",
    answer:
      "Bench is a resume template for lab scientists, QA and research technicians: IBM Plex Serif, dates in a left column, and section heads that rule off to the margin. Methods, instruments and outcomes get room without the length of a full academic CV.",
    guidance: g(
      ["Why a timeline", "Lab roles care about continuity: which methods you ran, for how long, and in which regulated setting. A date column makes that history plain at a glance."],
      "Name techniques and instruments in bullets (HPLC, PCR, flow cytometry), regulated standards (GLP, GMP, ISO 17025), and throughput or accuracy results. Put a few key papers in Publications.",
      "For a full academic CV with many papers, Scholar or Clinic. For software QA engineers, Signal or Kernel fit better.",
    ),
    faqs: [
      { q: "Should I list lab techniques?", a: "Yes, in Skills and inside bullets with the context and result." },
      { q: "Where do publications go?", a: "In a Publications section, three to five relevant ones. For many papers, use Scholar." },
      { q: "Do left-column dates parse?", a: "Yes. The role is written first in the text and the date is drawn on the left. Our tests check the order." },
    ],
    keywordRoles: ["data-analyst", "software-engineer", "project-manager"],
    body: { face: "IBM Plex Serif", size: "10 pt" },
  },
  {
    slug: "range",
    templateId: "r039-range",
    sample: "sofia",
    facets: { role: ["marketing", "design"], format: ALL, stage: ["mid", "senior"], style: ["two-column", "modern"] },
    tagline: "A sidebar and shaded heads. For marketing and brand managers.",
    answer:
      "Range is a two-column resume template for marketing and brand managers: PT Sans, shaded section bars, and a right sidebar for channels, tools and languages. The main column, with campaigns and results, comes first in the PDF's text.",
    guidance: g(
      ["Why a sidebar for marketers", "Marketing roles list many channels and tools. A sidebar keeps that inventory visible without crowding the campaign results that the hiring manager came for."],
      "Lead each role with budget and channel mix, then results tied to revenue or pipeline. Keep tools (HubSpot, GA4, Meta Ads) and channels in the sidebar.",
      "For a brand designer, Atelier or Specimen look more crafted. If a portal wants one column, switch to Modern in one click.",
    ),
    faqs: [
      { q: "What results go on a marketing resume?", a: "Pipeline or revenue influenced, cost per lead or acquisition, growth in traffic or audience, and campaign wins with numbers." },
      { q: "Can I keep the sidebar short?", a: "Yes. If it is shorter than the main column, the extra space stays white." },
      { q: "Is it tested?", a: "Yes. Every field read back in order on all samples, with the dated results on this page." },
    ],
    keywordRoles: ["digital-marketer", "content-writer", "product-manager"],
    body: { face: "PT Sans", size: "10 pt" },
  },
  {
    slug: "crew",
    templateId: "r040-crew",
    sample: "carlos",
    facets: { role: ["hospitality", "marketing", "retail"], format: ALL, stage: ["early", "mid", "senior"], style: ["one-page"] },
    tagline: "Centred capitals, one line per role. For cabin crew and guest services.",
    answer:
      "Crew is a resume template for cabin crew, guest services and customer-facing roles: the name in centred capitals, heads that rule off to the margin, and one line per role. Set in Lato, it is friendly and tidy, and fits several roles and languages on one page.",
    guidance: g(
      ["Why tidy and friendly", "Customer-facing hiring looks for warmth and reliability. A symmetrical, tidy page suggests both, and one line per role keeps a career of seasons and contracts readable."],
      "Lead with languages and safety certifications if the role needs them. Under each role, give passenger or guest volumes, service scores and incidents handled. Add availability or relocation in the summary.",
      "For hotel management, Atlas or Executive read more senior. For retail, Counter is built around tills and stock.",
    ),
    faqs: [
      { q: "What goes on a cabin crew resume?", a: "Customer service roles, languages with levels, first aid and safety training, and any swimming certification airlines ask for." },
      { q: "Should I add a photo?", a: "Some airlines ask for one with the application rather than on the resume. Photos are not supported in templates yet." },
      { q: "Is one page enough?", a: "Yes for most customer-facing roles." },
    ],
    keywordRoles: ["customer-success-manager", "sales-representative", "operations-manager"],
    body: { face: "Lato", size: "10 pt" },
  },
  {
    slug: "civic",
    templateId: "r041-civic",
    sample: "david",
    facets: { role: ["business", "education", "public"], format: ALL, stage: ["mid", "senior"], style: ["serif"] },
    tagline: "Source Serif, accent rule under the name, double-ruled heads. For public service.",
    answer:
      "Civic is a resume template for public sector and government roles: Source Serif 4, an accent rule under the name, and double-ruled section heads. It is close to the formal look civil service panels expect, and keeps policy, programme and budget work in one clear text flow.",
    guidance: g(
      ["Why formal", "Public sector applications are scored against criteria by panels. A formal, consistent page makes it easy to find the evidence for each criterion."],
      "Write bullets that match the criteria in the job pack: led, delivered, managed budgets, worked with ministers or the public. Give scale (budget, team, population served). Keep clearance or security vetting in Certifications if you may disclose it.",
      "For US federal resumes with required fields like hours per week, add them in each role's bullets. For private sector roles, Ledger reads lighter.",
    ),
    faqs: [
      { q: "How is a government resume different?", a: "It is scored against published criteria, so each criterion needs clear evidence. Use the words from the job pack where true." },
      { q: "Should I include salary grade?", a: "Only if the application asks for it. Some US federal applications do." },
      { q: "Is it ATS friendly?", a: "Yes. Our parse-back test read every field in order on all samples." },
    ],
    keywordRoles: ["project-manager", "business-analyst", "operations-manager"],
    body: { face: "Source Serif 4", size: "10 pt" },
  },
  {
    slug: "thread",
    templateId: "r042-thread",
    sample: "mateo",
    facets: { role: ["design", "marketing", "business"], format: ALL, stage: ["early", "mid", "senior"], style: ["modern"] },
    tagline: "Display heads in Bricolage, contact on the right. For fashion and retail buying.",
    answer:
      "Thread is a resume template for fashion, retail buying and merchandising: Bricolage Grotesque section heads with rules to the margin, Inter for the body, and contact details stacked to the right of the name. Fashion-aware, still one column and one text flow.",
    guidance: g(
      ["Why a display face", "Fashion and retail creative roles expect a resume with some style. The character here is only in the heading face, so the page stays parseable with no images or icons."],
      "Lead bullets with category, sell-through, margin and range size. Name suppliers or markets where public. Put tools such as merchandise planning systems and Adobe in Skills.",
      "For a fashion designer with a portfolio, Atelier or Specimen. For store management, Counter or Transit.",
    ),
    faqs: [
      { q: "What should a buyer's resume show?", a: "Categories bought, budget or open-to-buy, sell-through and margin results, range sizes, and supplier negotiations." },
      { q: "Is a display font a problem for ATS?", a: "No. Parsers read the text. Bricolage Grotesque is embedded with a full character map." },
      { q: "Can I add a portfolio link?", a: "Yes, in links. It appears in the contact block as a clickable link." },
    ],
    keywordRoles: ["graphic-designer", "digital-marketer", "sales-representative"],
    body: { face: "Bricolage Grotesque + Inter", size: "10 pt" },
  },
]
