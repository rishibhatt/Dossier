import type { ResumeExample } from "./types"

export const EXAMPLES_B: ResumeExample[] = [
  {
    slug: "content-writer",
    sample: "grace",
    templateId: "r012-specimen",
    title: "Content writer",
    answer:
      "A content writer's resume should read like a good brief: one page, a link to clips under the name, and bullets that say what each piece did after it was published.",
    guidance: [
      {
        heading: "Layout",
        body: "Grace Mwangi, our fictional sample, uses Specimen: her name set large in Bricolage Grotesque, then one column of Inter. A writer's resume is itself a writing sample, so a display face for the name is fair, but the body stays plain and in one text flow. Her clips link sits in the contact line, where an editor looks for it before reading anything else.",
      },
      {
        heading: "Bullets that report results",
        body: "Count the work, then say what happened to it. \"Wrote 40 long-form guides; 11 reached Google's first page and bring 22,000 visits a month\" gives volume, a ranking result and traffic in one line. The newsletter bullet does the same for email: 18,000 subscribers and an open rate that held at 46%. The third bullet, a style guide used by 6 freelance writers, shows editing and process, which matters if you want to lead other writers later.",
      },
      {
        heading: "Order and length",
        body: "Experience first, then education, skills and languages. Grace's US Letter page keeps the older copywriting job to one bullet naming the 15 brands and their sectors. Two languages go in their own short section, since writing in both is part of what she sells.",
      },
    ],
    faqs: [
      {
        q: "Should a content writer put a portfolio link on the resume?",
        a: "Yes, and near the top. Put it in the contact line with a short label such as a domain and /clips, so it is readable in print as well as clickable in the PDF.",
      },
      {
        q: "What if I can't share traffic numbers for my articles?",
        a: "Use what you can say: how many pieces, for whom, how often, and any result the client made public. A bullet like Grace's copywriting line, which names 15 brands and their sectors, works without a single metric.",
      },
      {
        q: "Is a display font safe for a writer's resume?",
        a: "In Specimen only the name and section heads use Bricolage Grotesque; the body text is Inter in one column. The PDF keeps selectable text either way. If an application portal feels conservative, switch to Ledger in the editor and the content stays as it is.",
      },
      {
        q: "One page or two?",
        a: "One, for three years of experience. Grace's sample fits two jobs, education, skills and languages on a single US Letter page.",
      },
    ],
    keywordRole: "content-writer",
  },
  {
    slug: "project-manager",
    sample: "rahul",
    templateId: "r005-compact",
    title: "Project manager",
    answer:
      "A senior project manager's resume needs to show scale, budget and delivery against plan, and Compact fits nine years of that on one page.",
    guidance: [
      {
        heading: "Why a compact layout",
        body: "Rahul Verma, a fictional sample, has nine years and two employers. Compact puts each role on one line, title, company and city, with dates at the right edge and bullets tight beneath. That leaves room for two certifications and a skills block without spilling onto a second page. His India preset sets A4 paper and adds a date of birth, which many Indian employers still expect.",
      },
      {
        heading: "Bullets a sponsor would recognise",
        body: "Each bullet answers a question a steering committee would ask. How big? \"Delivered a ₹48 crore SAP S/4HANA rollout across 7 plants, two weeks ahead of plan.\" Who did you manage? Steering committees for 3 client CXOs and a team of 35. Did your process change anything? RAID logs and earned-value tracking, with change requests down 40% year on year. The older role uses the same pattern: 12 data centre migrations with zero unplanned downtime.",
      },
      {
        heading: "Where certifications go",
        body: "PMP is in the headline and again in a Certifications section with its issuing body and date. A recruiter filtering for PMP sees it in the first line; one checking validity finds the date lower down.",
      },
    ],
    faqs: [
      {
        q: "Should PMP go in the headline?",
        a: "If the roles you apply for ask for it, yes. Rahul's sample has \"Project Manager, PMP\" as the headline and lists the certificate with its date in its own section as well.",
      },
      {
        q: "How do I show methodology without a buzzword list?",
        a: "Name it where you used it. The sample says vendors across 4 countries were coordinated using Agile and Waterfall plans, which is more convincing than both words sitting alone in a skills list.",
      },
      {
        q: "Should I include date of birth on an Indian resume?",
        a: "It is common in India and the India preset includes the field, but it is optional. Leave it blank and the line disappears from the PDF.",
      },
      {
        q: "What if my projects were late?",
        a: "Write what you delivered and what you controlled: scope, team size, budget, the risk you caught. Ahead-of-plan claims only belong on the page when they are true.",
      },
    ],
    keywordRole: "project-manager",
  },
  {
    slug: "business-analyst",
    sample: "chloe",
    templateId: "r001-ledger",
    title: "Business analyst",
    answer:
      "A business analyst's resume should show the artefacts you produced and what changed because of them, in a plain one-column layout that reads like a well-written requirement.",
    guidance: [
      {
        heading: "Layout and format",
        body: "Chloe Martin, a fictional sample, uses Ledger: one column of Inter with dates on the right. She is in Sydney, so the Australia preset sets A4 and calls the document a resume. Australian resumes often run to two or three pages and end with referees; Chloe's fits on one and closes with \"Referees: available on request\", added as a custom section.",
      },
      {
        heading: "Bullets that name the deliverable",
        body: "A hiring manager wants to know what you actually hand over. Chloe's bullets each name one: a process map built from 30 staff interviews, 180 user stories with acceptance criteria for a Guidewire upgrade, a Power BI backlog report the steering committee reads each fortnight. The first of those also gives the outcome, average handling time cut by 2.5 days, which turns the artefact into a result.",
      },
      {
        heading: "Domain matters",
        body: "Her headline says Banking and Insurance, because a BA's domain knowledge is often the deciding factor. The older role's single bullet, online home loan applications now 45% of all applications, keeps that thread running back seven years.",
      },
    ],
    faqs: [
      {
        q: "Should I list CBAP or other certifications?",
        a: "Yes, in a Certifications section with the issuing body and year, as the sample does for CBAP from IIBA. If it is a hard requirement in the job post, mention it in the summary too.",
      },
      {
        q: "Do Australian resumes need referees?",
        a: "Many employers ask for them later in the process. A one-line \"available on request\" section, like Chloe's, is common; you can also leave it out and supply names when asked.",
      },
      {
        q: "How technical should a BA resume be?",
        a: "Name the tools you used to do the analysis, such as SQL, Power BI or Visio, and keep the bullets about the business change. The sample's skills section splits Analysis from Tools so both are easy to find.",
      },
    ],
    keywordRole: "business-analyst",
  },
  {
    slug: "sales-representative",
    sample: "jake",
    templateId: "r006-modern",
    title: "Sales representative",
    answer:
      "A sales resume is judged on quota attainment, so put the percentage, the revenue and your rank in the first bullet of your current job.",
    guidance: [
      {
        heading: "Lead with the number",
        body: "Jake Thompson, a fictional account executive, opens with \"Closed $1.6M in new annual recurring revenue in 2024, 124% of quota; ranked 2nd of 14 reps.\" That one line answers the three things a sales leader checks: how much, against what target, and compared with whom. His summary repeats the multi-year view, 118% of quota over three years, so a reader skimming only the top still gets it.",
      },
      {
        heading: "Then show how",
        body: "The next two bullets explain the method. Mutual action plans took the average sales cycle from 74 to 51 days, and 40% of his pipeline came from his own outbound. An earlier SDR role gets one line, 310 qualified meetings in two years and a promotion after 18 months, which shows the path into closing.",
      },
      {
        heading: "Layout",
        body: "Modern hangs section titles in the left margin under a short accent bar, so it looks considered without breaking the single text flow. On the US preset it prints on Letter paper with no personal details, and one page is plenty for six years in sales.",
      },
    ],
    faqs: [
      {
        q: "What if I missed quota last year?",
        a: "Use the period that is honest and representative, label it clearly, and add context such as territory changes. Do not round 92% up to \"hit quota\"; reference checks often include your manager.",
      },
      {
        q: "Should I mention the sales methodology I use?",
        a: "Briefly, in skills or inside a bullet where it changed something. The sample lists MEDDIC in skills and credits mutual action plans with the shorter cycle.",
      },
      {
        q: "How far back should an SDR role go?",
        a: "Keep it, with one strong bullet. It shows how you learned to build pipeline, and promotion from SDR to AE is a signal recruiters look for.",
      },
      {
        q: "Can I try a different template with the same content?",
        a: "Yes. Templates switch in the editor without retyping, so you can compare Modern with Ledger or Compact before you download.",
      },
    ],
    keywordRole: "sales-representative",
  },
  {
    slug: "customer-success-manager",
    sample: "nina",
    templateId: "r010-europa",
    title: "Customer success manager",
    answer:
      "A customer success manager's resume should state the size of the book you own and the retention you kept, then show the systems you built to keep it.",
    guidance: [
      {
        heading: "Book, retention, expansion",
        body: "Nina Petrova, a fictional CSM in Amsterdam, writes her first bullet as \"Own a €3.2M book of 28 enterprise accounts; gross retention 97% and net retention 116% in 2024.\" Book size and both retention figures belong together, since one without the other is hard to judge. Her second bullet shows the method: a Gainsight health score that flags at-risk accounts 60 days before renewal.",
      },
      {
        heading: "A European CV",
        body: "Nina applies across the EU, so she uses Europa on the Europe preset: A4, numeric dates, a grey label column, and nationality and driving licence under the name. Her languages are a selling point for European accounts, so they get their own table with CEFR levels, from Russian native to Dutch B1, and the QBR bullet notes she runs reviews in English, German and Russian.",
      },
      {
        heading: "Earlier roles",
        body: "Her onboarding job gets one bullet with a before and after: time to first value fell from 30 to 12 days across 140 customers. It explains where her retention habits came from.",
      },
    ],
    faqs: [
      {
        q: "Gross or net retention: which should I use?",
        a: "Both, if you have them, with the year. Gross shows how much you kept; net shows whether accounts grew. The sample puts them in the same bullet as the book size.",
      },
      {
        q: "How do I write CEFR levels if I've never been tested?",
        a: "Use the level you could defend in an interview. The Europe preset expects A1 to C2 levels; native speakers usually write \"Native\" instead.",
      },
      {
        q: "Should I include nationality on a CV in the Netherlands?",
        a: "It is optional. Europa shows it under the name when filled in, which can help when work authorisation is a question; leave it blank and the line is not printed.",
      },
    ],
    keywordRole: "customer-success-manager",
  },
  {
    slug: "graphic-designer",
    sample: "mateo",
    templateId: "r012-specimen",
    title: "Graphic designer",
    answer:
      "A graphic designer's resume is the document that gets your portfolio opened, so keep it to one typeset page that counts the work and links straight to it.",
    guidance: [
      {
        heading: "Type, not decoration",
        body: "Mateo Rossi, a fictional designer in Milan, uses Specimen: his name in large Bricolage Grotesque, the rest in one column of Inter. Designers are tempted by sidebars, icons and skill bars. Those often break when a parser reads the PDF, and skill bars say nothing a reader can check. A confident name and clean hierarchy show taste without the risk.",
      },
      {
        heading: "Count the work",
        body: "His bullets read like a project list with numbers: identities for 9 food and drink brands including packaging for 40 products, print files with zero reprints in two years, and 3 product shoots plus a 64-page catalogue. Print production is a skill studios hire for, and \"zero reprints\" is the evidence for it. The junior role is one line about a monthly magazine and its social posts.",
      },
      {
        heading: "Format for Europe",
        body: "The Europe preset sets A4 paper and numeric dates, and adds nationality to the personal details. Mateo lists Italian and English with a CEFR level, and his ADI shortlist sits in an Awards section where it can't be missed.",
      },
    ],
    faqs: [
      {
        q: "Should my resume look as designed as my portfolio?",
        a: "It should look cared for, but the portfolio does the showing. Keep one text column so job portals read it in order, and put the visual work behind the link in your contact line.",
      },
      {
        q: "Can I add a photo?",
        a: "Dossier's templates do not support photos yet. In Italy and much of Europe a photo is optional, and many design studios do not expect one.",
      },
      {
        q: "Do shortlists count as awards?",
        a: "Yes, if you name them accurately. The sample writes \"shortlist\" in the award title so nobody reads it as a win.",
      },
      {
        q: "Should I list software?",
        a: "Yes, briefly. The sample groups design skills and tools separately: Illustrator, InDesign, Photoshop and Figma in one short row.",
      },
    ],
    keywordRole: "graphic-designer",
  },
  {
    slug: "devops-engineer",
    sample: "kwame",
    templateId: "r003-column",
    title: "DevOps engineer",
    answer:
      "A DevOps engineer's resume should tie each tool to a change in how often the team ships, how much the platform costs or how quiet on-call became.",
    guidance: [
      {
        heading: "Why a sidebar",
        body: "Kwame Asante, a fictional DevOps engineer in Manchester, has three skill groups and two certifications. Column puts those in a narrow right-hand sidebar, so the main column holds only his jobs and degree. The main column comes first in the PDF's text, so a parser reads the experience before the tool list.",
      },
      {
        heading: "Before and after in every bullet",
        body: "Each bullet pairs the work with a measured change. \"Moved 60 services to EKS with Terraform and Argo CD; deploys went from weekly to 25 a day\" names the tools inside the result, which is where they carry the most weight. The cost bullet gives a figure, £210k a year, and the method, rightsizing and Savings Plans. The monitoring bullet says pages outside working hours fell by half. The older systems role has one line: Linux server builds automated with Ansible, from two days to 40 minutes.",
      },
      {
        heading: "UK conventions",
        body: "The UK preset uses A4 and the word CV, with no date of birth or photo. A UK CV often runs to two pages; Kwame's six years fit on one.",
      },
    ],
    faqs: [
      {
        q: "Where should AWS and Kubernetes certifications go?",
        a: "In the sidebar's Certifications block with issuer and date, as in the sample. Mention the platform in your headline too if it is the core of the job, as Kwame does with \"AWS and Kubernetes\".",
      },
      {
        q: "Will a two-column layout confuse an ATS?",
        a: "Column keeps the main column first in the text flow, and Dossier reads each template's PDF back with pdf.js to check the order. That is an automated parse-back test, not a test in any particular commercial ATS. If a portal looks fussy, switch to Ledger in the editor.",
      },
      {
        q: "How do I show cost savings honestly?",
        a: "State the annual figure, the method, and that it was your work. If finance calculated it, it is fine to say so in an interview.",
      },
    ],
    keywordRole: "devops-engineer",
  },
  {
    slug: "operations-manager",
    sample: "fatima",
    templateId: "r011-gulf",
    title: "Operations manager",
    answer:
      "An operations manager's CV should open with the size of what you run, in floor space, people and daily volume, then show the rates you moved.",
    guidance: [
      {
        heading: "A Gulf CV",
        body: "Fatima Al-Sayed, a fictional operations manager in Riyadh, uses Gulf on the Gulf preset. Her name is centred in capitals and a personal details block shows nationality, date of birth and driving licence, which recruiters in the region usually check first. Section bars are shaded, the paper is A4, and two pages is normal here, though her CV fits on one.",
      },
      {
        heading: "Scale first, then improvement",
        body: "Her first bullet sets the scale: a 42,000 m² distribution centre, 260 staff, 18,000 orders a day. The next two show what she changed. Pick accuracy went from 98.1% to 99.6% with barcode scanning and slotting, and cost per order fell 14% with a zero lost-time-injury record for 3 years. Putting safety in the same line as cost shows she did not trade one for the other.",
      },
      {
        heading: "Qualifications that travel",
        body: "Lean Six Sigma Green Belt and the NEBOSH International General Certificate each sit in Certifications with issuer and year. Arabic and English are listed under Languages, since bilingual managers are often a requirement for regional roles.",
      },
    ],
    faqs: [
      {
        q: "Do I need to list nationality and visa status in the Gulf?",
        a: "It is common, and the Gulf preset includes both fields. The sample shows nationality because she is a Saudi national; if you hold a residence visa, filling in visa status answers the first question many recruiters ask.",
      },
      {
        q: "How do I describe a warehouse operation in one line?",
        a: "Size, headcount and throughput, as in the sample. Those three numbers let a reader compare your site with theirs.",
      },
      {
        q: "Should safety records go on an operations CV?",
        a: "If you have one you can stand behind, yes. Pair it with a productivity or cost result so the reader sees both.",
      },
      {
        q: "Can I add a photo to a Gulf CV?",
        a: "Photos are common in the region, but Dossier's templates do not support them yet. The CV reads in full without one.",
      },
    ],
    keywordRole: "operations-manager",
  },
  {
    slug: "secondary-school-teacher",
    sample: "emily",
    templateId: "r004-scholar",
    title: "Secondary school teacher",
    answer:
      "A teaching CV should show what you teach, to whom, your responsibilities beyond the classroom and the results your classes reached, with QTS and safeguarding checks easy to find.",
    guidance: [
      {
        heading: "Layout",
        body: "Emily Clarke, a fictional maths teacher in Bristol, uses Scholar: Source Serif 4, bold section heads over a thin rule, one column. It suits school and academy applications, which are often read alongside a formal application form. The UK preset sets A4 and the word CV, with no date of birth.",
      },
      {
        heading: "Bullets for teachers",
        body: "Start with your timetable and range: \"Teach 5 classes from Year 7 to A level.\" Add one outcome you can evidence, such as the sample's GCSE grade 4+ rate rising from 62% to 75% over three years. Then responsibilities: coordinating the KS4 scheme of work and assessment calendar for a department of 9, and mentoring 2 early career teachers a year. Her earlier post adds a weekly maths clinic that 40 students attended before exams.",
      },
      {
        heading: "What to put where",
        body: "Both qualifications sit under Education, PGCE first. QTS and the enhanced DBS check go in Certifications with dates, so a school business manager can find them at a glance. Keep classroom skills to one short group.",
      },
    ],
    faqs: [
      {
        q: "Should I put exam results on a teaching CV?",
        a: "If they are yours to claim and you can explain them at interview, yes. Give the measure, the starting point and the time span, as the sample does with grade 4+ rates over three years.",
      },
      {
        q: "Where do QTS and DBS go?",
        a: "In a Certifications section with the issuing body and date. Some teachers also put QTS in the headline, as Emily's sample does.",
      },
      {
        q: "Do I still need a CV if the school uses an application form?",
        a: "Many UK schools ask for the form only, but agencies, independent schools and international schools often want a CV. Keeping one up to date also makes the form quicker to fill.",
      },
      {
        q: "How long should a teacher's CV be?",
        a: "Two pages is normal in the UK. Seven years and two schools fit on one in this sample; add a second page only for real content such as extra responsibilities or training.",
      },
    ],
  },
]
