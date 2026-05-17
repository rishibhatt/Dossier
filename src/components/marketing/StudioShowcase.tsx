import { CheckCircle2 } from "lucide-react"

import { StudioMockup } from "@/components/marketing/Mockups"
import { Eyebrow } from "@/components/marketing/MarketingPrimitives"

const bullets = [
  "Edit content effortlessly",
  "Reorder and customize sections",
  "Switch design direction",
  "Preview on any device",
] as const

export function StudioShowcase() {
  return (
    <section id="studio" className="mk-anchor-section mk-studio-section py-20 md:py-28">
      <div className="mk-container-wide grid grid-cols-1 gap-12 lg:grid-cols-[330px_1fr]">
        <div className="max-w-[330px] self-center">
          <Eyebrow inverse>The studio</Eyebrow>
          <h2 className="mk-display-lg mt-5 text-white">Your portfolio. Your way.</h2>
          <p className="mt-7 text-[15px] leading-7 text-[var(--mk-text-inverse-secondary)]">
            A powerful yet intuitive studio to edit every detail. Rearrange sections, refine content, tweak design, and
            preview in real time.
          </p>
          <ul className="mt-8 space-y-4">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/88">
                <CheckCircle2 className="size-5 text-[#C9C4FF]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <StudioMockup />
      </div>
    </section>
  )
}
