import type { PortfolioDocument } from "@/types/dossier"

/** Fictional people (no real data). Dense: every section, 8 jobs, 20 skills. Sparse: one page, one job, no email. */

const jobs = [
  ["Northfield Health", "Programme Lead", "2021 – Present", "Leeds", ["Run a 14-person programme delivering a patient scheduling platform to 9 hospitals.", "Cut average booking time from 11 to 4 minutes.", "Own a 2.4M budget and the quarterly board report."]],
  ["Harbour City Council", "Senior Project Manager", "2017 – 2021", "Bristol", ["Delivered 6 digital services on time and 8% under budget.", "Introduced a risk register the council adopted organisation-wide."]],
  ["Brightwell Consulting", "Business Analyst", "2014 – 2017", "London", ["Mapped and redesigned processes for 12 clients across retail and logistics."]],
  ["Lakeside University", "Research Assistant", "2012 – 2014", "", ["Managed survey data for 3,000 participants in a longitudinal health study."]],
  ["Riverside Library Trust", "Volunteer Coordinator", "2011 – 2012", "", ["Scheduled 40 volunteers across three branches."]],
  ["Copperleaf Retail", "Operations Assistant", "2010 – 2011", "", ["Reconciled weekly stock counts for two stores."]],
  ["Summit Outdoor Centre", "Seasonal Instructor", "2009 – 2010", "", ["Led groups of up to 12 on day courses."]],
  ["Tideway Café", "Barista", "2008 – 2009", "", ["Opened the shop four mornings a week."]],
] as const

export const SAMPLE_RICH: PortfolioDocument = {
  meta: {
    title: "Maya Lindqvist-Featherstonehaugh — Programme Lead",
    description: "Programme lead who turns messy, cross-team problems into calm, measurable delivery.",
  },
  portfolioMeta: { type: "general", tone: "calm, precise", emphasis: ["delivery", "clarity"] },
  sections: [
    {
      id: "maya-hero",
      type: "hero",
      data: { name: "Maya Lindqvist-Featherstonehaugh", title: "Programme Lead", tagline: "I turn messy, cross-team problems into calm, measurable delivery." },
    },
    {
      id: "maya-about",
      type: "about",
      data: {
        body:
          "Ten years leading cross-functional teams in healthcare technology and public services. I like clear scopes, honest timelines and the unglamorous work that keeps a launch from becoming an incident.\n\nI mentor early-career colleagues, run a quarterly reading group, and volunteer as a data-literacy tutor on weekends.",
      },
    },
    {
      id: "maya-highlights",
      type: "highlights",
      data: {
        items: [
          { value: "9", label: "hospitals on the scheduling platform" },
          { value: "4 min", label: "average booking time, down from 11" },
          { value: "2.4M", label: "programme budget owned" },
          { value: "3,000", label: "study participants' data managed" },
        ],
      },
    },
    {
      id: "maya-experience",
      type: "experience",
      data: {
        items: jobs.map(([company, role, duration, location, highlights]) => ({
          company,
          role,
          duration,
          location: location || undefined,
          description: highlights.join(" "),
          highlights: [...highlights],
        })),
      },
    },
    {
      id: "maya-projects",
      type: "projects",
      data: {
        items: [
          { name: "Scheduling Platform Rollout", description: "Phased launch across nine hospitals with zero downtime windows and a clinician training programme.", tech: ["Roadmapping", "Change management", "Dashboards"], link: "northfield.example.com/scheduling" },
          { name: "Council Digital Front Door", description: "A single sign-in and request portal that replaced 23 separate forms and halved call-centre volume.", tech: ["Service design", "Accessibility", "Vendor management"] },
          { name: "Open Risk Register", description: "A one-page template and facilitation guide, now used by 40+ teams and shared as an open resource.", tech: ["Facilitation", "Templates", "Documentation"], link: "https://github.com/example/risk-register" },
          { name: "Data Literacy Evenings", description: "Volunteer evening classes teaching spreadsheet and chart basics to community groups.", tech: ["Teaching", "Curriculum", "Charts"] },
        ],
      },
    },
    {
      id: "maya-skills",
      type: "skills",
      data: {
        items: [
          "Programme management", "Stakeholder alignment", "Budget ownership", "Risk and compliance", "Process design",
          "SQL and dashboards", "Coaching", "Vendor management", "Workshop facilitation", "Technical writing",
          "Agile delivery", "Change management", "Service design", "Accessibility", "Procurement",
          "Board reporting", "Hiring", "Roadmapping", "User research", "Excel",
        ],
      },
    },
    {
      id: "maya-education",
      type: "education",
      data: {
        items: [
          { institution: "University of Leeds", degree: "MSc Health Informatics", period: "2012 – 2013", details: "Dissertation on appointment no-show prediction." },
          { institution: "University of York", degree: "BA Economics", period: "2008 – 2011", details: "" },
        ],
      },
    },
    {
      id: "maya-certifications",
      type: "certifications",
      data: {
        items: [
          { name: "PRINCE2 Practitioner", issuer: "AXELOS", year: "2018" },
          { name: "Managing Successful Programmes", issuer: "AXELOS", year: "2020" },
          { name: "Certified ScrumMaster", issuer: "Scrum Alliance", year: "2016" },
        ],
      },
    },
    {
      id: "maya-contact",
      type: "contact",
      data: {
        email: "maya.lindqvist-featherstonehaugh@example.com",
        phone: "+44 20 7946 0000",
        location: "Leeds, UK",
        links: ["linkedin.com/in/maya-example", "mayalindqvist.example.com", "github.com/maya-example"],
        headline: "Let's work together",
      },
    },
  ],
}

/** Thin one-page resume: one job, three skills, no projects, no email. */
export const SAMPLE_SPARSE: PortfolioDocument = {
  meta: { title: "Jonah Reyes — Recent Graduate", description: "Recent graduate looking for a first role." },
  portfolioMeta: { type: "student", tone: "friendly", emphasis: ["learning"] },
  sections: [
    { id: "jonah-hero", type: "hero", data: { name: "Jonah Reyes", title: "Recent Graduate", tagline: "Curious, careful and quick to learn." } },
    {
      id: "jonah-about",
      type: "about",
      data: { body: "Recent business graduate with a part-time retail background. Looking for a first full-time role in operations or customer success." },
    },
    { id: "jonah-skills", type: "skills", data: { items: ["Excel", "Customer service", "Teamwork"] } },
    {
      id: "jonah-experience",
      type: "experience",
      data: { items: [{ company: "Corner Books", role: "Sales Assistant", duration: "2023 – 2024", description: "Helped customers find titles, managed the weekend till and tidied the stockroom." }] },
    },
    {
      id: "jonah-education",
      type: "education",
      data: { items: [{ institution: "Riverside College", degree: "BA Business Management", period: "2021 – 2024", details: "" }] },
    },
    { id: "jonah-contact", type: "contact", data: { email: "", phone: "+1 555 0100", links: ["linkedin.com/in/jonah-example"], headline: "Contact" } },
  ],
}
