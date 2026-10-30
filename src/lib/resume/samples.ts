import { b, education, experience, sid, skills } from "./sampleKit"
import { SAMPLE_LIBRARY } from "./sampleLibrary"
import { SAMPLE_LIBRARY_2 } from "./sampleLibrary2"
import type { PresetId, ResumeDocument } from "./schema"

/**
 * Synthetic sample resumes. Not real people. Used for "Start from a sample", template previews and the
 * verification fixtures, and always labelled as a sample wherever a visitor can see them.
 */

export type SampleDomain =
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "Marketing and sales"
  | "Design and writing"
  | "Business and operations"
  | "Education and research"
  | "Engineering"
  | "Law and HR"
  | "Hospitality"
  | "Retail and service"
  | "Trades and transport"
  | "Public services"

export type SampleResume = {
  id: string
  label: string
  role: string
  domain: SampleDomain
  stage: "student" | "early" | "mid" | "senior" | "switcher"
  /** The country format the sample is written for (paper, dates, personal details). */
  preset: PresetId
  doc: ResumeDocument
}

const CORE_SAMPLES: SampleResume[] = [
  {
    id: "meera",
    label: "Meera Iyer (sample)",
    role: "Senior Accountant",
    domain: "Finance",
    stage: "mid",
    preset: "in",
    doc: {
      version: 1,
      basics: {
        name: "Meera Iyer",
        headline: "Senior Accountant",
        email: "meera@example.com",
        phone: "+91 98200 00000",
        location: "Pune, India",
        summary:
          "Chartered accountancy inter with seven years in month-end close, GST and audit support for mid-size firms. I close the books faster and catch what does not add up.",
        links: [{ id: sid("l"), label: "LinkedIn", url: "https://linkedin.com/in/meera-sample" }],
      },
      personal: { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" },
      sections: [
        experience([
          {
            role: "Senior Accountant",
            org: "Kulkarni & Rao LLP",
            location: "Pune",
            start: "2021-04",
            current: true,
            bullets: [
              "Close month-end for 14 clients in 4 working days, down from 7.",
              "Prepare GST returns and reconciliations for clients with ₹2–40 crore turnover.",
              "Trained two junior accountants on Tally Prime and the firm's review checklist.",
            ],
          },
          {
            role: "Accounts Executive",
            org: "Orbit Textiles",
            location: "Mumbai",
            start: "2018-06",
            end: "2021-03",
            bullets: [
              "Moved bank reconciliation into Excel macros; payment errors fell by a third.",
              "Handled vendor payments and TDS filings for 120 suppliers.",
            ],
          },
        ]),
        education([
          { school: "Institute of Chartered Accountants of India", degree: "CA Intermediate", start: "2016", end: "2018" },
          { school: "Savitribai Phule Pune University", degree: "B.Com, Accounting", location: "Pune", start: "2013", end: "2016" },
        ]),
        skills([
          ["Accounting", ["Month-end close", "GST filing", "TDS", "Audit support"]],
          ["Tools", ["Tally Prime", "SAP FICO", "Excel (macros, Power Query)"]],
        ]),
      ],
    },
  },
  {
    id: "arjun",
    label: "Arjun Mehta (sample)",
    role: "Computer Science student",
    domain: "Technology",
    stage: "student",
    preset: "in",
    doc: {
      version: 1,
      basics: {
        name: "Arjun Mehta",
        headline: "Software Engineering Intern",
        email: "arjun@example.com",
        phone: "+91 90000 11111",
        location: "Bengaluru, India",
        summary: "",
        links: [{ id: sid("l"), label: "GitHub", url: "https://github.com/arjun-sample" }],
      },
      personal: { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" },
      sections: [
        education([
          {
            school: "RV College of Engineering",
            degree: "B.Tech, Computer Science",
            location: "Bengaluru",
            start: "2022",
            end: "2026",
            bullets: ["CGPA 8.7 / 10. Coursework: distributed systems, databases, compilers."],
          },
        ]),
        experience([
          {
            role: "Software Engineering Intern, Platform",
            org: "Kitebox",
            location: "Bengaluru",
            start: "2025-05",
            end: "2025-07",
            bullets: [
              "Split the CI test suite into parallel shards; runs went from 11 minutes to 4.",
              "Wrote a Go service that caches build artefacts in S3, used by 30 engineers.",
            ],
          },
        ]),
        {
          id: sid("s"),
          type: "projects",
          title: "",
          hidden: false,
          items: [
            {
              id: sid("p"),
              name: "Hostel Mess Tracker",
              role: "Creator",
              link: "https://github.com/arjun-sample/mess",
              linkLabel: "GitHub",
              start: "2024",
              end: "",
              current: false,
              bullets: b("Next.js and Postgres app that 400 students use to rate meals and flag waste."),
            },
          ],
        },
        skills([
          ["Languages", ["TypeScript", "Go", "Python", "SQL"]],
          ["Tools", ["Postgres", "Docker", "GitHub Actions", "Figma"]],
        ]),
      ],
    },
  },
  {
    id: "lena",
    label: "Lena Okafor (sample)",
    role: "Registered Nurse",
    domain: "Healthcare",
    stage: "mid",
    preset: "uk",
    doc: {
      version: 1,
      basics: {
        name: "Lena Okafor",
        headline: "Registered Nurse, Critical Care",
        email: "lena@example.com",
        phone: "+44 7700 900000",
        location: "Leeds, UK",
        summary: "NMC-registered nurse with six years in ICU and high-dependency care. Calm under pressure and careful with handovers.",
        links: [],
      },
      personal: { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" },
      sections: [
        experience([
          {
            role: "Senior Staff Nurse, ICU",
            org: "St. Mary's Hospital",
            location: "Leeds",
            start: "2022-01",
            current: true,
            bullets: [
              "Care for 1–2 ventilated patients per shift in a 24-bed unit.",
              "Led the move to a structured handover sheet; missed handover items fell in the unit audit.",
              "Mentor four newly qualified nurses each year.",
            ],
          },
          {
            role: "Staff Nurse, High Dependency",
            org: "Northgate General",
            location: "York",
            start: "2019-09",
            end: "2021-12",
            bullets: ["Managed post-operative recovery for up to 6 patients per shift."],
          },
        ]),
        education([{ school: "University of Leeds", degree: "BSc (Hons) Adult Nursing", start: "2016", end: "2019" }]),
        {
          id: sid("s"),
          type: "certifications",
          title: "",
          hidden: false,
          items: [
            { id: sid("c"), title: "Advanced Life Support (ALS)", subtitle: "Resuscitation Council UK", date: "2024-03", link: "", linkLabel: "", detail: "" },
            { id: sid("c"), title: "NMC Registration", subtitle: "Nursing and Midwifery Council", date: "2019-09", link: "", linkLabel: "", detail: "" },
          ],
        },
        skills([["Clinical", ["Ventilator care", "Arterial lines", "Sepsis bundles", "Medication management"]]]),
      ],
    },
  },
  {
    id: "sofia",
    label: "Sofia Brandt (sample)",
    role: "Marketing Manager",
    domain: "Marketing and sales",
    stage: "mid",
    preset: "de",
    doc: {
      version: 1,
      basics: {
        name: "Sofia Brandt",
        headline: "Marketing Manager, B2B SaaS",
        email: "sofia@example.com",
        phone: "+49 151 00000000",
        location: "Berlin, Germany",
        summary: "Eight years running demand generation for B2B software. I plan campaigns around pipeline, not clicks.",
        links: [{ id: sid("l"), label: "Website", url: "https://sofia-sample.de" }],
      },
      personal: { dateOfBirth: "", nationality: "German", visaStatus: "", maritalStatus: "", drivingLicence: "Class B" },
      sections: [
        experience([
          {
            role: "Marketing Manager",
            org: "Ledgerly GmbH",
            location: "Berlin",
            start: "2021-02",
            current: true,
            bullets: [
              "Own a €900k annual budget across paid search, events and content.",
              "Rebuilt lead scoring with sales; sales-accepted leads rose from 22% to 41%.",
              "Hired and manage a team of three.",
            ],
          },
          {
            role: "Demand Generation Specialist",
            org: "Cloudnine Software",
            location: "Hamburg",
            start: "2017-05",
            end: "2021-01",
            bullets: ["Ran 40+ webinars; the series produced a fifth of new pipeline in 2020."],
          },
        ]),
        education([{ school: "Universität Hamburg", degree: "M.Sc. Marketing", start: "2015", end: "2017" }]),
        {
          id: sid("s"),
          type: "languages",
          title: "",
          hidden: false,
          items: [
            { id: sid("g"), language: "German", level: "Native" },
            { id: sid("g"), language: "English", level: "C2" },
            { id: sid("g"), language: "Spanish", level: "B1" },
          ],
        },
        skills([
          ["Marketing", ["Demand generation", "ABM", "Lead scoring", "Webinars"]],
          ["Tools", ["HubSpot", "Salesforce", "Google Ads", "Looker Studio"]],
        ]),
      ],
    },
  },
]

/** Every sample: the four core people first (used as verification fixtures since launch), then the library. */
export const SAMPLE_RESUMES: SampleResume[] = [...CORE_SAMPLES, ...SAMPLE_LIBRARY, ...SAMPLE_LIBRARY_2]

/** A fresh resume with the usual sections and nothing filled in. */
export function blankResume(): ResumeDocument {
  return {
    version: 1,
    basics: { name: "", headline: "", email: "", phone: "", location: "", summary: "", links: [] },
    personal: { dateOfBirth: "", nationality: "", visaStatus: "", maritalStatus: "", drivingLicence: "" },
    sections: [
      { id: sid("s"), type: "experience", title: "", hidden: false, items: [] },
      { id: sid("s"), type: "education", title: "", hidden: false, items: [] },
      { id: sid("s"), type: "skills", title: "", hidden: false, items: [] },
    ],
  }
}
