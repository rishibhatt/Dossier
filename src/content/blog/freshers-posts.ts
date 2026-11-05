import type { Post } from "./posts"

/**
 * Fresher-intent posts for the Indian campus and Naukri audience. Each targets one query and links into
 * the fresher format guide, templates and free tools. Same rules as posts.ts: no invented statistics,
 * and claims about Dossier must match what ships.
 */
export const FRESHERS_POSTS: readonly Post[] = [
  {
    slug: "resume-headline-for-freshers",
    title: "Resume headline for freshers: formula and 39 examples by field",
    seoTitle: "Resume headline for freshers: 39 examples",
    description: "Resume headline for freshers: the formula, length, where it goes on your resume and Naukri, and 39 examples for B.Tech, BCA, B.Com, MBA, nursing and more.",
    ogTitle: "39 resume headline examples for freshers, by degree",
    ogDescription: "One line under your name that says what you are and what you want. The formula, Naukri placement, and examples for every common degree.",
    query: "resume headline for freshers",
    category: "Resume",
    published: "2026-11-05",
    tool: "resume-builder",
    toolPitch: "The Fresher template has a headline line under your name, and the PDF download is free.",
    body: [
      { t: "p", text: "A resume headline is the one line under your name that tells a recruiter what you are and what you want. For a fresher it carries extra weight, because there is no job title above your first bullet to do that work for you. This guide covers the formula, the length, where the headline goes on your resume and on Naukri, and 39 example headlines grouped by degree." },

      { t: "h2", text: "What is a resume headline for freshers?" },
      { t: "p", text: "A resume headline for freshers is a single line, usually 8 to 15 words, that names your degree or target role, two or three skills, and one proof point such as a project, internship or CGPA. It sits under your name on the resume and in the Resume Headline field on Naukri. Think of it as a label for the whole page." },
      { t: "p", text: "During placement season one recruiter may go through a long pile of resumes for the same role. A good headline lets them place you quickly: CSE fresher, backend, has built something that runs. A weak one, such as \"Hardworking fresher seeking opportunities\", tells them nothing they did not already know." },

      { t: "h2", text: "Resume headline vs summary vs objective" },
      { t: "p", text: "The headline is one line that says who you are. The summary is two to four lines that say what you can do and give proof. The objective is one or two lines that say what role you want and what you bring to it. A fresher uses a headline plus either a summary or an objective, never all three. For objective examples by degree, see [career objective for freshers](/blog/career-objective-for-freshers)." },
      { t: "ul", items: [
        "Headline: B.Tech CSE Fresher | Java, Spring Boot, MySQL | Built a canteen ordering app used across campus",
        "Summary: B.Tech CSE (2026, CGPA 8.4) with a 3-month backend internship at a Pune fintech startup. Built and tested REST APIs in Spring Boot and fixed 20+ bugs in a live payments module.",
        "Objective: Looking for an entry-level backend developer role where I can build and test Java APIs from the first sprint, using what I learned in a 3-month fintech internship.",
      ] },
      { t: "p", text: "The headline and the next block should not repeat each other. If the headline says Java and Spring Boot, the summary can spend its words on the internship and the result. For wording ideas, see these [resume summary examples](/blog/resume-summary-examples)." },

      { t: "h2", text: "How long should a resume headline be?" },
      { t: "p", text: "Keep a resume headline to one line on the page: roughly 8 to 15 words, or under about 100 characters. If it wraps to a second line it has turned into a summary. On Naukri the Resume Headline field takes more text, but a recruiter scanning a list reads the opening words first, so the same one-line version works there too." },
      { t: "p", text: "Short does not mean vague. \"B.Com Fresher | Tally, GST\" is short and specific. \"Fresher\" alone is short and useless." },

      { t: "h2", text: "How to write a resume headline as a fresher" },
      { t: "p", text: "Use this formula: target role or degree, then two or three skills from the job ad, then one proof point. Separate the parts with a vertical bar or commas. Write it in title case or sentence case, never in full capitals, and leave out \"I\" and full sentences." },
      { t: "ol", items: [
        "Start with who you are in the employer's words. \"B.Tech CSE Fresher\" or \"Graduate Engineer Trainee, Production\" beats \"Motivated student\".",
        "Add two or three hard skills that appear in the job ad. Tools and methods only: SQL, AutoCAD, Tally Prime, GST returns, Figma, Selenium.",
        "Add one proof point. A project with a number, an internship, a certification, a competition rank, or a CGPA if it is above about 8.",
        "Cut every word that would fit any candidate: hardworking, passionate, dynamic, dedicated, result-oriented.",
        "Read it aloud. If a friend could not guess the job you want from the first four words, rewrite the start.",
      ] },
      { t: "p", text: "A quick way to draft it: say \"I am a [role] who knows [skills] and has [proof]\" in your head, then strip it down to fragments. \"I am a data analyst fresher who knows SQL and Power BI and built a sales dashboard\" becomes \"Data Analyst Fresher | SQL, Power BI | Built a sales dashboard on 50,000 rows of retail data\"." },

      { t: "h2", text: "Where does the resume headline go?" },
      { t: "p", text: "On your resume the headline goes directly under your name, above or beside your contact details. On Naukri it goes in the Resume Headline field of your profile, which is among the first things shown when your profile comes up in a recruiter search. Use the same core line in both places so your profile and your PDF tell one story." },
      { t: "ul", items: [
        "Resume: one line under your name. The [Fresher template](/resume-templates/fresher) has a headline line in that spot, with education and projects placed above work.",
        "Naukri: open your profile and edit Resume Headline. Write the role first, since that is what a recruiter searched for.",
        "College placement portal: if the form has a one-line profile or tagline field, paste the same headline.",
        "LinkedIn: the headline there has more room and different conventions. See [LinkedIn headline examples](/blog/linkedin-headline-examples) before you copy the resume line across.",
      ] },

      { t: "h2", text: "Resume headline examples for B.Tech CSE and IT freshers" },
      { t: "p", text: "For software roles, lead with the stack the job ad names and prove it with something deployed or measurable. A GitHub link belongs in the contact line, not the headline." },
      { t: "ol", items: [
        "B.Tech CSE Fresher (2026) | Java, Spring Boot, MySQL | Built a REST API for a campus canteen ordering app",
        "Aspiring Frontend Developer | React, TypeScript, Tailwind | 3 live projects deployed on Vercel",
        "Final-Year B.Tech IT Student | Python, Django, PostgreSQL | 2-month backend internship at a Bengaluru SaaS startup",
        "Software Engineer Fresher | C++, data structures, 450+ LeetCode problems solved | CGPA 8.6",
        "Android Developer Fresher | Kotlin, Jetpack Compose, Firebase | Expense tracker app published on the Play Store",
        "Cloud and DevOps Fresher | AWS Cloud Practitioner certified | Docker, GitHub Actions, Linux shell scripting",
      ] },

      { t: "h2", text: "Resume headline examples for ECE, EEE, mechanical and civil freshers" },
      { t: "p", text: "Core engineering headlines work best when they name the software you trained on and the place you applied it: a plant, a site, a lab or a student team." },
      { t: "ol", items: [
        "ECE Fresher | Embedded C, Arduino, STM32 | Final-year project: IoT soil-moisture monitor for drip irrigation",
        "VLSI Design Fresher | Verilog, Xilinx Vivado, digital design | M.Tech project on a low-power 16-bit adder",
        "B.Tech EEE Graduate | MATLAB, PLC basics, AutoCAD Electrical | 6-week training at a 220 kV substation",
        "Mechanical Engineering Fresher | SolidWorks, AutoCAD, GD&T | Suspension lead on the college BAJA SAEINDIA team",
        "Graduate Engineer Trainee, Production | 5S, Kaizen basics, MS Excel | Summer training at an auto-components plant in Chennai",
        "Civil Engineering Fresher | AutoCAD, STAAD.Pro, quantity estimation | Site internship on a G+4 residential building",
      ] },

      { t: "h2", text: "Resume headline examples for BCA and MCA freshers" },
      { t: "p", text: "BCA and MCA freshers compete with B.Tech graduates for the same roles, so the proof point matters more. Name a project someone actually used, or an internship." },
      { t: "ol", items: [
        "BCA Fresher | PHP, Laravel, MySQL | Built the library management system my college now uses",
        "MCA Graduate (2026) | Java, Spring, Angular | 6-month internship building internal dashboards for a logistics firm",
        "Technical Support Fresher, BCA | Windows, networking basics, CCNA trained | Clear written and spoken English",
        "Junior QA Tester, MCA Fresher | Manual testing, Selenium, JIRA | ISTQB Foundation Level certified",
      ] },

      { t: "h2", text: "Resume headline examples for B.Com, BBA and MBA freshers" },
      { t: "p", text: "Commerce and management headlines should name the software and the regulation you know. For accounts roles that means Tally, GST and TDS. For MBA roles, name your specialisation and the summer project." },
      { t: "ol", items: [
        "B.Com Fresher | Tally Prime, GST returns, MS Excel | 3-month internship at a CA firm handling 30+ client ledgers",
        "Accounts Executive Fresher | B.Com (Hons), 78% | Tally, TDS basics, bank reconciliation",
        "BBA Graduate | Sales and Business Development | Raised ₹1.8 lakh in sponsorship for the college fest",
        "MBA Finance Fresher | Financial modelling, Excel, Power BI | Summer internship in credit analysis at an NBFC",
        "MBA Marketing Fresher | Market research, Google Analytics | Live project on pricing for a Jaipur snack brand",
      ] },
      { t: "p", text: "To see a full page built around a headline like these, look at the [commerce graduate resume example](/resume-examples/commerce-graduate)." },

      { t: "h2", text: "Resume headline examples for BSc and data analyst freshers" },
      { t: "p", text: "Data roles reward a headline with a dataset size, a tool and a finished output. \"Knows Python\" is weaker than a dashboard someone could open." },
      { t: "ol", items: [
        "Data Analyst Fresher | SQL, Excel, Power BI | Built a sales dashboard on 50,000 rows of retail data",
        "BSc Statistics Graduate | R, Python, hypothesis testing | Dissertation on rainfall and crop yield in Maharashtra",
        "BSc Computer Science Fresher | Python, Pandas, Matplotlib | Google Data Analytics Certificate",
        "Junior Data Scientist, M.Sc Mathematics | scikit-learn, NLP basics | Top 10% in a Kaggle playground competition",
      ] },

      { t: "h2", text: "Resume headline examples for design freshers" },
      { t: "p", text: "Design headlines point to the portfolio. Name one case study in the headline and put the portfolio link in your contact line." },
      { t: "ol", items: [
        "UI/UX Design Fresher | Figma, user research, wireframing | Case study: redesigned a college fee-payment flow",
        "Graphic Designer, B.Des Fresher | Illustrator, Photoshop, InDesign | Branding for 3 college events",
        "Junior Motion Designer | After Effects, Premiere Pro | 40+ reels made for a local café's Instagram",
      ] },

      { t: "h2", text: "Resume headline examples for HR freshers" },
      { t: "p", text: "HR headlines should say which side of HR you want, recruitment or operations, because the skills differ." },
      { t: "ol", items: [
        "MBA HR Fresher | Recruitment, onboarding, HRMS basics | Screened 200+ applications during a staffing-firm internship",
        "HR Recruiter Fresher | Sourcing on Naukri and LinkedIn, interview scheduling | BBA, fluent in Hindi and English",
        "HR Operations Fresher | Payroll basics, PF and ESI, Excel VLOOKUP | 2-month internship at a manufacturing unit",
      ] },

      { t: "h2", text: "Resume headline examples for marketing freshers" },
      { t: "p", text: "Marketing freshers can show results from a college club, a family business or a personal account. Any real number beats a list of platforms." },
      { t: "ol", items: [
        "Digital Marketing Fresher | SEO, Google Ads, Meta Ads | Grew a college club page from 400 to 2,100 followers",
        "Content Writer Fresher | SEO writing, WordPress | 25 published articles on a consumer tech blog",
        "Social Media Executive Fresher | Canva, Instagram Reels, content calendars | Google Ads Search certified",
      ] },

      { t: "h2", text: "Resume headline examples for nursing and pharma freshers" },
      { t: "p", text: "Healthcare headlines should lead with the registration or certification the employer checks first, then the clinical or industrial exposure." },
      { t: "ol", items: [
        "B.Sc Nursing Fresher | Registered with the State Nursing Council | Clinical rotations in ICU, paediatrics and OT",
        "GNM Staff Nurse Fresher | BLS certified | 6-month internship at a 300-bed multispeciality hospital",
        "B.Pharm Fresher | QC, HPLC, GMP documentation | Industrial training at a tablet manufacturing unit in Baddi",
        "Medical Representative Fresher, B.Pharm | Cardio and diabetes product training | Fluent in Telugu, Hindi and English",
        "Clinical Research Fresher, M.Pharm | ICH-GCP certified | Dissertation on drug interactions in hypertension",
      ] },
      { t: "p", text: "Swap every number, place and tool for your own. A headline with a borrowed figure falls apart at the first interview question about it." },

      { t: "h2", text: "Weak vs strong resume headline examples" },
      { t: "p", text: "A weak headline describes a personality or a wish. A strong one names a role, a skill set and a proof point. Here are common fresher headlines and how to rewrite them using the same person's real material." },
      { t: "ul", items: [
        "Weak: Hardworking and dedicated fresher looking for a job. Strong: B.Com Fresher | Tally Prime, GST filing | 3-month internship at a CA firm in Indore",
        "Weak: Passionate about coding. Strong: Java Developer Fresher | Spring Boot, MySQL | Built a bus-pass booking app used in my college",
        "Weak: MBA graduate seeking a challenging role in a reputed organisation. Strong: MBA Marketing Fresher | Market research, Google Analytics | Live pricing project for a D2C snack brand",
        "Weak: Engineering graduate with good communication skills. Strong: Civil Engineering Fresher | AutoCAD, STAAD.Pro | Site internship on a G+4 residential building",
        "Weak: Fresher | Python | Java | C | C++ | HTML | CSS | SQL. Strong: Python Developer Fresher | Django, PostgreSQL | Face-recognition attendance system as final-year project",
        "Weak: Looking for an opportunity to learn and grow. Strong: Data Analyst Fresher | SQL, Power BI | Dashboard on 50,000 rows of retail sales data",
      ] },

      { t: "h2", text: "Common resume headline mistakes freshers make" },
      { t: "p", text: "Most weak headlines fail in one of six ways. Check yours against this list before you send the resume or save your Naukri profile." },
      { t: "ul", items: [
        "Writing a full sentence with \"I\" in it. That is an objective, and it belongs in the next block.",
        "Listing every language you touched in second year. Pick the two or three the job asks for.",
        "Writing only the degree, such as \"B.Tech Graduate\", with no branch or target role.",
        "Using words you cannot back in an interview, such as \"expert\" or \"proficient in all MS Office tools\".",
        "Writing it in capitals. It reads as shouting and is harder to scan.",
        "Keeping one headline for every application, even when the roles are different.",
      ] },
      { t: "tip", text: "Stuck on wording? The free [headline writer](/tools/headline-writer) asks four questions and gives you six headlines in different shapes. Pick one, then edit it so it carries one real number from your own work." },

      { t: "h2", text: "Should you change your resume headline for each job?" },
      { t: "p", text: "Yes. Change the role and the skills to match each job ad, and keep the proof point if it still fits. A Data Analyst application and a Python Developer application can share a project but should lead with different words. On Naukri, where one headline serves every search, use the role you apply for most often." },
      { t: "ol", items: [
        "Copy the job title from the ad if it honestly describes you. \"Graduate Engineer Trainee\" and \"Junior Software Engineer\" are searched differently.",
        "Find the two skills the ad repeats or lists first, and put the ones you can prove in the headline.",
        "Choose the proof point closest to the job. A finance internship beats a hackathon win for an accounts role.",
        "Run the finished resume and the job ad through the free [ATS checker](/tools/ats-checker) to see which of the ad's keywords are still missing.",
      ] },
      { t: "p", text: "Once the headline is set, the rest of the page follows the [resume format for freshers](/blog/resume-format-for-freshers): education and projects first, then any internships, then skills." },
    ],
    faq: [
      { q: "What is a good resume headline for a fresher?", a: "One line that names your degree or target role, two or three skills from the job ad, and one proof point. For example: B.Tech CSE Fresher | Java, Spring Boot, MySQL | Built a REST API for a campus ordering app." },
      { q: "What is the difference between a resume headline and a resume summary?", a: "The headline is one line that labels you. The summary is two to four lines that explain what you can do and give proof. Use the headline under your name and the summary below it, without repeating the same words." },
      { q: "How do I write a resume headline on Naukri as a fresher?", a: "Edit the Resume Headline field in your Naukri profile. Start with the role you want, add your main skills and one proof point such as an internship or project. Use the same core line as your resume so the two match." },
      { q: "Should I put my CGPA in my resume headline?", a: "Only if it is strong, roughly 8 or above, and you have no better proof point. A project, internship or certification usually says more about what you can do." },
      { q: "How many words should a resume headline have?", a: "About 8 to 15 words, short enough to fit on one line under your name. If it wraps to two lines, cut it down or move the extra detail to your summary." },
      { q: "Is it okay to write Fresher in my resume headline?", a: "Yes. Recruiters searching for entry-level candidates often use the word, so \"Data Analyst Fresher\" is clear. Just do not let Fresher be the only word; pair it with a role and skills." },
    ],
  },
  {
    slug: "career-objective-for-freshers",
    title: "Career objective for freshers: a 3-part formula and 28 examples",
    seoTitle: "Career objective for freshers: 28 examples",
    description: "Career objective for freshers that recruiters will read: when to use one, a 3-part formula, 28 examples by degree, the mistakes, and how to tailor it.",
    ogTitle: "28 career objective examples for freshers, by degree",
    ogDescription: "Skip \"seeking a challenging position\". A 3-part formula for a two-line objective, with examples for engineering, commerce, MBA, nursing and career changers.",
    query: "career objective for freshers",
    category: "Resume",
    published: "2026-11-05",
    tool: "resume-builder",
    toolPitch: "Write your objective in the free resume builder, pick a free template and download the PDF.",
    body: [
      { t: "p", text: "A career objective is one or two lines at the top of a resume that say what role you want and what you bring to it. Most objectives are generic, so the section has a poor reputation. A specific one still works, especially for freshers and career changers. Below: when to use one, a 3-part formula, 28 examples by degree, the mistakes to avoid, and how to tailor it for each job." },

      { t: "h2", text: "What is a career objective for freshers?" },
      { t: "p", text: "A career objective for freshers is a two-line statement under your name that names the role you are applying for, the skills or training you bring, and what you will do for the employer. It replaces work history as the first thing a reader sees, so it should be as specific as a job title. Aim for 25 to 45 words." },
      { t: "p", text: "A good objective answers the reader's first question, which is what this person is applying for and whether they can do it. A bad one answers a question nobody asked, such as what you hope to gain from the company." },

      { t: "h2", text: "Career objective vs resume summary: which should a fresher use?" },
      { t: "p", text: "Use a summary when you have a matching internship or strong projects that speak for themselves. Use an objective when the job you want is not obvious from the rest of the page, for example when your degree points elsewhere or you are changing careers. Most freshers do best with a hybrid: target role first, then proof. Either way, the line above it should be a [resume headline](/blog/resume-headline-for-freshers)." },
      { t: "p", text: "An objective makes sense when:" },
      { t: "ul", items: [
        "Your degree does not point at the job, such as a B.Sc Physics graduate applying for data analyst roles.",
        "You are changing careers and your past job titles point the wrong way. The [career change resume](/blog/career-change-resume) guide covers the rest of that page.",
        "You are applying to a graduate trainee scheme, a walk-in drive or a campus placement form that asks for an objective.",
        "You are returning after a career break and want to state the role you are aiming for now.",
      ] },
      { t: "p", text: "A summary is the better choice when you already have an internship or project in the same field as the job. In that case lead with the proof, as in these [resume summary examples](/blog/resume-summary-examples). The formula below works for both, because a modern objective is close to a short summary with the target role up front." },

      { t: "h2", text: "How to write a career objective: a 3-part formula" },
      { t: "p", text: "Write the role you want, then what you bring, then what you will do for the employer. Keep it to two sentences and 25 to 45 words. Take the role title and skills from the job ad, and the proof from your own projects, internships or training." },
      { t: "ol", items: [
        "The role, and the kind of employer if it helps. \"Entry-level backend developer role at a product company\" is better than \"a job in IT\".",
        "What you bring: two specific skills plus one proof point. A project, an internship, a certification, or a CGPA if it is strong.",
        "What you will do for them. Describe the work you are ready to take on, such as writing test cases or preparing GST returns, rather than what you want to learn.",
      ] },
      { t: "p", text: "Built step by step, it looks like this. Role: \"B.Com graduate seeking an accounts executive role in a CA firm.\" What you bring: \"Hands-on with Tally Prime, GST returns and bank reconciliation from a 3-month internship.\" What you will do: \"Ready to take over monthly bookkeeping for small-business clients.\" Joined up, that is 33 words and tells the reader everything they need to keep reading." },
      { t: "tip", text: "Write the objective last. Once your education, projects and internships are on the page, you can pick the strongest proof point instead of guessing at the start." },

      { t: "h2", text: "Career objective examples for engineering freshers" },
      { t: "p", text: "Engineering objectives work when they name the branch, the tools and one thing you built or trained on. Change the numbers and places to your own." },
      { t: "ol", items: [
        "B.Tech CSE graduate (2026, CGPA 8.2) looking for a Java backend developer role. Built REST APIs in Spring Boot for a college event-registration system used by 1,200 students, and ready to write tested services for a product team from the first sprint.",
        "Entry-level software tester with a B.Tech in IT and an ISTQB Foundation certificate, aiming for a QA role in fintech or e-commerce. Ready to write test cases, log defects in JIRA and automate regression checks with Selenium.",
        "ECE fresher seeking a graduate engineer trainee role in embedded systems. Final-year project used an STM32 board to monitor transformer temperature over LoRa, and I want to work on firmware and hardware testing for consumer electronics.",
        "Mechanical engineering graduate looking for a GET role in production or quality at an automotive plant. Trained in SolidWorks and GD&T with 8 weeks of shop-floor training on a CNC line, and ready to work rotating shifts.",
        "Civil engineering fresher aiming for a site engineer role on residential or road projects. Can prepare bar bending schedules and quantity estimates in Excel and AutoCAD, learned on a 3-month site internship with a Lucknow builder.",
        "B.Tech EEE graduate seeking a trainee role in power distribution or solar EPC. Designed a rooftop solar layout for my college hostel as a final-year project, and ready for site travel across the state.",
      ] },

      { t: "h2", text: "Career objective examples for BCA, MCA and B.Sc freshers" },
      { t: "p", text: "These degrees are broad, so the objective has to narrow you down to one role and show the self-study that supports it." },
      { t: "ol", items: [
        "BCA graduate looking for a junior web developer role at a digital agency. Built 4 sites in HTML, CSS, JavaScript and PHP, including a booking page for a family-run guest house, and ready to ship fast, mobile-first pages for client projects.",
        "MCA fresher seeking a .NET developer role. Comfortable with C#, ASP.NET Core and SQL Server from a 6-month internship building an inventory module, and ready to take on bug fixes and features in an existing codebase.",
        "B.Sc Physics graduate moving into data analysis. Learned SQL and Power BI and built a dashboard on Delhi air-quality data; looking for a junior analyst role preparing weekly reports from raw data.",
        "B.Sc Statistics fresher looking for an analyst role in market research or insurance. Skilled in R, Excel and survey design from a 120-respondent college survey project, and ready to clean, analyse and present survey results.",
      ] },

      { t: "h2", text: "Career objective examples for B.Com, BBA and MBA freshers" },
      { t: "p", text: "Commerce and management objectives should name the software, the regulation or the specialisation, plus the internship or live project that proves it." },
      { t: "ol", items: [
        "B.Com graduate seeking an accounts executive role in a CA firm or mid-size company. Hands-on with Tally Prime, GST returns and bank reconciliation from a 3-month internship, and ready to take over monthly bookkeeping for small-business clients.",
        "B.Com fresher aiming for a banking operations or customer service role. Comfortable with Excel and handling customers from 6 months part-time at a mobile store, and fluent in Marathi, Hindi and English.",
        "BBA graduate looking for a business development associate role at an edtech or SaaS company. Raised ₹1.5 lakh in sponsorship for our college fest, and comfortable with cold calls, CRM updates and follow-ups.",
        "MBA Finance fresher seeking a credit or financial analyst role at a bank or NBFC. Built a three-statement model for a listed FMCG company during my summer internship, and can read balance sheets and credit bureau reports.",
        "MBA Marketing graduate aiming for a brand or product marketing trainee role in FMCG or D2C. Ran a live pricing project for a Jaipur snack brand, and ready to run surveys, analyse them in Excel and present the findings.",
        "MBA Operations fresher looking for a supply chain trainee role. Summer internship mapped dispatch delays at a Nashik warehouse and cut average truck loading time by 20 minutes; ready to work on planning and vendor coordination.",
      ] },

      { t: "h2", text: "Career objective examples for design, marketing and HR freshers" },
      { t: "p", text: "For creative and people roles, point at work someone can look at: a case study, a page you grew, or applications you screened." },
      { t: "ol", items: [
        "UI/UX design fresher looking for a junior product designer role. Portfolio includes a redesign of my college's fee-payment flow, tested with 8 students and built in Figma with a small component library.",
        "B.Des graduate seeking a junior graphic designer role at an agency. Skilled in Illustrator, Photoshop and InDesign, designed identities for 3 college events, and ready to turn briefs into social and print work on tight deadlines.",
        "Digital marketing fresher aiming for an SEO or performance marketing executive role. Google Ads certified, grew a college club's Instagram from 400 to 2,100 followers, and comfortable reading GA4 reports.",
        "Content writer fresher seeking a role on a SaaS or fintech blog. Published 25 articles on a consumer tech blog and comfortable working from keyword briefs in WordPress.",
        "MBA HR fresher looking for a recruiter or HR generalist role. Screened 200+ CVs and scheduled interviews during an internship at a staffing firm, and familiar with PF, ESI and payroll basics.",
      ] },

      { t: "h2", text: "Career objective examples for nursing and pharmacy freshers" },
      { t: "p", text: "Healthcare employers check registration and certification first, so put them in the first sentence." },
      { t: "ol", items: [
        "B.Sc Nursing graduate registered with the State Nursing Council, seeking a staff nurse role in a multispeciality hospital. Completed clinical rotations in ICU, paediatrics and OT, and hold a current BLS certificate.",
        "B.Pharm fresher looking for a quality control role in a pharma manufacturing unit. Trained on HPLC and GMP documentation during industrial training, and ready to work in shifts.",
        "M.Pharm graduate seeking a clinical research associate role. ICH-GCP certified, with a dissertation on drug interactions in hypertension patients, and ready to support site monitoring and case report form review.",
      ] },

      { t: "h2", text: "Career objective examples for career changers" },
      { t: "p", text: "A career changer's objective has one extra job: explain the switch in a clause, then show the bridge, such as a course, a side project or overlapping work." },
      { t: "ol", items: [
        "Customer support executive with 2 years at a telecom BPO, moving into software testing. Completed a manual and Selenium testing course and logged 60 bugs on public test platforms; looking for a junior QA role.",
        "Mechanical engineer with 3 years in production, moving into data analysis. Built Excel and Power BI reports on line downtime at my current plant, and looking for a junior analyst role in manufacturing analytics.",
        "Teacher with 4 years of CBSE classroom experience moving into instructional design for edtech. Built 30 lesson units and a Google Classroom course for 120 students, and ready to design self-paced modules.",
        "Returning to work after a two-year career break, seeking an accounts assistant role. B.Com with 3 years of prior accounts experience, refreshed on Tally Prime and GST this year.",
      ] },

      { t: "h2", text: "Career objective mistakes to avoid" },
      { t: "p", text: "The most common mistake is the generic line, \"Seeking a challenging position in a reputed organisation where I can utilise my skills for the growth of the company.\" It names no role, no skill and no proof, and it would fit every candidate in the pile. Most other mistakes are versions of the same problem." },
      { t: "ul", items: [
        "Talking about what you want, such as learning opportunities or growth, instead of what you offer.",
        "Not naming a role. \"A job in the IT sector\" covers thousands of positions.",
        "Filling it with traits: hardworking, dynamic, quick learner, team player. Show them in your projects instead.",
        "Running to four or five lines. Past two sentences it stops being read.",
        "Leaving another company's name in after copying from an earlier application.",
        "Claiming skills you cannot discuss in an interview. If you write Power BI, expect a question on it.",
      ] },
      { t: "p", text: "Here is the generic line rewritten for a real candidate. Before: \"Seeking a challenging position in a reputed organisation to utilise my skills.\" After: \"BBA graduate seeking an inside sales role at a SaaS company. Raised ₹1.5 lakh in fest sponsorships through cold calls and follow-ups, and ready to work a daily call target from week one.\"" },

      { t: "h2", text: "How to tailor your career objective to a job ad" },
      { t: "p", text: "Change three things for each application: the role title, the two skills, and the employer type. Take all three from the job ad itself. Keep your proof point unless another one fits the ad better. It takes a couple of minutes per application and makes the objective read as written for that job." },
      { t: "ol", items: [
        "Copy the exact job title from the ad, as long as it honestly describes you.",
        "List the skills the ad mentions first or more than once. Choose the two you can prove.",
        "Pick the project, internship or certificate closest to the job and put it in the second sentence.",
        "Name the work you are ready to do, using a task from the ad's responsibilities list.",
        "Check the company name, the length, and that no line from an older version survived.",
      ] },
      { t: "p", text: "The same tailoring applies to the rest of your resume. The guide on [how to tailor your resume to a job description](/blog/how-to-tailor-resume-to-job-description) covers bullets and skills, and the free [ATS checker](/tools/ats-checker) shows which keywords from the ad are still missing." },
      { t: "tip", text: "If you have a matching internship or project, try turning your objective into a short summary instead. The free [resume summary generator](/tools/resume-summary-generator) drafts a few versions from your details, which you can then edit." },

      { t: "h2", text: "Where does the career objective go on a fresher resume?" },
      { t: "p", text: "The career objective goes directly under your name and contact details, above education. Label it Career Objective, Objective or Profile, and use only one of these blocks. On Naukri, the closest place is the Profile Summary field, which can hold a slightly longer version." },
      { t: "p", text: "Below the objective, follow the [resume format for freshers](/blog/resume-format-for-freshers): education, projects, internships, skills, then certifications. The [Campus template](/resume-templates/campus) is laid out for students and recent graduates in that order." },
    ],
    faq: [
      { q: "What is a good career objective for freshers?", a: "Two sentences that name the role you want, two skills plus one proof point such as a project or internship, and the work you are ready to do. For example: B.Com graduate seeking an accounts executive role. Hands-on with Tally Prime and GST returns from a 3-month CA firm internship." },
      { q: "Is a career objective still needed on a resume?", a: "Not always. Use one when your target role is not obvious from your degree or history, such as a fresher applying outside their field or a career changer. If you already have a matching internship or project, a short summary does the same job." },
      { q: "How long should a career objective be?", a: "Two sentences, roughly 25 to 45 words. Anything longer reads like a paragraph and gets skimmed." },
      { q: "What should I write in career objective as a fresher with no experience?", a: "Use your degree, projects, training or part-time work as the proof. Name the role, name two skills you used in a project or course, and say what work you are ready to take on." },
      { q: "Can I use the same career objective for every job?", a: "Keep the structure the same but change the role title, the skills and the employer type for each job ad. A generic objective that fits every job convinces none of them." },
      { q: "What is the difference between a career objective and a resume summary?", a: "An objective leads with the role you want. A summary leads with what you have already done. For freshers the two often merge into a two-line statement with the target role first and the proof second." },
    ],
  },
]
