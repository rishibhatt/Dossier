/**
 * Programmatic SEO data: one entry becomes one page at /resume-keywords/[role].
 * Every entry carries its own keywords, verbs, example bullets and mistakes, so no two pages share body text.
 * Keywords reflect wording that recurs in public job posts for the role. Treat them as a starting list, not a rule.
 */
export type Role = {
  slug: string
  title: string
  /** One sentence on what separates a strong resume for this role. Unique per role. */
  angle: string
  skills: string[]
  tools: string[]
  verbs: string[]
  bullets: string[]
  mistakes: string[]
  related: string[]
}

export const ROLES: readonly Role[] = [
  {
    slug: "software-engineer",
    title: "Software Engineer",
    angle: "Hiring teams scan for the stack first, then for proof that you shipped something people used.",
    skills: ["data structures", "system design", "REST API", "unit testing", "CI/CD", "code review", "microservices", "agile"],
    tools: ["JavaScript", "TypeScript", "Python", "Java", "SQL", "Docker", "AWS", "Git"],
    verbs: ["built", "shipped", "migrated", "optimized", "refactored", "automated"],
    bullets: [
      "Built a REST API in Node.js serving 40 clients, with p95 latency under 120 ms.",
      "Migrated a monolith's billing module to a separate service, cutting deploy time from 45 minutes to 8.",
      "Wrote unit and integration tests that took coverage on the checkout flow from 31% to 82%.",
    ],
    mistakes: ["Listing every language you have touched. Group by what you use daily and what you have shipped in.", "Describing the team's work as \"we\" with no line that says what you did."],
    related: ["frontend-developer", "data-analyst", "devops-engineer"],
  },
  {
    slug: "frontend-developer",
    title: "Frontend Developer",
    angle: "The best resumes tie each framework to a user-facing result: speed, accessibility or conversion.",
    skills: ["responsive design", "accessibility", "web performance", "state management", "component library", "cross-browser testing", "design systems"],
    tools: ["React", "Next.js", "TypeScript", "CSS", "Tailwind", "Jest", "Figma", "GraphQL"],
    verbs: ["built", "redesigned", "optimized", "improved", "implemented", "reduced"],
    bullets: [
      "Rebuilt the product page in Next.js and cut Largest Contentful Paint from 4.1 s to 1.9 s.",
      "Fixed 60 accessibility issues flagged by an audit and brought the app to WCAG 2.1 AA.",
      "Built a React component library used by 5 teams, replacing 3 duplicated button and form sets.",
    ],
    mistakes: ["Writing \"pixel-perfect\" with no result beside it.", "Leaving out a link to a live site or repository, which is the strongest proof you can give."],
    related: ["software-engineer", "ux-designer", "data-analyst"],
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    angle: "Recruiters look for a question you answered, the method you used and what the business did with it.",
    skills: ["data analysis", "data visualization", "A/B testing", "statistics", "ETL", "dashboarding", "stakeholder management", "forecasting"],
    tools: ["SQL", "Python", "Excel", "Tableau", "Power BI", "Looker", "pandas", "dbt"],
    verbs: ["analyzed", "forecasted", "automated", "identified", "built", "presented"],
    bullets: [
      "Wrote SQL models that cut the weekly sales report from 3 hours to 20 minutes.",
      "Analyzed 14 months of churn data and found that 62% of cancellations came in the first 30 days, which led to a new onboarding email series.",
      "Built a Tableau dashboard used by 25 managers to track pipeline against forecast.",
    ],
    mistakes: ["Listing tools without a single decision they informed.", "Writing \"data-driven\" as a trait. Show one decision instead."],
    related: ["software-engineer", "product-manager", "digital-marketer"],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    angle: "Strong resumes show a problem, a call you made with incomplete information, and the metric that moved.",
    skills: ["product roadmap", "stakeholder management", "user research", "prioritization", "A/B testing", "go-to-market", "OKRs", "agile"],
    tools: ["Jira", "Figma", "SQL", "Amplitude", "Mixpanel", "Confluence", "Notion"],
    verbs: ["launched", "prioritized", "defined", "led", "validated", "grew"],
    bullets: [
      "Launched self-serve onboarding for 3,000 accounts and lifted week-one activation from 34% to 47%.",
      "Cut a 12-item roadmap to 4 after interviewing 18 customers, and shipped all 4 in one quarter.",
      "Ran an A/B test on the pricing page that raised trial starts by 11%.",
    ],
    mistakes: ["Describing the roadmap and not the outcome.", "Leaving out team size and who you worked with, which is how readers judge scope."],
    related: ["data-analyst", "ux-designer", "project-manager"],
  },
  {
    slug: "ux-designer",
    title: "UX Designer",
    angle: "A link to case studies outweighs any keyword. The resume's job is to make someone click it.",
    skills: ["user research", "wireframing", "prototyping", "usability testing", "information architecture", "design systems", "accessibility", "interaction design"],
    tools: ["Figma", "FigJam", "Maze", "Miro", "Adobe XD", "Notion"],
    verbs: ["designed", "researched", "tested", "redesigned", "prototyped", "simplified"],
    bullets: [
      "Redesigned the booking flow from 7 steps to 4, which raised completed bookings 14%.",
      "Ran 12 usability sessions and turned the findings into a prioritized list the team shipped over two sprints.",
      "Built a Figma component library of 60 components that cut handoff questions from developers.",
    ],
    mistakes: ["Describing process steps with no outcome.", "Putting a portfolio link in the footer. Put it in the header."],
    related: ["frontend-developer", "product-manager", "graphic-designer"],
  },
  {
    slug: "digital-marketer",
    title: "Digital Marketer",
    angle: "Channels and budgets get a resume read. Show spend, the result and what you changed to get it.",
    skills: ["SEO", "content marketing", "email marketing", "paid social", "conversion rate optimization", "marketing analytics", "lead generation", "A/B testing"],
    tools: ["Google Analytics", "Google Ads", "HubSpot", "Semrush", "Mailchimp", "Meta Ads Manager"],
    verbs: ["grew", "launched", "optimized", "ran", "reduced", "increased"],
    bullets: [
      "Grew organic traffic from 8,000 to 31,000 monthly visits in 10 months by rebuilding 40 pages around search intent.",
      "Managed a $15,000 monthly paid budget and cut cost per lead from $48 to $31.",
      "Wrote and ran a 6-email onboarding sequence with a 52% open rate.",
    ],
    mistakes: ["Reporting impressions and clicks when leads or revenue are available.", "Listing every platform you have logged into."],
    related: ["data-analyst", "content-writer", "sales-representative"],
  },
  {
    slug: "content-writer",
    title: "Content Writer",
    angle: "Editors want proof that your writing ranked, converted or got read, plus a few links to the pieces.",
    skills: ["SEO writing", "copywriting", "editing", "content strategy", "keyword research", "brand voice", "research", "long-form"],
    tools: ["WordPress", "Google Docs", "Semrush", "Ahrefs", "Grammarly", "Notion"],
    verbs: ["wrote", "edited", "researched", "published", "planned", "rewrote"],
    bullets: [
      "Wrote 60 articles for a B2B software blog, 9 of which reached page one for their target keyword.",
      "Rewrote 25 product pages, which lifted add-to-cart rate 8%.",
      "Edited a team of 4 freelancers and cut turnaround from 9 days to 5.",
    ],
    mistakes: ["No links to published work.", "\"Excellent communication skills\" in a resume that is itself the sample."],
    related: ["digital-marketer", "graphic-designer", "ux-designer"],
  },
  {
    slug: "project-manager",
    title: "Project Manager",
    angle: "Scope, budget and schedule are the three numbers every hiring manager looks for first.",
    skills: ["project planning", "risk management", "stakeholder management", "budgeting", "scope management", "resource allocation", "agile", "scrum"],
    tools: ["Jira", "Asana", "MS Project", "Smartsheet", "Confluence", "Excel"],
    verbs: ["led", "delivered", "planned", "coordinated", "managed", "reduced"],
    bullets: [
      "Delivered a $1.2M ERP rollout across 4 sites, 2 weeks ahead of schedule and 3% under budget.",
      "Led a team of 14 across engineering, finance and operations through 6 two-week sprints.",
      "Built a risk register that caught 9 issues before launch and avoided an estimated week of rework.",
    ],
    mistakes: ["Listing certifications with no project beside them.", "Writing \"managed projects\" with no size, value or duration."],
    related: ["product-manager", "business-analyst", "operations-manager"],
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    angle: "Show that you turned vague requests into requirements a team could build, and name the result.",
    skills: ["requirements gathering", "process mapping", "user stories", "gap analysis", "stakeholder management", "UAT", "data analysis", "business case"],
    tools: ["SQL", "Excel", "Visio", "Jira", "Confluence", "Power BI", "Tableau"],
    verbs: ["analyzed", "documented", "mapped", "defined", "facilitated", "recommended"],
    bullets: [
      "Gathered requirements from 6 departments and wrote 85 user stories for a new claims portal.",
      "Mapped the order-to-cash process and found 3 manual steps whose removal saved 120 staff hours a month.",
      "Ran UAT with 20 users and logged 47 defects, 45 of which were closed before go-live.",
    ],
    mistakes: ["Describing documents you wrote but not what they led to.", "Skipping the domain (banking, retail, health), which recruiters filter on."],
    related: ["project-manager", "data-analyst", "product-manager"],
  },
  {
    slug: "sales-representative",
    title: "Sales Representative",
    angle: "Quota attainment and deal size lead. Everything else is context.",
    skills: ["lead generation", "cold calling", "pipeline management", "negotiation", "account management", "prospecting", "closing", "forecasting"],
    tools: ["Salesforce", "HubSpot", "LinkedIn Sales Navigator", "Outreach", "Gong", "Excel"],
    verbs: ["closed", "exceeded", "prospected", "negotiated", "grew", "won"],
    bullets: [
      "Closed $640,000 in new business in 2025, 118% of quota, ranking 3rd of 22 reps.",
      "Built a pipeline of 45 accounts through outbound calls and LinkedIn, converting 9 to customers.",
      "Cut average sales cycle from 62 days to 44 by moving pricing talks to the first call.",
    ],
    mistakes: ["Stating a title with no quota or result.", "Percent of quota with no dollar figure beside it."],
    related: ["digital-marketer", "customer-success-manager", "project-manager"],
  },
  {
    slug: "customer-success-manager",
    title: "Customer Success Manager",
    angle: "Retention, expansion and onboarding speed are the numbers that get a call back.",
    skills: ["customer onboarding", "retention", "account management", "churn reduction", "renewals", "upselling", "QBR", "customer health score"],
    tools: ["Salesforce", "Gainsight", "HubSpot", "Zendesk", "Intercom", "Slack"],
    verbs: ["retained", "onboarded", "expanded", "resolved", "renewed", "trained"],
    bullets: [
      "Managed 55 accounts worth $2.1M in annual revenue and kept gross retention at 94%.",
      "Cut onboarding time from 30 days to 18 with a standard checklist and weekly check-ins.",
      "Expanded 11 accounts into a higher plan, adding $180,000 in annual revenue.",
    ],
    mistakes: ["Describing friendliness instead of retention and expansion numbers.", "Skipping book size, which tells the reader your scope."],
    related: ["sales-representative", "project-manager", "business-analyst"],
  },
  {
    slug: "graphic-designer",
    title: "Graphic Designer",
    angle: "The portfolio link does the selling. Use the resume to show scope, clients and speed.",
    skills: ["brand identity", "typography", "layout", "print production", "motion graphics", "social media design", "art direction", "photo editing"],
    tools: ["Photoshop", "Illustrator", "InDesign", "Figma", "After Effects", "Canva"],
    verbs: ["designed", "created", "directed", "produced", "rebranded", "illustrated"],
    bullets: [
      "Designed the brand identity for 14 small-business clients, from logo to launch kit.",
      "Produced about 30 social posts a month for a 90,000-follower account.",
      "Prepared print-ready files for a 120-page catalogue and cut proof rounds from 4 to 2.",
    ],
    mistakes: ["A resume with no portfolio link.", "Skill bars for Adobe tools. Name the work instead."],
    related: ["ux-designer", "content-writer", "digital-marketer"],
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    angle: "Show reliability and speed in numbers: uptime, deploy frequency, recovery time and cost.",
    skills: ["CI/CD", "infrastructure as code", "monitoring", "incident response", "containerization", "cloud security", "automation", "site reliability"],
    tools: ["Kubernetes", "Terraform", "Docker", "AWS", "Jenkins", "GitHub Actions", "Prometheus", "Linux"],
    verbs: ["automated", "deployed", "migrated", "reduced", "monitored", "hardened"],
    bullets: [
      "Moved 22 services to Kubernetes and cut monthly cloud cost by 27%.",
      "Built a CI/CD pipeline in GitHub Actions that took deploys from weekly to several a day.",
      "Wrote Terraform for the full staging environment, so a new one now takes 20 minutes instead of 2 days.",
    ],
    mistakes: ["A tool list with no system you ran.", "Leaving out scale: services, requests, users or nodes."],
    related: ["software-engineer", "data-analyst", "project-manager"],
  },
  {
    slug: "operations-manager",
    title: "Operations Manager",
    angle: "Cost, throughput and team size are the three facts that place you in the right band.",
    skills: ["process improvement", "supply chain", "budgeting", "vendor management", "KPI tracking", "team leadership", "lean", "inventory management"],
    tools: ["Excel", "SAP", "NetSuite", "Power BI", "Slack", "Asana"],
    verbs: ["led", "streamlined", "reduced", "negotiated", "scheduled", "improved"],
    bullets: [
      "Led a team of 28 across two warehouses and raised on-time shipping from 88% to 97%.",
      "Renegotiated 6 vendor contracts, saving $140,000 a year.",
      "Cut order errors 35% by adding a second scan at packing.",
    ],
    mistakes: ["Describing responsibilities in place of improvements.", "Omitting the size of the operation."],
    related: ["project-manager", "business-analyst", "customer-success-manager"],
  },
] as const

export function getRole(slug: string): Role | undefined {
  return ROLES.find((r) => r.slug === slug)
}
