import type { ResumeExample } from "./types"

export const EXAMPLES_C: ResumeExample[] = [
  {
    slug: "mechanical-engineer",
    sample: "lukas",
    templateId: "r010-europa",
    title: "Mechanical engineer",
    answer:
      "A mechanical engineer's CV should show the part, the analysis behind it and what it saved, set out in the German format with dates, nationality and language levels where a German HR team expects them.",
    guidance: [
      {
        heading: "Layout and format",
        body: "Lukas Weber, our fictional sample, applies in Munich, so the CV uses the Germany format: A4, dates as 04/2021, nationality and date of birth in the personal details. Europa puts each section label in a left column, which helps an HR team comparing dozens of engineering CVs find Experience and Languages in the same place every time. One page is enough for one design role and a Werkstudent job.",
      },
      {
        heading: "How the bullets are built",
        body: "Each bullet names a component or a process, then the result. The housing bullet gives both the weight saved (1.4 kg per unit) and the cost saved (€3.10), which is what a purchasing-minded engineering manager reads for. The analysis bullet ties the tools, ANSYS and CETOL, to three series releases rather than listing them alone. The supplier bullet shows you can carry a part through DFM review and PPAP approval, which matters for series production roles.",
      },
      {
        heading: "Student jobs count",
        body: "In Germany a Werkstudent role is real experience. Keep it, with one bullet on what it saved, as Lukas does with six hours a week of test reporting.",
      },
    ],
    faqs: [
      {
        q: "Should a German engineering CV include a photo?",
        a: "It is optional and still common in Germany. Dossier does not support photos yet, so this sample has none. Many employers now accept CVs without one.",
      },
      {
        q: "How should I list languages for a job in Germany?",
        a: "Give each language a CEFR level, as the sample does with German Native and English C1. Europa sets them in a small table so the level is easy to find.",
      },
      {
        q: "Do I list every CAD package I have used?",
        a: "List the ones you would be comfortable using on day one. The sample groups methods such as GD&T and tolerance analysis apart from tools such as CATIA V5 and SolidWorks, so a reader can scan each separately.",
      },
      {
        q: "Can I use this CV for a job outside Germany?",
        a: "Yes. Switch the country format to Europe for other EU countries, or to UK for Britain, where date of birth and nationality are usually left off. The content stays the same.",
      },
    ],
  },
  {
    slug: "financial-analyst",
    sample: "ananya",
    templateId: "r001-ledger",
    title: "Financial analyst",
    answer:
      "A financial analyst's resume should show the size of what you forecast or modelled, who used it, and how accurate it became, on one clean page.",
    guidance: [
      {
        heading: "Layout and length",
        body: "Ananya Rao, a fictional FP&A analyst with three years of experience, fits on one page in Ledger. A single column suits finance hiring, where reviewers read top to bottom and look for the business size and the model first. The India format uses A4 and short month dates; date of birth is optional and this sample leaves it out.",
      },
      {
        heading: "Bullets that carry scale and accuracy",
        body: "The first bullet does three jobs: it says what she owns (the monthly forecast), how big it is (a ₹1,200 crore business unit) and how it improved (forecast error from 8% to 3%). The second names the users of her work, 6 category heads, which tells a reader the model was trusted. The third shows board exposure without inflating it: variance analysis and a margin bridge each quarter.",
      },
      {
        heading: "Qualifications in progress",
        body: "Put a passed CFA level under Certifications with the date, and mention the next level in the summary as a candidate. Keep the internship to one bullet with a concrete output, such as the three DCF valuations here.",
      },
    ],
    faqs: [
      {
        q: "Should I write amounts in crore or in millions?",
        a: "Use the unit your target employer reports in. For Indian companies crore is normal, as in this sample. For a multinational's global finance team, millions in a stated currency may read more easily.",
      },
      {
        q: "Where does the CFA go on a resume?",
        a: "List levels you have passed under Certifications with the date. If you are sitting the next level, say so in the summary, as the sample does with Level II.",
      },
      {
        q: "Is an MBA listed above a B.Com?",
        a: "Yes. Education runs newest first, so the MBA leads. Both stay, because some finance roles screen for a commerce degree.",
      },
    ],
  },
  {
    slug: "hr-business-partner",
    sample: "sarah",
    templateId: "r007-executive",
    title: "HR business partner",
    answer:
      "An HR business partner's resume should show the size of the organisation you support, the leaders you partner with and the people outcomes you changed.",
    guidance: [
      {
        heading: "Why the Executive layout",
        body: "Sarah Cohen, a fictional senior HRBP in New York, applies for roles where she would sit with a leadership team. Executive's centred name and serif type read as senior without being showy, and the summary sits first, which is where she states the scope: engineering and sales orgs of up to 600 people. The US format sets the page on Letter paper with no personal details.",
      },
      {
        heading: "Bullets that read as partnership",
        body: "Lead the current role with the remit: 3 VPs and 450 employees. Then give the results a business leader cares about. The pay equity bullet says how many people (38) and how fast (within one cycle). The attrition bullet names the group, the before and after (14% to 8%) and the methods used, stay interviews and a career ladder. That pairing of number and method is what separates a partner from an administrator.",
      },
      {
        heading: "Earlier roles stay short",
        body: "The generalist job gets one bullet with a volume, 300 hires a year, plus employee relations. That is enough to show the foundation without crowding the senior work.",
      },
    ],
    faqs: [
      {
        q: "Should an HRBP resume list HR systems?",
        a: "Yes, briefly. The sample keeps Workday, Greenhouse and Lattice in their own skills group, separate from HR practice areas, so a recruiter can check both at a glance.",
      },
      {
        q: "How do I write about confidential employee relations work?",
        a: "Describe the type and volume of work, never names or details. The sample says only that she handled employee relations cases, which is enough.",
      },
      {
        q: "Where does SHRM certification go?",
        a: "In the headline if it matters for the roles you want, and under Certifications with the year. The sample does both.",
      },
      {
        q: "Is one page enough for a senior HR resume in the US?",
        a: "Two pages is accepted at this level. This sample fits on one because it has two roles; add older roles as single lines if you need the room.",
      },
    ],
  },
  {
    slug: "solicitor",
    sample: "aoife",
    templateId: "r001-ledger",
    title: "Solicitor",
    answer:
      "A solicitor's CV should state your admission, your practice area and the kind of matters you handle, with deal sizes only where you are free to share them.",
    guidance: [
      {
        heading: "Layout and format",
        body: "Aoife Byrne, a fictional commercial solicitor in Dublin, uses the UK and Ireland format: A4, called a CV, with no photo, date of birth or nationality. Ledger's single column suits legal recruitment, where partners and HR read a CV in order and expect a conventional page. The summary carries the one fact every firm checks first: admitted in Ireland, 2019.",
      },
      {
        heading: "How the bullets are built",
        body: "Legal bullets describe matters, not tasks. The first gives a client base (20+ technology clients) and the agreement types. The second gives a count of clients and names the actual work, DPIAs and transfer assessments, which tells a data protection partner you have done more than read the regulation. The third uses a contract value, €40M, with the client described by sector only. Training contract seats belong in one line, as the trainee entry shows.",
      },
      {
        heading: "Education and referees",
        body: "List the Law Society professional course above the law degree. A short Referees line saying they are available on request is still common in Ireland and the UK.",
      },
    ],
    faqs: [
      {
        q: "Can I name clients on a solicitor CV?",
        a: "Only if the matter is public and your firm allows it. Otherwise describe the client by sector and the deal by type and size, as the sample does with a public sector cloud contract.",
      },
      {
        q: "Should I include my training contract seats?",
        a: "Yes, in one line under the trainee role. Recruiters use them to see what areas you have seen beyond your current practice.",
      },
      {
        q: "Do I need a referees section?",
        a: "It is optional. Many Irish and UK firms still expect it, so the sample includes a single line. You can delete it or hide it in the editor.",
      },
    ],
  },
  {
    slug: "research-scientist",
    sample: "mei",
    templateId: "r004-scholar",
    title: "Research scientist",
    answer:
      "A research scientist's CV should put your degrees and appointment first, then a full publication list with authors in printed order, then funding and talks.",
    guidance: [
      {
        heading: "Why Scholar",
        body: "Dr. Mei Lin Chen, a fictional computational biologist, applies for faculty and senior research posts in the US, where an academic CV is a complete record rather than a two-page summary. Scholar sets it in Source Serif with numbered publications, and it keeps each heading with its first entry so nothing is stranded at the foot of a page. The US format gives Letter paper; add pages as the record grows.",
      },
      {
        heading: "How the entries are built",
        body: "Her postdoc bullets each pair the science with a scale: 1.2 million immune cells across 90 donors, an R package with 400+ GitHub stars, 2 PhD students co-supervised. Publications carry the title, journal and year, with the author list in the detail line in printed order and her name as it appears. Awards include the amount and term of the fellowship, $180,000 over 3 years, because committees read funding as evidence of independence.",
      },
      {
        heading: "Moving to industry",
        body: "For an industry role, switch to Ledger and keep only the papers and tools relevant to that team.",
      },
    ],
    faqs: [
      {
        q: "How long should a research scientist's CV be?",
        a: "As long as the record. Academic CVs often run to several pages; Scholar is built to flow across pages without breaking a section heading from its first entry.",
      },
      {
        q: "Should I list papers under review?",
        a: "Yes, in their own group marked under review or in preparation, never mixed with published work. The sample lists only published papers.",
      },
      {
        q: "Where do my ORCID and code go?",
        a: "Put ORCID in the contact links, as the sample does. Mention notable open-source tools in a bullet with a usage signal, such as GitHub stars, rather than a bare link.",
      },
      {
        q: "Should teaching have its own section?",
        a: "If you have taught a course or several workshops, yes. The sample has one workshop, so it sits inside the postdoc bullets.",
      },
    ],
  },
  {
    slug: "hotel-operations-manager",
    sample: "carlos",
    templateId: "r011-gulf",
    title: "Hotel operations manager",
    answer:
      "A hotel operations manager's CV should give the property size, the departments and headcount you run, and the guest and cost numbers you moved.",
    guidance: [
      {
        heading: "Layout and format",
        body: "Carlos Mendes, a fictional operations manager at a resort in Abu Dhabi, uses the Gulf format. Gulf puts nationality, visa status and driving licence in a personal details block near the top, because hotel groups in the region sponsor visas and screen on them first. The sample lists Portuguese nationality, a UAE employment visa and UAE and EU licences. Languages matter in hospitality hiring here, so all four are listed with honest levels, including Basic Arabic.",
      },
      {
        heading: "How the bullets are built",
        body: "Open the current role with the scope, as the first bullet does: front office, housekeeping and F&B for a 320-key resort with 410 staff. Then one result that pairs a guest measure with a cost measure, the satisfaction score from 86 to 92 while labour cost held at 31%. Owners and general managers look for both together. A pre-opening bullet, two restaurants and a beach club opened on time, shows you can deliver against a fixed date.",
      },
      {
        heading: "Earlier roles",
        body: "Keep earlier jobs to a revenue result such as the 11% rise in average daily rate.",
      },
    ],
    faqs: [
      {
        q: "Should I put a photo on a hotel CV in the UAE?",
        a: "Photos are common in the Gulf. Dossier does not support photos yet, so this sample has none, and many international hotel groups do not require one.",
      },
      {
        q: "Is marital status needed on a Gulf CV?",
        a: "It is optional. The sample includes it because some employers ask for it for family visa planning. Leave it out if you prefer.",
      },
      {
        q: "Which hotel systems should I list?",
        a: "The ones you used daily. The sample names Opera PMS and Medallia in a separate Systems group so they do not crowd the operations skills.",
      },
      {
        q: "How many pages should a hotel operations CV be?",
        a: "Two to three pages is normal in the Gulf at this level. This sample fits on one because it shows two roles; older posts can be added as short entries.",
      },
    ],
    keywordRole: "operations-manager",
  },
  {
    slug: "finance-director",
    sample: "robert",
    templateId: "r007-executive",
    title: "Finance director",
    answer:
      "A finance director's CV should open with three or four transactions and results, then show each role's remit before its outcomes.",
    guidance: [
      {
        heading: "Achievements before history",
        body: "Robert Hale, a fictional finance director in London, puts a Selected achievements section above his experience: the £240M sale of a business, an £85M refinancing at 180 basis points below the old facility, and a month-end close cut from 12 days to 5. Search firms and PE investors read for exactly these, and they answer the question before the reader reaches the dates. In the editor this is a Custom section dragged above Experience.",
      },
      {
        heading: "Remit, then results",
        body: "Under the FD role, the first bullet states the scope: a team of 32 across four countries. The next two describe the board and investor reporting, the due diligence pack and the systems change. Earlier roles shrink to one line each, the capex plan and the audit work, which is enough to show the path from audit to FD. Executive's serif type and centred name suit a board-level reader. The UK format means A4, called a CV, with no personal details.",
      },
    ],
    faqs: [
      {
        q: "How long should a finance director's CV be?",
        a: "Two pages is normal at this level in the UK. The sample fits on one because the older roles are kept to a single line each.",
      },
      {
        q: "Can I mention deals that are confidential?",
        a: "Only what is public. The sale in the sample is described with a value and a year, as an announced transaction would be. If a deal is private, describe its type and size range without naming parties.",
      },
      {
        q: "Should my professional qualification go in the headline?",
        a: "In the UK, yes. FCA or ACA after the title is how many finance leaders are introduced, and the sample also lists it under Certifications with the year.",
      },
      {
        q: "What if I am between roles?",
        a: "Give the end date as it is. The sample's last role ended in March 2024, and that is shown plainly.",
      },
    ],
  },
  {
    slug: "career-change-instructional-designer",
    sample: "maya",
    templateId: "r009-switcher",
    title: "Instructional designer (career change)",
    answer:
      "A career-change resume for instructional design should lead with your design skills and a portfolio project, then show your teaching history in the language of the new field.",
    guidance: [
      {
        heading: "Section order",
        body: "Maya Johnson, a fictional middle school science teacher moving into instructional design, puts Skills and Projects above Experience. A recruiter reading top down sees ADDIE, Storyline and a finished module before the word teacher, so her old title reads as background. Switcher sets the profile in a panel at the top, where she names the move plainly. The US format keeps it to one Letter page with no personal details.",
      },
      {
        heading: "The portfolio project does the heavy lifting",
        body: "The project entry has a link, a length (a 20-minute Storyline course), a design choice (branching scenarios) and a measured result from a pilot with 60 students: quiz scores up 22%. That one bullet is closer to the new job than anything from the classroom.",
      },
      {
        heading: "Teaching bullets, translated",
        body: "Each teaching bullet uses words an L&D team uses. Designing a curriculum taken up by 5 teachers is curriculum design. Training 30 colleagues on Google Classroom is facilitation. The assessment result, pass rates from 54% to 68%, shows she measures learning.",
      },
    ],
    faqs: [
      {
        q: "Should I leave teaching off my instructional design resume?",
        a: "No. Keep it, below your skills and projects, and choose bullets that show design, training and measurement. Years of designing lessons are relevant experience.",
      },
      {
        q: "How many portfolio projects do I need?",
        a: "One finished project with a link and a result is a start. Add a second if it shows a different tool or audience, such as adult learners.",
      },
      {
        q: "Does a short certificate help?",
        a: "It signals intent. The sample lists an ATD certificate with its date under Certifications, below the work that proves the skill.",
      },
      {
        q: "When should I stop using the Switcher layout?",
        a: "After about a year in the new role. Then your current title can lead and a template such as Ledger or Modern works better.",
      },
    ],
  },
  {
    slug: "commerce-graduate",
    sample: "sneha",
    templateId: "r008-fresher",
    title: "Commerce graduate (fresher)",
    answer:
      "A commerce fresher's resume should lead with your degree and marks, then your articleship or internship work, with a number on every bullet you can honestly count.",
    guidance: [
      {
        heading: "Section order and length",
        body: "Sneha Kulkarni, a fictional B.Com graduate from Pune, has six months of articleship and no full-time job, so Education leads the page in Fresher. Her degree line gives the class and percentage, first class with 78%, and the papers that matter for accounts work. Everything fits on one A4 page. The India format allows a date of birth, which this sample includes.",
      },
      {
        heading: "Bullets from short experience",
        body: "An internship bullet should name the work and count it. Sneha's articleship bullets name the actual returns, GSTR-1 and GSTR-3B, for 15 small-business clients, and give a volume for audit work: 1,200 entries vouched across two statutory audits. That reads as real practice to an audit firm.",
      },
      {
        heading: "College work counts",
        body: "Treat a college role as a project. As fest treasurer she managed a ₹6 lakh budget for 2,000 visitors and closed with a 9% surplus, which is a finance result. Certifications with dates, such as Tally Prime with GST, show the tools are recent.",
      },
    ],
    faqs: [
      {
        q: "Should a fresher's resume include percentage or CGPA?",
        a: "Yes, if it is good or the employer asks for it. Put it in the education detail line, as the sample does.",
      },
      {
        q: "Is date of birth needed on an Indian resume?",
        a: "It is often included in India but not required. The India format shows the field; leave it blank if you prefer not to share it.",
      },
      {
        q: "Do Tally or Excel certificates matter?",
        a: "For accounts trainee roles they help show you can start work quickly. List them with the issuer and date, and also show the skill in a bullet.",
      },
      {
        q: "How long should a fresher's resume be?",
        a: "One page. If you run over, cut school-level details first.",
      },
    ],
  },
]
