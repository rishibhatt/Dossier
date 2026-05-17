"use client"

import type { Scene } from "@/features/creative-mode/types/experienceConfig"
import { HeroScene } from "@/features/creative-mode/scenes/HeroScene"
import { HorizontalScrollScene } from "@/features/creative-mode/scenes/HorizontalScrollScene"
import { MarqueeScene } from "@/features/creative-mode/scenes/MarqueeScene"
import { ProjectsCarouselScene } from "@/features/creative-mode/scenes/ProjectsCarouselScene"
import { SkillsCloudScene } from "@/features/creative-mode/scenes/SkillsCloudScene"
import { SplitScrollScene } from "@/features/creative-mode/scenes/SplitScrollScene"
import { StickyStackScene } from "@/features/creative-mode/scenes/StickyStackScene"
import { TextRevealScene } from "@/features/creative-mode/scenes/TextRevealScene"

export function SceneRenderer({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "hero":
      return <HeroScene scene={scene} />
    case "text-reveal":
      return <TextRevealScene scene={scene} />
    case "marquee":
      return <MarqueeScene scene={scene} />
    case "horizontal-scroll":
      return <HorizontalScrollScene scene={scene} />
    case "projects-carousel":
      return <ProjectsCarouselScene scene={scene} />
    case "skills-cloud":
      return <SkillsCloudScene scene={scene} />
    case "sticky-stack":
      return <StickyStackScene scene={scene} />
    case "split-scroll":
      return <SplitScrollScene scene={scene} />
    default:
      return null
  }
}
