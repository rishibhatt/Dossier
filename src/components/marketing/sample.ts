/**
 * Synthetic demo people used across the marketing site. Not real customers.
 * Every surface that shows this data labels it as a sample.
 */
export type SamplePerson = {
  id: string
  name: string
  role: string
  city: string
  email: string
  bio: string
  jobs: readonly { title: string; org: string; years: string; line: string }[]
  skills: readonly string[]
  credential: string
  /** Template the engine would recommend first for this resume (see lib/design/templates/specs.ts). */
  template: string
}

export const SAMPLE_PERSON: SamplePerson = {
  id: "meera",
  name: "Meera Iyer",
  role: "Senior Accountant",
  city: "Pune",
  email: "meera@example.com",
  bio: "I close the books faster and catch what does not add up.",
  jobs: [
    {
      title: "Senior Accountant",
      org: "Kulkarni & Rao LLP",
      years: "2021 – now",
      line: "Closes month-end for 14 clients in 4 working days.",
    },
    {
      title: "Accounts Executive",
      org: "Orbit Textiles",
      years: "2018 – 2021",
      line: "Moved bank reconciliation into Excel macros. Payment errors fell by a third.",
    },
  ],
  skills: ["Tally Prime", "SAP FICO", "GST filing", "Excel"],
  credential: "CA Inter, 2018",
  template: "ledger",
}

export const SAMPLE_PEOPLE: readonly SamplePerson[] = [
  SAMPLE_PERSON,
  {
    id: "arjun",
    name: "Arjun Mehta",
    role: "Computer Science student",
    city: "Bengaluru",
    email: "arjun@example.com",
    bio: "Final-year student. I build small tools that people in my hostel actually use.",
    jobs: [
      { title: "Intern, Platform team", org: "Kitebox", years: "2025", line: "Cut the test suite from 11 minutes to 4." },
      { title: "Lead", org: "Campus Dev Club", years: "2023 – now", line: "Runs weekly build nights for 60 members." },
    ],
    skills: ["TypeScript", "Go", "Postgres", "Figma"],
    credential: "B.Tech CSE, 2026",
    template: "fresh-start",
  },
  {
    id: "sana",
    name: "Sana Qureshi",
    role: "Primary school teacher",
    city: "Lucknow",
    email: "sana@example.com",
    bio: "Seven years teaching Class 3 to 5. Moving into instructional design.",
    jobs: [
      { title: "Class Teacher", org: "St. Agnes School", years: "2019 – now", line: "Wrote the reading programme now used in four sections." },
      { title: "Teacher", org: "Little Oaks", years: "2017 – 2019", line: "Ran the parent workshop series." },
    ],
    skills: ["Lesson design", "Canva", "Google Classroom", "Hindi, English, Urdu"],
    credential: "B.Ed, 2017",
    template: "chalk",
  },
  {
    id: "dev",
    name: "Dev Raman",
    role: "Freelance product designer",
    city: "Kochi",
    email: "dev@example.com",
    bio: "I design booking and checkout flows for small travel companies.",
    jobs: [
      { title: "Freelance designer", org: "Self-employed", years: "2022 – now", line: "Redesigned checkout for three homestay chains." },
      { title: "UI designer", org: "Tripnest", years: "2019 – 2022", line: "Owned the mobile booking flow." },
    ],
    skills: ["Figma", "Prototyping", "User interviews", "Webflow"],
    credential: "B.Des, 2019",
    template: "studio",
  },
] as const
