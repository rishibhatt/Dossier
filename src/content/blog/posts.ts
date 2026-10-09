/**
 * Blog posts as typed data: no MDX dependency, every post renders to semantic HTML and Article JSON-LD.
 * Inline links use [label](/path). Add a post by appending to POSTS. Keep claims checkable: no invented statistics.
 */
export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "tip"; text: string }

export type Post = {
  slug: string
  title: string
  /** Meta title. Falls back to `title`. */
  seoTitle?: string
  description: string
  /** The search phrase the post targets. */
  query: string
  category: "ATS" | "Resume" | "Portfolio" | "LinkedIn"
  published: string
  updated?: string
  /** Optional hand-made or AI-generated image in /public. When absent, an on-brand card is generated. */
  hero?: string
  /** Slug of the free tool the post hands off to. */
  tool: "ats-checker" | "headline-writer" | "linkedin-about" | "resume-to-website"
  toolPitch: string
  body: Block[]
}

export const AUTHOR = {
  name: "Rishab Bhatt",
  role: "Builder of Dossier",
  avatar: "/brand/builder.webp",
  initials: "RB",
  url: "https://rishieee.netlify.app",
} as const

export const POSTS: readonly Post[] = [
  {
    slug: "how-to-pass-ats-resume-scan",
    title: "How to pass an ATS resume scan",
    seoTitle: "How to pass an ATS resume scan: 9 fixes that work",
    description: "An ATS does not reject resumes at random. It fails to read them, or finds no match for the job. Here are the nine fixes that matter, in order.",
    query: "how to pass ats resume scan",
    category: "ATS",
    published: "2026-10-09",
    tool: "ats-checker",
    toolPitch: "Paste your resume and the job post. The scanner shows the missing keywords and what a parser cannot read.",
    body: [
      { t: "p", text: "An applicant tracking system is a database with a search box. It stores your application, pulls out your details, and lets a recruiter search and filter. Most of the time it does not score you and bin you. The usual failure is plainer: it could not read your resume, or the recruiter searched for a word that is not on it." },
      { t: "p", text: "That changes what to fix. You are not trying to beat an algorithm. You are making the document easy to parse and easy to find." },
      { t: "h2", text: "1. Use one column and plain text" },
      { t: "p", text: "Parsers read left to right, top to bottom. Two columns, sidebars and text boxes make them read across the page, so a job title ends up glued to a skill. Put everything in a single column. Skip tables for layout." },
      { t: "h2", text: "2. Name sections the standard way" },
      { t: "p", text: "Use Experience, Education and Skills, each alone on its own line. \"Where I've been\" is charming, and a parser will not know it is your work history." },
      { t: "h2", text: "3. Put contact details in the body, not the header" },
      { t: "p", text: "Some systems ignore the page header and footer. Put your name, email, phone and city in the first lines of the page itself." },
      { t: "h2", text: "4. Copy the job post's words" },
      { t: "p", text: "If the post says \"stakeholder management\" and you wrote \"worked with partners\", a keyword search for the first will miss you. Where it is true, use the post's exact phrase. Read [how to find resume keywords in a job description](/blog/resume-keywords-from-job-description) for a method." },
      { t: "h2", text: "5. Spell out acronyms once" },
      { t: "p", text: "Write \"Search Engine Optimization (SEO)\" the first time. Recruiters search both forms, and you match either." },
      { t: "h2", text: "6. Show keywords in bullets, not only in a skills list" },
      { t: "p", text: "A skills list proves you know the word. A bullet like \"Cut page load by 38% by moving the app to Next.js\" shows the skill in use, and a human reading it can see the result." },
      { t: "h2", text: "7. Keep dates and titles consistent" },
      { t: "p", text: "Use one date format throughout, such as \"Mar 2022 – Aug 2024\". Give each role a clear title, company and date range on the same line or the lines directly above its bullets." },
      { t: "h2", text: "8. Save as a text-based PDF or DOCX" },
      { t: "p", text: "A PDF exported from Word, Google Docs or a design tool has selectable text. A scan or a screenshot saved as PDF has none, and nothing can be read. Open the file and try to select a line. If you cannot, fix that first." },
      { t: "h2", text: "9. Skip the graphics" },
      { t: "p", text: "Skill bars, rating dots and icons carry no text a parser can use. \"Python ●●●●○\" says nothing a system can search. Write \"Python, 5 years\" instead." },
      { t: "tip", text: "Before you apply, copy your resume out of the PDF and paste it into a plain text box. What you see is close to what the parser sees." },
      { t: "h2", text: "What to do next" },
      { t: "p", text: "Run your resume through the scanner below with one real job post. Fix the high-priority items first, then run it again. If the keyword gap is large, the job may simply not be a fit, and that is useful to know before you spend an hour tailoring." },
    ],
  },
  {
    slug: "resume-keywords-from-job-description",
    title: "How to find resume keywords in a job description",
    seoTitle: "How to find resume keywords in any job description",
    description: "A five-step method to pull the keywords that matter out of a job post, and add them to your resume without lying or stuffing.",
    query: "resume keywords from job description",
    category: "ATS",
    published: "2026-10-09",
    tool: "ats-checker",
    toolPitch: "The scanner pulls the weighted keywords from a job post and shows which ones your resume is missing.",
    body: [
      { t: "p", text: "A job post is a list of what the employer will search for. Most people read it once and write a resume from memory. You get better results by mining the post for its words first." },
      { t: "h2", text: "Step 1: Read the requirements before the perks" },
      { t: "p", text: "Look for headings such as Requirements, Qualifications or What you'll need. These words carry the most weight. Anything under Nice to have or Preferred matters less." },
      { t: "h2", text: "Step 2: Mark three kinds of words" },
      { t: "ul", items: ["Hard skills and tools: React, SQL, Figma, QuickBooks, Salesforce.", "Job titles and levels: Senior Product Designer, Accounts Payable Specialist.", "Outcomes and methods: stakeholder management, A/B testing, month-end close."] },
      { t: "h2", text: "Step 3: Count repeats" },
      { t: "p", text: "A word that appears three times in a short post is the job. A word that appears once may be filler. Skip the generic ones: team, fast-paced, passionate, strong communication skills. They are in every post, so they separate no one." },
      { t: "h2", text: "Step 4: Check each word against your real experience" },
      { t: "p", text: "For each marked word, ask: have I done this? If yes, find the bullet where it belongs. If you did it but never wrote it down, add a bullet. If you have not done it, leave it out. A keyword you cannot defend in an interview costs you more than it earns." },
      { t: "h2", text: "Step 5: Write it into a bullet, with a result" },
      { t: "p", text: "Weak: \"Used SQL.\" Better: \"Wrote SQL queries that cut the weekly sales report from 3 hours to 20 minutes.\" The keyword is there, and a reader sees what it did." },
      { t: "h2", text: "Match both spellings" },
      { t: "p", text: "Write the full term and the short form once each: \"Customer Relationship Management (CRM)\", \"JavaScript (JS)\". Systems and recruiters search both." },
      { t: "tip", text: "Keep one master resume with every skill and result you have. For each application, copy it and keep the lines that fit that post. Do not rewrite from nothing each time." },
      { t: "p", text: "The ATS scanner on this site automates steps 1 to 3. It also treats \"JS\" and \"JavaScript\" as the same word, and tells you if a keyword sits only in your skills list. Step 4 is yours." },
    ],
  },
  {
    slug: "resume-bullet-points-weak-phrases",
    title: "Resume bullet points: weak phrases and what to write instead",
    seoTitle: "Resume bullet points: weak phrases to replace",
    description: "Ten phrases that make a resume bullet say nothing, with a before and after for each, so you can fix yours in one sitting.",
    query: "resume bullet points examples",
    category: "Resume",
    published: "2026-10-09",
    tool: "ats-checker",
    toolPitch: "The ATS scanner flags weak openers and bullets with no numbers, rewrites the weakest ones and lists the fixes by priority.",
    body: [
      { t: "p", text: "A recruiter spends seconds on a first read. Bullets that open with a duty (\"Responsible for...\") describe the job. Bullets that open with a result describe you. The fix is mostly mechanical." },
      { t: "h2", text: "The pattern" },
      { t: "p", text: "Start with a verb for what you did. Say what changed. Add a number if you have one: how many, how much, how fast, how often." },
      { t: "h2", text: "Ten weak openers, fixed" },
      { t: "ol", items: [
        "\"Responsible for the weekly newsletter.\" becomes \"Wrote and sent the weekly newsletter to 12,000 subscribers.\"",
        "\"Helped with onboarding.\" becomes \"Ran onboarding for 6 new hires, cutting time to first task from 10 days to 4.\"",
        "\"Worked on the checkout redesign.\" becomes \"Designed the mobile checkout flow, which lifted completed orders 9%.\"",
        "\"Assisted with month-end close.\" becomes \"Reconciled 14 accounts each month-end, finishing close in 4 days instead of 6.\"",
        "\"Duties included answering calls.\" becomes \"Handled about 60 customer calls a day with a 94% satisfaction score.\"",
        "\"Involved in testing.\" becomes \"Wrote 120 automated tests that caught 31 bugs before release.\"",
        "\"Tasked with managing the budget.\" becomes \"Managed a $240,000 annual budget and came in 3% under.\"",
        "\"Hard-working team player.\" becomes a fact: who you worked with and what came of it.",
        "\"Results-driven professional.\" becomes the result.",
        "\"Participated in meetings.\" gets cut. It is not an achievement.",
      ] },
      { t: "p", text: "The numbers above are examples. Use your own, and round honestly. If you do not know the exact figure, a careful estimate marked with \"about\" beats a blank." },
      { t: "h2", text: "When you have no numbers" },
      { t: "p", text: "Count something: people trained, tickets closed, pages shipped, events run, hours saved. If you really have nothing to count, name the scope: \"for a team of 8\", \"across 3 regions\", \"for the CEO\"." },
      { t: "h2", text: "Vary your verbs" },
      { t: "p", text: "If five bullets start with \"Managed\", pick different words where they fit: led, planned, ran, owned, coordinated. Do not stretch for a fancy verb that means something else." },
      { t: "tip", text: "Read the bullet aloud and ask \"so what?\" If the answer is not in the sentence, add it." },
    ],
  },
  {
    slug: "resume-to-portfolio-website",
    title: "How to turn your resume into a portfolio website",
    seoTitle: "Turn your resume into a portfolio website (free)",
    description: "A resume lists the work. A portfolio site shows it. Here is how to turn one into the other without writing code, and what to put on the page.",
    query: "resume to portfolio website",
    category: "Portfolio",
    published: "2026-10-09",
    tool: "resume-to-website",
    toolPitch: "Upload your resume PDF and turn it into a portfolio site. Free account, no card.",
    body: [
      { t: "p", text: "A PDF can say you led a redesign. A page can show it. When a recruiter has two similar candidates, the one with a link to real work is easier to believe." },
      { t: "h2", text: "What a portfolio page needs" },
      { t: "ul", items: ["A headline that says what you do and for whom.", "Two to four pieces of work, each with the problem, your part and the result.", "Your experience, shortened from the resume.", "A clear way to contact you.", "One link people can share."] },
      { t: "h2", text: "Start from the resume you have" },
      { t: "p", text: "Your resume already has the facts: roles, dates, skills, results. The slow part is moving them into a layout. A tool that reads the PDF and sets it into sections saves that step. Dossier does this: upload the PDF, pick a look, and you get a page you can edit and publish." },
      { t: "h2", text: "Choose work over decoration" },
      { t: "p", text: "Visitors read the first screen and decide. Lead with your best project, not a long about-me. Put the result in the first line of each project: \"Cut onboarding drop-off by a third.\"" },
      { t: "h2", text: "Write for a skim" },
      { t: "p", text: "Short paragraphs, specific nouns, numbers. If a sentence could appear on anyone's site, cut it." },
      { t: "h2", text: "Make it findable" },
      { t: "p", text: "Put your name and role in the page title, such as \"Asha Rao, product designer\". Add the link to your resume, LinkedIn and email signature. A portfolio nobody can find does nothing." },
      { t: "h2", text: "Keep the PDF too" },
      { t: "p", text: "Many employers still ask for a file, and applicant systems read files, not websites. Keep a clean, text-based PDF for applications and use the site as the link that backs it up. Run the PDF through the [ATS scanner](/tools/ats-checker) first." },
      { t: "tip", text: "Update both whenever you finish something. Put the new project on the site that day, while you remember the numbers." },
    ],
  },
  {
    slug: "linkedin-headline-examples",
    title: "LinkedIn headline examples that say what you do",
    description: "LinkedIn shows your headline everywhere you appear. Here are six formulas with examples, and how to pick the one that fits you.",
    query: "linkedin headline examples",
    category: "LinkedIn",
    published: "2026-10-09",
    tool: "headline-writer",
    toolPitch: "Answer four questions and get six headlines that fit LinkedIn's 220-character limit.",
    body: [
      { t: "p", text: "Your headline sits under your name in search results, comments and messages. By default LinkedIn fills it with your job title. You have 220 characters, and most people use about 30." },
      { t: "h2", text: "Six formulas" },
      { t: "ol", items: [
        "Role + who you help: \"Product designer for travel and booking apps.\"",
        "Role + proof: \"Backend engineer | Built payments that process 2M orders a month.\"",
        "Role + specialty + tools: \"Data analyst | SQL, Python, Looker | Retail and logistics.\"",
        "Outcome first: \"I help B2B startups turn demos into signed contracts. Sales lead.\"",
        "Switching careers: \"Teacher moving into learning design | Built courses for 400 students.\"",
        "Open to work: \"Accountant, CPA | Month-end close and audit prep | Open to roles in Pune.\"",
      ] },
      { t: "p", text: "The examples are shapes, not text to copy. Swap in your own role, field and proof." },
      { t: "h2", text: "What recruiters search for" },
      { t: "p", text: "Recruiters search LinkedIn by title and skill. A headline with \"Senior Product Designer\" and \"design systems\" appears for those searches. \"Creative problem solver\" appears for none." },
      { t: "h2", text: "Rules that hold up" },
      { t: "ul", items: ["Put the keywords you want to be found for in the first 60 characters. Mobile cuts the rest.", "Use one proof point if you have it: a number, a client type, a scale.", "Skip \"passionate\", \"guru\" and \"ninja\".", "Match the title on your resume and portfolio so the three agree."] },
      { t: "tip", text: "Look up five people with the job you want. Note which words repeat in their headlines. Those are the words recruiters search." },
    ],
  },
  {
    slug: "do-you-need-a-portfolio-website",
    title: "Do you need a portfolio website, or is a resume enough?",
    seoTitle: "Do you need a portfolio website? A resume guide",
    description: "A portfolio helps most when your work can be seen. Here is a short guide by field, and what to do if you have nothing to show yet.",
    query: "do i need a portfolio website",
    category: "Portfolio",
    published: "2026-10-09",
    tool: "resume-to-website",
    toolPitch: "Try it with your own resume. Free account, no card.",
    body: [
      { t: "p", text: "It depends on whether your work can be looked at. A designer or developer without a portfolio is asking the reader to take their word. An accountant is not." },
      { t: "h2", text: "A portfolio helps most when" },
      { t: "ul", items: ["Your output is visual or interactive: design, front-end, video, writing, photography.", "You are early in your career and your work history is short.", "You are changing fields and need to show skills your job titles do not.", "You freelance and clients want proof before they write."] },
      { t: "h2", text: "A resume alone is usually enough when" },
      { t: "ul", items: ["Employers screen on credentials and years, as in finance, law and nursing.", "Your work is confidential and cannot be shown.", "The application only accepts a file."] },
      { t: "p", text: "Even then, a one-page site with your summary, roles and contact details gives you a link to put in your email signature and LinkedIn profile. It costs an afternoon." },
      { t: "h2", text: "If you have nothing to show yet" },
      { t: "p", text: "Make something small and finish it. A case study of one real problem you solved, a redesign of a page you use, a short write-up of a project from class. One finished piece beats five outlines." },
      { t: "h2", text: "Keep both" },
      { t: "p", text: "Applicant systems read files, so send a clean PDF with the application and put the site link at the top of it. Check the PDF with the [free ATS scanner](/tools/ats-checker)." },
    ],
  },
] as const

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug)
}

export function readingMinutes(post: Post): number {
  const words = post.body.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).length : b.items.join(" ").split(/\s+/).length), 0)
  return Math.max(2, Math.round(words / 220))
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
}
