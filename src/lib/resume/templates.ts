/**
 * Resume template registry. Each id matches a file in src/resume/typst/ (copied to /typst/templates by
 * scripts/resume/sync-typst-assets.mjs). Fonts listed here are the only ones the worker loads for a template.
 */
export type ResumeTemplate = {
  id: string
  no: string
  name: string
  layout: string
  bestFor: string
  columns: 1 | 2
  fonts: readonly string[]
  /** Sample resumes (ids in samples.ts) that show this template off, default first. Thumbnails are made for these. */
  showcase: readonly string[]
  version: number
}

export const RESUME_TEMPLATES: readonly ResumeTemplate[] = [
  {
    id: "r001-ledger",
    no: "R-001",
    name: "Ledger",
    layout: "One column, sans",
    bestFor: "Any role. The safest layout for applicant tracking systems.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["meera", "daniel", "chloe", "fatima", "ananya", "jake", "aoife"],
    version: 1,
  },
  {
    id: "r002-plain",
    no: "R-002",
    name: "Plain",
    layout: "One column, serif, dense",
    bestFor: "Engineers and students who need everything on one page.",
    columns: 1,
    fonts: ["SourceSerif4-400", "SourceSerif4-600", "SourceSerif4-700", "SourceSerif4-400-italic"],
    showcase: ["arjun", "priya", "daniel", "kwame", "sneha"],
    version: 1,
  },
  {
    id: "r003-column",
    no: "R-003",
    name: "Column",
    layout: "Main column with a skills sidebar",
    bestFor: "People with long skill and tool lists.",
    columns: 2,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["lena", "kwame", "tomas", "rahul", "omar", "meera"],
    version: 1,
  },
  {
    id: "r004-scholar",
    no: "R-004",
    name: "Scholar",
    layout: "Academic CV, serif, numbered publications",
    bestFor: "Research, academia and medicine. Runs to as many pages as the record needs.",
    columns: 1,
    fonts: ["SourceSerif4-400", "SourceSerif4-600", "SourceSerif4-700", "SourceSerif4-400-italic"],
    showcase: ["mei", "emily", "lena"],
    version: 1,
  },
  {
    id: "r005-compact",
    no: "R-005",
    name: "Compact",
    layout: "One line per role, tight margins",
    bestFor: "Senior people fitting a long history on one page.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["robert", "rahul", "sarah", "carlos", "daniel"],
    version: 1,
  },
  {
    id: "r006-modern",
    no: "R-006",
    name: "Modern",
    layout: "Hanging section titles, accent bar",
    bestFor: "Product, marketing and business roles.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["sofia", "hannah", "nina", "jake", "grace", "meera"],
    version: 1,
  },
  {
    id: "r007-executive",
    no: "R-007",
    name: "Executive",
    layout: "Serif, centred name, summary first",
    bestFor: "Directors, VPs and heads of function. Two pages is normal.",
    columns: 1,
    fonts: ["SourceSerif4-400", "SourceSerif4-600", "SourceSerif4-700", "SourceSerif4-400-italic"],
    showcase: ["robert", "fatima", "sarah", "carlos"],
    version: 1,
  },
  {
    id: "r008-fresher",
    no: "R-008",
    name: "Fresher",
    layout: "Education and projects first, contact on the right",
    bestFor: "Students, freshers and interns with little work history.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["sneha", "arjun", "priya"],
    version: 1,
  },
  {
    id: "r009-switcher",
    no: "R-009",
    name: "Switcher",
    layout: "Profile panel and skills before history",
    bestFor: "Career changers and people returning after a gap.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["maya", "hannah", "grace"],
    version: 1,
  },
  {
    id: "r010-europa",
    no: "R-010",
    name: "Europa",
    layout: "A4 label column, CEFR language table",
    bestFor: "Applications in the EU, Germany, France and the Netherlands.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["tomas", "lukas", "nina", "mateo", "sofia"],
    version: 1,
  },
  {
    id: "r011-gulf",
    no: "R-011",
    name: "Gulf",
    layout: "Personal details block, shaded section bars",
    bestFor: "Applications in the UAE, Saudi Arabia, Qatar and Kuwait.",
    columns: 1,
    fonts: ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["omar", "fatima", "carlos"],
    version: 1,
  },
  {
    id: "r012-specimen",
    no: "R-012",
    name: "Specimen",
    layout: "Display name in Bricolage Grotesque",
    bestFor: "Designers, writers and other creative roles.",
    columns: 1,
    fonts: ["BricolageGrotesque-600", "BricolageGrotesque-700", "Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    showcase: ["noor", "mateo", "grace", "priya"],
    version: 1,
  },
]

export const DEFAULT_TEMPLATE_ID = "r001-ledger"

export function getTemplate(id: string) {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0]
}
