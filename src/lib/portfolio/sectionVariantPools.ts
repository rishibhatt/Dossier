import type { PortfolioSectionType } from "@/types/dossier"

/** Variant strings cycled in canvas edit mode — chosen to hit distinct branches in `sectionRegistry`. */
export const SECTION_VARIANT_CYCLE: Record<PortfolioSectionType, readonly string[]> = {
  hero: ["centered-minimal", "split-bold", "editorial", "showcase-editorial", "aurora", "split-media"],
  about: ["default", "two-column", "pull-editorial", "card", "mono-rail"],
  skills: [
    "skills-marquee-infinite",
    "terminal-tags",
    "constellation-pills",
    "finance-category",
    "tech-strip",
    "split-columns",
  ],
  experience: [
    "numbered-list",
    "stagger-cards",
    "branch-timeline",
    "case-rows",
    "exp-horizontal-carousel",
  ],
  projects: [
    "glass-mosaic",
    "horizontal-spotlight",
    "carousel-projects",
    "bento-grid",
    "stack-list",
    "default-grid",
  ],
  contact: ["default-block", "split-inline", "card-stack", "dramatic-footer", "mono-links"],
}
