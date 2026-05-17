"use client"

import { CreativeExperienceContext } from "@/features/creative-mode/CreativeExperienceContext"
import "@/features/creative-mode/creative-mode.css"
import { SceneRenderer } from "@/features/creative-mode/SceneRenderer"
import type { ExperienceConfig, Scene } from "@/features/creative-mode/types/experienceConfig"
import { cn } from "@/lib/utils"
import type { PortfolioDocument } from "@/types/dossier"

function sceneAnchor(scene: Scene) {
  if (scene.type === "hero") return "creative-hero"
  if (scene.type === "projects-carousel") return "creative-projects"
  if (scene.type === "skills-cloud") return "creative-skills"
  if (scene.type === "marquee") return "creative-skills-marquee"
  if (scene.type === "horizontal-scroll") return "creative-experience"
  if (scene.type === "split-scroll") return "creative-contact"
  return `creative-${scene.type}`
}

function sceneNavLabel(scene: Scene) {
  if (scene.type === "projects-carousel") return "Work"
  if (scene.type === "skills-cloud" || scene.type === "marquee") return "Skills"
  if (scene.type === "horizontal-scroll") return "Experience"
  if (scene.type === "text-reveal") return "About"
  if (scene.type === "sticky-stack") return "Highlights"
  if (scene.type === "split-scroll") return "Contact"
  return null
}

function CreativeNav({
  sticky,
  style,
  title,
  scenes,
}: {
  sticky: boolean
  style: string
  title: string
  scenes: Scene[]
}) {
  const used = new Set<string>()
  const links = scenes.flatMap((scene) => {
    const label = sceneNavLabel(scene)
    if (!label || used.has(label)) return []
    used.add(label)
    return [{ label, href: `#${sceneAnchor(scene)}` }]
  })

  return (
    <header
      className={cn(
        "z-20 shrink-0 border-b border-white/10 px-4 py-3 backdrop-blur-xl transition-colors sm:px-6",
        sticky ? "sticky top-0" : "relative",
        style === "floating" ? "mx-4 mt-4 rounded-xl border bg-zinc-950/80 sm:mx-8" : "bg-zinc-950/85"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <a href="#creative-hero" className="min-w-0 text-sm font-semibold text-white">
          <span className="block truncate">{title}</span>
        </a>
        <nav className="hidden items-center gap-4 text-xs font-medium text-zinc-400 sm:flex" aria-label="Creative preview">
          {links.map(({ label, href }) => (
            <a key={href} href={href} className="transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

/**
 * Native vertical scroll inside the preview frame (nested Lenis + flex height was unreliable).
 */
export function CreativeModeSurface({
  document,
  config,
}: {
  document: PortfolioDocument
  config: ExperienceConfig
}) {
  return (
    <CreativeExperienceContext.Provider value={{ document, config }}>
      <div
        data-creative-mode="true"
        className="flex h-full min-h-0 w-full flex-1 flex-col bg-[#080910] text-zinc-100 antialiased"
      >
        <CreativeNav
          sticky={config.global.nav.sticky}
          style={config.global.nav.style}
          title={document.meta.title}
          scenes={config.scenes}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="creative-lenis-content">
            {config.scenes.map((scene) => (
              <section key={scene.id} id={sceneAnchor(scene)} className="scroll-mt-20">
                <SceneRenderer scene={scene} />
              </section>
            ))}
            <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
              {document.meta.title} · Creative mode preview
            </footer>
          </div>
        </div>
      </div>
    </CreativeExperienceContext.Provider>
  )
}
