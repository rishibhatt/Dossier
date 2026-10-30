import type { ResumeExample } from "./types"

/** Examples for the first ten samples. Numbers quoted here all appear in the sample's own bullets. */
export const EXAMPLES_A: ResumeExample[] = [
  {
    slug: "senior-accountant",
    sample: "meera",
    templateId: "r001-ledger",
    title: "Senior accountant",
    answer:
      "A senior accountant's resume should show how many clients or entities you close each month, how fast, and which filings you own, in one plain column a finance manager can check line by line.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Meera Iyer is a fictional sample written for India, so the page is A4 with month-and-year dates and no photo. Ledger keeps it to one column: summary, experience, then education with the CA Intermediate listed above the degree, because the professional qualification is what a finance hiring manager looks for first. Seven years and two jobs fit on one page with room to spare.",
      },
      {
        heading: "How the bullets are built",
        body: "Accounting work is easy to describe as a list of duties. Each bullet here names the volume and the result instead. \"Close month-end for 14 clients in 4 working days, down from 7\" gives the scope and the improvement in one line. The GST bullet gives the turnover range of the clients, which tells a reader the size of books Meera is used to. The older job keeps two bullets: one improvement (bank reconciliation in Excel macros, payment errors down by a third) and one measure of scale (TDS filings for 120 suppliers).",
      },
      {
        heading: "Skills",
        body: "Split skills into accounting work and the software you use. Name the exact ERP and version you know, such as Tally Prime or SAP FICO, because firms filter on the system they run.",
      },
    ],
    faqs: [
      {
        q: "Should I list CA Inter or CA Final if I have not finished?",
        a: "List the level you have cleared, with the year, as the sample does with CA Intermediate. If you are attempting the next level, add the attempt date as a line under it. Do not write CA without the level.",
      },
      {
        q: "How do I describe client work at a CA firm without naming clients?",
        a: "Describe them by count, sector and size, as in 14 clients or clients with ₹2–40 crore turnover. That says as much about your experience as a name would and keeps client details private.",
      },
      {
        q: "Should an accountant's resume be one page?",
        a: "Up to about ten years, one page is usual in India and most hiring managers prefer it. Ledger flows onto a second page if you need it, and the editor shows the page count as you type.",
      },
    ],
  },
  {
    slug: "computer-science-student",
    sample: "arjun",
    templateId: "r008-fresher",
    title: "Computer science student",
    answer:
      "A computer science student's resume leads with the degree, then one internship and one project that each show something you built and who used it.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Arjun Mehta is a fictional final-year student, written for India on A4. Fresher puts Education at the top because the degree, the CGPA and the coursework are the strongest facts on the page. The internship comes next, then a project, then skills. There is no summary; for a student with one internship, the headline \"Software Engineering Intern\" says enough, and the space goes to evidence.",
      },
      {
        heading: "How the bullets are built",
        body: "Each bullet pairs what Arjun built with a measure of whether it worked. \"Split the CI test suite into parallel shards; runs went from 11 minutes to 4\" names the change and the before-and-after. The Go caching service bullet gives the number of engineers who used it, which matters more than the size of the codebase. The project, a meal-rating app, gets one bullet with its stack and its 400 student users, plus a GitHub link a reviewer can open.",
      },
      {
        heading: "Coursework and marks",
        body: "One line under the degree is enough: CGPA out of 10 and three courses that relate to the jobs you want.",
      },
    ],
    faqs: [
      {
        q: "Should a student resume have a summary?",
        a: "It is optional. With one internship, a clear headline does the job, as in this sample. Add a one-line objective if you are applying across very different roles and want to say which one this is.",
      },
      {
        q: "How many projects should I list?",
        a: "Two or three that you can talk about for ten minutes each. A project with real users or a link that works is worth more than several tutorial clones.",
      },
      {
        q: "Should I use Fresher or Plain for software internships?",
        a: "Both suit students. Plain is the dense serif pattern many US reviewers expect; Fresher has more room for certifications and activities. You can switch templates in the editor without retyping anything.",
      },
    ],
    keywordRole: "software-engineer",
  },
  {
    slug: "registered-nurse",
    sample: "lena",
    templateId: "r003-column",
    title: "Registered nurse",
    answer:
      "A registered nurse's CV should state your registration, your specialty and your patient load on each ward, with certifications where a nurse manager can find them in seconds.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Lena Okafor is a fictional ICU nurse, written for the UK: A4, no photo, no date of birth. Column puts the job history in the main column and clinical skills in the sidebar, so a ward manager sees the specialty and the competencies side by side. Certifications get their own section with the awarding body and date, because ALS and NMC registration are checked before anything else.",
      },
      {
        heading: "How the bullets are built",
        body: "Nursing bullets work best when they give the setting and the load. \"Care for 1–2 ventilated patients per shift in a 24-bed unit\" tells a reader the acuity and the size of the unit in one line. The handover bullet describes a change Lena led and how it was checked (the unit audit) without inventing a percentage. The mentoring bullet gives a count. The earlier high-dependency job needs only one bullet with its patient ratio.",
      },
      {
        heading: "Length",
        body: "Two pages is normal for a UK nursing CV. If yours runs longer, cut duties every nurse in that unit would share and keep what was specific to you.",
      },
    ],
    faqs: [
      {
        q: "Where should my NMC PIN go?",
        a: "List NMC registration under certifications with the date you registered. Many nurses add the PIN there too; employers will verify it either way, so include it if the application asks for it.",
      },
      {
        q: "Should a nursing CV include a personal statement?",
        a: "A two-line profile is enough, as in the sample: your band or level, your specialty, your years in it. Put the longer statement in the supporting statement section of the NHS application form.",
      },
      {
        q: "Can I use a two-column template for an NHS application?",
        a: "Column passed the same automated parse-back test as the one-column templates, with every field read back in order. If an employer asks for a plain format, switch to Ledger in the editor; your content stays the same.",
      },
    ],
  },
  {
    slug: "marketing-manager",
    sample: "sofia",
    templateId: "r010-europa",
    title: "Marketing manager",
    answer:
      "A marketing manager's CV should show the budget you own, the pipeline or revenue it produced, and the team you run, with each language given a CEFR level if you work across Europe.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Sofia Brandt is a fictional B2B marketer written for Germany, so the CV is A4 with numeric dates (02/2021) and nationality in the personal details. Europa sets section labels in a left column, which helps an HR team in Berlin or Amsterdam compare many CVs quickly. The languages table gives German, English and Spanish each a CEFR level instead of words like fluent.",
      },
      {
        heading: "How the bullets are built",
        body: "Manager bullets should show scope first and results second. The first bullet states the budget and channels (€900k across paid search, events and content), so a reader knows the size of the role before reading what came of it. The second ties a project to a sales outcome: sales-accepted leads rose from 22% to 41% after lead scoring was rebuilt with sales. The third, hiring and managing three people, is short because the fact is enough. The earlier specialist role keeps one bullet about the webinar series and its share of pipeline.",
      },
    ],
    faqs: [
      {
        q: "Should a German marketing CV include a photo?",
        a: "It is optional and still common in Germany. Dossier does not support photos yet, so the templates leave space for text only.",
      },
      {
        q: "How do I show marketing results without sharing confidential numbers?",
        a: "Use rates and ratios instead of totals, such as a lead acceptance rate going from 22% to 41%. Budget ranges and team sizes are usually fine to share.",
      },
      {
        q: "Is two pages too long for a marketing manager?",
        a: "In Germany and most of Europe, one to two pages is normal at manager level. Keep the newest role longest and the oldest to a line or two.",
      },
    ],
    keywordRole: "digital-marketer",
  },
  {
    slug: "software-engineer",
    sample: "daniel",
    templateId: "r002-plain",
    title: "Software engineer",
    answer:
      "A software engineer's resume should show what you built, the scale it runs at, and one measured improvement per bullet, on a single US Letter page up to about five years.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Daniel Reyes is a fictional backend engineer written for the US, so the page is US Letter with month-and-year dates and no personal details. Plain fits two jobs, a degree and three skill groups on one page. With five years of work, Experience comes before Education; the degree is a single line.",
      },
      {
        heading: "How the bullets are built",
        body: "Strong engineering bullets name the system, the change and the measurement. \"Rebuilt the invoice service in Go; p95 latency fell from 480 ms to 90 ms at 2,000 requests a second\" gives all three, plus the load, so the latency number means something. The Kafka bullet counts what was removed (14 nightly batch scripts) rather than claiming a vague improvement. The runbook bullet shows on-call ownership with a recovery time. The older job has two bullets: the API's users (120 clinics) and the contract tests that caught 30+ breaking changes.",
      },
      {
        heading: "Skills",
        body: "Group skills by kind: languages, infrastructure, practices. List only what you could be interviewed on today.",
      },
    ],
    faqs: [
      {
        q: "Should I list every language I have used?",
        a: "List the ones you would be happy to code in during an interview. Daniel lists four languages, and each one appears in a bullet too.",
      },
      {
        q: "Do I need a GitHub link?",
        a: "It helps if the profile has work you are glad to show. A link to an empty profile does more harm than leaving it off.",
      },
      {
        q: "When should a software engineer move to two pages?",
        a: "Around ten years or when you have staff-level scope to describe. Before that, cut older bullets until the page fits. If Plain feels cramped, Ledger gives each role more room.",
      },
    ],
    keywordRole: "software-engineer",
  },
  {
    slug: "frontend-developer",
    sample: "priya",
    templateId: "r002-plain",
    title: "Frontend developer",
    answer:
      "A frontend developer's resume should tie each piece of work to something a user feels, such as load time, accessibility or reuse across teams, and link to code or a live site.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Priya Nair is a fictional developer with three years of work, written for India on A4. Plain keeps experience, one project, education and skills on a single page. The header carries two links, GitHub and a personal site, because a frontend reviewer will often open the site before reading further. The project sits above education since it shows more of her current work than the degree does.",
      },
      {
        heading: "How the bullets are built",
        body: "Each bullet names the technique and a result a user would notice. \"Moved the product page to Next.js server rendering; Largest Contentful Paint fell from 4.1 s to 1.9 s\" states the metric by its real name. The component library bullet gives its reach (4 product teams). The accessibility bullet counts the fixes and names the worst one, keyboard traps in checkout, which is more convincing than claiming to care about accessibility. The project bullet gives its audience: 3,000 monthly users on low-end phones.",
      },
    ],
    faqs: [
      {
        q: "Should a frontend developer include a portfolio link?",
        a: "Yes, if it loads fast and works on a phone. Reviewers often check it before the resume, so a slow portfolio works against you.",
      },
      {
        q: "How do I describe agency work for many clients?",
        a: "Summarise it in one bullet with a count and the stack, as the sample does with 12 marketing sites in React and Tailwind CSS. Name a client only if you have permission.",
      },
      {
        q: "Is a one-page resume enough with three years of experience?",
        a: "Yes. One page is the norm until you have several jobs to describe. Keep the older role to one bullet.",
      },
    ],
    keywordRole: "frontend-developer",
  },
  {
    slug: "data-analyst",
    sample: "tomas",
    templateId: "r010-europa",
    title: "Data analyst",
    answer:
      "A data analyst's CV should show who used your work and what changed because of it, with the query, model or test behind each result.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Tomás Silva is a fictional analyst in Lisbon, written in the Europe format: A4, numeric dates and nationality shown. Europa's label column keeps Experience, Education, Skills and Languages easy to find, and the language table gives Portuguese, English and Spanish each a CEFR level, which matters for analyst roles at companies working across the EU.",
      },
      {
        heading: "How the bullets are built",
        body: "Analyst bullets are strongest when they name the people who rely on the work. \"Built a Power BI delivery dashboard used daily by 40 dispatchers\" says who and how often before giving the effect: late deliveries fell 12% in two quarters. The dbt bullet counts the manual reports it replaced (25). The A/B test bullet uses the word estimated for the €180k fuel saving, which is honest about a modelled figure. The internship needs one bullet on the data cleaning that fed a forecasting model.",
      },
      {
        heading: "Skills",
        body: "Split methods from tools, and put SQL first if most of your work is in it.",
      },
    ],
    faqs: [
      {
        q: "Should I say a saving is estimated?",
        a: "Yes, when it comes from a model or a test rather than an invoice. Interviewers will ask how you got the number, and estimated tells them you know the difference.",
      },
      {
        q: "Do data analysts need a portfolio?",
        a: "It helps early in a career. A public dashboard or a notebook with a short write-up shows how you think. Link it in the header.",
      },
      {
        q: "Does a Europe-format CV need a photo?",
        a: "No. It is optional in most EU countries and Dossier does not support photos yet.",
      },
    ],
    keywordRole: "data-analyst",
  },
  {
    slug: "product-manager",
    sample: "hannah",
    templateId: "r006-modern",
    title: "Product manager",
    answer:
      "A product manager's resume should show what you launched, the customer or business result, and how you work with research and engineering, one outcome per bullet.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Hannah Kim is a fictional fintech product manager in Toronto, written in the US and Canada format: US Letter, month-and-year dates and no personal details. Modern hangs each section title in the left margin, which gives a two-job history a clean shape without extra rules. Six years and two roles fit on one page with a short summary at the top.",
      },
      {
        heading: "How the bullets are built",
        body: "Product bullets should lead with the thing shipped and end with what moved. \"Launched round-up savings; 210,000 customers opted in within six months and deposits grew $34M\" gives adoption and money with a time frame. \"Cut onboarding steps from 11 to 6, lifting completion from 58% to 74%\" shows the change and the result together. One bullet covers how Hannah works: a weekly interview cadence and a shared insights board for 3 squads. The earlier role shows ownership of a roadmap with a before-and-after (4,000 to 11,500 paying accounts) and the size of the team she planned with.",
      },
    ],
    faqs: [
      {
        q: "Should a product manager list tools like Jira and Figma?",
        a: "Briefly, in a skills line. Hiring managers care more about decisions and results, so keep tools out of the bullets unless the tool was the point.",
      },
      {
        q: "How do I credit a launch the whole team worked on?",
        a: "Say what you owned. Launched, owned the roadmap or ran discovery are fair when they are true; the reader knows engineers built it.",
      },
      {
        q: "Is Modern a safe choice for product roles?",
        a: "Modern is one column and reads top to bottom in the PDF's text. If you prefer a plainer look, switch to Ledger in the editor and nothing needs retyping.",
      },
    ],
    keywordRole: "product-manager",
  },
  {
    slug: "ux-designer",
    sample: "noor",
    templateId: "r012-specimen",
    title: "UX designer",
    answer:
      "A UX designer's CV should link to a portfolio first, then show research you ran and a measured change to a real service in each role.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Noor Haddad is a fictional service designer in London, written for the UK on A4 with no photo or date of birth. Specimen sets the name in a display face and keeps the rest in a single readable column, so the CV has some character without columns or icons. The portfolio link sits in the header where a design lead will click it first. Two jobs and a master's degree fit on one page.",
      },
      {
        heading: "How the bullets are built",
        body: "Design bullets are most convincing when they include how the work was tested. \"Redesigned a council benefits form with 14 rounds of usability testing; completion rose from 61% to 86%\" shows method and outcome. The design system bullet gives its reach: 9 services. The research bullet says who took part, 48 residents including screen reader and low-literacy users, which tells a reader about inclusive practice without a separate claim. The earlier job keeps one result from a 3-month pilot, missed appointments down 18%.",
      },
    ],
    faqs: [
      {
        q: "Should a UX designer's CV be designed?",
        a: "Lightly. The CV is read by people and by screening software, so keep one column and let type and spacing carry the style. Save visual work for the portfolio.",
      },
      {
        q: "How do I describe research without breaching confidentiality?",
        a: "Give the number and type of participants and the method, as the sample does. Leave out names and anything that identifies an individual.",
      },
      {
        q: "Should I list Figma as a skill?",
        a: "Yes, in a short tools line. It is expected, so it will not set you apart; the bullets about research and outcomes do that.",
      },
    ],
    keywordRole: "ux-designer",
  },
  {
    slug: "digital-marketing-specialist",
    sample: "omar",
    templateId: "r011-gulf",
    title: "Digital marketing specialist",
    answer:
      "A digital marketing specialist's CV in the Gulf should show the budget you manage, cost per lead or traffic results in local currency, and your visa status and languages up front.",
    guidance: [
      {
        heading: "Layout and order",
        body: "Omar Khalil is a fictional performance marketer in Dubai, written in the Gulf format on A4. Gulf puts a personal details block near the top with nationality, a transferable UAE residence visa and a UAE driving licence, because employers who sponsor visas check these first. Certifications from Google and Meta get their own section with dates, and Arabic and English are listed under languages.",
      },
      {
        heading: "How the bullets are built",
        body: "Performance marketing bullets should give spend, channel and the efficiency measure you were judged on. \"Manage AED 2.4M a year across Google Ads and Meta; cost per qualified lead fell 31% in 12 months\" does that in the region's currency. The SEO bullet gives traffic before and after (18,000 to 64,000 monthly visits) and notes it was bilingual. The tracking bullet shows technical setup across 6 microsites. The earlier retail job keeps one bullet on a loyalty base of 300,000 members and a 9% rise in repeat purchases.",
      },
    ],
    faqs: [
      {
        q: "Should I put my visa status on a CV for the UAE?",
        a: "Yes. It is one of the first things a Gulf recruiter checks. Write the type and whether it is transferable, as in the sample.",
      },
      {
        q: "Which currency should I use for budgets?",
        a: "The currency of the country you are applying in, such as AED or SAR. If you managed budgets elsewhere, give the original currency and keep it consistent.",
      },
      {
        q: "Are ad platform certifications worth listing?",
        a: "Yes, briefly, with the issuer and date. They are easy for a recruiter to check, but your results matter more, so keep them below experience.",
      },
      {
        q: "Should my CV include a photo for Gulf jobs?",
        a: "Photos are common in the region but not required. Dossier does not support photos yet.",
      },
    ],
    keywordRole: "digital-marketer",
  },
]
