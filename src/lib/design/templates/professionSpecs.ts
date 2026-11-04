import type { PaletteInput, TemplateSpec } from "./types"

/**
 * Templates built for one profession group each. Every one starts from an original template (layout engine,
 * component styles) and changes what makes it fit the work: section order, section variants, type, palette.
 * Fonts must be listed in lib/design/googleFonts.ts.
 */

const p = (bg: string, bg2: string, text: string, muted: string, primary: string, accent: string): PaletteInput => ({ bg, bg2, text, muted, primary, accent })

type Base = (id: string) => TemplateSpec
type Overrides = Partial<Omit<TemplateSpec, "variants" | "fonts" | "match">> & {
  variants?: Partial<TemplateSpec["variants"]>
  fonts?: Partial<TemplateSpec["fonts"]>
  match?: Partial<TemplateSpec["match"]>
} & Pick<TemplateSpec, "id" | "name" | "tagline" | "bestFor" | "group" | "professions" | "order" | "palettes">

function derive(base: TemplateSpec, o: Overrides): TemplateSpec {
  return { ...base, ...o, variants: { ...base.variants, ...o.variants }, fonts: { ...base.fonts, ...o.fonts }, match: { ...base.match, ...o.match } }
}

export function professionSpecs(base: Base): TemplateSpec[] {
  return [
    /* ---------- visual: the pictures lead ---------- */
    derive(base("studio"), {
      id: "plan",
      name: "Plan",
      tagline: "Quiet paper, long sideways strip of your buildings, serif headings like a drawing title block.",
      bestFor: ["Architects", "Landscape and urban designers", "Set designers"],
      group: "visual",
      professions: ["architect"],
      tones: ["calm", "formal"],
      mode: "light",
      layout: "asymmetric",
      hero: "split-left",
      heroSection: "split",
      nav: "full-width-bar",
      bgType: "EDITORIAL_FLAT",
      order: ["hero", "gallery", "about", "projects", "experience", "press", "testimonials", "education", "certifications", "skills", "highlights", "contact"],
      variants: { gallery: "strip", projects: "feature", about: "lead", experience: "rows", skills: "inline", press: "outlets", testimonials: "quotes", contact: "statement" },
      motion: { preset: "parallax", stagger: 0.06, y: 28 },
      fonts: { display: "Instrument Serif", body: "Instrument Sans", mono: "DM Mono", displayWeight: 400, headingWeight: 400, tracking: "-0.01em", leading: 1.02, label: "0.14em" },
      radius: "rounded-none",
      density: "airy",
      palettes: [
        p("#F2F0EB", "#E6E3DC", "#1A1A18", "#5E5B54", "#1A1A18", "#B5532D"),
        p("#EFF0EE", "#E1E4E1", "#151817", "#545A57", "#151817", "#2F6B5B"),
        p("#F4F1EA", "#E8E2D6", "#201C17", "#625A50", "#201C17", "#8B5E34"),
      ],
      match: { clusters: ["design"], secondary: ["creative", "engineering"], emphasis: "projects", designy: true, projectLed: true },
    }),
    derive(base("kitchen"), {
      id: "salon",
      name: "Salon",
      tagline: "Warm, tactile and calm. Rooms in a soft masonry, services and kind words close behind.",
      bestFor: ["Interior designers", "Stylists and decorators", "Furniture and product makers"],
      group: "visual",
      professions: ["interior-designer", "visual-designer"],
      tones: ["warm", "calm"],
      mode: "light",
      hero: "split-left",
      heroSection: "split",
      order: ["hero", "gallery", "about", "services", "testimonials", "projects", "press", "experience", "education", "skills", "certifications", "highlights", "contact"],
      variants: { gallery: "masonry", services: "list", testimonials: "quotes", projects: "cards", press: "list", about: "lead", contact: "card" },
      motion: { preset: "parallax", stagger: 0.07, y: 30 },
      fonts: { display: "Fraunces", body: "Karla", mono: "DM Mono", displayWeight: 500, headingWeight: 500, tracking: "-0.02em", leading: 1.05, label: "0.12em" },
      radius: "rounded-lg",
      density: "airy",
      palettes: [
        p("#F7F2EA", "#EDE4D6", "#2B2420", "#6B5E54", "#7A4B32", "#3F5E4C"),
        p("#F5F1EB", "#E9E1D5", "#29231F", "#675B51", "#5C6B4A", "#9A5B3B"),
        p("#F8F3EC", "#EEE5D8", "#2A2421", "#6A5D53", "#8C5A3C", "#4A5F73"),
      ],
      match: { clusters: ["design"], secondary: ["creative", "freelance"], emphasis: "projects", designy: true, personality: ["creative"] },
    }),
    derive(base("atelier"), {
      id: "darkroom",
      name: "Darkroom",
      tagline: "Near-black walls so photographs glow. Condensed caps, natural-height masonry.",
      bestFor: ["Photographers and filmmakers", "Studios and agencies", "Chefs with a strong visual body of work"],
      group: "visual",
      professions: ["photographer", "studio", "chef"],
      tones: ["bold", "calm"],
      mode: "dark",
      layout: "magazine",
      hero: "kinetic",
      heroSection: "banner",
      bgType: "CLEAN_DARK",
      order: ["hero", "gallery", "showreel", "about", "projects", "press", "testimonials", "services", "experience", "education", "skills", "certifications", "highlights", "contact"],
      variants: { gallery: "masonry", showreel: "grid", projects: "gallery", press: "outlets", testimonials: "cards", services: "cards", about: "columns", contact: "footer" },
      motion: { preset: "slide-reveal", stagger: 0.06, y: 26 },
      fonts: { display: "Big Shoulders Display", body: "Inter Tight", mono: "DM Mono", displayWeight: 800, headingWeight: 700, tracking: "0.005em", leading: 0.95, label: "0.18em" },
      radius: "rounded-none",
      density: "normal",
      palettes: [
        p("#0E0E0D", "#1A1A18", "#EDEBE6", "#9A968D", "#EDEBE6", "#D9A441"),
        p("#0D0F10", "#181B1D", "#E9ECEC", "#929A9C", "#E9ECEC", "#E0573B"),
        p("#100E0E", "#1C1918", "#F0EBE6", "#A0958C", "#F0EBE6", "#7FB4A2"),
      ],
      match: { clusters: ["creative"], secondary: ["design", "culinary", "freelance"], emphasis: "projects", designy: true, needsRich: true },
    }),

    /* ---------- performer: the reel and the credits lead ---------- */
    derive(base("boardroom"), {
      id: "marquee",
      name: "Marquee",
      tagline: "Cinema dark, high-contrast serif. Your reel first, then a proper credits table.",
      bestFor: ["Actors", "Voice artists", "Presenters and comedians"],
      group: "performer",
      professions: ["actor"],
      tones: ["bold", "formal"],
      mode: "dark",
      layout: "single-column",
      hero: "fullscreen-center",
      heroSection: "centered",
      bgType: "CLEAN_DARK",
      order: ["hero", "showreel", "credits", "about", "press", "testimonials", "gallery", "education", "skills", "experience", "projects", "certifications", "highlights", "contact"],
      variants: { showreel: "feature", credits: "table", gallery: "grid", press: "outlets", testimonials: "quotes", about: "lead", skills: "inline", contact: "statement" },
      motion: { preset: "slide-reveal", stagger: 0.06, y: 24 },
      fonts: { display: "Bodoni Moda", body: "Karla", mono: "DM Mono", displayWeight: 700, headingWeight: 600, tracking: "-0.015em", leading: 1.0, label: "0.2em" },
      radius: "rounded-none",
      density: "airy",
      palettes: [
        p("#111014", "#1C1A21", "#F3EFE8", "#A39E96", "#E9C46A", "#E76F51"),
        p("#0F1012", "#1A1B1F", "#F1EEE9", "#9F9B94", "#D8B4A0", "#8AB0AB"),
        p("#121012", "#1E1A1E", "#F4EEEA", "#A69C97", "#E5A85C", "#C9A0DC"),
      ],
      match: { clusters: ["creative"], emphasis: "projects", personality: ["creative"], needsRich: false },
    }),
    derive(base("campaign"), {
      id: "stage",
      name: "Stage",
      tagline: "Loud, wide type and a grid of performances. Built to move.",
      bestFor: ["Choreographers and dancers", "Musicians and DJs", "Movement and fitness teachers"],
      group: "performer",
      professions: ["choreographer", "musician"],
      tones: ["bold", "playful"],
      mode: "light",
      hero: "kinetic",
      heroSection: "banner",
      order: ["hero", "showreel", "about", "credits", "gallery", "press", "testimonials", "services", "education", "experience", "skills", "projects", "certifications", "highlights", "contact"],
      variants: { showreel: "grid", credits: "list", gallery: "strip", press: "list", testimonials: "cards", services: "cards", about: "lead", contact: "statement" },
      motion: { preset: "slide-reveal", stagger: 0.05, y: 36 },
      fonts: { display: "Unbounded", body: "Onest", mono: "DM Mono", displayWeight: 700, headingWeight: 600, tracking: "-0.03em", leading: 0.98, label: "0.14em" },
      radius: "rounded-2xl",
      palettes: [
        p("#F5F3EE", "#E9E5DC", "#121212", "#55524C", "#D7263D", "#1B998B"),
        p("#F3F4F1", "#E5E7E1", "#111312", "#525651", "#3B37E6", "#F2A541"),
        p("#F6F2EF", "#EBE3DD", "#141111", "#5A514C", "#E4572E", "#17BEBB"),
      ],
      match: { clusters: ["creative"], secondary: ["education"], emphasis: "projects", personality: ["creative"] },
    }),

    /* ---------- licensed: trust leads ---------- */
    derive(base("clinic"), {
      id: "practice",
      name: "Practice",
      tagline: "Calm and legible. What you treat, where to find you and how to book, before the CV.",
      bestFor: ["Doctors and dentists", "Therapists and physiotherapists", "Nutritionists and vets"],
      group: "licensed",
      professions: ["doctor", "therapist"],
      tones: ["calm", "warm"],
      heroSection: "split",
      hero: "split-left",
      order: ["hero", "about", "services", "practice", "certifications", "experience", "education", "publications", "testimonials", "press", "skills", "highlights", "projects", "contact"],
      variants: { services: "list", practice: "split", certifications: "grid", publications: "list", testimonials: "cards", experience: "rows", about: "lead", contact: "card" },
      fonts: { display: "Source Serif 4", body: "Atkinson Hyperlegible", mono: "IBM Plex Mono", displayWeight: 600, headingWeight: 600, tracking: "-0.015em", leading: 1.08, label: "0.12em" },
      radius: "rounded-lg",
      palettes: [
        p("#F6F8F7", "#E8EEEC", "#13221F", "#4A5B57", "#1F6F5C", "#9C4A2F"),
        p("#F7F8FA", "#E9EDF2", "#151D27", "#4B5665", "#2C5E9E", "#2F7D6B"),
        p("#F8F7F4", "#EDEBE5", "#1D1B18", "#58544D", "#6B4F9E", "#2F7D6B"),
      ],
      match: { clusters: ["healthcare"], secondary: ["academic"], emphasis: "credentials", personality: ["corporate", "academic"] },
    }),
    derive(base("chambers"), {
      id: "counsel",
      name: "Counsel",
      tagline: "Formal and exact. Practice areas, registration and record set like a well-made brief.",
      bestFor: ["Lawyers and advocates", "Chartered accountants and auditors", "Researchers and consultants"],
      group: "licensed",
      professions: ["lawyer", "chartered-accountant", "researcher"],
      tones: ["formal", "calm"],
      order: ["hero", "about", "services", "certifications", "experience", "publications", "press", "education", "testimonials", "practice", "skills", "highlights", "projects", "contact"],
      variants: { services: "cards", certifications: "list", publications: "list", press: "outlets", testimonials: "quotes", practice: "card", experience: "rows", about: "prose", contact: "list" },
      fonts: { display: "Libre Franklin", body: "Source Serif 4", mono: "IBM Plex Mono", displayWeight: 700, headingWeight: 600, tracking: "-0.02em", leading: 1.06, label: "0.16em" },
      radius: "rounded-none",
      palettes: [
        p("#FAFAF7", "#EFEEE8", "#16181D", "#50545C", "#1E3A5F", "#8C6D2C"),
        p("#F9F8F5", "#EEECE6", "#181716", "#55524D", "#5B2333", "#3E5C76"),
        p("#F8F9F9", "#ECEFEF", "#141A1C", "#4F5A5E", "#24524A", "#8C6D2C"),
      ],
      match: { clusters: ["legal", "finance"], secondary: ["academic"], emphasis: "credentials", personality: ["corporate"] },
    }),

    /* ---------- builder: outcomes lead ---------- */
    derive(base("plain"), {
      id: "casebook",
      name: "Casebook",
      tagline: "Numbers first, then case studies with the problem, the call and the result.",
      bestFor: ["Product managers", "Founders and executives", "Marketing and sales leads"],
      group: "builder",
      professions: ["product-manager", "executive", "marketer"],
      tones: ["calm", "formal"],
      heroSection: "statement",
      order: ["hero", "highlights", "projects", "experience", "testimonials", "about", "press", "skills", "education", "certifications", "contact"],
      variants: { highlights: "figures", projects: "feature", experience: "rows", testimonials: "quotes", press: "list", skills: "inline", about: "lead", contact: "statement" },
      fonts: { display: "Geist", body: "Geist", mono: "DM Mono", displayWeight: 600, headingWeight: 600, tracking: "-0.035em", leading: 1.0, label: "0.12em" },
      radius: "rounded-md",
      palettes: [
        p("#F8F7F4", "#ECEAE4", "#18181A", "#5A5A60", "#2D4BD8", "#E2683C"),
        p("#F7F7F5", "#EBEBE6", "#161718", "#58595C", "#0F7B5F", "#D9480F"),
        p("#F9F7F6", "#EEEAE6", "#1A1817", "#5E5955", "#7A3EE0", "#E2683C"),
      ],
      match: { clusters: ["executive", "marketing"], secondary: ["sales", "software"], emphasis: "experience", personality: ["corporate"] },
    }),
    derive(base("workbench"), {
      id: "blueprint",
      name: "Blueprint",
      tagline: "Drafting-table blue, a fixed side rail and project cards that read like spec sheets.",
      bestFor: ["Civil, mechanical and electrical engineers", "Software engineers", "Technicians and makers"],
      group: "builder",
      professions: ["engineer", "software-engineer"],
      tones: ["techy", "calm"],
      mode: "dark",
      bgType: "CLEAN_DARK",
      order: ["hero", "about", "projects", "highlights", "experience", "skills", "certifications", "education", "publications", "gallery", "contact"],
      variants: { projects: "cards", highlights: "list", experience: "timeline", skills: "columns", certifications: "grid", publications: "list", gallery: "grid", contact: "list" },
      fonts: { display: "Chivo", body: "IBM Plex Sans", mono: "IBM Plex Mono", displayWeight: 800, headingWeight: 700, tracking: "-0.02em", leading: 1.02, label: "0.16em" },
      radius: "rounded-md",
      palettes: [
        p("#0F1A24", "#16242F", "#E4ECF2", "#8BA0B0", "#5BC0EB", "#F2C14E"),
        p("#101820", "#18232C", "#E6EDF1", "#8D9FAB", "#7BD389", "#F28F3B"),
        p("#121722", "#1A2130", "#E7EAF2", "#8F98AD", "#9DB4FF", "#F2C14E"),
      ],
      match: { clusters: ["engineering"], secondary: ["software"], emphasis: "projects", personality: ["technical"], projectLed: true },
    }),
  ]
}
